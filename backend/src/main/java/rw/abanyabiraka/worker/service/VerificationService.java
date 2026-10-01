package rw.abanyabiraka.worker.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.common.storage.FileStorageService;
import rw.abanyabiraka.worker.dto.QualificationDocumentResponse;
import rw.abanyabiraka.worker.entity.DocumentStatus;
import rw.abanyabiraka.worker.entity.QualificationDocument;
import rw.abanyabiraka.worker.entity.Worker;
import rw.abanyabiraka.worker.repository.QualificationDocumentRepository;
import rw.abanyabiraka.worker.repository.WorkerRepository;

@Service
public class VerificationService {

    // Badge thresholds are an assumption - the plan doesn't define them.
    private static final BigDecimal TOP_RATED_THRESHOLD = new BigDecimal("4.5");
    private static final int EXPERIENCED_YEARS_THRESHOLD = 5;

    private final WorkerRepository workerRepository;
    private final QualificationDocumentRepository documentRepository;
    private final FileStorageService fileStorageService;

    public VerificationService(
            WorkerRepository workerRepository,
            QualificationDocumentRepository documentRepository,
            FileStorageService fileStorageService) {
        this.workerRepository = workerRepository;
        this.documentRepository = documentRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public QualificationDocumentResponse uploadDocument(Long workerId, MultipartFile file, String documentType) {
        Worker worker = findWorker(workerId);

        String url = fileStorageService.store(file, "qualifications/" + workerId);

        QualificationDocument document = new QualificationDocument();
        document.setWorker(worker);
        document.setFileName(file.getOriginalFilename());
        document.setFileUrl(url);
        document.setDocumentType(documentType);
        document.setStatus(DocumentStatus.PENDING);
        document.setUploadedAt(LocalDateTime.now());
        documentRepository.save(document);

        return toResponse(document);
    }

    @Transactional
    public QualificationDocumentResponse approveDocument(Long documentId) {
        QualificationDocument document = findDocument(documentId);
        document.setStatus(DocumentStatus.APPROVED);
        documentRepository.save(document);
        return toResponse(document);
    }

    @Transactional
    public QualificationDocumentResponse rejectDocument(Long documentId) {
        QualificationDocument document = findDocument(documentId);
        document.setStatus(DocumentStatus.REJECTED);
        documentRepository.save(document);
        return toResponse(document);
    }

    @Transactional
    public void verifyIdentity(Long workerId) {
        Worker worker = findWorker(workerId);
        worker.setVerified(true);
        workerRepository.save(worker);
    }

    public List<String> computeBadges(Worker worker) {
        List<String> badges = new ArrayList<>();

        if (worker.isVerified()) {
            badges.add("Verified Identity");
        }

        boolean hasApprovedDocument = documentRepository.findByWorkerId(worker.getId()).stream()
                .anyMatch(d -> d.getStatus() == DocumentStatus.APPROVED);
        if (hasApprovedDocument) {
            badges.add("Verified Qualification");
        }

        if (worker.getRating() != null && worker.getRating().compareTo(TOP_RATED_THRESHOLD) >= 0) {
            badges.add("Top Rated");
        }

        if (worker.getYearsOfExperience() != null && worker.getYearsOfExperience() >= EXPERIENCED_YEARS_THRESHOLD) {
            badges.add("Experienced");
        }

        return badges;
    }

    private Worker findWorker(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Worker not found: " + id));
    }

    private QualificationDocument findDocument(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Qualification document not found: " + id));
    }

    private QualificationDocumentResponse toResponse(QualificationDocument document) {
        return new QualificationDocumentResponse(
                document.getId(),
                document.getFileName(),
                document.getFileUrl(),
                document.getDocumentType(),
                document.getStatus().name());
    }
}