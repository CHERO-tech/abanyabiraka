package rw.abanyabiraka.auth.service;

import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import rw.abanyabiraka.auth.dto.AuthResponse;
import rw.abanyabiraka.auth.dto.ForgotPasswordRequest;
import rw.abanyabiraka.auth.dto.LoginRequest;
import rw.abanyabiraka.auth.dto.OtpVerifyRequest;
import rw.abanyabiraka.auth.dto.RegisterRequest;
import rw.abanyabiraka.auth.dto.ResetPasswordRequest;
import rw.abanyabiraka.auth.entity.OtpPurpose;
import rw.abanyabiraka.auth.entity.Role;
import rw.abanyabiraka.auth.entity.User;
import rw.abanyabiraka.auth.repository.RoleRepository;
import rw.abanyabiraka.auth.repository.UserRepository;
import rw.abanyabiraka.auth.security.JwtTokenProvider;
import rw.abanyabiraka.common.exception.AuthException;

@Service
public class AuthService {

    // ADMIN is not self-registerable via this endpoint.
    private static final Set<String> SELF_REGISTERABLE_ROLES = Set.of("CLIENT", "WORKER");

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            UserRepository userRepository,
            RoleRepository roleRepository,
            OtpService otpService,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Transactional
    public void register(RegisterRequest request) {
        boolean hasEmail = StringUtils.hasText(request.getEmail());
        boolean hasPhone = StringUtils.hasText(request.getPhone());

        if (!hasEmail && !hasPhone) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Email or phone is required");
        }
        if (hasEmail && userRepository.existsByEmail(request.getEmail())) {
            throw new AuthException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        if (hasPhone && userRepository.existsByPhone(request.getPhone())) {
            throw new AuthException(HttpStatus.CONFLICT, "An account with this phone number already exists");
        }

        String roleName = request.getRole() == null ? "" : request.getRole().trim().toUpperCase();
        if (!SELF_REGISTERABLE_ROLES.contains(roleName)) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Role must be CLIENT or WORKER");
        }
        Role role = findOrCreateRole(roleName);

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(hasEmail ? request.getEmail() : null);
        user.setPhone(hasPhone ? request.getPhone() : null);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);
        user.setEnabled(false);
        userRepository.save(user);

        String identifier = hasPhone ? request.getPhone() : request.getEmail();
        otpService.generateAndSend(identifier, OtpPurpose.REGISTRATION);
    }

    @Transactional
    public AuthResponse verifyRegistrationOtp(OtpVerifyRequest request) {
        otpService.validate(request.getIdentifier(), request.getCode(), OtpPurpose.REGISTRATION);

        User user = findByIdentifier(request.getIdentifier());
        user.setEnabled(true);
        userRepository.save(user);

        return buildAuthResponse(user, request.getIdentifier());
    }

    public AuthResponse login(LoginRequest request) {
        User user = findByIdentifier(request.getIdentifier());

        if (!user.isEnabled()) {
            throw new AuthException(HttpStatus.FORBIDDEN, "Account is not verified yet - complete OTP verification");
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Incorrect email/phone or password");
        }

        return buildAuthResponse(user, request.getIdentifier());
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        // Always succeeds from the caller's point of view, even if the account doesn't
        // exist, so this endpoint can't be used to probe which emails/phones are registered.
        userRepository.findByEmailOrPhone(request.getIdentifier(), request.getIdentifier())
                .ifPresent(user -> otpService.generateAndSend(request.getIdentifier(), OtpPurpose.PASSWORD_RESET));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        otpService.validate(request.getIdentifier(), request.getCode(), OtpPurpose.PASSWORD_RESET);

        User user = findByIdentifier(request.getIdentifier());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    /**
     * The roles table has no seed data yet, so the first CLIENT/WORKER registration
     * creates the row. Once Phase 2/Admin seeds real roles, this just finds them instead.
     */
    private Role findOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    return roleRepository.save(role);
                });
    }

    private User findByIdentifier(String identifier) {
        return userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AuthException(HttpStatus.NOT_FOUND, "No account for: " + identifier));
    }

    private AuthResponse buildAuthResponse(User user, String identifier) {
        String token = jwtTokenProvider.generateToken(identifier);
        return new AuthResponse(token, user.getId(), user.getFullName(), user.getRole().getName());
    }
}
