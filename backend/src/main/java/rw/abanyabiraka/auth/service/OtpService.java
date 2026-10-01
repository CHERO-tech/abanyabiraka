package rw.abanyabiraka.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import rw.abanyabiraka.auth.entity.OtpCode;
import rw.abanyabiraka.auth.entity.OtpPurpose;
import rw.abanyabiraka.auth.repository.OtpCodeRepository;
import rw.abanyabiraka.common.exception.AuthException;

@Service
public class OtpService {

    private static final Logger log = LoggerFactory.getLogger(OtpService.class);
    private static final int CODE_LENGTH = 6;
    private static final long EXPIRY_MINUTES = 10;
    private static final int MAX_ATTEMPTS = 5;

    private final OtpCodeRepository otpCodeRepository;
    private final SecureRandom random = new SecureRandom();

    public OtpService(OtpCodeRepository otpCodeRepository) {
        this.otpCodeRepository = otpCodeRepository;
    }

    /**
     * Generates a new code, stores it, and "sends" it to the identifier.
     * Delivery is stubbed - wire in an SMS/email provider (e.g. Africa's Talking for
     * Rwandan numbers) before this goes near production; for now the code is logged.
     */
    public void generateAndSend(String identifier, OtpPurpose purpose) {
        String code = generateCode();

        OtpCode otp = new OtpCode();
        otp.setIdentifier(identifier);
        otp.setCode(code);
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plus(EXPIRY_MINUTES, ChronoUnit.MINUTES));
        otpCodeRepository.save(otp);

        // TODO(Phase 1 follow-up): replace with real SMS/email delivery.
        log.info("OTP for {} [{}]: {} (expires in {} min)", identifier, purpose, code, EXPIRY_MINUTES);
    }

    /**
     * Validates a submitted code. Throws AuthException on any failure (not found,
     * expired, wrong code, too many attempts). On success, marks the code used so it
     * can't be replayed.
     */
    public void validate(String identifier, String code, OtpPurpose purpose) {
        OtpCode otp = otpCodeRepository
                .findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(identifier, purpose)
                .orElseThrow(() -> new AuthException(HttpStatus.BAD_REQUEST, "No active code for this request"));

        if (otp.getAttempts() >= MAX_ATTEMPTS) {
            throw new AuthException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts - request a new code");
        }

        if (Instant.now().isAfter(otp.getExpiresAt())) {
            throw new AuthException(HttpStatus.BAD_REQUEST, "Code has expired - request a new one");
        }

        if (!otp.getCode().equals(code)) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpCodeRepository.save(otp);
            throw new AuthException(HttpStatus.BAD_REQUEST, "Incorrect code");
        }

        otp.setUsed(true);
        otpCodeRepository.save(otp);
    }

    private String generateCode() {
        StringBuilder sb = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
