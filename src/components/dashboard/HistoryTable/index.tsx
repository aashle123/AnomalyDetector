import { useNavigate } from 'react-router-dom';
import styles from './HistoryTable.module.css';

interface HistoryRecord {
    id: string;
    timestamp: string;
    metrics: {
        hr: number;
        bp: string;
        steps: number;
    };
    verdict: 'normal' | 'anomaly';
}

interface HistoryTableProps {
    records: HistoryRecord[];
}

export function HistoryTable({ records }: HistoryTableProps) {
    const navigate = useNavigate();

    if (!records || records.length === 0) {
        return (
            <div className={styles.emptyTable}>
                NO HISTORY FOUND
            </div>
        );
    }

    return (
        <div>
            {/* Desktop table */}
            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>TIME</th>
                            <th>HR</th>
                            <th>BP</th>
                            <th>STEPS</th>
                            <th>VERDICT</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr key={record.id} className={styles.row}>
                                <td className={styles.timeCell}>{record.timestamp}</td>
                                <td className={styles.metricCell}>{record.metrics.hr}</td>
                                <td className={styles.metricCell}>{record.metrics.bp}</td>
                                <td className={styles.metricCell}>{record.metrics.steps}</td>
                                <td className={styles.verdictCell}>
                                    <span className={`${styles.verdictBadge} ${record.verdict === 'anomaly' ? styles.badgeAnomaly : styles.badgeNormal}`}>
                                        {record.verdict.toUpperCase()}
                                    </span>
                                </td>
                                <td className={styles.actionCell}>
                                    <button className={styles.viewBtn} onClick={() => navigate(`/dashboard/analysis/${record.id}`)}>VIEW →</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile card stack */}
            <div className={styles.cardStack}>
                {records.map((record) => (
                    <div key={record.id} className={styles.mobileCard}>
                        <div className={styles.mobileCardHeader}>
                            <span className={styles.mobileCardTime}>{record.timestamp}</span>
                            <span className={`${styles.verdictBadge} ${record.verdict === 'anomaly' ? styles.badgeAnomaly : styles.badgeNormal}`}>
                                {record.verdict.toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.mobileCardGrid}>
                            <div className={styles.mobileMetric}>
                                <span className={styles.mobileMetricLabel}>HR</span>
                                <span className={styles.mobileMetricValue}>{record.metrics.hr} bpm</span>
                            </div>
                            <div className={styles.mobileMetric}>
                                <span className={styles.mobileMetricLabel}>BP</span>
                                <span className={styles.mobileMetricValue}>{record.metrics.bp}</span>
                            </div>
                            <div className={styles.mobileMetric}>
                                <span className={styles.mobileMetricLabel}>STEPS</span>
                                <span className={styles.mobileMetricValue}>{record.metrics.steps}</span>
                            </div>
                        </div>
                        <div className={styles.mobileCardFooter}>
                            <button className={styles.viewBtn} onClick={() => navigate(`/dashboard/analysis/${record.id}`)}>VIEW →</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HistoryTable;
