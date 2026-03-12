CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(80) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS priorities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  email_consent BOOLEAN NOT NULL,
  consent_timestamp TIMESTAMP NOT NULL,
  signup_source VARCHAR(100),
  plan VARCHAR(30) NOT NULL DEFAULT 'free',
  subscription_status VARCHAR(30) NOT NULL DEFAULT 'inactive',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_consent BOOLEAN;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS signup_source VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS plan VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(30);
ALTER TABLE users ADD COLUMN IF NOT EXISTS registered_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

UPDATE users SET email_consent = COALESCE(email_consent, TRUE);
UPDATE users SET consent_timestamp = COALESCE(consent_timestamp, NOW());
UPDATE users SET plan = COALESCE(plan, 'free');
UPDATE users SET subscription_status = COALESCE(subscription_status, 'inactive');

ALTER TABLE users ALTER COLUMN email_consent SET NOT NULL;
ALTER TABLE users ALTER COLUMN consent_timestamp SET NOT NULL;
ALTER TABLE users ALTER COLUMN plan SET DEFAULT 'free';
ALTER TABLE users ALTER COLUMN subscription_status SET DEFAULT 'inactive';

DO $$
BEGIN
  ALTER TABLE users DROP COLUMN IF EXISTS password_hash;
END;
$$;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  last_used_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMP
);

ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP DEFAULT NOW();
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE auth_sessions ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

UPDATE auth_sessions SET last_used_at = COALESCE(last_used_at, NOW());
UPDATE auth_sessions SET created_at = COALESCE(created_at, NOW());

