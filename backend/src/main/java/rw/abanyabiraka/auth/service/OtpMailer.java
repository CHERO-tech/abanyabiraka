package rw.abanyabiraka.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import rw.abanyabiraka.auth.entity.OtpPurpose;

/**
 * Emails OTP codes on a background thread. SMTP can be slow or blocked (Render's free plan blocks
 * outgoing SMTP, so each attempt hangs until it times out), and sign-up must not wait for it.
 * If sending fails, the code is written to the log so the account can still be verified.
 */
@Component
public class OtpMailer {

    private static final Logger log = LoggerFactory.getLogger(OtpMailer.class);

    private final JavaMailSender mailSender;

    public OtpMailer(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void send(String from, String to, OtpPurpose purpose, String code, long expiryMinutes) {
        boolean reset = purpose == OtpPurpose.PASSWORD_RESET;
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Abanyabiraka <" + from + ">");
        message.setTo(to);
        message.setSubject(reset ? "Your Abanyabiraka password reset code" : "Your Abanyabiraka verification code");
        message.setText("Muraho,\n\n"
                + (reset ? "Use this code to reset your Abanyabiraka password: " : "Use this code to verify your Abanyabiraka account: ")
                + code + "\n\nIt expires in " + expiryMinutes + " minutes. Never share it with anyone.\n\n"
                + "If you didn't request this, you can ignore this email.\n\nAbanyabiraka");
        try {
            mailSender.send(message);
            log.info("OTP for {} [{}] sent by email", to, purpose);
        } catch (MailException ex) {
            log.warn("Could not email OTP to {}: {}", to, ex.getMessage());
            log.info("OTP for {} [{}]: {} (expires in {} min)", to, purpose, code, expiryMinutes);
        }
    }
}
