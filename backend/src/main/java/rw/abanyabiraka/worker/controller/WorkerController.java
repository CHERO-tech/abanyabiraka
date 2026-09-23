package rw.abanyabiraka.worker.controller;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import rw.abanyabiraka.worker.dto.PortfolioItemResponse;
import rw.abanyabiraka.worker.dto.QualificationDocumentResponse;
import rw.abanyabiraka.worker.dto.WorkerEditRequest;
import rw.abanyabiraka.worker.dto.WorkerResponse;
import rw.abanyabiraka.worker.service.VerificationService;
import rw.abanyabiraka.worker.service.WorkerService;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;
    private final VerificationService verificationService;

    public WorkerController(WorkerService workerService, VerificationService verificationService) {
        this.workerService = workerService;
        this.verificationService = verificationService;
    }

    @GetMapping
    public ResponseEntity<List<WorkerResponse>> search(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String district,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) BigDecimal minRating,
            @RequestParam(required = false) Boolean available,
            @RequestParam(required = false) Integer minYearsOfExperience,
            @RequestParam(required = false) Boolean verified) {

        return ResponseEntity.ok(workerService.search(
                categoryId, district, sector, minRating, available, minYearsOfExperience, verified));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkerResponse> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody WorkerEditRequest request,
            Authentication authentication) {
        return ResponseEntity.ok(workerService.updateProfile(id, request, authentication));
    }

    @PostMapping(value = "/{id}/portfolio", consumes = "multipart/form-data")
    public ResponseEntity<PortfolioItemResponse> addPortfolioItem(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) String caption,
            Authentication authentication) {
        return ResponseEntity.ok(workerService.addPortfolioItem(id, file, caption, authentication));
    }

    @PostMapping(value = "/{id}/qualification-documents", consumes = "multipart/form-data")
    public ResponseEntity<QualificationDocumentResponse> uploadQualificationDocument(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam String documentType,
            Authentication authentication) {
        workerService.assertOwnerOrAdmin(workerService.findWorker(id), authentication);
        return ResponseEntity.ok(verificationService.uploadDocument(id, file, documentType));
    }

    @PatchMapping("/qualification-documents/{documentId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QualificationDocumentResponse> approveDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(verificationService.approveDocument(documentId));
    }

    @PatchMapping("/qualification-documents/{documentId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QualificationDocumentResponse> rejectDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(verificationService.rejectDocument(documentId));
    }

    @PatchMapping("/{id}/verify-identity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> verifyIdentity(@PathVariable Long id) {
        verificationService.verifyIdentity(id);
        return ResponseEntity.noContent().build();
    }
}