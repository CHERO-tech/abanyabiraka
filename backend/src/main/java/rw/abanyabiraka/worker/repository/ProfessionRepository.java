package rw.abanyabiraka.worker.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.worker.entity.Profession;

public interface ProfessionRepository extends JpaRepository<Profession, Long> {

    Optional<Profession> findByName(String name);

    boolean existsByName(String name);

    List<Profession> findByCategoryId(Long categoryId);
}