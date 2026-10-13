package rw.abanyabiraka.booking.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import rw.abanyabiraka.booking.dto.BookingCreateRequest;
import rw.abanyabiraka.booking.dto.BookingResponse;
import rw.abanyabiraka.booking.service.BookingService;
import rw.abanyabiraka.common.exception.ApiException;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<BookingResponse> create(
            @Valid @RequestBody BookingCreateRequest request, Authentication authentication) {
        return ResponseEntity.ok(bookingService.create(request, authentication));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BookingResponse> getById(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.getById(id, authentication));
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> list(
            @RequestParam(required = false) Long clientId,
            @RequestParam(required = false) Long workerId,
            Authentication authentication) {
        if (clientId != null) {
            return ResponseEntity.ok(bookingService.listByClient(clientId, authentication));
        }
        if (workerId != null) {
            return ResponseEntity.ok(bookingService.listByWorker(workerId, authentication));
        }
        throw new ApiException("Provide either clientId or workerId");
    }

    @PatchMapping("/{id}/accept")
    public ResponseEntity<BookingResponse> accept(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.accept(id, authentication));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<BookingResponse> reject(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.reject(id, authentication));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<BookingResponse> complete(@PathVariable Long id, Authentication authentication) {
        return ResponseEntity.ok(bookingService.complete(id, authentication));
    }
}