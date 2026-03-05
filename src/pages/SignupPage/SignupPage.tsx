import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import styles from '../LoginPage/LoginPage.module.css';
import { useAuth } from '../../hooks';

export function SignupPage() {
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        setSubmitting(true);
        setError('');
        const { error } = await signUp(formData.email, formData.password, formData.name);
        if (error) {
            setError(error.message);
        } else {
            navigate('/login', { state: { message: 'Account created! Please check your email to verify.' } });
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
                    <h1 className={styles.title}>Create Account</h1>
                    <p className={styles.subtitle}>Start your health monitoring journey</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="name" className={styles.label}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Your full name"
                            required
                        />
                    </div>
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
                            placeholder="Create a password"
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
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    {error && <p className={styles.errorMessage}>{error}</p>}
                    <button type="submit" className={styles.submitBtn} disabled={submitting}>
                        {submitting ? 'CREATING...' : 'CREATE ACCOUNT'}
                    </button>
                </form>

                <p className={styles.authFooter}>
                    Already have an account?{' '}
                    <Link to="/login" className={styles.authLink}>
                        Sign in
                    </Link>
                </p>

                <p className={styles.terms}>
                    By signing up, you agree to our{' '}
                    <Link to="/terms" className={styles.termsLink}>
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className={styles.termsLink}>
                        Privacy Policy
                    </Link>
                    .
                </p>
            </div>
        </div>
    );
}

export default SignupPage;
