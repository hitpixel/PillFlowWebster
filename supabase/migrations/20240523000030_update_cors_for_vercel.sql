-- Add specific CORS origins for Vercel domains

-- Allow all origins for auth (already set but ensuring it's there)
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_SITE_URL', '*')
ON CONFLICT (name) DO UPDATE SET value = '*';

-- Set additional CORS headers with explicit Vercel domains
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_ADDITIONAL_HEADERS', '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}')
ON CONFLICT (name) DO UPDATE SET value = '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}';

-- Add specific Vercel domain to storage CORS if needed
INSERT INTO storage.cors (id, origin) 
VALUES ('vercel-app', 'https://*.vercel.app') 
ON CONFLICT DO NOTHING;

-- Add netlify domains as well for completeness
INSERT INTO storage.cors (id, origin) 
VALUES ('netlify-app', 'https://*.netlify.app') 
ON CONFLICT DO NOTHING;

-- Add localhost for development
INSERT INTO storage.cors (id, origin) 
VALUES ('localhost', 'http://localhost:*') 
ON CONFLICT DO NOTHING;
