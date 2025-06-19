package pe.edu.bausate.app.domain.service;

import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.application.dto.student.*;
import pe.edu.bausate.app.domain.models.Student;

import java.util.Optional;

public interface StudentService {
    Page<StudentTableInfoResponse> filterStudents(StudentFilterRequest filterRequest);

    @Transactional(readOnly = true)
    Optional<Long> findByUserId(Long userId);

    @Transactional
    StudentCreateResponse createStudent(StudentRequest request);

    @Transactional(readOnly = true)
    StudentResponse findById(Long id);

    @Transactional
    StudentResponse updateStudent(Long id, StudentRequest request);

    @Transactional
    void deleteStudent(Long id);

    @Transactional(readOnly = true)
    Optional<Student> findByCode(String code);
}
