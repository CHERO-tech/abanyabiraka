package rw.abanyabiraka.client.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.client.entity.Client;

public interface ClientRepository extends JpaRepository<Client, Long> {
}
