

CREATE TABLE IF NOT EXISTS audit_logs (
    id           BIGSERIAL PRIMARY KEY,
    action       VARCHAR(255),
    entity       VARCHAR(255),
    performed_by VARCHAR(255),
    created_at   TIMESTAMP
);
