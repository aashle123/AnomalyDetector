# HealthAI — System Overview & Database Plan

---

## Part 1: How the System Works (End-to-End)

### User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│  1. SIGN UP                                                     │
│     User creates account (email + password)                     │
│     → Supabase Auth creates a user record                       │
│     → Our DB auto-creates a `profiles` row for that user        │
│     → User's Supabase UUID becomes their permanent `session_id` │
│       (this gets sent to the AI API on every reading)           │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  2. LOG IN                                                      │
│     User logs in → redirected to their personal Dashboard       │
│     Dashboard loads their saved reading history from Supabase   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  3. ENTER HEALTH METRICS (on Dashboard)                         │
│     User fills in their current readings:                       │
│       Heart Rate, BP, Steps, Sleep, Stress, Activity Level      │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  4. CLICK "ANALYZE & SAVE"                                      │
│     Our app sends the reading to the AI API:                    │
│       POST https://ayushidave-personal-anomoly-detector.hf.space│
│            /api/v1/predict                                      │
│       Body: { session_id, heart_rate, bp_systolic, ... }        │
│                                                                 │
│     API returns:                                                │
│       → Ensemble verdict (normal / anomaly)                     │
│       → Per-model scores                                        │
│       → Z-score explainability data                             │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  5. RESULT DISPLAYED + SAVED                                    │
│     Dashboard shows: ✅ NORMAL  or  ⚠️ ANOMALY                  │
│     Full result is saved as a new row in `health_readings` DB   │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  6. VIEW HISTORY                                                │
│     User can see all past readings in a history table/chart     │
│     Each row shows: timestamp, metrics, verdict                 │
└────────────────────────┬────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  7. EXPORT (Optional)                                           │
│     User clicks "Export CSV"                                    │
│     → Calls GET /api/v1/export/{session_id}                     │
│     → CSV file downloaded to their device                       │
└─────────────────────────────────────────────────────────────────┘
```

> **Key design decision:** The user's Supabase Auth UUID is used as `session_id`.
> This means the AI API's own internal record storage (via `save_record`) and our
> Supabase DB are always in sync for the same user — no separate ID to manage.

---

## Part 2: Database Schema (Supabase / PostgreSQL)

### Overview

Two tables. That's it. Clean and minimal.

```
auth.users  (Supabase built-in)
    │
    └──▶  profiles          (one row per user)
               │
               └──▶  health_readings   (many rows per user)
```

---

### Table 1: `profiles`

Extends Supabase's built-in `auth.users`. Created automatically via a database trigger the moment a user signs up.

```sql
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    email           TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

