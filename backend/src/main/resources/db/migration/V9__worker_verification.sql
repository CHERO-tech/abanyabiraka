ALTER TABLE workers ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id);

ALTER TABLE qualification_documents ADD COLUMN IF NOT EXISTS worker_id BIGINT REFERENCES workers(id);
ALTER TABLE qualification_documents ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));
ALTER TABLE qualification_documents ADD COLUMN IF NOT EXISTS uploaded_at TIMESTAMP;

CREATE TABLE IF NOT EXISTS portfolio_items (
     id         BIGSERIAL PRIMARY KEY,
     worker_id  BIGINT NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
    file_name  VARCHAR(255),
    file_url   VARCHAR(500),
    caption    VARCHAR(500),
    created_at TIMESTAMP
    );