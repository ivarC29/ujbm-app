package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.dto.course.CourseFilterRequest;
import pe.edu.bausate.app.application.dto.course.CourseRequest;
import pe.edu.bausate.app.application.dto.course.CourseResponse;
import pe.edu.bausate.app.application.dto.course.CourseSelectResponse;
import pe.edu.bausate.app.application.mapper.CourseMapper;
import pe.edu.bausate.app.domain.models.Course;
import pe.edu.bausate.app.domain.repository.CourseRepository;
import pe.edu.bausate.app.domain.specification.CourseSpecification;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        if (courseRepository.existsByCode(request.code())) {
            throw new IllegalArgumentException("Ya existe un curso con el código: " + request.code());
        }

        Course course = this.courseMapper.courseRequestToCourse(request);
        course.setAvailable(true);
        Course savedCourse = this.courseRepository.save(course);

        log.info("Curso creado con ID: {}", savedCourse.getId());
        return this.courseMapper.courseToCourseResponse(savedCourse);
    }

    @Override
    public Page<CourseResponse> filterCourses(CourseFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequest(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );

        Specification<Course> spec = CourseSpecification.filterBy(filterRequest);
        return courseRepository.findAll(spec, pageRequest)
                .map(courseMapper::courseToCourseResponse);
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = this.courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No se encontró el curso con ID: " + id));

        if (Boolean.FALSE.equals(course.getAvailable())) {
            throw new NotFoundException("El curso con ID: " + id + " ha sido eliminado.");
        }

        return this.courseMapper.courseToCourseResponse(course);
    }

    @Override
    public CourseResponse updateCourse(Long id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No se encontró el curso con ID: " + id));

        if (Boolean.FALSE.equals(course.getAvailable())) {
            throw new NotFoundException("El curso con ID: " + id + " ha sido eliminado.");
        }

        course.setCode(request.code());
        course.setName(request.name());
        course.setCredits(request.credits());
        course.setCycle(request.cycle());
        course.setProgram(courseMapper.map(request.programId()));

        Course updatedCourse = courseRepository.save(course);
        return courseMapper.courseToCourseResponse(updatedCourse);
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("No se encontró el curso con ID: " + id));
        course.setAvailable(false);
        courseRepository.save(course);
    }

    // public
    @Override
    public List<CourseSelectResponse> getAllForSelect() {
        return courseRepository.findAllByAvailableTrueOrderByNameAsc()
                .stream()
                .map(p -> new CourseSelectResponse(p.getId(), p.getName()))
                .toList();
    }

    @Override
    public List<CourseSelectResponse> getAllForSelectByProgramAndCycle(Long programId, Integer cycle) {
        return courseRepository.findAllByProgramIdAndCycleAndAvailableTrueOrderByNameAsc(programId, cycle)
                .stream()
                .map(p -> new CourseSelectResponse(p.getId(), p.getName()))
                .toList();
    }

}
