-- Fix auth settings to reduce OTP expiry
UPDATE auth.config 
SET config = jsonb_set(config, '{OTP_EXPIRY}', '3600') 
WHERE config IS NOT NULL;