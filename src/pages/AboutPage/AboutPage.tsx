import { Link } from 'react-router-dom';
import styles from './AboutPage.module.css';
import missionImg from '../../assets/about_mission.jpg';
import techImg from '../../assets/about_tech.jpg';
import mlImg from '../../assets/about_ml.jpg';
import ethicsImg from '../../assets/about_ethics.jpg';

export function AboutPage() {
    const techStack = [
        { icon: '⚛️', name: 'React', desc: 'Frontend' },
        { icon: '🗄️', name: 'Supabase', desc: 'Database & Auth' },
        { icon: '🐍', name: 'Python', desc: 'AI Models' },
        { icon: '📊', name: 'TensorFlow', desc: 'Deep Learning' },
    ];

    const mlAlgorithms = [
        {
            title: 'Isolation Forest',
            desc: 'Unsupervised algorithm that isolates anomalies by randomly selecting features and split values.',
        },
        {
            title: 'One-Class SVM',
            desc: 'Learns a boundary around normal health data patterns, identifying deviations as anomalies.',
        },
        {
            title: 'LSTM Autoencoders',
            desc: 'Deep learning models that capture temporal patterns and detect anomalies via reconstruction error.',
        },
        {
            title: 'Ensemble Methods',
            desc: 'Combining multiple algorithms for robust detection while reducing false positives.',
        },
    ];

    const ethicsItems = [
        { icon: '🔒', title: 'GDPR Compliant', desc: 'Full compliance with UK GDPR for sensitive health data protection.' },
        { icon: '📖', title: 'Interpretability', desc: 'Clear explanations for every alert to help you understand the data.' },
        { icon: '👁️', title: 'Transparency', desc: 'Open about our methods, limitations, and how your data generates insights.' },
    ];

    return (
        <div className={styles.about}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroCard}>
                    <div className={styles.heroMedia}>
                        <div className={styles.heroGradient} />
                        <div className={styles.heroMediaInner}>
                            <img src={missionImg} alt="About HealthAI" className={styles.heroImage} />
                        </div>
                    </div>

                    <div className={styles.heroInfo}>
                        <div className={styles.heroTextContent}>
                            <span className={styles.heroPlus}>+</span>
                            <h1 className={styles.heroTitle}>About HealthAI</h1>
                            <p className={styles.heroDescription}>
                                We're building the future of personal health monitoring through advanced
                                machine learning and a commitment to user privacy, transparency, and
                                interpretability. Our platform adapts to your unique physiological patterns
                                to provide timely, actionable health insights.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className={styles.sectionCard}>
                <div className={styles.cardInner}>
                    <div className={styles.cardMedia}>
                        <div className={styles.cardGradient} />
                        <div className={styles.cardMediaInner}>
                            <img src={missionImg} alt="Our Mission" className={styles.cardImage} />
                        </div>
                    </div>

                    <div className={styles.cardInfo}>
                        <div className={styles.cardTextContent}>
                            <span className={styles.cardPlus}>+</span>
                            <h2 className={styles.cardTitle}>Our Mission</h2>

                            <div className={styles.contentList}>
                                <div className={styles.contentItem}>
                                    <span className={styles.contentNumber}>01</span>
                                    <div className={styles.contentDetails}>
                                        <h3 className={styles.contentItemTitle}>The Problem</h3>
                                        <p className={styles.contentItemDesc}>
                                            Current health platforms rely on static, predefined thresholds lacking
                                            the analytical depth of adaptive, personalized ML models for detecting
                                            subtle physiological deviations.
                                        </p>
                                    </div>
                                </div>
                                <div className={styles.contentItem}>
                                    <span className={styles.contentNumber}>02</span>
                                    <div className={styles.contentDetails}>
                                        <h3 className={styles.contentItemTitle}>Our Solution</h3>
                                        <p className={styles.contentItemDesc}>
                                            We combine advanced ML algorithms with interpretability and user
                                            experience to provide timely, actionable health insights that adapt
                                            to your unique patterns.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link to="/features" className={styles.cardLink}>
                            <div className={styles.dotsIcon}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                            <span className={styles.cardLinkText}>VIEW FEATURES</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Technology Stack Section */}
            <section className={styles.sectionCard}>
                <div className={styles.cardInner}>
                    <div className={styles.cardMedia}>
                        <div className={styles.cardGradient} />
                        <div className={styles.cardMediaInner}>
                            <img src={techImg} alt="Technology Stack" className={styles.cardImage} />
                        </div>
                    </div>

                    <div className={styles.cardInfo}>
                        <div className={styles.cardTextContent}>
                            <span className={styles.cardPlus}>+</span>
                            <h2 className={styles.cardTitle}>Technology Stack</h2>

                            <div className={styles.techGrid}>
                                {techStack.map((tech, idx) => (
                                    <div key={idx} className={styles.techItem}>
                                        <div className={styles.techIcon}>{tech.icon}</div>
                                        <div className={styles.techName}>{tech.name}</div>
                                        <div className={styles.techDesc}>{tech.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ML Approach Section */}
            <section className={styles.sectionCard}>
                <div className={styles.cardInner}>
                    <div className={styles.cardMedia}>
                        <div className={styles.cardGradient} />
                        <div className={styles.cardMediaInner}>
                            <img src={mlImg} alt="ML Approach" className={styles.cardImage} />
                        </div>
                    </div>

                    <div className={styles.cardInfo}>
                        <div className={styles.cardTextContent}>
                            <span className={styles.cardPlus}>+</span>
                            <h2 className={styles.cardTitle}>Our ML Approach</h2>

                            <div className={styles.contentList}>
                                {mlAlgorithms.map((algo, idx) => (
                                    <div key={idx} className={styles.contentItem}>
                                        <span className={styles.contentNumber}>0{idx + 1}</span>
                                        <div className={styles.contentDetails}>
                                            <h3 className={styles.contentItemTitle}>{algo.title}</h3>
                                            <p className={styles.contentItemDesc}>{algo.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Ethics & Compliance Section */}
            <section className={styles.sectionCard}>
                <div className={styles.cardInner}>
                    <div className={styles.cardMedia}>
                        <div className={styles.cardGradient} />
                        <div className={styles.cardMediaInner}>
                            <img src={ethicsImg} alt="Ethics & Compliance" className={styles.cardImage} />
                        </div>
                    </div>

                    <div className={styles.cardInfo}>
                        <div className={styles.cardTextContent}>
                            <span className={styles.cardPlus}>+</span>
                            <h2 className={styles.cardTitle}>Ethics & Compliance</h2>

                            <div className={styles.ethicsGrid}>
                                {ethicsItems.map((item, idx) => (
                                    <div key={idx} className={styles.ethicsItem}>
                                        <div className={styles.ethicsIcon}>{item.icon}</div>
                                        <h3 className={styles.ethicsTitle}>{item.title}</h3>
                                        <p className={styles.ethicsDesc}>{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Link to="/contact" className={styles.cardLink}>
                            <div className={styles.dotsIcon}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                            <span className={styles.cardLinkText}>CONTACT US</span>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default AboutPage;
