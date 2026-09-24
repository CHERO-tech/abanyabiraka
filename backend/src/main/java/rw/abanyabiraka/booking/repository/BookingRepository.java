package rw.abanyabiraka.booking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.booking.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByClientId(Long clientId);
    List<Booking> findByWorkerId(Long workerId);
}