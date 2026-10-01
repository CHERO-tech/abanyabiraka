package rw.abanyabiraka.worker.service;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.worker.dto.WorkerResponse;
import rw.abanyabiraka.worker.entity.Profession;
import rw.abanyabiraka.worker.entity.Worker;
import rw.abanyabiraka.worker.repository.WorkerRepository;
import rw.abanyabiraka.worker.spec.WorkerSpecification;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerService(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    public List<WorkerResponse> search(
            Long categoryId,
            String district,
            String sector,
            BigDecimal minRating,
            Boolean available,
            Integer minYearsOfExperience,
            Boolean verified) {

        Specification<Worker> spec = WorkerSpecification.withFilters(
                categoryId, district, sector, minRating, available, minYearsOfExperience, verified);

        return workerRepository.findAll(spec).stream()
                .map(this::toResponse)
                .toList();
    }

    public WorkerResponse getById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Worker not found: " + id));
        return toResponse(worker);
    }

    private WorkerResponse toResponse(Worker worker) {
        WorkerResponse response = new WorkerResponse();
        response.setId(worker.getId());
        response.setFullName(worker.getFullName());
        response.setBio(worker.getBio());
        response.setPhone(worker.getPhone());
        response.setEmail(worker.getEmail());
        response.setVerified(worker.isVerified());
        response.setDistrict(worker.getDistrict());
        response.setSector(worker.getSector());
        response.setRating(worker.getRating());
        response.setAvailable(worker.isAvailable());
        response.setYearsOfExperience(worker.getYearsOfExperience());
        response.setCategoryName(worker.getCategory() != null ? worker.getCategory().getName() : null);
        response.setProfessions(worker.getProfessions().stream().map(Profession::getName).toList());
        return response;
    }
}