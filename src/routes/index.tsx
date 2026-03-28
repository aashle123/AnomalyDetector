import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { MainLayout } from '../components/layout';
import { useAuth } from '../hooks';

// Page imports
import HomePage from '../pages/HomePage';
import AboutPage from '../pages/AboutPage';
import FeaturesPage from '../pages/FeaturesPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import ContactPage from '../pages/ContactPage';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardPage from '../pages/DashboardPage';
import HistoryPage from '../pages/HistoryPage';
import SettingsPage from '../pages/SettingsPage';
import ExportPage from '../pages/ExportPage';
import AnalysisPage from '../pages/AnalysisPage';
import InsightsPage from '../pages/InsightsPage';

function ProtectedRoute() {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    return <Outlet />;
}

// Define routes
const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'about',
                element: <AboutPage />,
            },
            {
                path: 'features',
                element: <FeaturesPage />,
            },
            {
                path: 'contact',
                element: <ContactPage />,
            },
        ],
    },
    // Auth pages with minimal layout (no header/footer)
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/signup',
        element: <SignupPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    // Protected Dashboard routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/dashboard',
                element: <DashboardLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                    {
                        path: 'history',
                        element: <HistoryPage />,
                    },
                    {
                        path: 'settings',
                        element: <SettingsPage />,
                    },
                    {
                        path: 'export',
                        element: <ExportPage />,
                    },
                    {
                        path: 'insights',
                        element: <InsightsPage />,
                    },
                    {
                        path: 'analysis/:id',
                        element: <AnalysisPage />,
                    },
                ],
            },
        ],
    },
]);

export function AppRouter() {
    return <RouterProvider router={router} />;
}

export default AppRouter;
