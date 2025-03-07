-- Update CORS settings to allow all origins
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Enable CORS for all origins
INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_EXTERNAL_EMAIL_ENABLED', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';

INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_EXTERNAL_PHONE_ENABLED', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';

INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_SMS_AUTOCONFIRM', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';

INSERT INTO auth.config (name, value) 
VALUES ('GOTRUE_EMAIL_AUTOCONFIRM', 'true')
ON CONFLICT (name) DO UPDATE SET value = 'true';
