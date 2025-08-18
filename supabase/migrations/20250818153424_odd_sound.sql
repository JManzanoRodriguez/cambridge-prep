/*
  # Arreglar políticas RLS para creación de usuarios

  1. Cambios en políticas
    - Permitir que usuarios autenticados creen su propio perfil
    - Arreglar política de inserción en tabla users

  2. Seguridad
    - Mantener RLS habilitado
    - Solo permitir que usuarios creen su propio perfil (no el de otros)
*/

-- Eliminar política de inserción existente si existe
DROP POLICY IF EXISTS "Los usuarios pueden crear sus propios perfiles" ON users;

-- Crear nueva política que permita a usuarios autenticados crear su propio perfil
CREATE POLICY "Los usuarios pueden crear su propio perfil"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Asegurar que la política de actualización también existe
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON users;

CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Verificar que la política de lectura existe
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON users;

CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);