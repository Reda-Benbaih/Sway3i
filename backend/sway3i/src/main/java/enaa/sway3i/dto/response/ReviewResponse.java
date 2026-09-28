package enaa.sway3i.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {

    private Long id;
    private Integer rating;
    private String comment;
    private LocalDateTime publishedAt;
    private Long enrollmentId;
    private Long studentId;
    private String studentName;
    private Long tutorId;
    private String courseTitle;
}
