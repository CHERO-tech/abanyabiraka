package rw.abanyabiraka.auth.service;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import rw.abanyabiraka.auth.entity.Role;
import rw.abanyabiraka.auth.entity.User;
import rw.abanyabiraka.auth.repository.RoleRepository;
import rw.abanyabiraka.auth.repository.UserRepository;

/**
 * Makes sure an admin account exists, because nobody can sign up as ADMIN.
 *
 * When ADMIN_EMAIL and ADMIN_PASSWORD are set, every startup creates that account
 * (already verified) or, if the email is already registered, turns it into an admin.
 * The password is always reset to ADMIN_PASSWORD, so changing the variable changes
 * the login. Leave both empty to skip this.
 */
@Component
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String name;

    public AdminBootstrap(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.admin.email:}") String email,
                          @Value("${app.admin.password:}") String password,
                          @Value("${app.admin.name:Admin}") String name) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.email = email == null ? "" : email.trim();
        this.password = password;
        this.name = name;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!StringUtils.hasText(email) || !StringUtils.hasText(password)) {
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            log.warn("ADMIN_PASSWORD is shorter than {} characters; admin account not created", MIN_PASSWORD_LENGTH);
            return;
        }

        Role admin = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role role = new Role();
            role.setName("ADMIN");
            return roleRepository.save(role);
        });

        User user = userRepository.findByEmail(email).orElse(null);
        boolean created = user == null;
        if (created) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setCreatedAt(LocalDateTime.now());
        } else {
            user.setUpdatedAt(LocalDateTime.now());
        }
        user.setRole(admin);
        user.setEnabled(true);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        log.info("Admin account {} {}", email, created ? "created" : "updated");
    }
}
