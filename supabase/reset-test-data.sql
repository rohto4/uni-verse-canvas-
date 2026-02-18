-- Safe reset for test seed data only
BEGIN;

WITH seed_posts AS (
  SELECT id FROM posts WHERE slug LIKE 'seed-post-%'
), seed_projects AS (
  SELECT id FROM projects WHERE slug LIKE 'seed-project-%'
)
DELETE FROM post_project_links
WHERE post_id IN (SELECT id FROM seed_posts)
   OR project_id IN (SELECT id FROM seed_projects);

WITH seed_posts AS (
  SELECT id FROM posts WHERE slug LIKE 'seed-post-%'
)
DELETE FROM post_links
WHERE from_post_id IN (SELECT id FROM seed_posts)
   OR to_post_id IN (SELECT id FROM seed_posts);

WITH seed_posts AS (
  SELECT id FROM posts WHERE slug LIKE 'seed-post-%'
)
DELETE FROM post_tags
WHERE post_id IN (SELECT id FROM seed_posts);

WITH seed_projects AS (
  SELECT id FROM projects WHERE slug LIKE 'seed-project-%'
)
DELETE FROM project_tags
WHERE project_id IN (SELECT id FROM seed_projects);

WITH seed_projects AS (
  SELECT id FROM projects WHERE slug LIKE 'seed-project-%'
)
DELETE FROM in_progress
WHERE completed_project_id IN (SELECT id FROM seed_projects);

DELETE FROM posts WHERE slug LIKE 'seed-post-%';
DELETE FROM projects WHERE slug LIKE 'seed-project-%';

COMMIT;
