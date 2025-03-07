-- Add pillflow.com.au and app.pillflow.com.au to the CORS allowed origins
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, false, null, null)
ON CONFLICT (id) DO NOTHING;

UPDATE auth.config
SET external_email_redirect_domains = array_append(external_email_redirect_domains, 'pillflow.com.au');

UPDATE auth.config
SET external_email_redirect_domains = array_append(external_email_redirect_domains, 'app.pillflow.com.au');

UPDATE auth.config
SET external_email_redirect_domains = array_distinct(external_email_redirect_domains);

UPDATE auth.config
SET external_phone_redirect_domains = array_append(external_phone_redirect_domains, 'pillflow.com.au');

UPDATE auth.config
SET external_phone_redirect_domains = array_append(external_phone_redirect_domains, 'app.pillflow.com.au');

UPDATE auth.config
SET external_phone_redirect_domains = array_distinct(external_phone_redirect_domains);

INSERT INTO storage.cors (id, origin, max_age_seconds)
VALUES ('pillflow-com-au', 'https://pillflow.com.au', 3600)
ON CONFLICT DO NOTHING;

INSERT INTO storage.cors (id, origin, max_age_seconds)
VALUES ('app-pillflow-com-au', 'https://app.pillflow.com.au', 3600)
ON CONFLICT DO NOTHING;
