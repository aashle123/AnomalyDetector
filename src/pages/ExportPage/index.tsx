import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { db, api } from '../../services/api';
import styles from './ExportPage.module.css';

export function ExportPage() {
    const { user } = useAuth();
    const [readingCount, setReadingCount] = useState<number | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    const [loadingCount, setLoadingCount] = useState(true);

    useEffect(() => {
        if (!user?.id) return;
        db.getHistory(user.id).then((records) => {
            setReadingCount(records.length);
            setLoadingCount(false);
        });
    }, [user?.id]);

    const handleExport = async () => {
        if (!user?.id) return;
        setIsExporting(true);
        setExportError('');
        try {
            await api.exportCsv(user.id);
        } catch (err) {
            setExportError(
                err instanceof Error ? err.message : 'Export failed. Please try again.'
            );
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Page Header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Export Data</h1>
            </div>

            {/* Summary Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>YOUR DATA</h2>
                    <div className={styles.headerLine} />
                </div>

                <div className={styles.summaryCard}>
                    <div className={styles.summaryCount}>
                        {loadingCount ? (
                            <span className={styles.countSkeleton} />
                        ) : (
                            <span className={styles.countNumber}>{readingCount ?? 0}</span>
                        )}
                        <span className={styles.countLabel}>readings stored</span>
                    </div>
                    <p className={styles.summaryDesc}>
                        Your data is exported as a CSV file containing all recorded health metrics
                        and AI verdicts.
                    </p>
                </div>
            </section>

            {/* Download Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>DOWNLOAD</h2>
                    <div className={styles.headerLine} />
                </div>

                <div className={styles.downloadCard}>
                    <div className={styles.downloadInfo}>
                        <p className={styles.downloadTitle}>Export as CSV</p>
                        <p className={styles.downloadDesc}>
                            Downloads a comma-separated values file with all your heart rate,
                            activity, sleep, stress, blood pressure, and verdict data.
                        </p>
                    </div>
                    <button
                        className={styles.downloadBtn}
                        onClick={handleExport}
                        disabled={isExporting || readingCount === 0}
                    >
                        {isExporting ? 'Exporting...' : 'Download CSV'}
                    </button>
                    {exportError && <p className={styles.errorMsg}>{exportError}</p>}
                    {readingCount === 0 && !loadingCount && (
                        <p className={styles.emptyNote}>
                            No readings to export. Go to Monitor to record your first reading.
                        </p>
                    )}
                </div>
            </section>

            {/* About Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>ABOUT YOUR DATA</h2>
                    <div className={styles.headerLine} />
                </div>

                <div className={styles.aboutCard}>
                    <div className={styles.aboutItem}>
                        <div className={styles.aboutDot} />
                        <div>
                            <p className={styles.aboutItemTitle}>Supabase (Our Database)</p>
                            <p className={styles.aboutItemDesc}>
                                Your health readings are securely stored in our Supabase
                                database, tied to your account. Only you can access your records.
                            </p>
                        </div>
                    </div>
                    <div className={styles.aboutItem}>
                        <div className={styles.aboutDot} />
                        <div>
                            <p className={styles.aboutItemTitle}>AI Analysis Service</p>
                            <p className={styles.aboutItemDesc}>
                                Each reading is also processed by our hosted anomaly detection
                                model. The AI verdict and confidence scores are stored alongside
                                your raw metrics. The CSV export is generated from this service.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default ExportPage;
