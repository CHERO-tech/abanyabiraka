package rw.abanyabiraka.worker.dto;

public class QualificationDocumentResponse {
    private final Long id;
    private final String fileName;
    private final String fileUrl;
    private final String documentType;
    private final String status;

    public QualificationDocumentResponse(Long id, String fileName, String fileUrl, String documentType, String status) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.documentType = documentType;
        this.status = status;
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileUrl() { return fileUrl; }
    public String getDocumentType() { return documentType; }
    public String getStatus() { return status; }
}