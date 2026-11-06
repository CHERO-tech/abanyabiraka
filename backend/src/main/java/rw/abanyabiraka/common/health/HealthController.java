package rw.abanyabiraka.common.health;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public status endpoint. Opening the API's base URL in a browser used to show a bare 403
 * (there was nothing at "/"), which looked like the deployment was broken. Render also uses
 * /api/health as its health check.
 */
@RestController
public class HealthController {

    @GetMapping({"/", "/api/health"})
    public Map<String, String> health() {
        return Map.of(
                "status", "ok",
                "service", "abanyabiraka-api",
                "docs", "/swagger-ui.html");
    }
}
