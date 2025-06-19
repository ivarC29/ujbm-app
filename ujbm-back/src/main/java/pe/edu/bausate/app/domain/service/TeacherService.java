package pe.edu.bausate.app.domain.service;

import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.teacher.*;
import pe.edu.bausate.app.domain.models.Teacher;

import java.util.List;
import java.util.Optional;

public interface TeacherService {
    @Transactional(readOnly = true)
    Optional<Long> findByUserId(Long userId);
    List<TeacherAutocompleteResponse> autocompleteAvailableTeachers(String query);

    @Transactional
    TeacherCreateResponse createTeacher(TeacherRequest request);

    Page<TeacherTableInfoResponse> filterTeachers(TeacherFilterRequest filterRequest);

    @Transactional(readOnly = true)
    TeacherResponse findById(Long id);

    @Transactional
    TeacherResponse updateTeacher(Long id, TeacherRequest request);

    @Transactional
    void deleteTeacher(Long id);

    @Transactional(readOnly = true)
    Optional<Teacher> findByCode(String code);
}
