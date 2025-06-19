package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditCourseListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.EnrollmentDetailStatus;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;
import pe.edu.bausate.app.infraestructure.util.converter.EnrollmentDetailStatusConverter;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class EnrollmentDetail extends AuditableEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne
    @JoinColumn(name = "course_section_id", nullable = false)
    private CourseSection courseSection;

    @Convert(converter = EnrollmentDetailStatusConverter.class)
    @Column(nullable = false)
    private EnrollmentDetailStatus status;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;

}
