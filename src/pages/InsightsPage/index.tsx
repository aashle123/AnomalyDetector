import { useState, useEffect } from 'react';
import { db } from '../../services/api';
import type { SupabaseHealthRecord } from '../../services/api';
import { useAuth } from '../../hooks';
import {
    TrendingUp, Heart, Footprints, Moon,
    CheckCircle2, Brain, Activity, BarChart2
} from 'lucide-react';
import styles from './InsightsPage.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function fmt(n: number, dp = 1): string {
    return n.toFixed(dp);
}

function shortDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ── Health Score Ring ─────────────────────────────────────────────────────

function HealthRing({ score, anomalyCount, totalCount }: {
    score: number; anomalyCount: number; totalCount: number;
}) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 300);
        return () => clearTimeout(t);
    }, []);

    const r = 54;
    const circumference = 2 * Math.PI * r;
    const arc = animated ? circumference * (score / 100) : 0;
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
    const label = score >= 80 ? 'EXCELLENT' : score >= 50 ? 'MODERATE' : 'AT RISK';

    return (
        <div className={styles.ringWrap}>
            <svg viewBox="0 0 128 128" className={styles.ringSvg}>
                <defs>
                    <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                {/* Track */}
                <circle cx="64" cy="64" r={r} fill="none"
                    stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
                {/* Glow ring */}
                <circle cx="64" cy="64" r={r} fill="none"
                    stroke={color} strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${arc} ${circumference}`}
                    transform="rotate(-90 64 64)"
                    opacity="0.25"
                    filter="url(#ringGlow)"
                    style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
                {/* Main arc */}
                <circle cx="64" cy="64" r={r} fill="none"
                    stroke={color} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${arc} ${circumference}`}
                    transform="rotate(-90 64 64)"
                    style={{ transition: 'stroke-dasharray 1.4s cubic-bezier(0.34,1.56,0.64,1)' }}
                />
            </svg>
            <div className={styles.ringCenter}>
                <span className={styles.ringScore} style={{ color }}>{score}</span>
                <span className={styles.ringLabel} style={{ color }}>{label}</span>
                <span className={styles.ringMeta}>{totalCount - anomalyCount}/{totalCount} normal</span>
            </div>
        </div>
    );
}

// ── SVG Line Chart ────────────────────────────────────────────────────────

function LineChart({ data, color, yMin, yMax }: {
    data: { label: string; value: number }[];
    color: string;
    yMin?: number;
    yMax?: number;
}) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 500);
        return () => clearTimeout(t);
    }, []);

    if (data.length < 2) {
        return <div className={styles.chartEmpty}>Not enough data</div>;
    }

    const W = 500, H = 110;
    const P = { t: 10, r: 12, b: 22, l: 34 };
    const cW = W - P.l - P.r, cH = H - P.t - P.b;

    const vals = data.map(d => d.value);
    const minV = yMin ?? Math.min(...vals) - Math.max(5, (Math.max(...vals) - Math.min(...vals)) * 0.15);
    const maxV = yMax ?? Math.max(...vals) + Math.max(5, (Math.max(...vals) - Math.min(...vals)) * 0.15);
    const range = maxV - minV || 1;

    const xS = (i: number) => P.l + (i / (data.length - 1)) * cW;
    const yS = (v: number) => P.t + (1 - (v - minV) / range) * cH;

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(d.value).toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L${xS(data.length - 1).toFixed(1)},${(H - P.b).toFixed(1)} L${xS(0).toFixed(1)},${(H - P.b).toFixed(1)} Z`;
    const gradId = `grad_${color.replace('#', '')}`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {/* Grid */}
            {[0, 0.33, 0.67, 1].map(t => (
                <line key={t}
                    x1={P.l} y1={P.t + t * cH} x2={W - P.r} y2={P.t + t * cH}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                />
            ))}
            {/* Area */}
            <path d={areaPath} fill={`url(#${gradId})`}
                opacity={animated ? 1 : 0}
                style={{ transition: 'opacity 0.8s ease' }}
            />
            {/* Line */}
            <path d={linePath} fill="none" stroke={color} strokeWidth="1.8"
                opacity={animated ? 1 : 0}
                style={{ transition: 'opacity 0.6s ease' }}
            />
            {/* Dots */}
            {data.map((d, i) => (
                <circle key={i} cx={xS(i)} cy={yS(d.value)} r="3"
                    fill={color}
                    opacity={animated ? 1 : 0}
                    style={{ transition: `opacity 0.25s ease ${0.5 + i * 0.04}s` }}
                />
            ))}
            {/* X labels */}
            {data.map((d, i) => {
                if (data.length > 7 && i % 2 !== 0) return null;
                return (
                    <text key={i} x={xS(i)} y={H - 5} textAnchor="middle"
                        fontSize="8" fill="rgba(148,163,184,0.5)">
                        {d.label}
                    </text>
                );
            })}
            {/* Y axis */}
            <text x={P.l - 3} y={P.t + 5} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.4)">{fmt(maxV, 0)}</text>
            <text x={P.l - 3} y={H - P.b + 2} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.4)">{fmt(minV, 0)}</text>
        </svg>
    );
}

