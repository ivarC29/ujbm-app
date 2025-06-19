package pe.edu.bausate.app.domain.service;

import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.coursesection.*;

import java.util.List;
import java.util.Optional;

public interface CourseSectionService {

    @Transactional(readOnly = true)
    Page<CourseSectionTableInfoResponse> filterCourseSections(CourseSectionFilterRequest filterRequest);

    @Transactional
    CourseSectionResponse save(CourseSectionRequest request);

    @Transactional(readOnly = true)
    Optional<CourseSectionResponse> findById(Long id);

    @Transactional
    void deleteById(Long id);

    @Transactional
    CourseSectionResponse update(Long id, CourseSectionRequest request);

    // ##### Carga Masiva ###
    @Transactional
    CourseSectionBatchUploadResponse batchUpload(MultipartFile file) throws BadRequestException;

    // Student
    @Transactional(readOnly = true)
    List<CourseSectionResponse> findCurrentCourseSectionsByStudentId(Long studentId);

    @Transactional(readOnly = true)
    List<CourseSectionResponse> findCurrentCourseSectionsByTeacherId(Long teacherId);
}
