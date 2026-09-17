package enaa.sway3i.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import enaa.sway3i.model.CourseType;
import enaa.sway3i.model.CourseFormat;
import java.math.BigDecimal;
@Data
public class CourseListingRequest {
    @NotBlank(message = "Title is required")
    private String title;
    private String description;
    @NotNull(message = "Course type is required")
    private CourseType courseType;
    @NotNull(message = "Course format is required")
    private CourseFormat courseFormat;
    @NotNull(message = "Price is required")
    private BigDecimal monthlyPrice;
    private Integer maxCapacity;
    private String locationOrLink;
    @NotNull(message = "Subject ID is required")
    private Long subjectId;
    @NotNull(message = "Tutor ID is required")
    private Long tutorId;
}
