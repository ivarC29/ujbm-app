package pe.edu.bausate.app.domain.models;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import pe.edu.bausate.app.domain.audit.AuditableEntity;
import pe.edu.bausate.app.domain.enumerate.ApplicantStatus;
import pe.edu.bausate.app.domain.enumerate.AwarenessMethod;
import pe.edu.bausate.app.infraestructure.util.converter.ApplicantStatusConverter;
import pe.edu.bausate.app.infraestructure.util.converter.AwarenessMethodConverter;
import pe.edu.bausate.app.infraestructure.util.converter.BooleanToSmallintConverter;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

@Entity
@EntityListeners({AuditingEntityListener.class})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Applicant extends AuditableEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate registryDate;

    @Column(nullable = false, length = 10)
    private String code;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "dni_file_id", nullable = false)
    private ApplicantFile dniFile;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "study_certificate_file_id", nullable = false)
    private ApplicantFile studyCertificateFile;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "photo_file_id", nullable = false)
    private ApplicantFile photoFile;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "syllabus_file_id")
    private List<ApplicantFile> syllabusFiles;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "payment_receipt_file1_id")
    private ApplicantFile paymentReceiptFile1;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "payment_receipt_file2_id")
    private ApplicantFile paymentReceiptFile2;

    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean dniValidated = false;

    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean certificateValidated = false;

    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean photoValidated = false;

    @Column(nullable = false, length = 10)
    private String academicPeriodName;

    @Column(nullable = false, columnDefinition = "SMALLINT")
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean available;

    @Convert(converter = ApplicantStatusConverter.class)
    @Column(nullable = false)
    private ApplicantStatus status;

    @Convert(converter = AwarenessMethodConverter.class)
    @Column(nullable = false)
    private AwarenessMethod awarenessMethod;

    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean hasPaidAdmissionFee = false;

    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean isEnrolled = false;

    @OneToOne(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "score_id")
    private Score score;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @OneToOne(optional = false)
    @JoinColumn(name = "person_id", nullable = false, unique = true)
    private Person person;

    @OneToOne(optional = false, cascade = CascadeType.ALL)
    @JoinColumn(name = "high_school_info_id", nullable = false, unique = true)
    private HighSchoolInfo highSchoolInfo;

    @ManyToOne
    @JoinColumn(name = "assigned_exam_id")
    private Exam assignedExam;
    //aun no se si queda
    @Convert(converter = BooleanToSmallintConverter.class)
    private Boolean admissionApprovalEmailSent = false;
}
