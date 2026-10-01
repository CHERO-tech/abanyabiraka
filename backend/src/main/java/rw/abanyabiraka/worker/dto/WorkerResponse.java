package rw.abanyabiraka.worker.dto;

import java.math.BigDecimal;
import java.util.List;

public class WorkerResponse {

    private Long id;
    private String fullName;
    private String bio;
    private String phone;
    private String email;
    private boolean verified;
    private String district;
    private String sector;
    private BigDecimal rating;
    private boolean available;
    private Integer yearsOfExperience;
    private String categoryName;
    private List<String> professions;
    private List<String> badges;
    private List<PortfolioItemResponse> portfolio;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public boolean isVerified() { return verified; }
    public void setVerified(boolean verified) { this.verified = verified; }
    public String getDistrict() { return district; }
    public void setDistrict(String district) { this.district = district; }
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    public BigDecimal getRating() { return rating; }
    public void setRating(BigDecimal rating) { this.rating = rating; }
    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }
    public Integer getYearsOfExperience() { return yearsOfExperience; }
    public void setYearsOfExperience(Integer yearsOfExperience) { this.yearsOfExperience = yearsOfExperience; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public List<String> getProfessions() { return professions; }
    public void setProfessions(List<String> professions) { this.professions = professions; }
    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }
    public List<PortfolioItemResponse> getPortfolio() { return portfolio; }
    public void setPortfolio(List<PortfolioItemResponse> portfolio) { this.portfolio = portfolio; }
}