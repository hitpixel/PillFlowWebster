-- Add pillflow.com.au domains to CORS configuration

-- Add app.pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-app', 'https://app.pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Add pillflow.com.au domain
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-main', 'https://pillflow.com.au') 
ON CONFLICT DO NOTHING;

-- Add www.pillflow.com.au domain for completeness
INSERT INTO storage.cors (id, origin) 
VALUES ('pillflow-www', 'https://www.pillflow.com.au') 
ON CONFLICT DO NOTHING;
