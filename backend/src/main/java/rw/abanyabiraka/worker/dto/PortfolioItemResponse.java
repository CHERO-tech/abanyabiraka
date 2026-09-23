package rw.abanyabiraka.worker.dto;

public class PortfolioItemResponse {
    private final Long id;
    private final String fileName;
    private final String fileUrl;
    private final String caption;

    public PortfolioItemResponse(Long id, String fileName, String fileUrl, String caption) {
        this.id = id;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.caption = caption;
    }

    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getFileUrl() { return fileUrl; }
    public String getCaption() { return caption; }
}