// ── SVG Bar Chart ─────────────────────────────────────────────────────────

function BarChart({ data, color, threshold, thresholdLabel }: {
    data: { label: string; value: number }[];
    color: string;
    threshold?: number;
    thresholdLabel?: string;
}) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 400);
        return () => clearTimeout(t);
    }, []);

    if (!data.length) return <div className={styles.chartEmpty}>No data</div>;

    const W = 500, H = 110;
    const P = { t: 10, r: 12, b: 22, l: 34 };
    const cW = W - P.l - P.r, cH = H - P.t - P.b;

    const maxV = Math.max(...data.map(d => d.value), threshold ?? 0) * 1.12 || 1;
    const barW = (cW / data.length) * 0.6;
    const gap = cW / data.length;

    const yS = (v: number) => cH * (1 - v / maxV);
    const barH = (v: number) => cH * (v / maxV);

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
            {/* Threshold */}
            {threshold != null && (
                <>
                    <line
                        x1={P.l} y1={P.t + yS(threshold)}
                        x2={W - P.r} y2={P.t + yS(threshold)}
                        stroke="rgba(245,158,11,0.5)" strokeWidth="1" strokeDasharray="4 3"
                    />
                    <text x={W - P.r - 2} y={P.t + yS(threshold) - 3}
                        textAnchor="end" fontSize="7.5" fill="rgba(245,158,11,0.7)">
                        {thresholdLabel}
                    </text>
                </>
            )}
            {/* Bars */}
            {data.map((d, i) => {
                const x = P.l + i * gap + (gap - barW) / 2;
                const h = animated ? barH(d.value) : 0;
                const y = animated ? P.t + yS(d.value) : P.t + cH;
                const meetsGoal = threshold != null && d.value >= threshold;
                return (
                    <g key={i}>
                        <rect
                            x={x} y={y} width={barW} height={h}
                            fill={meetsGoal ? '#22c55e' : color} rx="2" opacity="0.85"
                            style={{ transition: `all 0.55s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.04}s` }}
                        />
                        {(data.length <= 8 || i % 2 === 0) && (
                            <text x={x + barW / 2} y={H - 5} textAnchor="middle"
                                fontSize="8" fill="rgba(148,163,184,0.5)">
                                {d.label}
                            </text>
                        )}
                    </g>
                );
            })}
            <text x={P.l - 3} y={P.t + 5} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.4)">{fmt(maxV / 1.12, 0)}</text>
        </svg>
    );
}

// ── Dual Line Chart (BP) ──────────────────────────────────────────────────

