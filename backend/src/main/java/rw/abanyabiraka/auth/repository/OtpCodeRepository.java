package rw.abanyabiraka.auth.repository;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import rw.abanyabiraka.auth.entity.OtpCode;
import rw.abanyabiraka.auth.entity.OtpPurpose;

public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {

    Optional<OtpCode> findTopByIdentifierAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String identifier, OtpPurpose purpose);
}
