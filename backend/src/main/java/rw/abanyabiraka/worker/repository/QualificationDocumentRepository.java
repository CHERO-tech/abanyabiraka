package rw.abanyabiraka.worker.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.worker.entity.QualificationDocument;

public interface QualificationDocumentRepository extends JpaRepository<QualificationDocument, Long> {
    List<QualificationDocument> findByWorkerId(Long workerId);
}