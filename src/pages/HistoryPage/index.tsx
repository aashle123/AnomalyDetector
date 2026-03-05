import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/api';
import type { SupabaseHealthRecord } from '../../services/api';
import styles from './HistoryPage.module.css';

type FilterType = 'ALL' | 'NORMAL' | 'ANOMALY';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

function formatBP(systolic?: number | null, diastolic?: number | null): string {
    if (systolic && diastolic) return `${systolic}/${diastolic}`;
    return '—';
}

const SKELETON_COUNT = 6;

export function HistoryPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [records, setRecords] = useState<SupabaseHealthRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterType>('ALL');

    useEffect(() => {
        if (!user?.id) return;
        setLoading(true);
        db.getHistory(user.id).then((data) => {
            setRecords(data);
            setLoading(false);
        });
    }, [user?.id]);

    const filtered = records.filter((r) => {
        if (filter === 'ALL') return true;
        if (filter === 'NORMAL') return r.verdict === 'normal';
        if (filter === 'ANOMALY') return r.verdict === 'anomaly';
        return true;
    });

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Reading History</h1>
                <div className={styles.filterBar}>
                    {(['ALL', 'NORMAL', 'ANOMALY'] as FilterType[]).map((f) => (
                        <button
                            key={f}
                            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.sectionHeader}>
                <h2>ALL READINGS</h2>
                <div className={styles.headerLine} />
            </div>

            {loading ? (
                <>
                    {/* Desktop skeleton */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>DATE / TIME</th>
                                    <th className={styles.th}>HEART RATE</th>
                                    <th className={styles.th}>PAL</th>
                                    <th className={styles.th}>STEPS</th>
                                    <th className={styles.th}>SLEEP</th>
                                    <th className={styles.th}>QOS</th>
                                    <th className={styles.th}>STRESS</th>
                                    <th className={styles.th}>BP</th>
                                    <th className={styles.th}>VERDICT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                                    <tr key={i} className={styles.skeletonRow}>
                                        {Array.from({ length: 9 }).map((__, j) => (
                                            <td key={j} className={styles.td}>
                                                <span className={styles.skeletonCell} />
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile skeleton */}
                    <div className={styles.cardStack}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className={styles.mobileCard}>
                                <div className={styles.mobileCardHeader}>
                                    <span className={`${styles.skeletonCell} ${styles.skeletonShort}`} />
                                    <span className={`${styles.skeletonCell} ${styles.skeletonBadge}`} />
                                </div>
                                <div className={styles.mobileCardGrid}>
                                    {Array.from({ length: 6 }).map((__, j) => (
                                        <div key={j} className={styles.mobileMetric}>
                                            <span className={`${styles.skeletonCell} ${styles.skeletonLabel}`} />
                                            <span className={`${styles.skeletonCell} ${styles.skeletonValue}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : filtered.length === 0 ? (
                <div className={styles.empty}>
                    {records.length === 0
                        ? 'No readings yet. Go to Monitor to record your first reading.'
                        : `No ${filter.toLowerCase()} readings found.`}
                </div>
            ) : (
                <>
                    {/* Desktop table */}
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>DATE / TIME</th>
                                    <th className={styles.th}>HEART RATE</th>
                                    <th className={styles.th}>PAL</th>
                                    <th className={styles.th}>STEPS</th>
                                    <th className={styles.th}>SLEEP</th>
                                    <th className={styles.th}>QOS</th>
                                    <th className={styles.th}>STRESS</th>
                                    <th className={styles.th}>BP</th>
                                    <th className={styles.th}>VERDICT</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((r) => (
                                    <tr key={r.id} className={`${styles.tr} ${styles.trClickable}`} onClick={() => navigate(`/dashboard/analysis/${r.id}`)}>
                                        <td className={styles.td}>
                                            <span className={styles.monoText}>{formatDate(r.recorded_at)}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.metricValue}>{r.heart_rate}</span>
                                            <span className={styles.metricUnit}> bpm</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.metricValue}>{r.physical_activity_level}</span>
                                            <span className={styles.metricUnit}> score</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.metricValue}>{r.daily_steps.toLocaleString()}</span>
                                            <span className={styles.metricUnit}> steps</span>
                                        </td>
                                        <td className={styles.td}>
                                            {r.sleep_duration != null ? (
                                                <>
                                                    <span className={styles.metricValue}>{r.sleep_duration}</span>
                                                    <span className={styles.metricUnit}> hr</span>
                                                </>
                                            ) : (
                                                <span className={styles.metricMissing}>—</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {r.quality_of_sleep != null ? (
                                                <>
                                                    <span className={styles.metricValue}>{r.quality_of_sleep}</span>
                                                    <span className={styles.metricUnit}> /10</span>
                                                </>
                                            ) : (
                                                <span className={styles.metricMissing}>—</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            {r.stress_level != null ? (
                                                <>
                                                    <span className={styles.metricValue}>{r.stress_level}</span>
                                                    <span className={styles.metricUnit}> /10</span>
                                                </>
                                            ) : (
                                                <span className={styles.metricMissing}>—</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.monoText}>
                                                {formatBP(r.bp_systolic, r.bp_diastolic)}
                                            </span>
                                            {r.bp_systolic && r.bp_diastolic && (
                                                <span className={styles.metricUnit}> mmHg</span>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            <span
                                                className={`${styles.badge} ${
                                                    r.verdict === 'anomaly'
                                                        ? styles.badgeAnomaly
                                                        : styles.badgeNormal
                                                }`}
                                            >
                                                {r.verdict.toUpperCase()}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile card stack */}
                    <div className={styles.cardStack}>
                        {filtered.map((r) => (
                            <div key={r.id} className={styles.mobileCard} onClick={() => navigate(`/dashboard/analysis/${r.id}`)} style={{ cursor: 'pointer' }}>
                                <div className={styles.mobileCardHeader}>
                                    <span className={styles.mobileCardTime}>{formatDate(r.recorded_at)}</span>
                                    <span className={`${styles.badge} ${r.verdict === 'anomaly' ? styles.badgeAnomaly : styles.badgeNormal}`}>
                                        {r.verdict.toUpperCase()}
                                    </span>
                                </div>
                                <div className={styles.mobileCardGrid}>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>HEART RATE</span>
                                        <span className={styles.mobileMetricValue}>{r.heart_rate} <span className={styles.mobileMetricUnit}>bpm</span></span>
                                    </div>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>STEPS</span>
                                        <span className={styles.mobileMetricValue}>{r.daily_steps.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>ACTIVITY</span>
                                        <span className={styles.mobileMetricValue}>{r.physical_activity_level} <span className={styles.mobileMetricUnit}>score</span></span>
                                    </div>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>BLOOD PRESSURE</span>
                                        <span className={styles.mobileMetricValue}>
                                            {r.bp_systolic && r.bp_diastolic
                                                ? <>{formatBP(r.bp_systolic, r.bp_diastolic)} <span className={styles.mobileMetricUnit}>mmHg</span></>
                                                : <span className={styles.mobileMetricMissing}>—</span>
                                            }
                                        </span>
                                    </div>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>SLEEP</span>
                                        <span className={styles.mobileMetricValue}>
                                            {r.sleep_duration != null
                                                ? <>{r.sleep_duration} <span className={styles.mobileMetricUnit}>hr</span></>
                                                : <span className={styles.mobileMetricMissing}>—</span>
                                            }
                                        </span>
                                    </div>
                                    <div className={styles.mobileMetric}>
                                        <span className={styles.mobileMetricLabel}>STRESS</span>
                                        <span className={styles.mobileMetricValue}>
                                            {r.stress_level != null
                                                ? <>{r.stress_level} <span className={styles.mobileMetricUnit}>/10</span></>
                                                : <span className={styles.mobileMetricMissing}>—</span>
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default HistoryPage;
