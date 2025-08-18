/*
  # Arreglar constraint de tipo para incluir 'diagnostic'

  1. Cambios en constraints
    - Actualizar check constraint de quizzes.type para incluir 'diagnostic'
    - Mantener todos los tipos existentes

  2. Seguridad
    - Mantener RLS habilitado
    - No afectar políticas existentes
*/

-- Eliminar el constraint existente
ALTER TABLE quizzes DROP CONSTRAINT IF EXISTS quizzes_type_check;

-- Crear nuevo constraint que incluya 'diagnostic'
ALTER TABLE quizzes ADD CONSTRAINT quizzes_type_check 
  CHECK (type IN ('grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking', 'diagnostic'));