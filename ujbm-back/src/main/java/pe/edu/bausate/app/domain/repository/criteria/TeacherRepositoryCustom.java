package pe.edu.bausate.app.domain.repository.criteria;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import pe.edu.bausate.app.application.dto.teacher.TeacherFilterRequest;
import pe.edu.bausate.app.domain.models.projection.TeacherTableInfoProjection;

public interface TeacherRepositoryCustom {
    Page<TeacherTableInfoProjection> findAllProjectedWithFilter(TeacherFilterRequest filter, Pageable pageable);
}
