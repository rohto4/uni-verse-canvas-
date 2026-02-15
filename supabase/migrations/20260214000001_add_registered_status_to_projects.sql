-- Step 1: Drop the existing check constraint on the projects table's status column.
-- The default constraint name is assumed to be projects_status_check. If this fails, the name might be different.
ALTER TABLE projects DROP CONSTRAINT projects_status_check;

-- Step 2: Add a new check constraint that includes the 'registered' status.
ALTER TABLE projects ADD CONSTRAINT projects_status_check CHECK (status IN ('completed', 'archived', 'registered'));

-- Step 3: Drop the old RLS policy for reading projects.
DROP POLICY "Public read completed projects" ON projects;

-- Step 4: Create a new RLS policy that allows public access to 'completed' and 'registered' projects.
CREATE POLICY "Public read visible projects" ON projects
  FOR SELECT USING (status IN ('completed', 'registered'));
