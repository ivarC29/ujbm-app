package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionFilterRequest;
import pe.edu.bausate.app.domain.models.CourseSection;
import pe.edu.bausate.app.infraestructure.util.helper.JpaUtils;

public class CourseSectionSpecification {
    public static Specification<CourseSection> filterBy(CourseSectionFilterRequest filter) {
        return (root, query, cb) -> {
            var predicates = cb.conjunction();

            if (filter.courseId() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("course").get("id"), filter.courseId()));
            }
            if (filter.courseName() != null && !filter.courseName().isBlank()) {
                String normalizedCourseName = filter.courseName().toLowerCase();
                predicates = cb.and(predicates,
                        cb.like(
                                JpaUtils.unaccentLower(cb, root.get("course").get("name")),
                                "%" + normalizedCourseName + "%"
                        )
                );
            }
            if (filter.teacherId() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("teacher").get("id"), filter.teacherId()));
            }
            if (filter.teacherName() != null && !filter.teacherName().isBlank()) {
                String normalizedTeacherName = filter.teacherName().toLowerCase();
                predicates = cb.and(predicates,
                        cb.like(
                                JpaUtils.unaccentLower(cb, root.get("teacher").get("person").get("name")),
                                "%" + normalizedTeacherName + "%"
                        )
                );
            }
            if (filter.vacancies() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("vacancies"), filter.vacancies()));
            }
            if (filter.periodId() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("period").get("id"), filter.periodId()));
            }
            if (filter.section() != null && !filter.section().isBlank()) {
                predicates = cb.and(predicates, cb.like(cb.lower(root.get("section")), "%" + filter.section().toLowerCase() + "%"));
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
