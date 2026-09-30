package enaa.sway3i.dto.request;

import enaa.sway3i.model.CourseFormat;
import enaa.sway3i.model.CourseType;
import enaa.sway3i.model.Level;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CourseListingRequest {
    @NotBlank(message = "Title is required")
    @Size(max = 100, message = "Title must not exceed 100 characters")
    private String title;
    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;
    @NotNull(message = "Course type is required")
    private CourseType courseType;
    @NotNull(message = "Course format is required")
    private CourseFormat courseFormat;
    private Level level;
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal monthlyPrice;
    @Min(value = 1, message = "Max capacity must be at least 1")
    private Integer maxCapacity;
    private String locationOrLink;
    private Boolean isActive;
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    private Long tutorId;
}
