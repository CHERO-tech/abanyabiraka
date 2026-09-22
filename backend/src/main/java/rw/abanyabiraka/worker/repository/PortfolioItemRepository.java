package rw.abanyabiraka.worker.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.worker.entity.PortfolioItem;

public interface PortfolioItemRepository extends JpaRepository<PortfolioItem, Long> {
    List<PortfolioItem> findByWorkerId(Long workerId);
}