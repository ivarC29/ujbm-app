package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.NaturalId;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.*;
import pe.edu.bausate.app.infraestructure.util.converter.*;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.Objects;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Person extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String lastname;

    @Convert(converter = DocumentTypeConverter.class)
    @Column(nullable = false)
    private DocumentIdType documentIdType;

    @NaturalId
    @Column(nullable = false, unique = true)
    private String documentNumber;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 15, nullable = false)
    private String phoneNumber;

    private String address;

    @Column(nullable = false)
    private LocalDate birthdate;

    @Convert(converter = PersonTypeConverter.class)
    @Column(nullable = false)
    private PersonType type;

    @Convert(converter = EnrollmentModeConverter.class)
    @Column(nullable = false)
    private EnrollmentMode enrollmentMode;

    @ManyToOne
    @JoinColumn(name = "ubigeo_id", nullable = false)
    private Ubigeo ubigeo;

    // --- Datos de contacto del apoderado ---
    @Column(length = 100)
    private String guardianName;

    @Column(length = 100)
    private String guardianLastname;

    @Column(length = 15)
    private String guardianPhoneNumber;

    @Column(length = 100)
    private String guardianEmail;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private boolean hasDisability;

    @Convert(converter = DisabilityTypeConverter.class)
    private DisabilityType disabilityType;

    @Convert(converter = GenderConverter.class)
    @Column(nullable = false)
    private Gender gender;

    @Column(length = 150)
    private String disabilityDescription;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;
}
