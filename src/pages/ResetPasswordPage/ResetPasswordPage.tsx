import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import styles from '../LoginPage/LoginPage.module.css';
import { supabase } from '../../config/supabase';
import { useAuth } from '../../hooks';

export function ResetPasswordPage() {
    const { updatePassword } = useAuth();
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);
    const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Supabase fires PASSWORD_RECOVERY when user lands here via the reset link
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setReady(true);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setSubmitting(true);
        setError('');
        const { error } = await updatePassword(formData.password);
        if (error) {
            setError(error.message);
        } else {
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        }
        setSubmitting(false);
    };

    return (
        <div className={styles.auth}>
            <div className={styles.authBackground}></div>

            <div className={styles.authCard}>
                <div className={styles.authHeader}>
                    <Link to="/" className={styles.logo}>
                        <Activity className={styles.logoIcon} size={28} color="#fff" strokeWidth={2} />
                        <span className={styles.logoText}>HealthAI</span>
                    </Link>
                    <h1 className={styles.title}>New Password</h1>
                    <p className={styles.subtitle}>
                        {success
                            ? 'Password updated — redirecting to login...'
                            : 'Choose a new password for your account'}
                    </p>
                </div>

                {success ? (
                    <p className={styles.errorMessage} style={{ color: '#4aff91', background: 'rgba(74,255,145,0.08)', borderColor: 'rgba(74,255,145,0.2)' }}>
                        Your password has been updated successfully. Redirecting to login...
                    </p>
                ) : !ready ? (
                    <p className={styles.errorMessage}>
                        Invalid or expired reset link. Please{' '}
                        <Link to="/forgot-password" className={styles.authLink}>
                            request a new one
                        </Link>
                        .
                    </p>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="password" className={styles.label}>
                                New Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Min. 8 characters"
                                minLength={8}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword" className={styles.label}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'UPDATING...' : 'UPDATE PASSWORD'}
                        </button>
                    </form>
                )}

                <p className={styles.authFooter}>
                    <Link to="/login" className={styles.authLink}>
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
