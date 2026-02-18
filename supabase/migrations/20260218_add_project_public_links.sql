ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS public_link_type varchar(20),
  ADD COLUMN IF NOT EXISTS public_link_url text;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_public_link_type_check
  CHECK (public_link_type IS NULL OR public_link_type IN ('download', 'website'));
