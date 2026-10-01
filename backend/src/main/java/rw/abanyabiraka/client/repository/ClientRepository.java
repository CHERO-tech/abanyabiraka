package rw.abanyabiraka.client.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.client.entity.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByUserId(UUID userId);
}