function DualLineChart({ data }: {
    data: { label: string; systolic: number; diastolic: number }[];
}) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 500);
        return () => clearTimeout(t);
    }, []);

    if (data.length < 2) return <div className={styles.chartEmpty}>Not enough data</div>;

    const W = 500, H = 110;
    const P = { t: 10, r: 12, b: 22, l: 34 };
    const cW = W - P.l - P.r, cH = H - P.t - P.b;

    const allVals = [...data.map(d => d.systolic), ...data.map(d => d.diastolic)];
    const minV = Math.min(...allVals) - 10;
    const maxV = Math.max(...allVals) + 10;
    const range = maxV - minV || 1;

    const xS = (i: number) => P.l + (i / (data.length - 1)) * cW;
    const yS = (v: number) => P.t + (1 - (v - minV) / range) * cH;

    const sysPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(d.systolic).toFixed(1)}`).join(' ');
    const diaPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xS(i).toFixed(1)},${yS(d.diastolic).toFixed(1)}`).join(' ');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className={styles.chartSvg} preserveAspectRatio="xMidYMid meet">
            {[0, 0.5, 1].map(t => (
                <line key={t}
                    x1={P.l} y1={P.t + t * cH} x2={W - P.r} y2={P.t + t * cH}
                    stroke="rgba(255,255,255,0.04)" strokeWidth="1"
                />
            ))}
            <path d={sysPath} fill="none" stroke="#ef4444" strokeWidth="1.8"
                opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.6s ease' }} />
            <path d={diaPath} fill="none" stroke="#f97316" strokeWidth="1.8"
                opacity={animated ? 1 : 0} style={{ transition: 'opacity 0.6s ease 0.15s' }} />
            {data.map((d, i) => (
                <g key={i}>
                    <circle cx={xS(i)} cy={yS(d.systolic)} r="3" fill="#ef4444"
                        opacity={animated ? 1 : 0} style={{ transition: `opacity 0.25s ease ${0.5 + i * 0.05}s` }} />
                    <circle cx={xS(i)} cy={yS(d.diastolic)} r="3" fill="#f97316"
                        opacity={animated ? 1 : 0} style={{ transition: `opacity 0.25s ease ${0.6 + i * 0.05}s` }} />
                </g>
            ))}
            {data.map((d, i) => {
                if (data.length > 7 && i % 2 !== 0) return null;
                return (
                    <text key={i} x={xS(i)} y={H - 5} textAnchor="middle"
                        fontSize="8" fill="rgba(148,163,184,0.5)">
                        {d.label}
                    </text>
                );
            })}
            <text x={P.l - 3} y={P.t + 5} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.4)">{fmt(maxV - 10, 0)}</text>
            <text x={P.l - 3} y={H - P.b + 2} textAnchor="end" fontSize="8" fill="rgba(148,163,184,0.4)">{fmt(minV + 10, 0)}</text>
        </svg>
    );
}

// ── Stress Distribution Bars ──────────────────────────────────────────────

