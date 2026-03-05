import type { NavItem } from '../types';

// App Information
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Health Anomaly Detector';
export const APP_DESCRIPTION = 'AI-powered personal health monitoring and anomaly detection platform';
export const APP_VERSION = '1.0.0';

// Navigation Items
export const NAV_ITEMS: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/features' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
];

export const AUTH_NAV_ITEMS: NavItem[] = [
    { label: 'Login', path: '/login' },
    { label: 'Sign Up', path: '/signup' },
];

// Feature List for Features Page
export const FEATURES = [
    {
        id: 'ml-detection',
        title: 'Machine Learning Detection',
        description: 'Advanced algorithms including Isolation Forest, One-Class SVM, and LSTM autoencoders for accurate anomaly detection.',
        icon: '🧠',
    },
    {
        id: 'real-time',
        title: 'Real-Time Monitoring',
        description: 'Continuous health data analysis with instant alerts when unusual patterns are detected.',
        icon: '⚡',
    },
    {
        id: 'personalized',
        title: 'Personalized Baselines',
        description: 'Models learn your unique health patterns to provide context-aware, individual-specific insights.',
        icon: '👤',
    },
    {
        id: 'interpretable',
        title: 'Interpretable Insights',
        description: 'Clear explanations for every detected anomaly, helping you understand what the data means.',
        icon: '📊',
    },
    {
        id: 'secure',
        title: 'GDPR Compliant',
        description: 'Built with privacy-first principles, fully compliant with UK GDPR for health data protection.',
        icon: '🔒',
    },
    {
        id: 'alerts',
        title: 'Smart Alerts',
        description: 'Configurable notification system that alerts you only when action is needed.',
        icon: '🔔',
    },
];

// How It Works Steps
export const HOW_IT_WORKS = [
    {
        step: 1,
        title: 'Connect Your Data',
        description: 'Securely sync your health data from wearables and manual entries.',
    },
    {
        step: 2,
        title: 'AI Analysis',
        description: 'Our ML models learn your personal health patterns and baselines.',
    },
    {
        step: 3,
        title: 'Get Insights',
        description: 'Receive personalized alerts and interpretable health insights.',
    },
];

// Footer Links
export const FOOTER_LINKS = {
    product: [
        { label: 'Features', path: '/features' },
        { label: 'Pricing', path: '/pricing' },
        { label: 'FAQ', path: '/faq' },
    ],
    company: [
        { label: 'About', path: '/about' },
        { label: 'Contact', path: '/contact' },
        { label: 'Careers', path: '/careers' },
    ],
    legal: [
        { label: 'Privacy Policy', path: '/privacy' },
        { label: 'Terms of Service', path: '/terms' },
        { label: 'Cookie Policy', path: '/cookies' },
    ],
};
