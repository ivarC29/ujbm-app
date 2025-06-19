package pe.edu.bausate.app.domain.service;

import org.springframework.data.domain.Page;
import pe.edu.bausate.app.application.dto.course.CourseFilterRequest;
import pe.edu.bausate.app.application.dto.course.CourseRequest;
import pe.edu.bausate.app.application.dto.course.CourseResponse;
import pe.edu.bausate.app.application.dto.course.CourseSelectResponse;

import java.util.List;

public interface CourseService {
    CourseResponse createCourse(CourseRequest request);

    Page<CourseResponse> filterCourses(CourseFilterRequest filterRequest);

    CourseResponse getCourseById(Long id);

    CourseResponse updateCourse(Long id, CourseRequest request);

    void deleteCourse(Long id);

    List<CourseSelectResponse> getAllForSelect();

    List<CourseSelectResponse> getAllForSelectByProgramAndCycle(Long programId, Integer cycle);
}
