package rw.abanyabiraka.worker.dto;

public class ProfessionResponse {

    private Long id;
    private String name;
    private Long categoryId;
    private String categoryName;

    public ProfessionResponse(Long id, String name, Long categoryId, String categoryName) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }
}