import { Link } from 'react-router-dom';
import styles from './FeaturesPage.module.css';
import f1 from '../../assets/f1.jpg';
import f2 from '../../assets/f2.jpg';
import f3 from '../../assets/f3.jpg';
import f4 from '../../assets/f4.jpg';
import f5 from '../../assets/f5.jpg';
import f6 from '../../assets/f6.jpg';

const DETAILED_FEATURES = [
    {
        id: 'isolation-forest',
        image: f1,
        title: 'Isolation Forest',
        description: 'Efficient unsupervised algorithm that isolates anomalies by randomly partitioning the feature space.',
        benefits: [
            'Works without labeled training data',
            'Scales well with large datasets',
            'Low memory footprint',
            'Fast inference time',
        ],
    },
    {
        id: 'ocsvm',
        image: f2,
        title: 'One-Class SVM',
        description: 'Creates a decision boundary around normal data patterns to identify outliers in your health metrics.',
        benefits: [
            'Effective with high-dimensional data',
            'Robust to outliers in training',
            'Kernel flexibility',
            'Strong theoretical foundation',
        ],
    },
    {
        id: 'lstm',
        image: f3,
        title: 'LSTM Autoencoders',
        description: 'Deep learning models that capture temporal patterns in time-series health data.',
        benefits: [
            'Captures temporal dependencies',
            'Learns complex patterns',
            'Reconstruction-based detection',
            'Adapts to seasonal changes',
        ],
    },
    {
        id: 'realtime',
        image: f4,
        title: 'Real-Time Processing',
        description: 'Continuous monitoring with instant analysis and alerts when anomalies are detected.',
        benefits: [
            'Sub-second latency',
            'Streaming data support',
            'Configurable alert thresholds',
            'Push notifications',
        ],
    },
    {
        id: 'personalization',
        image: f5,
        title: 'Personalized Baselines',
        description: 'AI models learn your unique physiology to provide context-aware anomaly detection.',
        benefits: [
            'Individual pattern learning',
            'Adaptive thresholds',
            'Activity-aware analysis',
            'Sleep pattern recognition',
        ],
    },
    {
        id: 'privacy',
        image: f6,
        title: 'Privacy-First Design',
        description: 'End-to-end encryption and GDPR compliance for your sensitive health data.',
        benefits: [
            'UK GDPR compliant',
            'Data encryption at rest',
            'User data ownership',
            'Transparent data usage',
        ],
    },
];

export function FeaturesPage() {
    return (
        <div className={styles.features}>
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroCard}>
                    <div className={styles.heroMedia}>
                        <div className={styles.heroGradient} />
                        <div className={styles.heroMediaInner}>
                            <img src={f1} alt="Powerful Features" className={styles.heroImage} />
                        </div>
                    </div>

                    <div className={styles.heroInfo}>
                        <div className={styles.heroTextContent}>
                            <span className={styles.heroPlus}>+</span>
                            <h1 className={styles.heroTitle}>Powerful Features</h1>
                            <p className={styles.heroDescription}>
                                State-of-the-art machine learning algorithms combined with
                                privacy-first design to deliver accurate, interpretable health insights
                                that adapt to your unique physiological patterns.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Cards - Sticky Scroll */}
            {DETAILED_FEATURES.map((feature) => (
                <section key={feature.id} className={styles.featureCard}>
                    <div className={styles.cardInner}>
                        <div className={styles.cardMedia}>
                            <div className={styles.cardGradient} />
                            <div className={styles.cardMediaInner}>
                                <img src={feature.image} alt={feature.title} className={styles.cardImage} />
                            </div>
                        </div>

                        <div className={styles.cardInfo}>
                            <div className={styles.cardTextContent}>
                                <span className={styles.cardPlus}>+</span>
                                <h2 className={styles.cardTitle}>{feature.title}</h2>
                                <p className={styles.cardDescription}>{feature.description}</p>

                                <div className={styles.benefitsList}>
                                    {feature.benefits.map((benefit, index) => (
                                        <div key={index} className={styles.benefitItem}>
                                            <span className={styles.benefitCheck}>✓</span>
                                            <span className={styles.benefitText}>{benefit}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Link to="/signup" className={styles.cardLink}>
                                <div className={styles.dotsIcon}>
                                    <span className={styles.dot}></span>
                                    <span className={styles.dot}></span>
                                    <span className={styles.dot}></span>
                                    <span className={styles.dot}></span>
                                </div>
                                <span className={styles.cardLinkText}>GET STARTED</span>
                            </Link>
                        </div>
                    </div>
                </section>
            ))}

            {/* Comparison Section */}
            <section className={styles.comparisonSection}>
                <div className={styles.comparisonCard}>
                    <div className={styles.comparisonHeader}>
                        <span className={styles.comparisonPlus}>+</span>
                        <h2 className={styles.comparisonTitle}>How We Compare</h2>
                    </div>

                    <table className={styles.comparisonTable}>
                        <thead>
                            <tr>
                                <th>Feature</th>
                                <th>Traditional Apps</th>
                                <th className={styles.highlight}>HealthAI</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Anomaly Detection</td>
                                <td>Static thresholds</td>
                                <td className={styles.highlight}>ML-based adaptive detection</td>
                            </tr>
                            <tr>
                                <td>Personalization</td>
                                <td>Basic profiles</td>
                                <td className={styles.highlight}>Individual pattern learning</td>
                            </tr>
                            <tr>
                                <td>Interpretability</td>
                                <td><span className={styles.crossMark}>✗</span>Limited</td>
                                <td><span className={styles.checkMark}>✓</span>Full explanations</td>
                            </tr>
                            <tr>
                                <td>Time-Series Analysis</td>
                                <td><span className={styles.crossMark}>✗</span>Basic stats</td>
                                <td><span className={styles.checkMark}>✓</span>LSTM deep learning</td>
                            </tr>
                            <tr>
                                <td>GDPR Compliance</td>
                                <td>Varies</td>
                                <td><span className={styles.checkMark}>✓</span>Full compliance</td>
                            </tr>
                            <tr>
                                <td>Real-time Alerts</td>
                                <td>Delayed</td>
                                <td><span className={styles.checkMark}>✓</span>Instant</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}

export default FeaturesPage;
