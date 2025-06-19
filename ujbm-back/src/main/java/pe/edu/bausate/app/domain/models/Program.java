package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.AcademicLevel;
import pe.edu.bausate.app.infraestructure.util.converter.AcademicLevelConverter;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;

import java.io.Serializable;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Program extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false , unique = true)
    private Integer code;

    @Column(nullable = false)
    @Convert(converter = AcademicLevelConverter.class)
    private AcademicLevel academicLevel;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String authorizationType;

    @Column(nullable = false)
    private Integer durationInSemesters;

    @Column(nullable = false)
    private String degreeAwarded;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean hasEfi;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

}
