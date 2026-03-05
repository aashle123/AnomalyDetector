import { supabase } from '../config/supabase';

const API_BASE_URL = 'https://ayushidave-personal-anomoly-detector.hf.space';

// ── AI API types ────────────────────────────────────────────────────────────

export interface HealthReading {
    session_id: string;
    physical_activity_level: number;
    heart_rate: number;
    daily_steps: number;
    sleep_duration?: number;
    quality_of_sleep?: number;
    stress_level?: number;
    bp_systolic?: number;
    bp_diastolic?: number;
    save_record?: boolean;
}

export interface ModelResult {
    label: 'normal' | 'anomaly';
    score: number;
    anomaly: boolean;
    threshold?: number;
}

export interface ExplanationDriver {
    feature: string;
    display_name: string;
    value: number;
    unit: string;
    z_score: number;
    direction: string;
    normal_range: string;
}

export interface PredictionResponse {
    input: Record<string, number>;
    models: Record<string, ModelResult>;
    ensemble: {
        verdict: 'normal' | 'anomaly';
        total_models: number;
        anomaly_count: number;
    };
    explanation?: {
        drivers: ExplanationDriver[];
        summary: string;
    };
    timestamp: string;
    session_id: string;
    disclaimer?: string;
}

// ── Supabase DB record type (mirrors health_readings table) ─────────────────

export interface SupabaseHealthRecord {
    id: string;
    user_id: string;
    recorded_at: string;
    heart_rate: number;
    physical_activity_level: number;
    daily_steps: number;
    sleep_duration?: number | null;
    quality_of_sleep?: number | null;
    stress_level?: number | null;
    bp_systolic?: number | null;
    bp_diastolic?: number | null;
    notes?: string | null;
    verdict: 'normal' | 'anomaly';
    raw_api_response: Record<string, unknown>;
}

// ── AI API client ────────────────────────────────────────────────────────────

export const api = {
    predict: async (data: HealthReading): Promise<PredictionResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ save_record: true, ...data }),
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail?.[0]?.msg || 'Prediction request failed');
        }
        return response.json();
    },

    exportCsv: async (sessionId: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/api/v1/export/${sessionId}`);
        if (!response.ok) throw new Error('Export failed');
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `health_records_${sessionId.substring(0, 8)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
};

// ── Supabase DB layer ────────────────────────────────────────────────────────

type ReadingInput = Omit<HealthReading, 'session_id' | 'save_record'>;

export const db = {
    saveReading: async (
        userId: string,
        input: ReadingInput,
        apiResult: PredictionResponse
    ): Promise<SupabaseHealthRecord | null> => {
        const { data, error } = await supabase
            .from('health_readings')
            .insert({
                user_id: userId,
                heart_rate: input.heart_rate,
                physical_activity_level: input.physical_activity_level,
                daily_steps: input.daily_steps,
                sleep_duration: input.sleep_duration ?? null,
                quality_of_sleep: input.quality_of_sleep ?? null,
                stress_level: input.stress_level ?? null,
                bp_systolic: input.bp_systolic ?? null,
                bp_diastolic: input.bp_diastolic ?? null,
                verdict: apiResult.ensemble.verdict,
                raw_api_response: apiResult as unknown as Record<string, unknown>,
            })
            .select()
            .single();

        if (error) {
            console.error('Supabase insert error:', error.message);
            return null;
        }
        return data as SupabaseHealthRecord;
    },

    getRecord: async (id: string): Promise<SupabaseHealthRecord | null> => {
        const { data, error } = await supabase
            .from('health_readings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Supabase fetch error:', error.message);
            return null;
        }
        return data as SupabaseHealthRecord;
    },

    getHistory: async (userId: string): Promise<SupabaseHealthRecord[]> => {
        const { data, error } = await supabase
            .from('health_readings')
            .select('*')
            .eq('user_id', userId)
            .order('recorded_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Supabase fetch error:', error.message);
            return [];
        }
        return (data ?? []) as SupabaseHealthRecord[];
    },
};
