

ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES users(id);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE bookings ADD CONSTRAINT bookings_worker_id_fkey FOREIGN KEY (worker_id) REFERENCES workers(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
    CHECK (status IN ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'));

ALTER TABLE reviews ADD CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES bookings(id);
ALTER TABLE reviews ADD CONSTRAINT reviews_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id);