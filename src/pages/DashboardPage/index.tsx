import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeartPulse,
    Activity,
    Footprints,
    Moon,
    Brain,
    TrendingUp
} from 'lucide-react';
import { MetricInputCard } from '../../components/dashboard/MetricInputCard';
import { VerdictPanel } from '../../components/dashboard/VerdictPanel';
import { TrendChart } from '../../components/dashboard/TrendChart';
import { HistoryTable } from '../../components/dashboard/HistoryTable';
import type { SupabaseHealthRecord } from '../../services/api';
import { api, db } from '../../services/api';
import { useAuth } from '../../hooks';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user!.id;

    const [sessionTime] = useState(() =>
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );

    const [metrics, setMetrics] = useState({
        heart_rate: '',
        bp_systolic: '',
        bp_diastolic: '',
        daily_steps: '',
        physical_activity_level: '',
        stress_level: '',
        sleep_duration: '',
        quality_of_sleep: ''
    });

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');
    const [lastRecordId, setLastRecordId] = useState<string | null>(null);
    const [verdict, setVerdict] = useState<{
        status: 'pending' | 'normal' | 'anomaly';
        confidence?: number;
        zScores?: Record<string, number>;
    }>({ status: 'pending' });

    const [history, setHistory] = useState<SupabaseHealthRecord[]>([]);

    const handleMetricChange = (id: string, value: string | number) => {
        setMetrics(prev => ({ ...prev, [id]: value }));
    };

    const fetchHistory = useCallback(async () => {
        const records = await db.getHistory(userId);
        setHistory(records);
    }, [userId]);

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setAnalyzeError('');
        try {
            const input = {
                physical_activity_level: Number(metrics.physical_activity_level) || 0,
                heart_rate: Number(metrics.heart_rate) || 0,
                daily_steps: Number(metrics.daily_steps) || 0,
                ...(metrics.sleep_duration && { sleep_duration: Number(metrics.sleep_duration) }),
                ...(metrics.quality_of_sleep && { quality_of_sleep: Number(metrics.quality_of_sleep) }),
                ...(metrics.stress_level && { stress_level: Number(metrics.stress_level) }),
                ...(metrics.bp_systolic && { bp_systolic: Number(metrics.bp_systolic) }),
                ...(metrics.bp_diastolic && { bp_diastolic: Number(metrics.bp_diastolic) }),
            };

            // 1. Call AI API
            const result = await api.predict({ session_id: userId, ...input });

            // 2. Persist to Supabase
            const saved = await db.saveReading(userId, input, result);
            if (saved?.id) setLastRecordId(saved.id);

            // 3. Update verdict UI
            const zScores = result.explanation
                ? Object.fromEntries(result.explanation.drivers.map(d => [d.display_name || d.feature, d.z_score]))
                : {};
            const { verdict, anomaly_count, total_models } = result.ensemble;
            const agreeing = verdict === 'anomaly' ? anomaly_count : total_models - anomaly_count;
            setVerdict({
                status: verdict,
                confidence: agreeing / total_models,
                zScores,
            });

            // 4. Refresh history from Supabase
            await fetchHistory();

        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Analysis failed. Please try again.';
            setAnalyzeError(msg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExport = async () => {
        try {
            await api.exportCsv(userId);
        } catch {
            setAnalyzeError('Export failed. Please try again.');
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // Map Supabase records → chart shape (oldest first for left→right flow)
    const chartData = [...history].reverse().map(rec => ({
        timestamp: new Date(rec.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        heart_rate: rec.heart_rate,
        isAnomaly: rec.verdict === 'anomaly',
    }));

    // Map Supabase records → table shape
    const tableData = history.map(rec => ({
        id: rec.id,
        timestamp: new Date(rec.recorded_at).toLocaleString([], {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        }),
        metrics: {
            hr: rec.heart_rate,
            bp: rec.bp_systolic ? `${rec.bp_systolic}/${rec.bp_diastolic}` : '—',
            steps: rec.daily_steps,
        },
        verdict: rec.verdict,
    }));

    return (
        <div className={styles.dashboardContainer}>
            {/* Top Status Bar */}
            <header className={styles.statusBar}>
                <div className={styles.statusLeft}>
                    <h1 className={styles.pageTitle}>Patient Monitoring</h1>
                    <div className={styles.sessionMeta}>
                        <span className={styles.metaLabel}>SESSION START</span>
                        <span className={styles.metaValue}>{sessionTime}</span>
                        <span className={styles.metaDivider}>/</span>
                        <span className={styles.metaLabel}>READINGS</span>
                        <span className={styles.metaValue}>{history.length}</span>
                    </div>
                </div>

                <div className={styles.statusRight}>
                    <button className={styles.exportBtn} onClick={handleExport}>
                        EXPORT RECORD ↓
                    </button>
                </div>
            </header>

            {analyzeError && (
                <div style={{ color: 'var(--color-anomaly)', fontSize: 'var(--text-sm)', marginBottom: 'var(--spacing-md)', padding: '0 0 var(--spacing-sm)' }}>
                    {analyzeError}
                </div>
            )}

            {/* Layout Grid */}
            <div className={styles.dashboardGrid}>
                {/* Left Column: Inputs & Action */}
                <div className={styles.inputZone}>
                    <div className={styles.sectionHeader}>
                        <h2>VITAL SIGNS</h2>
                        <span className={styles.headerLine}></span>
                    </div>

                    <div className={styles.metricsGrid}>
                        <MetricInputCard
                            id="heart_rate"
                            label="Heart Rate"
                            icon={HeartPulse}
                            value={metrics.heart_rate}
                            onChange={handleMetricChange}
                            unit="bpm"
                            min={30}
                            max={200}
                            placeholder="72"
                            required
                        />
                        <MetricInputCard
                            id="bp_systolic"
                            label="BP Systolic"
                            icon={Activity}
                            value={metrics.bp_systolic}
                            onChange={handleMetricChange}
                            unit="mmHg"
                            min={70}
                            max={250}
                            placeholder="120"
                            helperText="Diastolic goes in next card"
                        />
                        <MetricInputCard
                            id="bp_diastolic"
                            label="BP Diastolic"
                            icon={Activity}
                            value={metrics.bp_diastolic}
                            onChange={handleMetricChange}
                            unit="mmHg"
                            min={40}
                            max={150}
                            placeholder="80"
                        />
                        <MetricInputCard
                            id="daily_steps"
                            label="Daily Steps"
                            icon={Footprints}
                            value={metrics.daily_steps}
                            onChange={handleMetricChange}
                            unit="steps"
                            min={0}
                            max={30000}
                            placeholder="5000"
                            required
                        />
                        <MetricInputCard
                            id="physical_activity_level"
                            label="Activity Level"
                            icon={TrendingUp}
                            value={metrics.physical_activity_level}
                            onChange={handleMetricChange}
                            unit="score"
                            min={0}
                            max={120}
                            placeholder="45"
                            required
                        />
                        <MetricInputCard
                            id="stress_level"
                            label="Stress Level"
                            icon={Brain}
                            value={metrics.stress_level}
                            onChange={handleMetricChange}
                            unit="/ 10"
                            min={1}
                            max={10}
                            placeholder="3"
                        />
                        <MetricInputCard
                            id="sleep_duration"
                            label="Sleep Hours"
                            icon={Moon}
                            value={metrics.sleep_duration}
                            onChange={handleMetricChange}
                            unit="hrs"
                            min={0}
                            max={24}
                            step={0.5}
                            placeholder="7.5"
                        />
                        <MetricInputCard
                            id="quality_of_sleep"
                            label="Sleep Quality"
                            icon={Moon}
                            value={metrics.quality_of_sleep}
                            onChange={handleMetricChange}
                            unit="/ 10"
                            min={1}
                            max={10}
                            placeholder="8"
                        />
                    </div>

                    <button
                        className={styles.analyzeBtn}
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? 'ANALYZING...' : 'ANALYZE METRICS →'}
                    </button>
                </div>

                {/* Right Column: Verdict & History Summary */}
                <div className={styles.resultsZone}>
                    <div className={styles.sectionHeader}>
                        <h2>AI VERDICT</h2>
                        <span className={styles.headerLine}></span>
                    </div>

                    <VerdictPanel
                        status={verdict.status}
                        confidence={verdict.confidence}
                        zScores={verdict.zScores}
                    />

                    {verdict.status !== 'pending' && lastRecordId && (
                        <button
                            className={styles.analysisBtn}
                            onClick={() => navigate(`/dashboard/analysis/${lastRecordId}`)}
                        >
                            VIEW FULL ANALYSIS →
                        </button>
                    )}

                    <TrendChart data={chartData} />

                    <div className={`${styles.sectionHeader} ${styles.mtLarge}`}>
                        <h2>SESSION HISTORY</h2>
                        <span className={styles.headerLine}></span>
                    </div>

                    <HistoryTable records={tableData} />
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;