function StressDistribution({ stressValues }: { stressValues: number[] }) {
    const [animated, setAnimated] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => setAnimated(true), 400);
        return () => clearTimeout(t);
    }, []);

    if (!stressValues.length) return <div className={styles.chartEmpty}>No stress data recorded</div>;

    // Bucket 1-3 (low), 4-6 (medium), 7-10 (high)
    const buckets = [
        { label: 'LOW (1–3)', count: stressValues.filter(v => v <= 3).length, color: '#22c55e' },
        { label: 'MEDIUM (4–6)', count: stressValues.filter(v => v >= 4 && v <= 6).length, color: '#f59e0b' },
        { label: 'HIGH (7–10)', count: stressValues.filter(v => v >= 7).length, color: '#ef4444' },
    ];
    const maxCount = Math.max(...buckets.map(b => b.count), 1);

    return (
        <div className={styles.stressBars}>
            {buckets.map((b, i) => (
                <div key={i} className={styles.stressRow}>
                    <span className={styles.stressLabel}>{b.label}</span>
                    <div className={styles.stressTrack}>
                        <div
                            className={styles.stressFill}
                            style={{
                                width: animated ? `${(b.count / maxCount) * 100}%` : '0%',
                                background: b.color,
                                transition: `width 0.7s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s`,
                            }}
                        />
                    </div>
                    <span className={styles.stressCount} style={{ color: b.color }}>{b.count}</span>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export function InsightsPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<SupabaseHealthRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (!user?.id) return;
        db.getHistory(user.id).then(data => {
            setRecords(data);
            setLoading(false);
        });
    }, [user?.id]);

    useEffect(() => {
        if (!loading) {
            const t = setTimeout(() => setMounted(true), 80);
            return () => clearTimeout(t);
        }
    }, [loading]);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingState}>
                    <div className={styles.loadingDots}>
                        <span /><span /><span />
                    </div>
                    Loading health data...
                </div>
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <BarChart2 size={44} strokeWidth={1} />
                    <p>No readings yet.<br />Go to Monitor to record your first reading.</p>
                </div>
            </div>
        );
    }

    // ── Data processing ──────────────────────────────────────────────────

    const total = records.length;
    const anomalies = records.filter(r => r.verdict === 'anomaly').length;
    const healthScore = Math.round(((total - anomalies) / total) * 100);

    const hrVals = records.map(r => r.heart_rate);
    const stepsVals = records.map(r => r.daily_steps);
    const sleepVals = records.filter(r => r.sleep_duration != null).map(r => r.sleep_duration!);
    const stressVals = records.filter(r => r.stress_level != null).map(r => r.stress_level!);
    const qosVals = records.filter(r => r.quality_of_sleep != null).map(r => r.quality_of_sleep!);
    const bpRecords = records.filter(r => r.bp_systolic != null && r.bp_diastolic != null);

    const avgHR = avg(hrVals);
    const avgSteps = avg(stepsVals);
    const avgSleep = sleepVals.length ? avg(sleepVals) : null;
    const avgStress = stressVals.length ? avg(stressVals) : null;
    const avgQos = qosVals.length ? avg(qosVals) : null;

    // Last 10 readings, oldest first for left→right
    const trend = [...records].slice(0, 10).reverse();

    const hrTrend = trend.map(r => ({ label: shortDate(r.recorded_at), value: r.heart_rate }));
    const stepsTrend = trend.map(r => ({ label: shortDate(r.recorded_at), value: r.daily_steps }));
    const sleepTrend = trend.filter(r => r.sleep_duration != null)
        .map(r => ({ label: shortDate(r.recorded_at), value: r.sleep_duration! }));
    const bpTrend = [...bpRecords].slice(0, 10).reverse()
        .map(r => ({ label: shortDate(r.recorded_at), systolic: r.bp_systolic!, diastolic: r.bp_diastolic! }));

    // ── Generate insights ─────────────────────────────────────────────────

    const insights: { text: string; severity: 'good' | 'warn' | 'bad' }[] = [];

    if (avgHR > 100) {
        insights.push({ text: `Average heart rate of ${fmt(avgHR, 0)} bpm is elevated (normal: 60–100 bpm). Persistent tachycardia warrants medical review.`, severity: 'bad' });
    } else if (avgHR < 60) {
        insights.push({ text: `Average heart rate of ${fmt(avgHR, 0)} bpm is below the typical range. May indicate high fitness or bradycardia — consult a physician if symptomatic.`, severity: 'warn' });
    } else {
        insights.push({ text: `Heart rate averages ${fmt(avgHR, 0)} bpm — within the healthy resting range of 60–100 bpm.`, severity: 'good' });
    }

    if (avgSteps < 3000) {
        insights.push({ text: `Daily step average of ${Math.round(avgSteps).toLocaleString()} is critically low. Sedentary behaviour is associated with elevated cardiovascular risk.`, severity: 'bad' });
    } else if (avgSteps < 7500) {
        insights.push({ text: `Daily step average of ${Math.round(avgSteps).toLocaleString()} is moderate. Reaching 7,500–10,000 steps is associated with significantly lower mortality risk.`, severity: 'warn' });
    } else {
        insights.push({ text: `Daily step average of ${Math.round(avgSteps).toLocaleString()} is strong — meeting or exceeding the wellness benchmark.`, severity: 'good' });
    }

    if (avgSleep !== null) {
        if (avgSleep < 6) {
            insights.push({ text: `Sleep duration averages ${fmt(avgSleep)} hrs — below the 7–9 hr recommendation. Chronic under-sleeping is linked to impaired immune function and metabolic changes.`, severity: 'bad' });
        } else if (avgSleep > 9) {
            insights.push({ text: `Sleep duration averages ${fmt(avgSleep)} hrs. Consistently sleeping over 9 hours may indicate fatigue or underlying conditions worth monitoring.`, severity: 'warn' });
        } else {
            insights.push({ text: `Sleep duration of ${fmt(avgSleep)} hrs per night is within the recommended adult range of 7–9 hours.`, severity: 'good' });
        }
    }

    if (avgStress !== null) {
        if (avgStress > 7) {
            insights.push({ text: `Average stress of ${fmt(avgStress)}/10 is high. Sustained elevated stress is associated with increased anomaly risk and cardiovascular strain.`, severity: 'bad' });
        } else if (avgStress > 4) {
            insights.push({ text: `Average stress level of ${fmt(avgStress)}/10 is moderate. Consider stress management practices to improve overall health score.`, severity: 'warn' });
        } else {
            insights.push({ text: `Average stress of ${fmt(avgStress)}/10 is well-managed.`, severity: 'good' });
        }
    }

    if (anomalies === 0) {
        insights.push({ text: `All ${total} readings returned normal verdicts. Your metrics are statistically stable across all sessions.`, severity: 'good' });
    } else {
        const rate = Math.round((anomalies / total) * 100);
        insights.push({
            text: `${rate}% of readings (${anomalies}/${total}) were flagged as anomalies. ${rate >= 40 ? 'This rate is significant — a healthcare professional should review your results.' : 'Monitor for patterns across future readings.'}`,
            severity: rate >= 40 ? 'bad' : 'warn',
        });
    }

    const kpiItems = [
        { icon: <Activity size={15} />, value: String(total), label: 'TOTAL READINGS', delay: 60 },
        { icon: <CheckCircle2 size={15} />, value: `${healthScore}%`, label: 'HEALTH SCORE', delay: 100, color: healthScore >= 80 ? '#22c55e' : healthScore >= 50 ? '#f59e0b' : '#ef4444' },
        { icon: <Heart size={15} />, value: fmt(avgHR, 0), label: 'AVG HEART RATE (bpm)', delay: 140 },
        { icon: <Footprints size={15} />, value: Math.round(avgSteps).toLocaleString(), label: 'AVG DAILY STEPS', delay: 180 },
        ...(avgSleep !== null ? [{ icon: <Moon size={15} />, value: `${fmt(avgSleep)}h`, label: 'AVG SLEEP', delay: 220 }] : []),
        ...(avgStress !== null ? [{ icon: <Brain size={15} />, value: fmt(avgStress), label: 'AVG STRESS /10', delay: 260 }] : []),
        ...(avgQos !== null ? [{ icon: <TrendingUp size={15} />, value: `${fmt(avgQos)}/10`, label: 'AVG SLEEP QUALITY', delay: 300 }] : []),
    ];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={`${styles.pageHeader} ${mounted ? styles.fadeIn : ''}`}>
                <div>
                    <h1 className={styles.pageTitle}>Health Intelligence</h1>
                    <p className={styles.pageSubtitle}>
                        Insights drawn from {total} recorded reading{total !== 1 ? 's' : ''}
                    </p>
                </div>
                <span className={styles.lastUpdated}>LAST ENTRY · {shortDate(records[0].recorded_at)}</span>
            </div>

            {/* KPI strip */}
            <div className={`${styles.kpiStrip} ${mounted ? styles.fadeIn : ''}`}
                style={{ transitionDelay: '60ms' }}>
                {kpiItems.map((k, i) => (
                    <div key={i} className={styles.kpiCard}
                        style={{ transitionDelay: `${k.delay}ms` }}>
                        <span className={styles.kpiIcon}>{k.icon}</span>
                        <span className={styles.kpiValue} style={k.color ? { color: k.color } : undefined}>
                            {k.value}
                        </span>
                        <span className={styles.kpiLabel}>{k.label}</span>
                    </div>
                ))}
            </div>

            {/* Main layout */}
            <div className={styles.mainGrid}>

                {/* Charts column */}
                <div className={styles.chartsCol}>

                    {/* Heart rate */}
                    <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                        style={{ transitionDelay: '120ms' }}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h3 className={styles.chartTitle}>HEART RATE TREND</h3>
                                <span className={styles.chartSub}>Last {hrTrend.length} readings · bpm</span>
                            </div>
                            <div className={styles.chartStat}>
                                <span className={styles.chartStatVal}>{fmt(avgHR, 0)}</span>
                                <span className={styles.chartStatUnit}>avg bpm</span>
                            </div>
                        </div>
                        <LineChart data={hrTrend} color="#f59e0b" yMin={50} yMax={140} />
                    </div>

                    {/* Steps */}
                    <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                        style={{ transitionDelay: '190ms' }}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h3 className={styles.chartTitle}>DAILY STEPS</h3>
                                <span className={styles.chartSub}>Goal: 5,000 steps · green = met</span>
                            </div>
                            <div className={styles.chartStat}>
                                <span className={styles.chartStatVal}>{Math.round(avgSteps).toLocaleString()}</span>
                                <span className={styles.chartStatUnit}>avg</span>
                            </div>
                        </div>
                        <BarChart data={stepsTrend} color="#475569" threshold={5000} thresholdLabel="5k goal" />
                    </div>

                    {/* Sleep duration */}
                    {sleepTrend.length >= 2 && (
                        <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                            style={{ transitionDelay: '260ms' }}>
                            <div className={styles.chartHeader}>
                                <div>
                                    <h3 className={styles.chartTitle}>SLEEP DURATION</h3>
                                    <span className={styles.chartSub}>Hours per session</span>
                                </div>
                                <div className={styles.chartStat}>
                                    <span className={styles.chartStatVal}>{fmt(avgSleep ?? 0)}</span>
                                    <span className={styles.chartStatUnit}>avg hrs</span>
                                </div>
                            </div>
                            <LineChart data={sleepTrend} color="#14b8a6" yMin={0} yMax={12} />
                        </div>
                    )}

                    {/* BP */}
                    {bpTrend.length >= 2 && (
                        <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                            style={{ transitionDelay: '330ms' }}>
                            <div className={styles.chartHeader}>
                                <div>
                                    <h3 className={styles.chartTitle}>BLOOD PRESSURE</h3>
                                    <span className={styles.chartSub}>mmHg over time</span>
                                </div>
                                <div className={styles.bpLegend}>
                                    <span className={styles.bpItem}>
                                        <span className={styles.bpDot} style={{ background: '#ef4444' }} />SYS
                                    </span>
                                    <span className={styles.bpItem}>
                                        <span className={styles.bpDot} style={{ background: '#f97316' }} />DIA
                                    </span>
                                </div>
                            </div>
                            <DualLineChart data={bpTrend} />
                        </div>
                    )}

                    {/* Stress distribution */}
                    {stressVals.length > 0 && (
                        <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                            style={{ transitionDelay: '400ms' }}>
                            <div className={styles.chartHeader}>
                                <div>
                                    <h3 className={styles.chartTitle}>STRESS DISTRIBUTION</h3>
                                    <span className={styles.chartSub}>{stressVals.length} readings with stress data</span>
                                </div>
                                <div className={styles.chartStat}>
                                    <span className={styles.chartStatVal}>{fmt(avgStress ?? 0)}</span>
                                    <span className={styles.chartStatUnit}>avg /10</span>
                                </div>
                            </div>
                            <StressDistribution stressValues={stressVals} />
                        </div>
                    )}
                </div>

                {/* Right column: score + insights */}
                <div className={styles.rightCol}>

                    {/* Health score */}
                    <div className={`${styles.chartCard} ${styles.scoreCard} ${mounted ? styles.cardIn : ''}`}
                        style={{ transitionDelay: '80ms' }}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>HEALTH SCORE</h3>
                            <span className={styles.chartSub}>{total} readings analysed</span>
                        </div>
                        <HealthRing score={healthScore} anomalyCount={anomalies} totalCount={total} />
                        <div className={styles.scoreSplit}>
                            <div className={styles.splitStat}>
                                <span className={styles.splitVal} style={{ color: '#22c55e' }}>{total - anomalies}</span>
                                <span className={styles.splitLabel}>NORMAL</span>
                            </div>
                            <div className={styles.splitDivider} />
                            <div className={styles.splitStat}>
                                <span className={styles.splitVal}
                                    style={{ color: anomalies > 0 ? '#ef4444' : 'rgba(148,163,184,0.4)' }}>
                                    {anomalies}
                                </span>
                                <span className={styles.splitLabel}>ANOMALY</span>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    <div className={`${styles.chartCard} ${mounted ? styles.cardIn : ''}`}
                        style={{ transitionDelay: '160ms' }}>
                        <div className={styles.chartHeader}>
                            <h3 className={styles.chartTitle}>HEALTH INSIGHTS</h3>
                        </div>
                        <div className={styles.insightList}>
                            {insights.map((ins, i) => (
                                <div key={i} className={`${styles.insightItem} ${styles[`sev_${ins.severity}`]}`}>
                                    <span className={styles.insightDot} />
                                    <p className={styles.insightText}>{ins.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default InsightsPage;
