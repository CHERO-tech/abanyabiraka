package rw.abanyabiraka.booking.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class BookingCreateRequest {

    @NotNull(message = "workerId is required")
    private Long workerId;

    @NotNull(message = "bookingDate is required")
    private LocalDateTime bookingDate;

    private String description;

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public LocalDateTime getBookingDate() {
        return bookingDate;
    }

    public void setBookingDate(LocalDateTime bookingDate) {
        this.bookingDate = bookingDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}