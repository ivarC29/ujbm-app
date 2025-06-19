package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;

import java.io.Serializable;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Ubigeo  extends AuditableEntity implements Serializable {

    @Id
    private Long id;

    @Column(nullable = false, length = 2)
    private String departmentCode;
    @Column(nullable = false, length = 2)
    private String provinceCode;
    @Column(nullable = false, length = 2)
    private String districtCode;

    @Column(nullable = false, length = 150)
    private String departmentName;
    @Column(nullable = false, length = 150)
    private String provinceName;
    @Column(nullable = false, length = 150)
    private String districtName;

    @Column(nullable = false, length = 50)
    private String country;

    @Column(nullable = false, length = 6)
    private String reniecCode;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;
}
