package pe.edu.bausate.app.domain.repository.criteria;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Tuple;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;
import pe.edu.bausate.app.application.dto.teacher.TeacherFilterRequest;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.models.projection.TeacherTableInfoProjection;
import pe.edu.bausate.app.domain.specification.TeacherSpecification;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Repository
public class TeacherRepositoryCustomImpl implements TeacherRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<TeacherTableInfoProjection> findAllProjectedWithFilter(
            TeacherFilterRequest filter, Pageable pageable) {

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Query usando Tuple
        CriteriaQuery<Tuple> query = cb.createTupleQuery();
        Root<Teacher> root = query.from(Teacher.class);

        // Seleccionar campos como Tuple
        query.multiselect(
                root.get("id").alias("id"),
                root.get("code").alias("code"),
                root.get("person").get("name").alias("name"),
                root.get("person").get("lastname").alias("lastname"),
                root.get("person").get("email").alias("email"),
                root.get("professionalTitle").alias("professionalTitle"),
                root.get("academicDegree").alias("academicDegree")
        );

        // Aplicar filtros
        Specification<Teacher> spec = TeacherSpecification.filterBy(filter);
        Predicate predicate = spec.toPredicate(root, query, cb);
        query.where(predicate);

        // Aplicar ordenamiento
        if (pageable.getSort().isSorted()) {
            List<Order> orders = new ArrayList<>();
            for (Sort.Order sortOrder : pageable.getSort()) {
                String property = sortOrder.getProperty();
                Path<?> path;

                switch (property) {
                    case "name":
                        path = root.get("person").get("name");
                        break;
                    case "lastname":
                        path = root.get("person").get("lastname");
                        break;
                    case "email":
                        path = root.get("person").get("email");
                        break;
                    default:
                        path = root.get(property);
                        break;
                }

                Order order = sortOrder.isAscending() ? cb.asc(path) : cb.desc(path);
                orders.add(order);
            }
            query.orderBy(orders);
        }

        TypedQuery<Tuple> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());

        List<Tuple> tuples = typedQuery.getResultList();

        // Convertir Tuple a TeacherTableInfoProjection
        List<TeacherTableInfoProjection> results = tuples.stream()
                .map(tuple -> new TeacherTableInfoProjection() {
                    @Override
                    public Long getId() { return tuple.get("id", Long.class); }

                    @Override
                    public String getCode() { return tuple.get("code", String.class); }

                    @Override
                    public String getName() { return tuple.get("name", String.class); }

                    @Override
                    public String getLastname() { return tuple.get("lastname", String.class); }

                    @Override
                    public String getEmail() { return tuple.get("email", String.class); }

                    @Override
                    public String getProfessionalTitle() { return tuple.get("professionalTitle", String.class); }

                    @Override
                    public String getAcademicDegree() { return tuple.get("academicDegree", String.class); }
                })
                .collect(Collectors.toList());

        // Query para contar
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<Teacher> countRoot = countQuery.from(Teacher.class);
        countQuery.select(cb.count(countRoot));
        countQuery.where(spec.toPredicate(countRoot, countQuery, cb));

        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(results, pageable, total);
    }
}
