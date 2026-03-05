import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks';
import { supabase } from '../../config/supabase';
import styles from './SettingsPage.module.css';

function formatMemberSince(iso: string): string {
    return new Date(iso).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
    });
}

export function SettingsPage() {
    const { user } = useAuth();
    const [displayName, setDisplayName] = useState('');
    const [initialName, setInitialName] = useState('');
    const [saving, setSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');

    useEffect(() => {
        if (!user?.id) return;
        supabase
            .from('profiles')
            .select('display_name')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
                const name = data?.display_name ?? '';
                setDisplayName(name);
                setInitialName(name);
            });
    }, [user?.id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setSaving(true);
        setSuccessMsg('');
        setErrorMsg('');

        const { error } = await supabase
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', user.id);

        setSaving(false);
        if (error) {
            setErrorMsg('Failed to update profile. Please try again.');
        } else {
            setInitialName(displayName);
            setSuccessMsg('Profile updated successfully');
            setTimeout(() => setSuccessMsg(''), 3000);
        }
    };

    const handleDeleteReadings = async () => {
        if (!user?.id) return;
        const confirmed = window.confirm(
            'Are you sure you want to delete all your health readings? This action cannot be undone.'
        );
        if (!confirmed) return;

        setDeleteSuccess('');
        const { error } = await supabase
            .from('health_readings')
            .delete()
            .eq('user_id', user.id);

        if (error) {
            setErrorMsg('Failed to delete readings. Please try again.');
        } else {
            setDeleteSuccess('All readings deleted successfully.');
        }
    };

    const isDirty = displayName !== initialName;

    return (
        <div className={styles.page}>
            {/* Page Title */}
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Settings</h1>
            </div>

            {/* Profile Section */}
            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2 className={styles.sectionTitle}>PROFILE</h2>
                    <div className={styles.headerLine} />
                </div>

                <form className={styles.form} onSubmit={handleSave}>
                    <div className={styles.fieldGroup}>
                        <label className={styles.label} htmlFor="displayName">
                            Display Name
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            className={styles.input}
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter your display name"
                            maxLength={64}
                        />
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Email</label>
                        <div className={styles.readonlyField}>{user?.email ?? '—'}</div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Account ID</label>
                        <div className={`${styles.readonlyField} ${styles.monoField}`}>
                            {user?.id ? `${user.id.substring(0, 8)}...` : '—'}
                        </div>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Member Since</label>
                        <div className={styles.readonlyField}>
                            {user?.created_at ? formatMemberSince(user.created_at) : '—'}
                        </div>
                    </div>

                    <div className={styles.formFooter}>
                        <button
                            type="submit"
                            className={styles.saveBtn}
                            disabled={saving || !isDirty}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        {successMsg && <p className={styles.successMsg}>{successMsg}</p>}
                        {errorMsg && <p className={styles.errorMsg}>{errorMsg}</p>}
                    </div>
                </form>
            </section>

            {/* Danger Zone */}
            <section className={`${styles.section} ${styles.dangerZone}`}>
                <div className={styles.sectionHeader}>
                    <h2 className={`${styles.sectionTitle} ${styles.dangerTitle}`}>DANGER ZONE</h2>
                    <div className={styles.headerLine} />
                </div>

                <div className={styles.dangerContent}>
                    <div className={styles.dangerInfo}>
                        <p className={styles.dangerLabel}>Delete All My Readings</p>
                        <p className={styles.dangerDescription}>
                            Permanently remove all your stored health readings from the database.
                            This action cannot be undone.
                        </p>
                    </div>
                    <button
                        type="button"
                        className={styles.dangerBtn}
                        onClick={handleDeleteReadings}
                    >
                        Delete All Readings
                    </button>
                </div>
                {deleteSuccess && <p className={styles.successMsg}>{deleteSuccess}</p>}
            </section>
        </div>
    );
}

export default SettingsPage;
