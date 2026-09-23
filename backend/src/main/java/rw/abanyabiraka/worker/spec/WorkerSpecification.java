package rw.abanyabiraka.worker.spec;

import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.data.jpa.domain.Specification;
import rw.abanyabiraka.worker.entity.Worker;

public final class WorkerSpecification {

    private WorkerSpecification() {
    }

    public static Specification<Worker> withFilters(
            Long categoryId,
            String district,
            String sector,
            BigDecimal minRating,
            Boolean available,
            Integer minYearsOfExperience,
            Boolean verified) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (district != null && !district.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("district")), district.toLowerCase()));
            }
            if (sector != null && !sector.isBlank()) {
                predicates.add(cb.equal(cb.lower(root.get("sector")), sector.toLowerCase()));
            }
            if (minRating != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("rating"), minRating));
            }
            if (available != null) {
                predicates.add(cb.equal(root.get("available"), available));
            }
            if (minYearsOfExperience != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("yearsOfExperience"), minYearsOfExperience));
            }
            if (verified != null) {
                predicates.add(cb.equal(root.get("verified"), verified));
            }

            if (query != null) {
                query.distinct(true);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
