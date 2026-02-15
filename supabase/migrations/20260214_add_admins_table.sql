-- admins table creation
CREATE TABLE IF NOT EXISTS admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text DEFAULT 'admin',
  created_at timestamptz DEFAULT now()
);

-- RLS for admins table
-- Allow admin users to read the table
CREATE POLICY "Allow admins to read admins table"
ON public.admins
FOR SELECT
USING (auth.role() = 'service_role' OR (auth.uid() IN (SELECT user_id FROM admins)));

-- Allow admin users to insert into the table
CREATE POLICY "Allow admins to insert into admins table"
ON public.admins
FOR INSERT
WITH CHECK (auth.role() = 'service_role' OR (auth.uid() IN (SELECT user_id FROM admins)));

-- Logged in users can read their own admin status
CREATE POLICY "Allow users to see their own admin status"
ON public.admins
FOR SELECT
USING (auth.uid() = user_id);
