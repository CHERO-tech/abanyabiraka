package rw.abanyabiraka.auth.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
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

    private final JavaMailSender mailSender;
    private final String mailFrom;

    public OtpService(OtpCodeRepository otpCodeRepository,
                      JavaMailSender mailSender,
                      @Value("${spring.mail.username:}") String mailFrom) {
        this.otpCodeRepository = otpCodeRepository;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
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

        // Email identifiers get a real email when SMTP is configured (MAIL_USERNAME/MAIL_PASSWORD).
        // Phone numbers still have no SMS provider (e.g. Africa's Talking), so their code is only logged.
        if (identifier.contains("@") && StringUtils.hasText(mailFrom) && sendEmail(identifier, purpose, code)) {
            log.info("OTP for {} [{}] sent by email", identifier, purpose);
            return;
        }
        log.info("OTP for {} [{}]: {} (expires in {} min)", identifier, purpose, code, EXPIRY_MINUTES);
    }

    private boolean sendEmail(String to, OtpPurpose purpose, String code) {
        boolean reset = purpose == OtpPurpose.PASSWORD_RESET;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Abanyabiraka <" + mailFrom + ">");
        message.setTo(to);
        message.setSubject(reset ? "Your Abanyabiraka password reset code" : "Your Abanyabiraka verification code");
        message.setText("Muraho,\n\n"
                + (reset ? "Use this code to reset your Abanyabiraka password: " : "Use this code to verify your Abanyabiraka account: ")
                + code + "\n\nIt expires in " + EXPIRY_MINUTES + " minutes. Never share it with anyone.\n\n"
                + "If you didn't request this, you can ignore this email.\n\nAbanyabiraka");
        try {
            mailSender.send(message);
            return true;
        } catch (MailException ex) {
            // Don't fail registration because email is down; fall back to the log so dev isn't blocked.
            log.warn("Could not email OTP to {}: {}", to, ex.getMessage());
            return false;
        }
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
