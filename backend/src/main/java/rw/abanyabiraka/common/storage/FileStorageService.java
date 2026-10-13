package rw.abanyabiraka.common.storage;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import rw.abanyabiraka.common.exception.ApiException;

/**
 * TODO: local-disk storage only, for dev. Doesn't survive redeploys/scaling and isn't
 * backed up - swap for S3 (or similar) before any real deployment.
 */
@Service
public class FileStorageService {

    private final Path uploadRoot;

    public FileStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(uploadRoot);
        } catch (IOException e) {
            throw new ApiException("Could not create upload directory: " + e.getMessage());
        }
    }

    public String store(MultipartFile file, String subfolder) {
        if (file == null || file.isEmpty()) {
            throw new ApiException("File is empty");
        }
        try {
            Path folder = uploadRoot.resolve(subfolder);
            Files.createDirectories(folder);

            String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String safeName = UUID.randomUUID() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
            Path target = folder.resolve(safeName);

            Files.copy(file.getInputStream(), target);

            return "/uploads/" + subfolder + "/" + safeName;
        } catch (IOException e) {
            throw new ApiException("Failed to store file: " + e.getMessage());
        }
    }
}