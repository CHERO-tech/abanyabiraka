package rw.abanyabiraka.booking.controller;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import rw.abanyabiraka.booking.dto.ReviewCreateRequest;
import rw.abanyabiraka.booking.dto.ReviewResponse;
import rw.abanyabiraka.booking.service.ReviewService;

@RestController
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/api/bookings/{id}/review")
    public ResponseEntity<ReviewResponse> create(
            @PathVariable Long id,
            @Valid @RequestBody ReviewCreateRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(reviewService.create(id, request, authentication));
    }

    @GetMapping("/api/reviews")
    public ResponseEntity<List<ReviewResponse>> listByWorker(@RequestParam Long workerId) {
        return ResponseEntity.ok(reviewService.listByWorker(workerId));
    }
}