ALTER TABLE auth_sessions ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE auth_sessions ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE auth_sessions ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE auth_sessions ALTER COLUMN last_used_at SET NOT NULL;
ALTER TABLE auth_sessions ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_sessions_user_id_fkey'
      AND conrelid = 'auth_sessions'::regclass
  ) THEN
    ALTER TABLE auth_sessions
      ADD CONSTRAINT auth_sessions_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS auth_magic_links (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  flow VARCHAR(32),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS flow VARCHAR(32);
ALTER TABLE auth_magic_links ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

UPDATE auth_magic_links SET created_at = COALESCE(created_at, NOW());

ALTER TABLE auth_magic_links ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE auth_magic_links ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE auth_magic_links ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE auth_magic_links ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_magic_links_user_id_fkey'
      AND conrelid = 'auth_magic_links'::regclass
  ) THEN
    ALTER TABLE auth_magic_links
      ADD CONSTRAINT auth_magic_links_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS auth_passkey_challenges (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  challenge_hash VARCHAR(64) NOT NULL,
  purpose VARCHAR(32) NOT NULL,
  rp_id VARCHAR(255) NOT NULL,
  origin TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS challenge_hash VARCHAR(64);
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS purpose VARCHAR(32);
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS rp_id VARCHAR(255);
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS origin TEXT;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE auth_passkey_challenges ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

UPDATE auth_passkey_challenges SET created_at = COALESCE(created_at, NOW());
UPDATE auth_passkey_challenges SET purpose = COALESCE(purpose, 'authenticate') WHERE purpose IS NULL;
UPDATE auth_passkey_challenges SET rp_id = COALESCE(rp_id, 'localhost') WHERE rp_id IS NULL;
UPDATE auth_passkey_challenges SET origin = COALESCE(origin, 'http://localhost:5174') WHERE origin IS NULL;

ALTER TABLE auth_passkey_challenges ALTER COLUMN challenge_hash SET NOT NULL;
ALTER TABLE auth_passkey_challenges ALTER COLUMN purpose SET NOT NULL;
ALTER TABLE auth_passkey_challenges ALTER COLUMN rp_id SET NOT NULL;
ALTER TABLE auth_passkey_challenges ALTER COLUMN origin SET NOT NULL;
ALTER TABLE auth_passkey_challenges ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE auth_passkey_challenges ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_passkey_challenges_purpose_check'
      AND conrelid = 'auth_passkey_challenges'::regclass
  ) THEN
    ALTER TABLE auth_passkey_challenges
      ADD CONSTRAINT auth_passkey_challenges_purpose_check
      CHECK (purpose IN ('register', 'authenticate'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS auth_passkeys (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  transports JSONB NOT NULL DEFAULT '[]'::jsonb,
  aaguid TEXT,
  device_name VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP,
  revoked_at TIMESTAMP
);

ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS credential_id TEXT;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS public_key TEXT;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS counter BIGINT DEFAULT 0;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS transports JSONB DEFAULT '[]'::jsonb;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS aaguid TEXT;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS device_name VARCHAR(120);
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMP;
ALTER TABLE auth_passkeys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP;

UPDATE auth_passkeys SET counter = COALESCE(counter, 0);
UPDATE auth_passkeys SET transports = COALESCE(transports, '[]'::jsonb);
UPDATE auth_passkeys SET created_at = COALESCE(created_at, NOW());
UPDATE auth_passkeys SET updated_at = COALESCE(updated_at, NOW());

ALTER TABLE auth_passkeys ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN credential_id SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN public_key SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN counter SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN transports SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE auth_passkeys ALTER COLUMN updated_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_passkeys_counter_check'
      AND conrelid = 'auth_passkeys'::regclass
  ) THEN
    ALTER TABLE auth_passkeys
      ADD CONSTRAINT auth_passkeys_counter_check CHECK (counter >= 0);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS auth_recovery_tokens (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(64) NOT NULL,
  purpose VARCHAR(40) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  redirect_path VARCHAR(512),
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS user_id BIGINT;
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64);
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS purpose VARCHAR(40);
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS redirect_path VARCHAR(512);
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE auth_recovery_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

UPDATE auth_recovery_tokens SET created_at = COALESCE(created_at, NOW());
UPDATE auth_recovery_tokens SET purpose = COALESCE(purpose, 'recovery') WHERE purpose IS NULL;

ALTER TABLE auth_recovery_tokens ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE auth_recovery_tokens ALTER COLUMN token_hash SET NOT NULL;
ALTER TABLE auth_recovery_tokens ALTER COLUMN purpose SET NOT NULL;
ALTER TABLE auth_recovery_tokens ALTER COLUMN expires_at SET NOT NULL;
ALTER TABLE auth_recovery_tokens ALTER COLUMN created_at SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'auth_recovery_tokens_purpose_check'
      AND conrelid = 'auth_recovery_tokens'::regclass
  ) THEN
    ALTER TABLE auth_recovery_tokens
      ADD CONSTRAINT auth_recovery_tokens_purpose_check
      CHECK (purpose IN ('recovery', 'bootstrap'));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS recommendation_sessions (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
  profile_id INT NOT NULL REFERENCES profiles(id),
  task_id INT NOT NULL REFERENCES tasks(id),
  selected_priority VARCHAR(120) NOT NULL,
  wizard_duration_seconds INT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  session_id BIGINT NOT NULL REFERENCES recommendation_sessions(id) ON DELETE CASCADE,
  primary_tool_id INT NOT NULL,
  alternative_tool_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  primary_reason TEXT NOT NULL,
  is_primary_locked BOOLEAN NOT NULL DEFAULT TRUE,
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS session_id BIGINT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS primary_reason TEXT;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS is_primary_locked BOOLEAN DEFAULT TRUE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS unlocked_at TIMESTAMP;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS alternative_tool_ids JSONB DEFAULT '[]'::jsonb;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'recommendations'
      AND column_name = 'explanation'
  ) THEN
    UPDATE recommendations
    SET primary_reason = COALESCE(primary_reason, explanation)
    WHERE primary_reason IS NULL;
  END IF;
END;
$$;

UPDATE recommendations
SET is_primary_locked = COALESCE(is_primary_locked, TRUE)
WHERE is_primary_locked IS NULL;

UPDATE recommendations
SET alternative_tool_ids = '[]'::jsonb
WHERE alternative_tool_ids IS NULL;

CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  signal SMALLINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE recommendation_feedback ADD COLUMN IF NOT EXISTS signal SMALLINT;
ALTER TABLE recommendation_feedback ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
UPDATE recommendation_feedback SET created_at = COALESCE(created_at, NOW());
UPDATE recommendation_feedback SET signal = COALESCE(signal, 1) WHERE signal IS NULL;
ALTER TABLE recommendation_feedback ALTER COLUMN signal SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'recommendation_feedback_signal_check'
      AND conrelid = 'recommendation_feedback'::regclass
  ) THEN
    ALTER TABLE recommendation_feedback
      ADD CONSTRAINT recommendation_feedback_signal_check CHECK (signal IN (-1, 1));
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS recommendation_try_it_clicks (
  id BIGSERIAL PRIMARY KEY,
  recommendation_id BIGINT NOT NULL REFERENCES recommendations(id) ON DELETE CASCADE,
  session_id BIGINT NOT NULL REFERENCES recommendation_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE recommendation_try_it_clicks ADD COLUMN IF NOT EXISTS recommendation_id BIGINT;
ALTER TABLE recommendation_try_it_clicks ADD COLUMN IF NOT EXISTS session_id BIGINT;
ALTER TABLE recommendation_try_it_clicks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();
UPDATE recommendation_try_it_clicks SET created_at = COALESCE(created_at, NOW());
ALTER TABLE recommendation_try_it_clicks ALTER COLUMN recommendation_id SET NOT NULL;
ALTER TABLE recommendation_try_it_clicks ALTER COLUMN session_id SET NOT NULL;
ALTER TABLE recommendation_try_it_clicks ALTER COLUMN created_at SET NOT NULL;

CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  tool_name VARCHAR(120),
  tool_slug VARCHAR(160),
  logo_url TEXT,
  best_for TEXT,
  website TEXT,
  referral_url TEXT,
  category VARCHAR(80),
  pricing VARCHAR(120),
  pricing_tier VARCHAR(20),
  ease_of_use SMALLINT,
  speed SMALLINT,
  quality SMALLINT,
  target_users JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_word VARCHAR(40),
  record_status VARCHAR(20) NOT NULL DEFAULT 'active',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  name VARCHAR(120),
  pricing_type VARCHAR(50),
  pricing_label VARCHAR(120),
  website_url TEXT,
  description TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE tools ADD COLUMN IF NOT EXISTS tool_name VARCHAR(120);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS tool_slug VARCHAR(160);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS best_for TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS referral_url TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pricing VARCHAR(120);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pricing_tier VARCHAR(20);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS ease_of_use SMALLINT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS speed SMALLINT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS quality SMALLINT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS target_users JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS context_word VARCHAR(40);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS record_status VARCHAR(20) DEFAULT 'active';
ALTER TABLE tools ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS name VARCHAR(120);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pricing_type VARCHAR(50);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS pricing_label VARCHAR(120);
ALTER TABLE tools ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb;
ALTER TABLE tools ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb;

UPDATE tools SET tool_name = COALESCE(tool_name, name);
UPDATE tools
SET tool_slug = COALESCE(tool_slug, LOWER(REGEXP_REPLACE(COALESCE(tool_name, name, 'tool-' || id::text), '[^a-z0-9]+', '-', 'g')));
UPDATE tools SET website = COALESCE(website, website_url);
UPDATE tools SET pricing = COALESCE(pricing, pricing_label, pricing_type, 'Unknown');
UPDATE tools
SET pricing_tier = COALESCE(
  pricing_tier,
  CASE pricing_type
    WHEN 'open-source' THEN 'free'
    WHEN 'freemium' THEN 'freemium'
    WHEN 'paid' THEN 'paid_mid'
    ELSE 'paid_mid'
  END
);
UPDATE tools SET ease_of_use = COALESCE(ease_of_use, 3);
UPDATE tools SET speed = COALESCE(speed, 3);
UPDATE tools SET quality = COALESCE(quality, 3);
UPDATE tools SET target_users = COALESCE(target_users, '[]'::jsonb);
UPDATE tools SET tags = COALESCE(tags, '[]'::jsonb);
UPDATE tools SET record_status = COALESCE(record_status, CASE WHEN is_active THEN 'active' ELSE 'inactive' END);

ALTER TABLE tools ALTER COLUMN tool_name SET NOT NULL;
ALTER TABLE tools ALTER COLUMN tool_slug SET NOT NULL;
ALTER TABLE tools ALTER COLUMN website SET NOT NULL;
ALTER TABLE tools ALTER COLUMN category SET NOT NULL;
ALTER TABLE tools ALTER COLUMN pricing SET NOT NULL;
ALTER TABLE tools ALTER COLUMN pricing_tier SET NOT NULL;
ALTER TABLE tools ALTER COLUMN ease_of_use SET NOT NULL;
ALTER TABLE tools ALTER COLUMN speed SET NOT NULL;
ALTER TABLE tools ALTER COLUMN quality SET NOT NULL;
ALTER TABLE tools ALTER COLUMN target_users SET NOT NULL;
ALTER TABLE tools ALTER COLUMN tags SET NOT NULL;
ALTER TABLE tools ALTER COLUMN record_status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_pricing_tier_check'
      AND conrelid = 'tools'::regclass
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_pricing_tier_check
      CHECK (pricing_tier IN ('free', 'freemium', 'paid_low', 'paid_mid', 'paid_high'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_record_status_check'
      AND conrelid = 'tools'::regclass
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_record_status_check
      CHECK (record_status IN ('active', 'inactive', 'deprecated'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_quality_range_check'
      AND conrelid = 'tools'::regclass
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_quality_range_check CHECK (quality BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_speed_range_check'
      AND conrelid = 'tools'::regclass
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_speed_range_check CHECK (speed BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tools_ease_range_check'
      AND conrelid = 'tools'::regclass
  ) THEN
    ALTER TABLE tools
      ADD CONSTRAINT tools_ease_range_check CHECK (ease_of_use BETWEEN 1 AND 5);
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower_unique ON users ((LOWER(email)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_sessions_token_hash_unique ON auth_sessions (token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_active ON auth_sessions (user_id, expires_at DESC)
WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_magic_links_token_hash_unique ON auth_magic_links (token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_magic_links_user_active ON auth_magic_links (user_id, expires_at DESC)
WHERE used_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_passkey_challenges_hash_unique ON auth_passkey_challenges (challenge_hash);
CREATE INDEX IF NOT EXISTS idx_auth_passkey_challenges_active ON auth_passkey_challenges (purpose, expires_at DESC)
WHERE used_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_passkeys_credential_unique ON auth_passkeys (credential_id);
CREATE INDEX IF NOT EXISTS idx_auth_passkeys_user_active ON auth_passkeys (user_id, created_at DESC)
WHERE revoked_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_recovery_tokens_hash_unique ON auth_recovery_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_auth_recovery_tokens_user_active ON auth_recovery_tokens (user_id, expires_at DESC)
WHERE used_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_task_created ON recommendation_sessions (task_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_sessions_user ON recommendation_sessions (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_recommendations_session_unique ON recommendations (session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_locked_created ON recommendations (is_primary_locked, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendation_feedback_recommendation ON recommendation_feedback (recommendation_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_try_it_clicks_recommendation_session_unique ON recommendation_try_it_clicks (recommendation_id, session_id);
CREATE INDEX IF NOT EXISTS idx_try_it_clicks_recommendation ON recommendation_try_it_clicks (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_try_it_clicks_session ON recommendation_try_it_clicks (session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_tool_slug_unique ON tools (tool_slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_tools_tool_name_unique ON tools ((LOWER(tool_name)));
CREATE INDEX IF NOT EXISTS idx_tools_status_category ON tools (record_status, category);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_tasks_updated_at ON tasks;
CREATE TRIGGER trigger_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_priorities_updated_at ON priorities;
CREATE TRIGGER trigger_priorities_updated_at
BEFORE UPDATE ON priorities
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
CREATE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_auth_passkeys_updated_at ON auth_passkeys;
CREATE TRIGGER trigger_auth_passkeys_updated_at
BEFORE UPDATE ON auth_passkeys
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_recommendation_sessions_updated_at ON recommendation_sessions;
CREATE TRIGGER trigger_recommendation_sessions_updated_at
BEFORE UPDATE ON recommendation_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_tools_updated_at ON tools;
CREATE TRIGGER trigger_tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
