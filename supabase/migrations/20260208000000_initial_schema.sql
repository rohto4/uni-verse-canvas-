-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  content JSONB NOT NULL,
  excerpt TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  published_at TIMESTAMPTZ,
  cover_image TEXT,
  ogp_image TEXT,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  content JSONB,
  demo_url TEXT,
  github_url TEXT,
  cover_image TEXT,
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- In Progress table
CREATE TABLE IF NOT EXISTS in_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'not_started' CHECK (status IN ('not_started', 'paused', 'in_progress', 'completed')),
  progress_rate INTEGER DEFAULT 0 CHECK (progress_rate >= 0 AND progress_rate <= 100),
  started_at DATE,
  completed_at DATE,
  completed_project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  page_type VARCHAR(50) PRIMARY KEY CHECK (page_type IN ('home', 'about', 'links')),
  title VARCHAR(200) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction tables
CREATE TABLE IF NOT EXISTS post_tags (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_links (
  from_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  to_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  link_type VARCHAR(50) DEFAULT 'related',
  PRIMARY KEY (from_post_id, to_post_id)
);

CREATE TABLE IF NOT EXISTS post_project_links (
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, project_id)
);

-- Qiita cache table
CREATE TABLE IF NOT EXISTS qiita_cache (
  qiita_id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  url TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  cached_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_in_progress_status ON in_progress(status);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Row Level Security (RLS)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public read access
CREATE POLICY "Public read published posts" ON posts
  FOR SELECT USING (
    status = 'published' OR
    (status = 'scheduled' AND published_at <= NOW())
  );

CREATE POLICY "Public read completed projects" ON projects
  FOR SELECT USING (status = 'completed');

CREATE POLICY "Public read in progress" ON in_progress
  FOR SELECT USING (true);

CREATE POLICY "Public read tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Public read pages" ON pages
  FOR SELECT USING (true);

-- Full access policies will be added later when authentication is implemented
-- For now, we'll use the anon key with service role for admin operations

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_in_progress_updated_at BEFORE UPDATE ON in_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
