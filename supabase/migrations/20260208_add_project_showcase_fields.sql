-- Add showcase fields to projects table
-- Created: 2026-02-08

ALTER TABLE projects
ADD COLUMN IF NOT EXISTS steps_count INTEGER DEFAULT NULL,
ADD COLUMN IF NOT EXISTS used_ai JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tech_stack JSONB DEFAULT NULL;

COMMENT ON COLUMN projects.steps_count IS 'Approximate development scale (lines of code)';
COMMENT ON COLUMN projects.used_ai IS 'AI tools used (array: ["Claude Sonnet 4.5", "GitHub Copilot"])';
COMMENT ON COLUMN projects.gallery_images IS 'Gallery image URLs (array)';
COMMENT ON COLUMN projects.tech_stack IS 'Technology stack with usage percentage (object: {"TypeScript": 45.2, "CSS": 30.1})';
