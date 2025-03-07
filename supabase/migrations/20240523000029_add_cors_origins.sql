-- Add CORS origins for Vercel domains
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;

-- Add CORS origins for all domains
INSERT INTO storage.cors (id, origin) VALUES ('all-origins', '*') ON CONFLICT DO NOTHING;

-- Enable auto-confirm for email and SMS
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_SMS_AUTOCONFIRM', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';

INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_EMAIL_AUTOCONFIRM', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';

-- Allow all origins for auth
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_SITE_URL', '*')
ON CONFLICT (name) DO UPDATE SET value = '*';

-- Set additional CORS headers
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_ADDITIONAL_HEADERS', '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}')
ON CONFLICT (name) DO UPDATE SET value = '{"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Credentials": "true"}';
