-- Add specific CORS origins for PillFlow domains

-- Add app.pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-app', 'https://app.pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Add pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-main', 'https://pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Set additional CORS headers to include these domains
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_ADDITIONAL_HEADERS', '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}')
ON CONFLICT (name) DO UPDATE SET value = '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}';
