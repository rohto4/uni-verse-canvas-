-- RLS Policies for UniVerse Canvas

-- Enable RLS on all tables
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.in_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- 1. POSTS
-- Public can read published/scheduled posts
CREATE POLICY "Public can read published posts" ON public.posts
FOR SELECT USING (
  status = 'published' OR 
  (status = 'scheduled' AND published_at <= NOW())
);

-- Admins can do everything
CREATE POLICY "Admins have full access to posts" ON public.posts
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- 2. PROJECTS
CREATE POLICY "Public can read projects" ON public.projects
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to projects" ON public.projects
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- 3. TAGS
CREATE POLICY "Public can read tags" ON public.tags
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to tags" ON public.tags
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- 4. IN PROGRESS
CREATE POLICY "Public can read in_progress" ON public.in_progress
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to in_progress" ON public.in_progress
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

-- 5. PAGES
CREATE POLICY "Public can read pages" ON public.pages
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to pages" ON public.pages
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
