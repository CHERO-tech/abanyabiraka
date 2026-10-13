package rw.abanyabiraka.auth.dto;

import java.util.UUID;

/**
 * Who the bearer of the current JWT is, plus the ids of their WORKER/CLIENT profile rows.
 * The frontend needs workerId/clientId to call /api/bookings?workerId=... and
 * PUT /api/workers/{id}, but login only returns the UUID userId.
 */
public class CurrentUserResponse {

    private final UUID userId;
    private final String fullName;
    private final String email;
    private final String phone;
    private final String role;
    private final Long workerId;
    private final Long clientId;

    public CurrentUserResponse(UUID userId, String fullName, String email, String phone,
                               String role, Long workerId, Long clientId) {
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.workerId = workerId;
        this.clientId = clientId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public Long getClientId() {
        return clientId;
    }
}
