package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.ValueType;
import pe.edu.bausate.app.infraestructure.util.converter.AwarenessMethodConverter;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;
import pe.edu.bausate.app.infraestructure.util.converter.ValueTypeConverter;

import java.io.Serializable;

@Entity
@Table(name = "system_parameter")
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class SystemParameter extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String key;

    @Column(nullable = false, length = 255)
    private String value;

    @Column(length = 500)
    private String description;

    @Convert(converter = ValueTypeConverter.class)
    @Column(nullable = false)
    private ValueType valueType;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean editable = true;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;

}
