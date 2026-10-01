package rw.abanyabiraka.booking.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.booking.entity.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByWorkerId(Long workerId);
    boolean existsByBookingId(Long bookingId);
}