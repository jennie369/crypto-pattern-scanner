-- Migration: Add Teacher and Manager roles
-- Date: 2025-12-09
-- Description: Extends the role column to support 'teacher' and 'manager' roles
-- for course management access control

-- Roles hierarchy:
-- admin: Full access to everything
-- manager: Can view all courses in course admin (read-only)
-- teacher: Can create/edit their own courses
-- user: Default role, no course admin access

-- Update the role column constraint to allow new values
-- Drop existing constraint if exists and recreate with new values
DO $$
BEGIN
  -- Check if constraint exists and drop it
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'profiles_role_check'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
  END IF;
END $$;

-- Add new constraint with expanded role values
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IS NULL OR role IN ('user', 'admin', 'teacher', 'manager'));

-- Create index for role column for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Create helper function to check if user has course admin access
CREATE OR REPLACE FUNCTION has_course_admin_access(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- admin, teacher, manager have access
  RETURN user_role IN ('admin', 'teacher', 'manager');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is teacher
CREATE OR REPLACE FUNCTION is_teacher(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN user_role = 'teacher';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is manager
CREATE OR REPLACE FUNCTION is_manager(user_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  RETURN user_role = 'manager';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user can edit a specific course
CREATE OR REPLACE FUNCTION can_edit_course(user_id_param UUID, course_id_param UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
  course_creator UUID;
BEGIN
  -- Get user role
  SELECT role INTO user_role
  FROM profiles
  WHERE id = user_id_param;

  IF NOT FOUND THEN RETURN FALSE; END IF;

  -- Admin can edit all courses
  IF user_role = 'admin' THEN RETURN TRUE; END IF;

  -- Manager can only view, not edit
  IF user_role = 'manager' THEN RETURN FALSE; END IF;

  -- Teacher can only edit their own courses
  IF user_role = 'teacher' THEN
    SELECT created_by INTO course_creator
    FROM courses
    WHERE id = course_id_param;

    RETURN course_creator = user_id_param;
  END IF;

  -- Regular users cannot edit
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for courses table to respect new roles
-- Drop existing policies first (IF EXISTS to avoid errors)
DROP POLICY IF EXISTS "Teachers can manage their own courses" ON courses;
DROP POLICY IF EXISTS "Course admin access" ON courses;
DROP POLICY IF EXISTS "Admin full access on courses" ON courses;
DROP POLICY IF EXISTS "Teachers manage own courses" ON courses;
DROP POLICY IF EXISTS "Managers can view all courses" ON courses;
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;

-- Policy: Admin can do everything
CREATE POLICY "Admin full access on courses"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy: Teachers can manage their own courses
CREATE POLICY "Teachers manage own courses"
ON courses
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
  AND created_by = auth.uid()
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'teacher'
  )
  AND created_by = auth.uid()
);

-- Policy: Managers can view all courses (read-only)
CREATE POLICY "Managers can view all courses"
ON courses
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'manager'
  )
);

-- Policy: Everyone can view published courses
CREATE POLICY "Anyone can view published courses"
ON courses
FOR SELECT
TO authenticated
USING (is_published = true);

-- Grant execute permissions on helper functions
GRANT EXECUTE ON FUNCTION has_course_admin_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_teacher(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION is_manager(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_edit_course(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION has_course_admin_access IS 'Check if user has access to course admin page (admin, teacher, manager)';
COMMENT ON FUNCTION is_teacher IS 'Check if user has teacher role';
COMMENT ON FUNCTION is_manager IS 'Check if user has manager role';
COMMENT ON FUNCTION can_edit_course IS 'Check if user can edit a specific course';
