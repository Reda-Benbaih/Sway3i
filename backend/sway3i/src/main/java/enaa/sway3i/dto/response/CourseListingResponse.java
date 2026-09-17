package enaa.sway3i.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import enaa.sway3i.model.CourseFormat;
import enaa.sway3i.model.CourseType;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CourseListingResponse {

    private Long id;
    private String title;
    private String description;
    private CourseType courseType;
    private CourseFormat courseFormat;
    private BigDecimal monthlyPrice;
    private Integer maxCapacity;
    private String locationOrLink;
    private Boolean isActive;
    private Long tutorId;
    private String tutorName;
    private Long subjectId;
    private String subjectName;
    private List<WeeklySlotResponse> weeklySlots;
}
