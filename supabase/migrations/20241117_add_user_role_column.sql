-- ==============================================================================
-- ADD USER ROLE COLUMN FOR ADMIN ACCESS CONTROL
-- ==============================================================================

-- Add role column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Add comment
COMMENT ON COLUMN public.users.role IS 'User role for access control (admin, moderator, etc.)';

-- Update RLS policies to allow admins to manage users
-- (Optional: Add admin-specific policies if needed)

-- Grant admin role to specific users (example)
-- UPDATE public.users SET role = 'admin' WHERE email = 'maow390@gmail.com';
