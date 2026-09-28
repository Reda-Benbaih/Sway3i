package enaa.sway3i.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tutors")
@NoArgsConstructor
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
public class Tutor extends User {
    private String biography;
    private String degree;
    private String nationalId;
    private Boolean isVerified;
    private Double averageRating;
    private BigDecimal hourlyRate;
    private String teachingZones;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "tutor_subjects",
            joinColumns = @JoinColumn(name = "tutor_id"),
            inverseJoinColumns = @JoinColumn(name = "subject_id")
    )
    private Set<Subject> subjects = new HashSet<>();
}
