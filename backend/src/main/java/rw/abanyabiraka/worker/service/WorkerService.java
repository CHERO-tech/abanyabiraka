package rw.abanyabiraka.worker.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import rw.abanyabiraka.auth.entity.User;
import rw.abanyabiraka.auth.repository.UserRepository;
import rw.abanyabiraka.common.exception.AuthException;
import rw.abanyabiraka.common.exception.NotFoundException;
import rw.abanyabiraka.common.storage.FileStorageService;
import rw.abanyabiraka.worker.dto.PortfolioItemResponse;
import rw.abanyabiraka.worker.dto.WorkerEditRequest;
import rw.abanyabiraka.worker.dto.WorkerResponse;
import rw.abanyabiraka.worker.entity.Category;
import rw.abanyabiraka.worker.entity.PortfolioItem;
import rw.abanyabiraka.worker.entity.Profession;
import rw.abanyabiraka.worker.entity.Worker;
import rw.abanyabiraka.worker.repository.CategoryRepository;
import rw.abanyabiraka.worker.repository.PortfolioItemRepository;
import rw.abanyabiraka.worker.repository.ProfessionRepository;
import rw.abanyabiraka.worker.repository.WorkerRepository;
import rw.abanyabiraka.worker.spec.WorkerSpecification;

@Service
public class WorkerService {

    private final WorkerRepository workerRepository;
    private final CategoryRepository categoryRepository;
    private final ProfessionRepository professionRepository;
    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final FileStorageService fileStorageService;
    private final VerificationService verificationService;

    public WorkerService(
            WorkerRepository workerRepository,
            CategoryRepository categoryRepository,
            ProfessionRepository professionRepository,
            UserRepository userRepository,
            PortfolioItemRepository portfolioItemRepository,
            FileStorageService fileStorageService,
            VerificationService verificationService) {
        this.workerRepository = workerRepository;
        this.categoryRepository = categoryRepository;
        this.professionRepository = professionRepository;
        this.userRepository = userRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.fileStorageService = fileStorageService;
        this.verificationService = verificationService;
    }

    public List<WorkerResponse> search(
            Long categoryId, String district, String sector, BigDecimal minRating,
            Boolean available, Integer minYearsOfExperience, Boolean verified) {

        Specification<Worker> spec = WorkerSpecification.withFilters(
                categoryId, district, sector, minRating, available, minYearsOfExperience, verified);

        return workerRepository.findAll(spec).stream().map(this::toResponse).toList();
    }

    public WorkerResponse getById(Long id) {
        return toResponse(findWorker(id));
    }

    @Transactional
    public WorkerResponse updateProfile(Long workerId, WorkerEditRequest request, Authentication authentication) {
        Worker worker = findWorker(workerId);
        assertOwnerOrAdmin(worker, authentication);

        if (request.getFullName() != null) worker.setFullName(request.getFullName());
        if (request.getBio() != null) worker.setBio(request.getBio());
        if (request.getPhone() != null) worker.setPhone(request.getPhone());
        if (request.getEmail() != null) worker.setEmail(request.getEmail());
        if (request.getDistrict() != null) worker.setDistrict(request.getDistrict());
        if (request.getSector() != null) worker.setSector(request.getSector());
        if (request.getYearsOfExperience() != null) worker.setYearsOfExperience(request.getYearsOfExperience());
        if (request.getAvailable() != null) worker.setAvailable(request.getAvailable());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category not found: " + request.getCategoryId()));
            worker.setCategory(category);
        }

        if (request.getProfessionIds() != null) {
            Set<Profession> professions = new HashSet<>(professionRepository.findAllById(request.getProfessionIds()));
            worker.setProfessions(professions);
        }

        worker.setUpdatedAt(LocalDateTime.now());
        workerRepository.save(worker);
        return toResponse(worker);
    }

    @Transactional
    public PortfolioItemResponse addPortfolioItem(
            Long workerId, MultipartFile file, String caption, Authentication authentication) {
        Worker worker = findWorker(workerId);
        assertOwnerOrAdmin(worker, authentication);

        String url = fileStorageService.store(file, "portfolio/" + workerId);

        PortfolioItem item = new PortfolioItem();
        item.setWorker(worker);
        item.setFileName(file.getOriginalFilename());
        item.setFileUrl(url);
        item.setCaption(caption);
        item.setCreatedAt(LocalDateTime.now());
        portfolioItemRepository.save(item);

        return new PortfolioItemResponse(item.getId(), item.getFileName(), item.getFileUrl(), item.getCaption());
    }

    public void assertOwnerOrAdmin(Worker worker, Authentication authentication) {
        if (authentication == null) {
            throw new AuthException(HttpStatus.UNAUTHORIZED, "Login required");
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return;
        }

        String identifier = authentication.getName();
        User currentUser = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new AuthException(HttpStatus.UNAUTHORIZED, "Invalid session"));

        if (worker.getUser() == null || !worker.getUser().getId().equals(currentUser.getId())) {
            throw new AuthException(HttpStatus.FORBIDDEN, "You do not own this worker profile");
        }
    }

    public Worker findWorker(Long id) {
        return workerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Worker not found: " + id));
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
        response.setBadges(verificationService.computeBadges(worker));
        response.setPortfolio(portfolioItemRepository.findByWorkerId(worker.getId()).stream()
                .map(p -> new PortfolioItemResponse(p.getId(), p.getFileName(), p.getFileUrl(), p.getCaption()))
                .toList());
        return response;
    }
}