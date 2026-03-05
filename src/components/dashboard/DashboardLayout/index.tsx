import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, History, Settings, LogOut, Menu, X, Download, BarChart2 } from 'lucide-react';
import styles from './DashboardLayout.module.css';
import { useAuth } from '../../../hooks/useAuth';

export function DashboardLayout() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const navItems = [
        { path: '/dashboard', label: 'Monitor', icon: <Activity strokeWidth={1.5} size={20} />, exact: true },
        { path: '/dashboard/insights', label: 'Insights', icon: <BarChart2 strokeWidth={1.5} size={20} /> },
        { path: '/dashboard/history', label: 'History', icon: <History strokeWidth={1.5} size={20} /> },
        { path: '/dashboard/export', label: 'Export', icon: <Download strokeWidth={1.5} size={20} /> },
        { path: '/dashboard/settings', label: 'Settings', icon: <Settings strokeWidth={1.5} size={20} /> },
    ];

    return (
        <div className={styles.layout}>
            {/* Mobile Header */}
            <header className={styles.mobileHeader}>
                <div className={styles.mobileLogo}>
                    <Activity className={styles.logoIcon} strokeWidth={2} size={24} />
                    <span>HealthAI</span>
                </div>
                <button
                    className={styles.mobileMenuBtn}
                    onClick={toggleMobileMenu}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar Desktop / Mobile Drawer */}
            <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Activity className={styles.logoIcon} strokeWidth={2} size={28} color="#fff" />
                    <span className={styles.logoText}>HealthAI</span>
                </div>

                <div className={styles.patientInfo}>
                    <div className={styles.patientLabel}>PATIENT RECORD</div>
                    <div className={styles.patientName}>{user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Guest Patient'}</div>
                    <div className={styles.patientId}>ID: {user?.id?.substring(0, 8) || '---------'}</div>
                    <div className={styles.statusBadge}>
                        <span className={styles.statusDot}></span>
                        ACTIVE
                    </div>
                </div>

                <nav className={styles.navigation}>
                    <div className={styles.navSection}>VIEWS</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.exact}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={({ isActive }) =>
                                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                            }
                        >
                            <span className={styles.navIcon}>{item.icon}</span>
                            <span className={styles.navLabel}>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className={styles.sidebarFooter}>
                    <button onClick={handleSignOut} className={styles.logoutBtn}>
                        <LogOut strokeWidth={1.5} size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className={styles.mainContent}>
                <div className={styles.contentWrapper}>
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div className={styles.overlay} onClick={() => setIsMobileMenuOpen(false)} />
            )}
        </div>
    );
}

export default DashboardLayout;
