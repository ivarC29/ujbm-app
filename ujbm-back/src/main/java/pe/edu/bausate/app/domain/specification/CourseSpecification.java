package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.course.CourseFilterRequest;
import pe.edu.bausate.app.domain.models.Course;
import pe.edu.bausate.app.infraestructure.util.helper.JpaUtils;

public class CourseSpecification {
    public static Specification<Course> filterBy(CourseFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (filter.code() != null && !filter.code().isEmpty()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("code")), "%" + filter.code().toLowerCase() + "%"));
            }
            if (filter.name() != null && !filter.name().isEmpty()) {
                String normalizedName = filter.name().toLowerCase();
                predicates = cb.and(predicates,
                        cb.like(
                                JpaUtils.unaccentLower(cb, root.get("name")),
                                "%" + normalizedName + "%"
                        )
                );
            }
            if (filter.credits() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("credits"), filter.credits()));
            }
            if (filter.cycle() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("cycle"), filter.cycle()));
            }
            if (filter.programId() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("program").get("id"), filter.programId()));
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
