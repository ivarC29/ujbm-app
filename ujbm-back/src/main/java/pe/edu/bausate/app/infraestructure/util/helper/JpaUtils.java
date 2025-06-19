package pe.edu.bausate.app.infraestructure.util.helper;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Path;

public class JpaUtils {
    public static Expression<String> unaccentLower(CriteriaBuilder cb, Path<String> path) {
        return cb.function("unaccent", String.class, cb.lower(path));
    }
}
