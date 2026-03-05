import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

const MENU_ITEMS = [
    { number: '01', label: 'HOME', path: '/' },
    { number: '02', label: 'FEATURES', path: '/features' },
    { number: '03', label: 'ABOUT', path: '/about' },
    { number: '04', label: 'CONTACT', path: '/contact' },
];

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    // Prevent body scroll when menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
                {/* Nav Container with SVG Shape */}
                <div className={styles.navContainer}>
                    <div className={styles.navInner}>
                        {/* Top black bar */}
                        <div className={styles.navTopBar} />

                        {/* Rounded edge decorations */}
                        <div className={styles.roundedEdgeLeft} />
                        <div className={styles.roundedEdgeRight} />

                        {/* Main nav shape */}
                        <div className={styles.navShape} />

                        {/* Logo */}
                        <Link to="/" className={styles.logo}>
                            HEALTHAI
                        </Link>
                    </div>
                </div>

                {/* Hamburger Menu Button */}
                <button
                    className={`${styles.mobileMenuBtn} ${isMobileMenuOpen ? styles.mobileMenuBtnOpen : ''}`}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={styles.menuBar}></span>
                    <span className={styles.menuBar}></span>
                    <span className={styles.menuBar}></span>
                </button>
            </header>

            {/* Full Screen Menu */}
            <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
                <div className={styles.menuContent}>
                    <nav className={styles.menuNav}>
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={styles.menuNavItem}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span className={styles.menuNavNumber}>{item.number}</span>
                                <span className={styles.menuNavText}>{item.label}</span>
                                <span className={styles.menuNavPlus}>+</span>
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.menuFooter}>
                        <Link to="/login" className={styles.menuFooterLink} onClick={() => setIsMobileMenuOpen(false)}>
                            LOGIN
                        </Link>
                        <Link to="/signup" className={styles.menuFooterLink} onClick={() => setIsMobileMenuOpen(false)}>
                            SIGN UP
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;
