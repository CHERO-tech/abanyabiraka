-- Rename this version prefix if V11 isn't actually next.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS worker_id BIGINT REFERENCES workers(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_unique UNIQUE (booking_id);