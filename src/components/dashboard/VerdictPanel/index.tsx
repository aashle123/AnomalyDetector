import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import styles from './VerdictPanel.module.css';

interface VerdictPanelProps {
    status: 'pending' | 'normal' | 'anomaly';
    confidence?: number;
    zScores?: Record<string, number>;
}

export function VerdictPanel({ status, confidence, zScores }: VerdictPanelProps) {
    if (status === 'pending') {
        return (
            <div className={styles.pendingPanel}>
                <span className={styles.pendingText}>AWAITING INPUT</span>
            </div>
        );
    }

    const isAnomaly = status === 'anomaly';
    const confidencePct = confidence ? Math.round(confidence * 100) : 0;

    return (
        <div className={`${styles.panel} ${isAnomaly ? styles.anomaly : styles.normal}`}>
            <div className={styles.header}>
                {isAnomaly ? (
                    <AlertCircle size={32} className={styles.icon} strokeWidth={2} />
                ) : (
                    <CheckCircle2 size={32} className={styles.icon} strokeWidth={2} />
                )}
                <div className={styles.verdictTitle}>
                    {isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL READINGS'}
                </div>
            </div>

            <div className={styles.confidenceSection}>
                <div className={styles.confidenceLabel}>
                    <span>AI CONFIDENCE</span>
                    <span>{confidencePct}%</span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${confidencePct}%` }}
                    />
                </div>
            </div>

            {zScores && Object.keys(zScores).length > 0 && (
                <div className={styles.explainabilitySection}>
                    <div className={styles.explainabilityHeader}>
                        <Info size={14} />
                        <span>STATISTICAL DEVIATIONS (Z-SCORES)</span>
                    </div>
                    <div className={styles.zScoreList}>
                        {Object.entries(zScores)
                            .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
                            .slice(0, 4) // Show top 4 contributing factors
                            .map(([key, value]) => (
                                <div key={key} className={styles.zScoreItem}>
                                    <span className={styles.zScoreKey}>
                                        {key.replace(/_/g, ' ')}
                                    </span>
                                    <span className={`${styles.zScoreValue} ${Math.abs(value) > 2 ? styles.zScoreHigh : ''}`}>
                                        {value > 0 ? '+' : ''}{value.toFixed(1)}
                                    </span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default VerdictPanel;
