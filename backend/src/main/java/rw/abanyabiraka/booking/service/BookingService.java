package rw.abanyabiraka.booking.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import rw.abanyabiraka.auth.entity.User;
import rw.abanyabiraka.auth.repository.UserRepository;
import rw.abanyabiraka.booking.dto.BookingCreateRequest;
import rw.abanyabiraka.booking.dto.BookingResponse;
import rw.abanyabiraka.booking.entity.Booking;
import rw.abanyabiraka.booking.entity.BookingStatus;
import rw.abanyabiraka.booking.repository.BookingRepository;
import rw.abanyabiraka.client.entity.Client;
import rw.abanyabiraka.client.repository.ClientRepository;
import rw.abanyabiraka.common.exception.AuthException;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.worker.entity.Worker;
import rw.abanyabiraka.worker.repository.WorkerRepository;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final WorkerRepository workerRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;

    public BookingService(
            BookingRepository bookingRepository,
            WorkerRepository workerRepository,
            ClientRepository clientRepository,
            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.workerRepository = workerRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse create(BookingCreateRequest request, Authentication authentication) {
        User currentUser = currentUser(authentication);
        Client client = findOrCreateClient(currentUser);

        Worker worker = workerRepository.findById(request.getWorkerId())
                .orElseThrow(() -> new NotFoundException("Worker not found: " + request.getWorkerId()));

        Booking booking = new Booking();
        booking.setWorkerId(worker.getId());
        booking.setClientId(client.getId());
        booking.setStatus(BookingStatus.PENDING);
        booking.setDescription(request.getDescription());
        booking.setBookingDate(request.getBookingDate());
        booking.setCreatedAt(LocalDateTime.now());
        bookingRepository.save(booking);

        return toResponse(booking, worker, client);
    }

    public BookingResponse getById(Long id, Authentication authentication) {
        Booking booking = findBooking(id);
        Worker worker = workerRepository.findById(booking.getWorkerId()).orElse(null);
        Client client = clientRepository.findById(booking.getClientId()).orElse(null);
        assertParticipantOrAdmin(worker, client, authentication);
        return toResponse(booking, worker, client);
    }

    public List<BookingResponse> listByClient(Long clientId, Authentication authentication) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new NotFoundException("Client not found: " + clientId));
        assertClientOwnerOrAdmin(client, authentication);

        return bookingRepository.findByClientId(clientId).stream()
                .map(b -> toResponse(b, workerRepository.findById(b.getWorkerId()).orElse(null), client))
                .toList();
    }

    public List<BookingResponse> listByWorker(Long workerId, Authentication authentication) {
        Worker worker = workerRepository.findById(workerId)
                .orElseThrow(() -> new NotFoundException("Worker not found: " + workerId));
        assertWorkerOwnerOrAdmin(worker, authentication);

        return bookingRepository.findByWorkerId(workerId).stream()
                .map(b -> toResponse(b, worker, clientRepository.findById(b.getClientId()).orElse(null)))
                .toList();
    }

    @Transactional
    public BookingResponse accept(Long id, Authentication authentication) {
        return transitionByWorker(id, authentication, BookingStatus.PENDING, BookingStatus.ACCEPTED);
    }

    @Transactional
    public BookingResponse reject(Long id, Authentication authentication) {
        return transitionByWorker(id, authentication, BookingStatus.PENDING, BookingStatus.REJECTED);
    }

    @Transactional
    public BookingResponse complete(Long id, Authentication authentication) {
        return transitionByWorker(id, authentication, BookingStatus.ACCEPTED, BookingStatus.COMPLETED);
    }

    private BookingResponse transitionByWorker(
            Long id, Authentication authentication, BookingStatus requiredCurrent, BookingStatus next) {
        Booking booking = findBooking(id);
        Worker worker = workerRepository.findById(booking.getWorkerId()).orElse(null);
        assertWorkerOwnerOrAdmin(worker, authentication);

        if (booking.getStatus() != requiredCurrent) {
            throw new AuthException(HttpStatus.CONFLICT,
                    "Booking must be " + requiredCurrent + " to become " + next
                            + " (currently " + booking.getStatus() + ")");
        }

        booking.setStatus(next);
        bookingRepository.save(booking);

        Client client = clientRepository.findById(booking.getClientId()).orElse(null);
        return toResponse(booking, worker, client);
    }
    
    private Client findOrCreateClient(User user) {
        return clientRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Client client = new Client();
                    client.setUser(user);
                    client.setFullName(StringUtils.hasText(user.getFullName()) ? user.getFullName() : "Client");
                    client.setEmail(user.getEmail());
                    client.setPhone(user.getPhone());
                    client.setCreatedAt(LocalDateTime.now());
                    return clientRepository.save(client);
                });
    }

    private void assertParticipantOrAdmin(Worker worker, Client client, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }
        User currentUser = currentUser(authentication);
        boolean isWorkerOwner = worker != null && worker.getUser() != null
                && worker.getUser().getId().equals(currentUser.getId());
        boolean isClientOwner = client != null && client.getUser() != null
                && client.getUser().getId().equals(currentUser.getId());
        if (!isWorkerOwner && !isClientOwner) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You are not part of this booking");
        }
    }

    private void assertClientOwnerOrAdmin(Client client, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }
        User currentUser = currentUser(authentication);
        if (client.getUser() == null || !client.getUser().getId().equals(currentUser.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You do not own this client profile");
        }
    }

    private void assertWorkerOwnerOrAdmin(Worker worker, Authentication authentication) {
        if (isAdmin(authentication)) {
            return;
        }
        if (worker == null) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Worker not found for this booking");
        }
        User currentUser = currentUser(authentication);
        if (worker.getUser() == null || !worker.getUser().getId().equals(currentUser.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You do not own this worker profile");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    private User currentUser(Authentication authentication) {
        if (authentication == null) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        String identifier = authentication.getName();
        return userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Invalid session"));
    }

    private Booking findBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Booking not found: " + id));
    }

    private BookingResponse toResponse(Booking booking, Worker worker, Client client) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        response.setWorkerId(booking.getWorkerId());
        response.setWorkerName(worker != null ? worker.getFullName() : null);
        response.setClientId(booking.getClientId());
        response.setClientName(client != null ? client.getFullName() : null);
        response.setStatus(booking.getStatus().name());
        response.setDescription(booking.getDescription());
        response.setBookingDate(booking.getBookingDate());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }
}