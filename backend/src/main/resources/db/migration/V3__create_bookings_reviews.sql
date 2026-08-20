CREATE TABLE IF NOT EXISTS bookings (
    id BIGSERIAL PRIMARY KEY,
    worker_id BIGINT,
    client_id BIGINT,
    status VARCHAR(50),
    booking_date TIMESTAMP,
    created_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT,
    client_id BIGINT,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP
);
