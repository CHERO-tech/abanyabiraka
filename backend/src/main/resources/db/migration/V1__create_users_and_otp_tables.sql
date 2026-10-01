CREATE TABLE roles (
    id   BIGSERIAL    PRIMARY KEY,
    name VARCHAR(20)  NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('CLIENT'), ('WORKER'), ('ADMIN');

CREATE TABLE users (
        id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        full_name     VARCHAR(255) NOT NULL,
        email         VARCHAR(255) UNIQUE,
        phone         VARCHAR(32)  UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        enabled       BOOLEAN      NOT NULL DEFAULT FALSE,
        role_id       BIGINT       NOT NULL REFERENCES roles (id),
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
        updated_at    TIMESTAMPTZ,
        CONSTRAINT users_email_or_phone_present CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_role_id ON users (role_id);

CREATE TABLE user_roles (
                            user_id UUID   NOT NULL REFERENCES users (id) ON DELETE CASCADE,
                            role_id BIGINT NOT NULL REFERENCES roles (id),
                            PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role_id ON user_roles (role_id);

CREATE TABLE otp_codes (
                           id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           identifier  VARCHAR(255) NOT NULL,
                           code        VARCHAR(10)  NOT NULL,
                           purpose     VARCHAR(30)  NOT NULL CHECK (purpose IN ('REGISTRATION', 'PASSWORD_RESET')),
                           expires_at  TIMESTAMPTZ  NOT NULL,
                           used        BOOLEAN      NOT NULL DEFAULT FALSE,
                           attempts    INT          NOT NULL DEFAULT 0,
                           created_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_otp_codes_identifier_purpose ON otp_codes (identifier, purpose, used);