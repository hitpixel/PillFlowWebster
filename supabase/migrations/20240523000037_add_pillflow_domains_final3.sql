-- Add pillflow.com.au domains to CORS allowed origins
INSERT INTO auth.cors_origins (origin) VALUES ('https://app.pillflow.com.au');
INSERT INTO auth.cors_origins (origin) VALUES ('https://pillflow.com.au');
