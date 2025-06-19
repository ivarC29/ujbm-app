package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.student.StudentFilterRequest;
import pe.edu.bausate.app.domain.models.Student;

public class StudentSpecification {
    public static Specification<Student> filterBy(StudentFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (filter.fullName() != null && !filter.fullName().isBlank()) {
                var fullNameExpression = cb.concat(
                        cb.concat(cb.lower(root.get("person").get("name")), " "),
                        cb.lower(root.get("person").get("lastname"))
                );
                predicates = cb.and(
                        predicates,
                        cb.like(fullNameExpression, "%" + filter.fullName().toLowerCase() + "%")
                );
            }
            if (filter.email() != null && !filter.email().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("person").get("email")), "%" + filter.email().toLowerCase() + "%"));
            }
            if (filter.code() != null && !filter.code().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("code")), "%" + filter.code().toLowerCase() + "%"));
            }
            if (filter.enrollmentModeCode() != null && !filter.enrollmentModeCode().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("person").get("enrollmentMode")), "%" + filter.enrollmentModeCode().toLowerCase() + "%"));
            }
            if (filter.programId() != null && !filter.programId().isEmpty()) {
                predicates = cb.and(predicates, cb.equal(root.get("program").get("id"), filter.programId()));
            }
            if (filter.programName() != null && !filter.programName().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("program").get("name")), "%" + filter.programName().toLowerCase() + "%"));
            }
            if (filter.available() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("available"), filter.available()));
            } else {
                predicates = cb.and(predicates, cb.isTrue(root.get("available")));
            }
            return predicates;
        };
    }
}
