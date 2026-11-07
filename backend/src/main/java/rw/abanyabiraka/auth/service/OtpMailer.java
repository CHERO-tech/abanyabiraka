package rw.abanyabiraka.auth.service;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import rw.abanyabiraka.auth.entity.OtpPurpose;

/**
 * Emails OTP codes on a background thread, so sign-up never waits for the mail provider.
 *
 * Two ways to send, picked from configuration:
 *  - Brevo HTTP API (BREVO_API_KEY): works on hosts that block SMTP, such as Render's free plan.
 *  - SMTP (MAIL_USERNAME / MAIL_PASSWORD, e.g. Gmail with an App Password): fine locally.
 * If neither is configured, or sending fails, the code is written to the log instead.
 */
@Component
public class OtpMailer {

    private static final Logger log = LoggerFactory.getLogger(OtpMailer.class);
    private static final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    private final JavaMailSender mailSender;
    private final String from;
    private final String brevoApiKey;
    private final String smtpUsername;
    private final RestClient http;

    public OtpMailer(JavaMailSender mailSender,
                     @Value("${app.mail.from:}") String from,
                     @Value("${app.mail.brevo-api-key:}") String brevoApiKey,
                     @Value("${spring.mail.username:}") String smtpUsername) {
        this.mailSender = mailSender;
        this.from = from;
        this.brevoApiKey = brevoApiKey;
        this.smtpUsername = smtpUsername;
        SimpleClientHttpRequestFactory timeouts = new SimpleClientHttpRequestFactory();
        timeouts.setConnectTimeout(Duration.ofSeconds(10));
        timeouts.setReadTimeout(Duration.ofSeconds(15));
        this.http = RestClient.builder().requestFactory(timeouts).build();
    }

    /** True when some email provider is configured; otherwise callers just log the code. */
    public boolean isEnabled() {
        return StringUtils.hasText(from) && (StringUtils.hasText(brevoApiKey) || StringUtils.hasText(smtpUsername));
    }

    @Async
    public void send(String to, OtpPurpose purpose, String code, long expiryMinutes) {
        boolean reset = purpose == OtpPurpose.PASSWORD_RESET;
        String subject = reset ? "Your Abanyabiraka password reset code" : "Your Abanyabiraka verification code";
        String text = "Muraho,\n\n"
                + (reset ? "Use this code to reset your Abanyabiraka password: " : "Use this code to verify your Abanyabiraka account: ")
                + code + "\n\nIt expires in " + expiryMinutes + " minutes. Never share it with anyone.\n\n"
                + "If you didn't request this, you can ignore this email.\n\nAbanyabiraka";
        try {
            if (StringUtils.hasText(brevoApiKey)) {
                sendWithBrevo(to, subject, text);
            } else {
                sendWithSmtp(to, subject, text);
            }
            log.info("OTP for {} [{}] sent by email", to, purpose);
        } catch (Exception ex) {
            log.warn("Could not email OTP to {}: {}", to, ex.getMessage());
            log.info("OTP for {} [{}]: {} (expires in {} min)", to, purpose, code, expiryMinutes);
        }
    }

    private void sendWithBrevo(String to, String subject, String text) {
        http.post()
                .uri(BREVO_URL)
                .header("api-key", brevoApiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .body(Map.of(
                        "sender", Map.of("name", "Abanyabiraka", "email", from),
                        "to", List.of(Map.of("email", to)),
                        "subject", subject,
                        "textContent", text))
                .retrieve()
                .toBodilessEntity();
    }

    private void sendWithSmtp(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Abanyabiraka <" + from + ">");
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }
}
