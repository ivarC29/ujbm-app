package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.teacher.TeacherFilterRequest;
import pe.edu.bausate.app.domain.models.Teacher;

public class TeacherSpecification {
    public static Specification<Teacher> filterBy(TeacherFilterRequest filter) {
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
            if (filter.professionalTitle() != null && !filter.professionalTitle().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("professionalTitle")), "%" + filter.professionalTitle().toLowerCase() + "%"));
            }
            if (filter.academicDegree() != null && !filter.academicDegree().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("academicDegree")), "%" + filter.academicDegree().toLowerCase() + "%"));
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
