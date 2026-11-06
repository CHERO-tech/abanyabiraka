package rw.abanyabiraka.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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

    private final OtpMailer otpMailer;

    public OtpService(OtpCodeRepository otpCodeRepository, OtpMailer otpMailer) {
        this.otpCodeRepository = otpCodeRepository;
        this.otpMailer = otpMailer;
    }

    /**
     * Generates a new code, stores it, and sends it to the identifier: by email (in the
     * background) when an email provider is configured, otherwise it is only written to the log.
     */
    public void generateAndSend(String identifier, OtpPurpose purpose) {
        String code = generateCode();

        OtpCode otp = new OtpCode();
        otp.setIdentifier(identifier);
        otp.setCode(code);
        otp.setPurpose(purpose);
        otp.setExpiresAt(Instant.now().plus(EXPIRY_MINUTES, ChronoUnit.MINUTES));
        otpCodeRepository.save(otp);

        // Email identifiers get a real email when a provider is configured (see OtpMailer).
        // It's sent in the background once the transaction commits, so a slow or blocked mail server
        // can't stall sign-up (and no email goes out for an account that was rolled back).
        // Phone numbers still have no SMS provider (e.g. Africa's Talking), so their code is only logged.
        if (identifier.contains("@") && otpMailer.isEnabled()) {
            Runnable send = () -> otpMailer.send(identifier, purpose, code, EXPIRY_MINUTES);
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        send.run();
                    }
                });
            } else {
                send.run();
            }
            return;
        }
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
