package pe.edu.bausate.app.domain.models;


import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;

import java.io.Serializable;
import java.util.List;

@Entity
@Getter
@Setter
@EntityListeners({AuditingEntityListener.class})
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Score extends AuditableEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer totalScore;

    @Column(columnDefinition = "TEXT")
    private String answers;

    @OneToOne
    @JoinColumn(name = "applicant_id", nullable = false)
    private Applicant applicant;
}
