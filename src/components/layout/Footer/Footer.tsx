import { Link } from 'react-router-dom';
import { FOOTER_LINKS, APP_DESCRIPTION } from '../../../constants';
import styles from './Footer.module.css';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerTop}>
                    {/* Brand Section */}
                    <div className={styles.footerBrand}>
                        <Link to="/" className={styles.footerLogo}>
                            HEALTHAI
                        </Link>
                        <p className={styles.footerDescription}>{APP_DESCRIPTION}</p>
                    </div>

                    {/* Product Links */}
                    <div className={styles.footerSection}>
                        <h4>Product</h4>
                        <div className={styles.footerLinks}>
                            {FOOTER_LINKS.product.map((link) => (
                                <Link key={link.path} to={link.path} className={styles.footerLink}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Company Links */}
                    <div className={styles.footerSection}>
                        <h4>Company</h4>
                        <div className={styles.footerLinks}>
                            {FOOTER_LINKS.company.map((link) => (
                                <Link key={link.path} to={link.path} className={styles.footerLink}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className={styles.footerSection}>
                        <h4>Legal</h4>
                        <div className={styles.footerLinks}>
                            {FOOTER_LINKS.legal.map((link) => (
                                <Link key={link.path} to={link.path} className={styles.footerLink}>
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.footerBottom}>
                    <p className={styles.copyright}>
                        © {currentYear} HealthAI. All rights reserved.
                    </p>
                    <div className={styles.socialLinks}>
                        <a href="#" className={styles.socialLink} aria-label="Twitter">
                            𝕏
                        </a>
                        <a href="#" className={styles.socialLink} aria-label="LinkedIn">
                            in
                        </a>
                        <a href="#" className={styles.socialLink} aria-label="GitHub">
                            ⌂
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
