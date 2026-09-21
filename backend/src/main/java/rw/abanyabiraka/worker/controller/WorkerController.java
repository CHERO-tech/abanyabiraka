package rw.abanyabiraka.worker.controller;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import rw.abanyabiraka.worker.dto.WorkerResponse;
import rw.abanyabiraka.worker.service.WorkerService;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
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
}