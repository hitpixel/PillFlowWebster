-- Add PillFlow domains to CORS configuration

-- Add app.pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-app', 'https://app.pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Add pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-main', 'https://pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Update auth config to include these domains in CORS headers
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_ADDITIONAL_REDIRECT_URLS', 'https://app.pillflow.com.au,https://pillflow.com.au')
ON CONFLICT (name) DO UPDATE SET value = 'https://app.pillflow.com.au,https://pillflow.com.au';
