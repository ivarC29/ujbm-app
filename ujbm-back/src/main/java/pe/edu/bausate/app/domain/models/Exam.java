package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.ExamStatus;
import pe.edu.bausate.app.domain.enumerate.ExamType;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;
import pe.edu.bausate.app.infraestructure.util.converter.ExamStatusConverter;
import pe.edu.bausate.app.infraestructure.util.converter.ExamTypeConverter;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Exam extends AuditableEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @JoinColumn(name = "course_section_id")
    private CourseSection courseSection;

    @Convert(converter = ExamTypeConverter.class)
    @Column(nullable = false)
    private ExamType type;

    @Convert(converter = ExamStatusConverter.class)
    @Column(nullable = false)
    private ExamStatus status;

    private BigDecimal maxScore;

    private Integer totalQuestions;

    private Integer durationMinutes;

    @ManyToOne
    @JoinColumn(name = "schedule_id")
    private Schedule schedule;

    @ManyToOne
    @JoinColumn(name = "academic_period_id")
    private AcademicPeriod academicPeriod;

    private Boolean shuffleQuestions;

    private BigDecimal passingScore;

    private Integer attemptsAllowed;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;
}