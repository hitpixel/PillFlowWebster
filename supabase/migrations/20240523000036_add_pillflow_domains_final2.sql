-- Add pillflow.com.au domains to CORS allowed origins

-- Update the CORS configuration to allow the pillflow domains
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

-- Add the domains to the CORS allowed origins
UPDATE auth.config
SET config_data = jsonb_set(
  config_data,
  '{external_email_enabled}',
  'true'
);

-- Add the domains to the CORS allowed origins list
UPDATE auth.config
SET config_data = jsonb_set(
  config_data,
  '{additional_redirect_urls}',
  config_data->'additional_redirect_urls' || '[
    "https://app.pillflow.com.au",
    "https://pillflow.com.au"
  ]'::jsonb
);

-- Update the CORS configuration for the API
UPDATE auth.config
SET config_data = jsonb_set(
  config_data,
  '{allowed_email_domains}',
  config_data->'allowed_email_domains' || '[
    "pillflow.com.au"
  ]'::jsonb
);

-- Update the CORS configuration for the API
UPDATE storage.buckets
SET public = TRUE
WHERE id = 'avatars';

-- Set CORS configuration for the API
BEGIN;
  INSERT INTO pgsodium.key (id, name, status, key_type, key_id, key_context, created_at, expires_at)
  VALUES ('pgsodium_key_2023_05_23', 'pgsodium_key_2023_05_23', 'default', 'aead-det', '\x0000000000000000000000000000000000000000000000000000000000000000', '\x', NOW(), NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Set CORS configuration for the API
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', TRUE)
  ON CONFLICT (id) DO NOTHING;

  -- Set CORS configuration for the API
  UPDATE storage.buckets
  SET public = TRUE
  WHERE id = 'avatars';
COMMIT;

-- Add the domains to the CORS allowed origins
ALTER SYSTEM SET "cors.allowed_origins" TO 'https://app.pillflow.com.au,https://pillflow.com.au';
