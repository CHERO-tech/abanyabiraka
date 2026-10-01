package rw.abanyabiraka.booking.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rw.abanyabiraka.auth.entity.User;
import rw.abanyabiraka.auth.repository.UserRepository;
import rw.abanyabiraka.booking.dto.ReviewCreateRequest;
import rw.abanyabiraka.booking.dto.ReviewResponse;
import rw.abanyabiraka.booking.entity.Booking;
import rw.abanyabiraka.booking.entity.BookingStatus;
import rw.abanyabiraka.booking.entity.Review;
import rw.abanyabiraka.booking.repository.BookingRepository;
import rw.abanyabiraka.booking.repository.ReviewRepository;
import rw.abanyabiraka.client.entity.Client;
import rw.abanyabiraka.client.repository.ClientRepository;
import rw.abanyabiraka.common.exception.AuthException;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.worker.entity.Worker;
import rw.abanyabiraka.worker.repository.WorkerRepository;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final ClientRepository clientRepository;
    private final WorkerRepository workerRepository;
    private final UserRepository userRepository;

    public ReviewService(
            ReviewRepository reviewRepository,
            BookingRepository bookingRepository,
            ClientRepository clientRepository,
            WorkerRepository workerRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.clientRepository = clientRepository;
        this.workerRepository = workerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewResponse create(Long bookingId, ReviewCreateRequest request, Authentication authentication) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + bookingId));

        Client client = clientRepository.findById(booking.getClientId())
                .orElseThrow(() -> new NotFoundException("Client not found: " + booking.getClientId()));

        assertClientOwnerOrAdmin(client, authentication);

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new AuthException(HttpStatus.CONFLICT,
                    "Booking must be COMPLETED before it can be reviewed (currently " + booking.getStatus() + ")");
        }

        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new AuthException(HttpStatus.CONFLICT, "This booking has already been reviewed");
        }

        Review review = new Review();
        review.setBookingId(booking.getId());
        review.setWorkerId(booking.getWorkerId());
        review.setClientId(client.getId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());
        reviewRepository.save(review);

        recomputeWorkerRating(booking.getWorkerId());

        return toResponse(review, client);
    }

    public List<ReviewResponse> listByWorker(Long workerId) {
        return reviewRepository.findByWorkerId(workerId).stream()
                .map(r -> toResponse(r, clientRepository.findById(r.getClientId()).orElse(null)))
                .toList();
    }

    /** Recomputes the worker's rating field as a plain average of all their reviews. */
    private void recomputeWorkerRating(Long workerId) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new NotFoundException("Worker not found: " + workerId));

        List<Review> reviews = reviewRepository.findByWorkerId(workerId);
        if (reviews.isEmpty()) {
            worker.setRating(null);
        } else {
            double average = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
            worker.setRating(BigDecimal.valueOf(average).setScale(2, RoundingMode.HALF_UP));
        }
        workerRepository.save(worker);
    }

    private void assertClientOwnerOrAdmin(Client client, Authentication authentication) {
        if (authentication == null) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }
        String identifier = authentication.getName();
        User currentUser = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Invalid session"));

        if (client.getUser() == null || !client.getUser().getId().equals(currentUser.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You do not own this booking");
        }
    }

    private ReviewResponse toResponse(Review review, Client client) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setBookingId(review.getBookingId());
        response.setWorkerId(review.getWorkerId());
        response.setClientId(review.getClientId());
        response.setClientName(client != null ? client.getFullName() : null);
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());
        return response;
    }
}