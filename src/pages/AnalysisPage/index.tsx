import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, Info, Cpu } from 'lucide-react';
import { db } from '../../services/api';
import type { SupabaseHealthRecord } from '../../services/api';
import styles from './AnalysisPage.module.css';

const KNOWN_FIELDS = new Set(['input', 'models', 'ensemble', 'explanation', 'session_id', 'timestamp', 'disclaimer']);

function formatKey(key: string): string {
    return key.replace(/_/g, ' ').toUpperCase();
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
        year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true,
    });
}

// ── Smart value renderers ────────────────────────────────────────

function VerdictChip({ value }: { value: string }) {
    const isNormal = value === 'normal';
    const isAnomaly = value === 'anomaly';
    return (
        <span className={`${styles.verdictChip} ${isNormal ? styles.chipNormal : isAnomaly ? styles.chipAnomaly : styles.chipNeutral}`}>
            <span className={styles.chipDot} />
            {value.toUpperCase()}
        </span>
    );
}

function ScoreBar({ value, label }: { value: number; label: string }) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 80);
        return () => clearTimeout(t);
    }, []);

    const pct = Math.round(value * 100);
    return (
        <div className={styles.scoreBarRow}>
            <span className={styles.scoreBarLabel}>{formatKey(label)}</span>
            <div className={styles.scoreBarTrack}>
                <div
                    className={styles.scoreBarFill}
                    style={{ width: animated ? `${pct}%` : '0%' }}
                />
            </div>
            <span className={styles.scoreBarValue}>{pct}%</span>
        </div>
    );
}

function NestedObjectPanel({ data }: { data: Record<string, unknown> }) {
    return (
        <div className={styles.nestedPanel}>
            {Object.entries(data).map(([k, v]) => (
                <div key={k} className={styles.nestedRow}>
                    <span className={styles.nestedKey}>{formatKey(k)}</span>
                    <span className={styles.nestedVal}>
                        {(v === 'normal' || v === 'anomaly')
                            ? <VerdictChip value={String(v)} />
                            : (typeof v === 'number' && v >= 0 && v <= 1)
                                ? <span className={styles.scoreInline}>{Math.round((v as number) * 100)}%</span>
                                : typeof v === 'boolean'
                                    ? <span className={v ? styles.boolTrue : styles.boolFalse}>{v ? 'TRUE' : 'FALSE'}</span>
                                    : <span className={styles.nestedRaw}>{JSON.stringify(v)}</span>
                        }
                    </span>
                </div>
            ))}
        </div>
    );
}

function BooleanChip({ value }: { value: boolean }) {
    return (
        <span className={`${styles.verdictChip} ${value ? styles.chipNormal : styles.chipAnomaly}`}>
            <span className={styles.chipDot} />
            {value ? 'TRUE' : 'FALSE'}
        </span>
    );
}

function ModelValue({ fieldKey, value }: { fieldKey: string; value: unknown }) {
    if (value === 'normal' || value === 'anomaly') return <VerdictChip value={value} />;
    if (typeof value === 'boolean') return <BooleanChip value={value} />;
    if (typeof value === 'number' && value >= 0 && value <= 1) return <ScoreBar value={value} label={fieldKey} />;
    if (typeof value === 'number') {
        return <span className={styles.numericReadout}>{value % 1 === 0 ? value : value.toFixed(4)}</span>;
    }
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return <NestedObjectPanel data={value as Record<string, unknown>} />;
    }
    if (Array.isArray(value)) {
        return <span className={styles.numericReadout}>[{(value as unknown[]).join(', ')}]</span>;
    }
    return <span className={styles.stringReadout}>{String(value)}</span>;
}

// ── Z-Score bar ──────────────────────────────────────────────────

