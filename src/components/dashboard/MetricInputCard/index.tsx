import React, { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import styles from './MetricInputCard.module.css';

interface MetricInputCardProps {
    id: string;
    label: string;
    icon: LucideIcon;
    value: number | string;
    onChange: (id: string, value: number | string) => void;
    min?: number;
    max?: number;
    unit?: string;
    step?: number;
    type?: 'number' | 'text';
    placeholder?: string;
    required?: boolean;
    helperText?: string;
}

export function MetricInputCard({
    id,
    label,
    icon: Icon,
    value,
    onChange,
    min,
    max,
    unit,
    step = 1,
    type = 'number',
    placeholder,
    required = false,
    helperText
}: MetricInputCardProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Pass raw string while typing — do NOT clamp mid-keystroke
        onChange(id, e.target.value);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        // Clamp to valid range only when the user leaves the field
        const raw = e.target.value;
        if (raw === '') return;
        const num = Number(raw);
        if (isNaN(num)) return;
        let clamped = num;
        if (min !== undefined && num < min) clamped = min;
        if (max !== undefined && num > max) clamped = max;
        if (clamped !== num) onChange(id, String(clamped));
    };

    return (
        <div className={`${styles.card} ${isFocused ? styles.focused : ''}`}>
            <div className={styles.cardHeader}>
                <div className={styles.labelGroup}>
                    <Icon size={16} className={styles.icon} strokeWidth={2} />
                    <label htmlFor={id} className={styles.label}>
                        {label} {required && <span className={styles.required}>*</span>}
                    </label>
                </div>
            </div>

            <div className={styles.inputWrapper}>
                <input
                    id={id}
                    type={type}
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={handleBlur}
                    min={min}
                    max={max}
                    step={step}
                    placeholder={placeholder}
                    className={styles.input}
                    required={required}
                    inputMode="decimal"
                    autoComplete="off"
                />
                {unit && <span className={styles.unit}>{unit}</span>}
            </div>

            {helperText && (
                <div className={styles.helperText}>{helperText}</div>
            )}
        </div>
    );
}

export default MetricInputCard;
