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
  category VARCHAR(80),
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

CREATE TABLE IF NOT EXISTS tools (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) UNIQUE NOT NULL,
  category VARCHAR(80) NOT NULL,
  pricing_type VARCHAR(50) NOT NULL,
  pricing_label VARCHAR(120) NOT NULL,
  website_url TEXT NOT NULL,
  description TEXT NOT NULL,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255),
  profile_id INT NOT NULL REFERENCES profiles(id),
  task_id INT NOT NULL REFERENCES tasks(id),
  budget VARCHAR(50) NOT NULL,
  experience_level VARCHAR(50) NOT NULL,
  selected_priorities JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recommendations (
  id BIGSERIAL PRIMARY KEY,
  user_session_id BIGINT NOT NULL REFERENCES user_sessions(id) ON DELETE CASCADE,
  primary_tool_id INT NOT NULL REFERENCES tools(id),
  alternative_tool_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tools_active ON tools (is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_profile_task ON user_sessions (profile_id, task_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_session ON recommendations (user_session_id);

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

DROP TRIGGER IF EXISTS trigger_tools_updated_at ON tools;
CREATE TRIGGER trigger_tools_updated_at
BEFORE UPDATE ON tools
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_user_sessions_updated_at ON user_sessions;
CREATE TRIGGER trigger_user_sessions_updated_at
BEFORE UPDATE ON user_sessions
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