function ZScoreBar({ label, value, index }: { label: string; value: number; index: number }) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 120 + index * 45);
        return () => clearTimeout(t);
    }, [index]);

    const abs = Math.abs(value);
    const severity = abs >= 2.5 ? 'high' : abs >= 1.5 ? 'medium' : 'low';
    const widthPct = animated ? Math.min((abs / 3.5) * 100, 100) / 2 : 0;

    return (
        <div className={styles.zScoreRow}>
            <div className={styles.zScoreLabel}>{label.replace(/_/g, ' ')}</div>
            <div className={styles.zScoreBarWrap}>
                <div className={styles.zScoreCenter} />
                <div
                    className={`${styles.zScoreFill} ${styles[`zscore_${severity}`]}`}
                    style={{
                        width: `${widthPct}%`,
                        left: value >= 0 ? '50%' : `calc(50% - ${widthPct}%)`,
                    }}
                />
            </div>
            <div className={`${styles.zScoreNum} ${styles[`zscore_${severity}`]}`}>
                {value > 0 ? '+' : ''}{value.toFixed(2)}σ
            </div>
        </div>
    );
}

// ── Input metric item ────────────────────────────────────────────

function InputMetricItem({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) {
    if (value == null) return null;
    return (
        <div className={styles.metricItem}>
            <span className={styles.metricItemLabel}>{label}</span>
            <span className={styles.metricItemValue}>{value}<span className={styles.metricItemUnit}> {unit}</span></span>
        </div>
    );
}

// ── Main page ────────────────────────────────────────────────────

export function AnalysisPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [record, setRecord] = useState<SupabaseHealthRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!id) return;
        db.getRecord(id).then(r => {
            if (!r) setNotFound(true);
            else setRecord(r);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (!loading && record) {
            const t = setTimeout(() => setMounted(true), 60);
            return () => clearTimeout(t);
        }
    }, [loading, record]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.skeleton}>
                    <div className={`${styles.skeletonLine} ${styles.skeletonWide}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonMed}`} />
                    <div className={`${styles.skeletonLine} ${styles.skeletonFull}`} />
                </div>
            </div>
        );
    }

    if (notFound || !record) {
        return (
            <div className={styles.page}>
                <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} /> BACK TO MONITOR
                </button>
                <div className={styles.notFound}>Record not found.</div>
            </div>
        );
    }

    const raw = record.raw_api_response;

    // Extract typed structures from the actual API response shape
    type EnsembleData = { verdict: string; total_models: number; anomaly_count: number };
    type ModelData = { label: string; score: number; anomaly: boolean; threshold?: number };
    type Driver = { feature: string; display_name: string; value: number; unit: string; z_score: number; direction: string; normal_range: string };

    const ensemble = raw.ensemble as EnsembleData | undefined;
    const modelsData = raw.models as Record<string, ModelData> | undefined;
    const explanation = raw.explanation as { drivers: Driver[]; summary: string } | undefined;

    const confidencePct = ensemble
        ? Math.round(((ensemble.verdict === 'anomaly'
            ? ensemble.anomaly_count
            : ensemble.total_models - ensemble.anomaly_count) / ensemble.total_models) * 100)
        : null;

    const zScores: Record<string, number> | null = explanation?.drivers?.length
        ? Object.fromEntries(explanation.drivers.map(d => [d.display_name || d.feature, d.z_score]))
        : null;

    // Any unrecognised top-level keys for the generic renderer
    const extraEntries = Object.entries(raw).filter(([k]) => !KNOWN_FIELDS.has(k));

    const isAnomaly = record.verdict === 'anomaly';

    return (
        <div className={styles.page}>
            <button className={styles.backBtn} onClick={() => navigate(-1)}>
                <ArrowLeft size={16} /> BACK
            </button>

            <div className={`${styles.pageHeader} ${mounted ? styles.headerVisible : ''}`}>
                <div className={styles.headerLeft}>
                    <h1 className={styles.pageTitle}>Full Analysis Report</h1>
                    <span className={styles.timestamp}>{formatDate(record.recorded_at)}</span>
                </div>
                <span className={`${styles.verdictBadge} ${isAnomaly ? styles.badgeAnomaly : styles.badgeNormal}`}>
                    {isAnomaly ? '⚠ ANOMALY' : '✓ NORMAL'}
                </span>
            </div>

            <div className={styles.grid}>
                {/* Left column */}
                <div className={styles.leftCol}>

                    {/* Ensemble verdict */}
                    <section className={`${styles.card} ${isAnomaly ? styles.cardAnomaly : styles.cardNormal} ${mounted ? styles.cardVisible : ''}`}
                        style={{ animationDelay: '60ms' }}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>ENSEMBLE VERDICT</h2>
                            <span className={styles.headerLine} />
                        </div>
                        <div className={styles.verdictRow}>
                            {isAnomaly
                                ? <AlertCircle size={40} className={styles.verdictIconAnomaly} strokeWidth={1.5} />
                                : <CheckCircle2 size={40} className={styles.verdictIconNormal} strokeWidth={1.5} />
                            }
                            <div>
                                <div className={styles.verdictHeadline}>
                                    {isAnomaly ? 'Anomaly Detected' : 'Normal Readings'}
                                </div>
                                <div className={styles.verdictSub}>
                                    {isAnomaly
                                        ? 'One or more metrics deviate significantly from the reference baseline.'
                                        : 'All submitted metrics are within statistically normal bounds.'}
                                </div>
                            </div>
                        </div>

                        {confidencePct != null && (
                            <div className={styles.confidenceBlock}>
                                <div className={styles.confidenceLabels}>
                                    <span>AI CONFIDENCE</span>
                                    <span className={styles.confidenceValue}>{confidencePct}%</span>
                                </div>
                                <div className={styles.progressTrack}>
                                    <div
                                        className={`${styles.progressFill} ${isAnomaly ? styles.progressAnomaly : styles.progressNormal}`}
                                        style={{ width: mounted ? `${confidencePct}%` : '0%' }}
                                    />
                                </div>
                                <div className={styles.confidenceNote}>
                                    {confidencePct >= 90
                                        ? 'High confidence — result is reliable.'
                                        : confidencePct >= 70
                                            ? 'Moderate confidence — consider re-testing.'
                                            : 'Low confidence — result should be verified.'}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Z-Score breakdown */}
                    {zScores && Object.keys(zScores).length > 0 && (
                        <section className={`${styles.card} ${mounted ? styles.cardVisible : ''}`}
                            style={{ animationDelay: '130ms' }}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>Z-SCORE BREAKDOWN</h2>
                                <span className={styles.headerLine} />
                            </div>
                            <p className={styles.cardNote}>
                                <Info size={12} style={{ display: 'inline', marginRight: 4 }} />
                                Distance from the population mean in standard deviations (σ). Values beyond ±2σ are statistically notable.
                            </p>
                            <div className={styles.zScoreBarLegend}>
                                <span>← Below avg</span>
                                <span className={styles.legendCenter}>0σ</span>
                                <span>Above avg →</span>
                            </div>
                            <div className={styles.zScoreList}>
                                {Object.entries(zScores)
                                    .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                                    .map(([key, val], i) => (
                                        <ZScoreBar key={key} label={key} value={val} index={i} />
                                    ))}
                            </div>
                            <div className={styles.zScoreLegendRow}>
                                <span className={`${styles.legendDot} ${styles.zscore_low}`} />
                                <span className={styles.legendText}>Normal (&lt;1.5σ)</span>
                                <span className={`${styles.legendDot} ${styles.zscore_medium}`} />
                                <span className={styles.legendText}>Notable (1.5–2.5σ)</span>
                                <span className={`${styles.legendDot} ${styles.zscore_high}`} />
                                <span className={styles.legendText}>Critical (&gt;2.5σ)</span>
                            </div>
                        </section>
                    )}
                </div>

                {/* Right column */}
                <div className={styles.rightCol}>

                    {/* Submitted metrics */}
                    <section className={`${styles.card} ${mounted ? styles.cardVisible : ''}`}
                        style={{ animationDelay: '100ms' }}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>SUBMITTED METRICS</h2>
                            <span className={styles.headerLine} />
                        </div>
                        <div className={styles.metricsGrid}>
                            <InputMetricItem label="Heart Rate" value={record.heart_rate} unit="bpm" />
                            <InputMetricItem label="Daily Steps" value={record.daily_steps} unit="steps" />
                            <InputMetricItem label="Activity Level" value={record.physical_activity_level} unit="score" />
                            <InputMetricItem label="BP Systolic" value={record.bp_systolic} unit="mmHg" />
                            <InputMetricItem label="BP Diastolic" value={record.bp_diastolic} unit="mmHg" />
                            <InputMetricItem label="Sleep Duration" value={record.sleep_duration} unit="hrs" />
                            <InputMetricItem label="Sleep Quality" value={record.quality_of_sleep} unit="/ 10" />
                            <InputMetricItem label="Stress Level" value={record.stress_level} unit="/ 10" />
                        </div>
                    </section>

                    {/* Model details */}
                    {(modelsData || explanation || extraEntries.length > 0) && (
                        <section className={`${styles.card} ${mounted ? styles.cardVisible : ''}`}
                            style={{ animationDelay: '170ms' }}>
                            <div className={styles.sectionHeader}>
                                <h2 className={styles.sectionTitle}>MODEL DETAILS</h2>
                                <span className={styles.headerLine} />
                            </div>

                            {/* Consensus summary strip */}
                            {ensemble && (
                                <div className={`${styles.consensusStrip} ${isAnomaly ? styles.consensusAnomaly : styles.consensusNormal}`}>
                                    <Cpu size={14} className={styles.consensusIcon} />
                                    <span className={styles.consensusText}>
                                        {ensemble.anomaly_count}/{ensemble.total_models} models flagged anomaly
                                    </span>
                                    {modelsData && (
                                        <div className={styles.consensusDots}>
                                            {Object.entries(modelsData).map(([k, v]) => (
                                                <span
                                                    key={k}
                                                    className={`${styles.consensusDot} ${v.anomaly ? styles.dotAnomaly : styles.dotNormal}`}
                                                    title={`${k.replace(/_/g, ' ')}: ${v.label}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Per-model verdict grid */}
                            {modelsData && (
                                <div className={styles.modelSection}>
                                    <span className={styles.modelSectionLabel}>INDIVIDUAL MODEL VERDICTS</span>
                                    <div className={styles.modelVerdictGrid}>
                                        {Object.entries(modelsData).map(([key, model]) => (
                                            <div key={key} className={`${styles.modelVerdictCell} ${model.anomaly ? styles.cellAnomaly : styles.cellNormal}`}>
                                                <span className={styles.cellKey}>{key.replace(/_/g, ' ').toUpperCase()}</span>
                                                <VerdictChip value={model.label} />
                                                <span className={styles.cellScore}>
                                                    {model.score.toFixed(4)}
                                                    {model.threshold != null ? ` / thresh ${model.threshold.toFixed(4)}` : ''}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Explanation summary */}
                            {explanation?.summary && (
                                <div className={styles.modelSection}>
                                    <span className={styles.modelSectionLabel}>AI EXPLANATION</span>
                                    <p className={styles.explanationSummary}>{explanation.summary}</p>
                                </div>
                            )}

                            {/* Any unrecognised extra entries */}
                            {extraEntries.length > 0 && (
                                <div className={styles.modelSection}>
                                    <span className={styles.modelSectionLabel}>ADDITIONAL DATA</span>
                                    <div className={styles.otherList}>
                                        {extraEntries.map(([key, val]) => (
                                            <div key={key} className={styles.otherRow}>
                                                <span className={styles.otherKey}>{formatKey(key)}</span>
                                                <ModelValue fieldKey={key} value={val} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>
                    )}

                    {/* Record info */}
                    <section className={`${styles.card} ${mounted ? styles.cardVisible : ''}`}
                        style={{ animationDelay: '210ms' }}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>RECORD INFO</h2>
                            <span className={styles.headerLine} />
                        </div>
                        <div className={styles.metaList}>
                            <div className={styles.metaRow}>
                                <span className={styles.metaKey}>Record ID</span>
                                <span className={styles.metaVal}>{record.id}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaKey}>Recorded At</span>
                                <span className={styles.metaVal}>{formatDate(record.recorded_at)}</span>
                            </div>
                            <div className={styles.metaRow}>
                                <span className={styles.metaKey}>Verdict</span>
                                <span className={`${styles.metaVal} ${isAnomaly ? styles.textAnomaly : styles.textNormal}`}>
                                    {record.verdict.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default AnalysisPage;
