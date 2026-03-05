import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import { Footer } from '../Footer';
import styles from './MainLayout.module.css';

interface MainLayoutProps {
    hideHeader?: boolean;
    hideFooter?: boolean;
}

export function MainLayout({ hideHeader = false, hideFooter = false }: MainLayoutProps) {
    return (
        <div className={styles.layout}>
            {!hideHeader && <Header />}
            <main className={`${styles.main} ${hideHeader ? styles.mainNoPadding : ''}`}>
                <Outlet />
            </main>
            {!hideFooter && <Footer />}
        </div>
    );
}

export default MainLayout;
