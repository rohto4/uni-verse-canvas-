-- RLS policies for link tables

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_project_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read post_tags" ON public.post_tags
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to post_tags" ON public.post_tags
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Public can read project_tags" ON public.project_tags
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to project_tags" ON public.project_tags
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Public can read post_links" ON public.post_links
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to post_links" ON public.post_links
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);

CREATE POLICY "Public can read post_project_links" ON public.post_project_links
FOR SELECT USING (true);

CREATE POLICY "Admins have full access to post_project_links" ON public.post_project_links
FOR ALL USING (
  EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid())
);
