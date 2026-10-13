
CREATE TABLE IF NOT EXISTS clients (
    id         BIGSERIAL PRIMARY KEY,
    full_name  VARCHAR(255) NOT NULL,
    phone      VARCHAR(255),
    email      VARCHAR(255),
    created_at TIMESTAMP
);
