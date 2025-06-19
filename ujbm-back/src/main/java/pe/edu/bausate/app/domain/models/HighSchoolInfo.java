package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.HighSchoolType;
import pe.edu.bausate.app.infraestructure.util.converter.HighSchoolTypeConverter;

import java.io.Serializable;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class HighSchoolInfo  extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Convert(converter = HighSchoolTypeConverter.class)
    @Column(nullable = false)
    private HighSchoolType type;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer graduationYear;

    @ManyToOne(optional = false)
    @JoinColumn(name = "ubigeo_id", nullable = false)
    private Ubigeo ubigeo;

    @OneToOne(mappedBy = "highSchoolInfo", optional = false)
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;

}