| Column | Type | Notes |
|---|---|---|
| [id](file:///d:/Bajwa%20Projects/PersonalAnomalyDetector/src/context/AuthContext.tsx#23-49) | `uuid` PK | Same as `auth.users.id`. This is also the `session_id` sent to the AI API |
| `display_name` | [text](file:///d:/Bajwa%20Projects/PersonalAnomalyDetector/src/context/AuthContext.tsx#9-16) | User's chosen name (from signup form) |
| `email` | [text](file:///d:/Bajwa%20Projects/PersonalAnomalyDetector/src/context/AuthContext.tsx#9-16) | Mirrored from auth for easy display |
| `created_at` | `timestamptz` | Auto-set on insert |

**Trigger — auto-create profile on signup:**
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

### Table 2: `health_readings`

One row per "Analyze & Save" click. Every field maps directly to the API's `HealthReading` schema.

```sql
CREATE TABLE public.health_readings (
    -- Identity
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recorded_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Required API inputs (from apiDox.md)
    heart_rate              NUMERIC(5,1) NOT NULL CHECK (heart_rate BETWEEN 30 AND 200),
    physical_activity_level NUMERIC(5,1) NOT NULL CHECK (physical_activity_level BETWEEN 0 AND 120),
    daily_steps             NUMERIC(7,0) NOT NULL CHECK (daily_steps BETWEEN 0 AND 30000),

    -- Optional API inputs (from apiDox.md)
    sleep_duration          NUMERIC(4,1) CHECK (sleep_duration BETWEEN 0 AND 24),
    quality_of_sleep        NUMERIC(3,1) CHECK (quality_of_sleep BETWEEN 1 AND 10),
    stress_level            NUMERIC(3,1) CHECK (stress_level BETWEEN 1 AND 10),
    bp_systolic             NUMERIC(5,1) CHECK (bp_systolic BETWEEN 70 AND 250),
    bp_diastolic            NUMERIC(5,1) CHECK (bp_diastolic BETWEEN 40 AND 150),

    -- AI API Response
    verdict                 TEXT NOT NULL CHECK (verdict IN ('normal', 'anomaly')),
    raw_api_response        JSONB NOT NULL
);
```

| Column | Type | API Field | Constraint |
|---|---|---|---|
| [id](file:///d:/Bajwa%20Projects/PersonalAnomalyDetector/src/context/AuthContext.tsx#23-49) | `uuid` PK | — | Auto-generated |
| `user_id` | `uuid` FK | — | → `profiles.id` |
| `recorded_at` | `timestamptz` | — | Auto-set |
| `heart_rate` | `numeric(5,1)` | `heart_rate` ✅ Required | 30–200 |
| `physical_activity_level` | `numeric(5,1)` | `physical_activity_level` ✅ Required | 0–120 |
| `daily_steps` | `numeric(7,0)` | `daily_steps` ✅ Required | 0–30,000 |
| `sleep_duration` | `numeric(4,1)` | `sleep_duration` | 0–24 |
| `quality_of_sleep` | `numeric(3,1)` | `quality_of_sleep` | 1–10 |
| `stress_level` | `numeric(3,1)` | `stress_level` | 1–10 |
| `bp_systolic` | `numeric(5,1)` | `bp_systolic` | 70–250 |
| `bp_diastolic` | `numeric(5,1)` | `bp_diastolic` | 40–150 |
| `verdict` | [text](file:///d:/Bajwa%20Projects/PersonalAnomalyDetector/src/context/AuthContext.tsx#9-16) | from response | `'normal'` or `'anomaly'` |
| `raw_api_response` | `jsonb` | full response | Stores scores + z-scores |

> **Why `raw_api_response JSONB`?**
> The API returns per-model scores and z-score explainability data whose exact shape
> we don't control. Storing it as JSONB lets us display it in the dashboard without
> defining a rigid schema for it — and future API changes won't break our DB.

---

### Row Level Security (RLS)

Every user sees **only their own data**. Enforced at the database level.

```sql
ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_readings ENABLE ROW LEVEL SECURITY;

-- Profiles: user can only read/update their own row
CREATE POLICY "Own profile only" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Readings: user can only read/insert their own readings
CREATE POLICY "Own readings only" ON public.health_readings
    FOR ALL USING (auth.uid() = user_id);
```

---

### Indexes (Performance)

```sql
-- Fast lookup of a user's readings sorted by time (for history table & chart)
CREATE INDEX idx_health_readings_user_time
    ON public.health_readings (user_id, recorded_at DESC);

-- Fast filter by verdict (for anomaly-only view)
CREATE INDEX idx_health_readings_verdict
    ON public.health_readings (user_id, verdict);
```

---

## Summary

```
Supabase Auth ──signs up──▶ profiles (1 row per user)
                                │
                    clicks "Analyze & Save"
                                │
                                ▼
                    health_readings (N rows per user)
                    ├── all 8 health metric inputs
                    ├── verdict (normal / anomaly)
                    └── raw_api_response (full JSON)
```

This is everything we need to power:
- ✅ Secure per-user login
- ✅ "Analyze & Save" button
- ✅ History table and trend chart
- ✅ Anomaly-only filter
- ✅ CSV export via API
