-- Add CORS origins for pillflow.com.au domains
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, 5242880, '{image/*}')
ON CONFLICT (id) DO NOTHING;

-- Add CORS origins for all pillflow domains
INSERT INTO auth.config (provider, params)
VALUES ('http', '{"uri":"https://pillflow.com.au","redirect_uri":"https://pillflow.com.au/auth/callback"}')
ON CONFLICT (provider) DO UPDATE SET params = '{"uri":"https://pillflow.com.au","redirect_uri":"https://pillflow.com.au/auth/callback"}';

-- Add all possible domains to CORS allowed origins
INSERT INTO cors.origins (origin) VALUES ('https://pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('https://www.pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('https://app.pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('http://pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('http://www.pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('http://app.pillflow.com.au') ON CONFLICT DO NOTHING;
INSERT INTO cors.origins (origin) VALUES ('*') ON CONFLICT DO NOTHING;
