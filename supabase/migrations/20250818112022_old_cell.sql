/*
  # Esquema inicial para Cambridge Prep App

  1. Nuevas tablas
    - `users` - Perfiles de usuario extendidos
    - `quizzes` - Resultados de quizzes completados
    - `user_progress` - Progreso del usuario por habilidad
    - `subscriptions` - Información de suscripciones

  2. Seguridad
    - Habilitar RLS en todas las tablas
    - Políticas para que los usuarios solo accedan a sus propios datos
*/

-- Tabla de usuarios extendida
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  level text DEFAULT 'A1' CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  subscription_type text DEFAULT 'free' CHECK (subscription_type IN ('free', 'basic', 'premium')),
  avatar_url text,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabla de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking')),
  level text NOT NULL CHECK (level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  questions jsonb NOT NULL,
  answers jsonb DEFAULT '[]',
  score integer DEFAULT 0,
  total_questions integer NOT NULL,
  time_spent integer DEFAULT 0, -- en segundos
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Tabla de progreso del usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  skill_type text NOT NULL CHECK (skill_type IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking')),
  current_level text NOT NULL CHECK (current_level IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2')),
  progress_percentage integer DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  strengths text[] DEFAULT '{}',
  weaknesses text[] DEFAULT '{}',
  total_questions_answered integer DEFAULT 0,
  correct_answers integer DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_type)
);

-- Tabla de suscripciones
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
  plan_type text NOT NULL CHECK (plan_type IN ('basic', 'premium')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Políticas para users
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Políticas para quizzes
CREATE POLICY "Los usuarios pueden ver sus propios quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden crear sus propios quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar sus propios quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para user_progress
CREATE POLICY "Los usuarios pueden ver su propio progreso"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden actualizar su propio progreso"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden modificar su propio progreso"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Políticas para subscriptions
CREATE POLICY "Los usuarios pueden ver sus propias suscripciones"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_last_updated
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_type ON quizzes(type);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_at ON quizzes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);