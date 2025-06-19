package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.QuestionType;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;
import pe.edu.bausate.app.infraestructure.util.converter.QuestionTypeConverter;

import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Question extends AuditableEntity implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Convert(converter = QuestionTypeConverter.class)
    @Column(nullable = false)
    private QuestionType type;

    @ManyToOne
    @JoinColumn(name = "file_id")
    private ExamFile examFile;

    @ManyToOne
    @JoinColumn(name = "exam_id")
    private Exam exam;

    private Integer position;

    private BigDecimal points;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available = true;
}