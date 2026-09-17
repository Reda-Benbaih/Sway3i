package enaa.sway3i.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.experimental.SuperBuilder;
import lombok.Builder;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "course_listings")
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
public class CourseListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Enumerated(EnumType.STRING)
    private CourseType courseType;

    @Enumerated(EnumType.STRING)
    private CourseFormat courseFormat;

    private BigDecimal monthlyPrice;
    private Integer maxCapacity;
    private String locationOrLink;
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tutor_id")
    private Tutor tutor;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id")
    private Subject subject;

    @Builder.Default
    @OneToMany(mappedBy = "courseListing", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WeeklySlot> weeklySlots = new ArrayList<>();
}
