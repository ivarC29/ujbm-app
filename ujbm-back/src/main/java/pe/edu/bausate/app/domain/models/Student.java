package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditCourseListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.EnrollmentMode;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Student extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDate enrollmentDate;

    @Column(columnDefinition = "INTEGER CHECK (cycle >= 1 AND cycle <= 10)")
    private Integer cycle;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @OneToOne(optional = false)
    @JoinColumn(name = "person_id", nullable = false, unique = true)
    private Person person;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;
}
