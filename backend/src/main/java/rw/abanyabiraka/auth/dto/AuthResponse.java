package rw.abanyabiraka.auth.dto;

import java.util.UUID;

public class AuthResponse {

    private String token;
    private final UUID userId;
    private String fullName;
    private String role;

    public AuthResponse(String token, UUID userId, String fullName, String role) {
        this.token = token;
        this.userId = userId;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }
}
