import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Github, Mail } from 'lucide-react';
import styles from './LoginPage.module.css';
import { useAuth } from '../../hooks';

export function LoginPage() {
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
            setError(error.message);
        } else {
            navigate('/dashboard');
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
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to access your health dashboard</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email" className={styles.label}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="your@email.com"
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="password" className={styles.label}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Enter your password"
                            required
                        />
                        <Link to="/forgot-password" className={styles.forgotPassword}>
                            Forgot password?
                        </Link>
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? 'SIGNING IN...' : 'SIGN IN'}
                    </button>
                </form>

                <div className={styles.divider}>
                    <span className={styles.dividerLine}></span>
                    <span className={styles.dividerText}>or continue with</span>
                    <span className={styles.dividerLine}></span>
                </div>

                <div className={styles.socialButtons}>
                    <button type="button" className={styles.socialBtn}>
                        <Mail size={18} /> Google
                    </button>
                    <button type="button" className={styles.socialBtn}>
                        <Github size={18} /> GitHub
                    </button>
                </div>

                <p className={styles.authFooter}>
                    Don't have an account?{' '}
                    <Link to="/signup" className={styles.authLink}>
                        Sign up free
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
