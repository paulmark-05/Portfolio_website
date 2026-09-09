-- 0006_skill_logo.sql
-- Adds an optional uploaded-logo path to skills so custom technologies
-- (CrewAI, Pinecone, n8n, LlamaIndex, …) can carry their own logo image.
-- Identity becomes logo + name rather than colour. Idempotent.
alter table public.skills add column if not exists logo text;
