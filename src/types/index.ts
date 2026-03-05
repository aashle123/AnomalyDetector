// User related types
export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
}

// Health data types
export interface HealthMetric {
    id: string;
    user_id: string;
    metric_type: MetricType;
    value: number;
    unit: string;
    recorded_at: string;
    created_at: string;
}

export type MetricType =
    | 'heart_rate'
    | 'blood_pressure_systolic'
    | 'blood_pressure_diastolic'
    | 'steps'
    | 'sleep_hours'
    | 'weight'
    | 'temperature'
    | 'oxygen_saturation';

// Anomaly detection types
export interface Anomaly {
    id: string;
    user_id: string;
    metric_type: MetricType;
    detected_at: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    value: number;
    expected_range: {
        min: number;
        max: number;
    };
}

// Navigation types
export interface NavItem {
    label: string;
    path: string;
    icon?: string;
}

// Component prop types
export interface ButtonProps {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}
