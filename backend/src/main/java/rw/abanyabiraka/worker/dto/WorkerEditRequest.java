package rw.abanyabiraka.worker.dto;

import java.util.Set;

public class WorkerEditRequest {

    private String fullName;
    private String bio;
    private String phone;
    private String email;
    private String district;
    private String sector;
    private Long categoryId;
    private Set<Long> professionIds;
    private Integer yearsOfExperience;
    private Boolean available;

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Set<Long> getProfessionIds() { return professionIds; }
    public void setProfessionIds(Set<Long> professionIds) { this.professionIds = professionIds; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }
}