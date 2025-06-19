package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.enrollment.EnrollmentFilterRequest;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;
import pe.edu.bausate.app.domain.models.Enrollment;
import pe.edu.bausate.app.infraestructure.util.helper.JpaUtils;

import java.time.LocalDate;
import java.util.Arrays;

public class EnrollmentSpecification {
    public static Specification<Enrollment> filterBy(EnrollmentFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            // Filter by status
            if (filter.status() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), filter.status()));
            } else if (filter.statusCode() != null && !filter.statusCode().isEmpty()) {
                EnrollmentStatus matchingStatus = Arrays.stream(EnrollmentStatus.values())
                        .filter(status -> status.getCode().equals(filter.statusCode()))
                        .findFirst()
                        .orElse(null);

                if (matchingStatus != null) {
                    predicates = cb.and(predicates, cb.equal(root.get("status"), matchingStatus));
                }
            }

            // Student name con parcial matching
            if (filter.studentName() != null && !filter.studentName().isEmpty()) {
                String normalizedName = filter.studentName().toLowerCase();
                predicates = cb.and(predicates,
                    cb.or(
                        cb.like(JpaUtils.unaccentLower(cb, root.get("student").get("person").get("name")),
                               "%" + normalizedName + "%"),
                        cb.like(JpaUtils.unaccentLower(cb, root.get("student").get("person").get("lastname")),
                               "%" + normalizedName + "%")
                    )
                );
            }

            // Student code con partial matching
            if (filter.studentCode() != null && !filter.studentCode().isEmpty()) {
                String pattern = "%" + filter.studentCode().toLowerCase() + "%";
                predicates = cb.and(predicates,
                    cb.like(cb.lower(root.get("student").get("code")), pattern));
            }

            // Academic period filter
            if (filter.academicPeriodId() != null) {
                predicates = cb.and(predicates,
                    cb.equal(root.join("academicPeriod").get("id"), filter.academicPeriodId()));
            }

            // Program ID filter
            if (filter.programId() != null) {
                predicates = cb.and(predicates,
                    cb.equal(root.join("student").join("program").get("id"), filter.programId()));
            }

            // Add enrollment date filter
            if (filter.enrollmentDate() != null) {
                LocalDate date = filter.enrollmentDate();
                predicates = cb.and(predicates,
                    cb.equal(cb.function("DATE", LocalDate.class, root.get("enrollmentDate")), date));
            }


            predicates = cb.and(predicates, cb.isTrue(root.get("available")));

            return predicates;
        };
    }
}