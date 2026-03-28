import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';
import styles from '../LoginPage/LoginPage.module.css';
import { useAuth } from '../../hooks';

export function ForgotPasswordPage() {
    const { resetPassword } = useAuth();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        const { error } = await resetPassword(email);
        if (error) {
            setError(error.message);
        } else {
            setSent(true);
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
                    <h1 className={styles.title}>Reset Password</h1>
                    <p className={styles.subtitle}>
                        {sent
                            ? 'Check your inbox for a reset link'
                            : "Enter your email and we'll send you a reset link"}
                    </p>
                </div>

                {!sent ? (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email" className={styles.label}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={styles.input}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        {error && <p className={styles.errorMessage}>{error}</p>}
                        <button type="submit" className={styles.submitBtn} disabled={submitting}>
                            {submitting ? 'SENDING...' : 'SEND RESET LINK'}
                        </button>
                    </form>
                ) : (
                    <p className={styles.errorMessage} style={{ color: '#4aff91', background: 'rgba(74,255,145,0.08)', borderColor: 'rgba(74,255,145,0.2)' }}>
                        A password reset link has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder).
                    </p>
                )}

                <p className={styles.authFooter}>
                    Remembered your password?{' '}
                    <Link to="/login" className={styles.authLink}>
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
