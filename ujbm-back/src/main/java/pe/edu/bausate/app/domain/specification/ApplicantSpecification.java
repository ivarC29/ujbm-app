package pe.edu.bausate.app.domain.specification;

import org.springframework.data.jpa.domain.Specification;
import pe.edu.bausate.app.application.dto.applicant.ApplicantFilterRequest;
import pe.edu.bausate.app.domain.models.Applicant;

public class ApplicantSpecification {
    public static Specification<Applicant> filterBy(ApplicantFilterRequest filter) {
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
            if (filter.code() != null && !filter.code().isBlank()) {
                predicates = cb.and(predicates, cb.equal(root.get("code"), filter.code()));
            }
            if (filter.documentNumber() != null && !filter.documentNumber().isBlank()) {
                predicates = cb.and(predicates, cb.equal(root.get("person").get("documentNumber"), filter.documentNumber()));
            }
            if (filter.programId() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("program").get("id"), filter.programId()));
            }
            if (filter.statusCode() != null && !filter.statusCode().isBlank()) {
                predicates = cb.and(predicates, cb.equal(root.get("status"), filter.statusCode()));
            }
            if (filter.enrollmentModeCode() != null && !filter.enrollmentModeCode().isBlank()) {
                predicates = cb.and(predicates, cb.equal(root.get("person").get("enrollmentMode"), filter.enrollmentModeCode()));
            }
            if (filter.registryDate() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("registryDate"), filter.registryDate()));
            }
            if (filter.enrolled() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("isEnrolled"), filter.enrolled()));
            }
            // Por defecto, solo los disponibles, salvo que se indique explícitamente
            if (filter.available() != null) {
                predicates = cb.and(predicates, cb.equal(root.get("available"), filter.available()));
            } else {
                predicates = cb.and(predicates, cb.isTrue(root.get("available")));
            }

            return predicates;
        };
    }
}
