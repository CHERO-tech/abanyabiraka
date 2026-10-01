

ALTER TABLE users ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS otp_codes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier  VARCHAR(255) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    purpose     VARCHAR(30)  NOT NULL CHECK (purpose IN ('REGISTRATION', 'PASSWORD_RESET')),
    expires_at  TIMESTAMPTZ  NOT NULL,
    used        BOOLEAN      NOT NULL DEFAULT FALSE,
    attempts    INT          NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_identifier_purpose ON otp_codes (identifier, purpose, used);
