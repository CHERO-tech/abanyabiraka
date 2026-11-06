package rw.abanyabiraka;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class AbanyabirakaApplication {
    public static void main(String[] args) {
        SpringApplication.run(AbanyabirakaApplication.class, args);
    }
}
