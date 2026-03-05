import { Link } from 'react-router-dom';
import { FEATURES, HOW_IT_WORKS } from '../../constants';
import styles from './HomePage.module.css';
import heroVideo from '../../assets/videos/hero.mp4';
import f1 from '../../assets/f1.jpg';
import f2 from '../../assets/f2.jpg';
import f3 from '../../assets/f3.jpg';
import f4 from '../../assets/f4.jpg';
import f5 from '../../assets/f5.jpg';
import f6 from '../../assets/f6.jpg';
import howItWorksImg from '../../assets/howitworks.jpg';

export function HomePage() {
    const handleScrollDown = () => {
        const featuresSection = document.getElementById('features');
        if (featuresSection) {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className={styles.hero}>
                {/* Video Container */}
                <div className={styles.videoContainer}>
                    <div className={styles.videoFallback} />
                    <div className={styles.videoWrapper}>
                        <video
                            className={styles.heroVideo}
                            autoPlay
                            loop
                            muted
                            playsInline
                            src={heroVideo}
                        />
                    </div>

                    {/* Text Overlay */}
                    <div className={styles.textOverlay}>
                        <div className={styles.textHeading}>
                            <h2 className={styles.labelText}>EXPLORATION OF</h2>
                            <h1 className={styles.headlineText}>PERSONAL</h1>
                            <h1 className={styles.headlineText}>HEALTH</h1>
                            <h1 className={styles.headlineText}>ANOMALIES</h1>
                        </div>
                    </div>

                    {/* Scroll Down Button */}
                    <div className={styles.scrollDownContainer}>
                        <button
                            className={styles.scrollDownBtn}
                            onClick={handleScrollDown}
                            aria-label="Scroll to features"
                        >
                            <div className={styles.scrollDownBg} />
                            <span className={styles.scrollDownText}>SCROLL DOWN</span>
                            <div className={styles.scrollDownChevron} />
                        </button>
                    </div>

                    {/* Bottom Cutout Shape */}
                    <div className={styles.bottomCutout} />
                </div>
            </section>

            {/* Features Section - Sticky Scroll Cards */}
            <section id="features" className={styles.features}>
                {FEATURES.map((feature, index) => {
                    const featureImages = [f1, f2, f3, f4, f5, f6];
                    return (
                        <div key={feature.id} className={styles.projectCard}>
                            {/* Project Media */}
                            <Link to="/features" className={styles.projectMedia}>
                                <div className={styles.projectGradient} />
                                <div className={styles.projectMediaInner}>
                                    <img
                                        src={featureImages[index]}
                                        alt={feature.title}
                                        className={styles.projectImage}
                                    />
                                </div>
                            </Link>

                            {/* Project Info */}
                            <div className={styles.projectInfo}>
                                <div className={styles.projectTextContent}>
                                    <span className={styles.projectPlus}>+</span>
                                    <h2 className={styles.projectTitle}>{feature.title}</h2>
                                    <p className={styles.projectDescription}>
                                        {feature.description}
                                    </p>
                                </div>

                                {/* View Project Link */}
                                <Link to="/features" className={styles.viewProjectLink}>
                                    <div className={styles.dotsIcon}>
                                        <span className={styles.dot}></span>
                                        <span className={styles.dot}></span>
                                        <span className={styles.dot}></span>
                                        <span className={styles.dot}></span>
                                    </div>
                                    <span className={styles.viewProjectText}>LEARN MORE</span>
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* How It Works Section - Single Card */}
            <section className={styles.howItWorks}>
                <div className={styles.howItWorksCard}>
                    {/* Media Section */}
                    <div className={styles.howItWorksMedia}>
                        <div className={styles.howItWorksGradient} />
                        <div className={styles.howItWorksMediaInner}>
                            <img
                                src={howItWorksImg}
                                alt="How It Works Process"
                                className={styles.howItWorksImage}
                            />
                        </div>
                    </div>

                    {/* Info Section */}
                    <div className={styles.howItWorksInfo}>
                        <div className={styles.howItWorksTextContent}>
                            <span className={styles.howItWorksPlus}>+</span>
                            <h2 className={styles.howItWorksTitle}>How It Works</h2>

                            {/* Steps List */}
                            <div className={styles.stepsList}>
                                {HOW_IT_WORKS.map((item) => (
                                    <div key={item.step} className={styles.stepItem}>
                                        <span className={styles.stepNumber}>0{item.step}</span>
                                        <div className={styles.stepContent}>
                                            <h3 className={styles.stepTitle}>{item.title}</h3>
                                            <p className={styles.stepDescription}>{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* View Link */}
                        <Link to="/about" className={styles.howItWorksLink}>
                            <div className={styles.dotsIcon}>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                                <span className={styles.dot}></span>
                            </div>
                            <span className={styles.howItWorksLinkText}>LEARN MORE</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className={styles.cta}>
                <div className={styles.ctaContent}>
                    <h2 className={styles.ctaTitle}>Ready to Start?</h2>
                    <p className={styles.ctaSubtitle}>
                        TAKE CONTROL OF YOUR HEALTH JOURNEY
                    </p>
                    <Link to="/signup" className={styles.ctaBtn}>
                        Get Started Free
                        <span>→</span>
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default HomePage;
