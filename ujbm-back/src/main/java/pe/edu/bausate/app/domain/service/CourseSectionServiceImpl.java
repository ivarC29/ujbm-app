package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.BadRequestException;
import org.apache.poi.ss.usermodel.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import pe.edu.bausate.app.application.dto.coursesection.*;
import pe.edu.bausate.app.application.mapper.CourseSectionMapper;
import pe.edu.bausate.app.domain.models.CourseSection;
import pe.edu.bausate.app.domain.models.WeeklySchedule;
import pe.edu.bausate.app.domain.models.projection.AcademicPeriodProjection;
import pe.edu.bausate.app.domain.repository.*;
import pe.edu.bausate.app.domain.specification.CourseSectionSpecification;
import pe.edu.bausate.app.infraestructure.exception.NotFoundException;
import pe.edu.bausate.app.infraestructure.util.helper.ExcelUtils;
import pe.edu.bausate.app.infraestructure.util.helper.PageableUtils;

import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseSectionServiceImpl implements CourseSectionService {

    private final CourseSectionRepository courseSectionRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final CourseSectionMapper courseSectionMapper;

    @Transactional(readOnly = true)
    @Override
    public Page<CourseSectionTableInfoResponse> filterCourseSections(CourseSectionFilterRequest filterRequest) {
        PageRequest pageRequest = PageableUtils.fromFilterRequest(
                filterRequest.page(),
                filterRequest.size(),
                filterRequest.sortBy(),
                filterRequest.sortDirection()
        );

        Specification<CourseSection> spec = CourseSectionSpecification.filterBy(filterRequest);

        return courseSectionRepository.findAll(spec, pageRequest)
                .map(courseSectionMapper::courseSectionToCourseSectionTableInfoResponse);
    }

    @Transactional
    @Override
    public CourseSectionResponse save(CourseSectionRequest request) {
        log.info("Iniciando creación de CourseSection para cursoId={}, sección={}, docenteId={}",
                request.courseId(), request.section(), request.teacherId());

        if (courseSectionRepository.existsCourseSectionBySection(request.section())) {
            throw new IllegalArgumentException("Ya existe una sección con el nombre: " + request.section());
        }

        CourseSection courseSection = courseSectionMapper.courseSectionRequestToCourseSection(request);

        courseSection.setCourse(courseRepository.findById(request.courseId())
                .orElseThrow(() -> new NotFoundException("Curso no encontrado con id: " + request.courseId())));

        courseSection.setTeacher(teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new NotFoundException("Profesor no encontrado con id: " + request.teacherId())));

        courseSection.setPeriod(academicPeriodRepository.findById(request.academicPeriodId())
                .orElseThrow(() -> new NotFoundException("Periodo académico no encontrado con id: " + request.academicPeriodId())));

        // Relación bidireccional y validación de solapamientos
        if (courseSection.getWeeklyScheduleList() != null) {
            ValidateOverlaps(courseSection.getWeeklyScheduleList());
            courseSection.getWeeklyScheduleList().forEach(ws -> ws.setCourseSection(courseSection));
        }
        if (courseSection.getWeeklyScheduleList() != null && !courseSection.getWeeklyScheduleList().isEmpty()) {
            courseSection.getWeeklyScheduleList().forEach(ws -> {
                ws.setAvailable(true);
            });
        }

        CourseSection savedCourseSection = courseSectionRepository.save(courseSection);
        log.info("CourseSection creada con id={}", savedCourseSection.getId());
        return courseSectionMapper.courseSectionToCourseSectionResponse(savedCourseSection);
    }

    // FIXME: Ubicar funcion en WeeklyScheduleUtils
    private void ValidateOverlaps(List<WeeklySchedule> schedules) {
        for (int i = 0; i < schedules.size(); i++) {
            WeeklySchedule ws1 = schedules.get(i);
            for (int j = i + 1; j < schedules.size(); j++) {
                WeeklySchedule ws2 = schedules.get(j);
                if (ws1.getDay() == ws2.getDay()) {
                    if (ws1.getStartTime().isBefore(ws2.getEndTime()) && ws2.getStartTime().isBefore(ws1.getEndTime())) {
                        throw new IllegalArgumentException("Cruce de horarios en el día " + ws1.getDay() +
                                " entre " + ws1.getStartTime() + "-" + ws1.getEndTime() +
                                " y " + ws2.getStartTime() + "-" + ws2.getEndTime());
                    }
                }
            }
        }
    }

    @Transactional(readOnly = true)
    @Override
    public Optional<CourseSectionResponse> findById(Long id) {
        return courseSectionRepository.findById(id)
                .map(courseSectionMapper::courseSectionToCourseSectionResponse);
    }

    @Transactional
    public CourseSectionResponse update(Long id, CourseSectionRequest request) {
        log.info("Iniciando actualización de CourseSection id={} para cursoId={}, sección={}, docenteId={}",
                id, request.courseId(), request.section(), request.teacherId());

        CourseSection existingCourseSection = courseSectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sección de curso no encontrada con id: " + id));

        if (!existingCourseSection.getSection().equals(request.section()) &&
                courseSectionRepository.existsCourseSectionBySection(request.section())) {
            throw new IllegalArgumentException("Ya existe una sección con el nombre: " + request.section());
        }

        existingCourseSection.setSection(request.section());
        existingCourseSection.setVacancies(request.vacancies());

        if (!existingCourseSection.getCourse().getId().equals(request.courseId())) {
            existingCourseSection.setCourse(courseRepository.findById(request.courseId())
                    .orElseThrow(() -> new NotFoundException("Curso no encontrado con id: " + request.courseId())));
        }

        if (!existingCourseSection.getTeacher().getId().equals(request.teacherId())) {
            existingCourseSection.setTeacher(teacherRepository.findById(request.teacherId())
                    .orElseThrow(() -> new NotFoundException("Profesor no encontrado con id: " + request.teacherId())));
        }

        if (!existingCourseSection.getPeriod().getId().equals(request.academicPeriodId())) {
            existingCourseSection.setPeriod(academicPeriodRepository.findById(request.academicPeriodId())
                    .orElseThrow(() -> new NotFoundException("Periodo académico no encontrado con id: " + request.academicPeriodId())));
        }

        if (existingCourseSection.getWeeklyScheduleList() != null) {
            existingCourseSection.getWeeklyScheduleList().clear();
        } else {
            existingCourseSection.setWeeklyScheduleList(new ArrayList<>());
        }

        if (request.weeklySchedules() != null && !request.weeklySchedules().isEmpty()) {
            List<WeeklySchedule> newSchedules = request.weeklySchedules().stream()
                    .map(ws -> {
                        WeeklySchedule schedule = new WeeklySchedule();
                        schedule.setDay(DayOfWeek.valueOf(ws.day().toUpperCase()));
                        schedule.setStartTime(LocalTime.parse(ws.startTime()));
                        schedule.setEndTime(LocalTime.parse(ws.endTime()));
                        schedule.setCourseSection(existingCourseSection);
                        schedule.setAvailable(true);
                        return schedule;
                    })
                    .collect(Collectors.toList());

            ValidateOverlaps(newSchedules);
            existingCourseSection.getWeeklyScheduleList().addAll(newSchedules);
        }

        CourseSection updatedCourseSection = courseSectionRepository.save(existingCourseSection);
        log.info("CourseSection actualizada con id={}", updatedCourseSection.getId());
        return courseSectionMapper.courseSectionToCourseSectionResponse(updatedCourseSection);
    }

    @Transactional
    @Override
    public void deleteById(Long id) {
        CourseSection courseSection = courseSectionRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Sección de curso no encontrada con id: " + id));

        courseSection.setAvailable(false);
        courseSectionRepository.save(courseSection);
    }

    @Transactional
    @Override
    public CourseSectionBatchUploadResponse batchUpload(MultipartFile file) throws BadRequestException {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("El archivo es obligatorio");
        }

        // Validar extensión y tipo MIME
        String contentType = file.getContentType();
        if (!ExcelUtils.isExcelFile(file.getOriginalFilename()) ||
                (contentType != null && !contentType.equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") && !contentType.equals("application/vnd.ms-excel"))) {
            throw new BadRequestException("El archivo debe ser un Excel válido (.xlsx o .xls)");
        }

        List<String> errors = new ArrayList<>();
        int successCount = 0;
        int errorCount = 0;
        int totalRecords = 0;

        // Optimizar: cargar IDs válidos solo una vez
        Set<Long> validCourseIds = new HashSet<>(courseRepository.findAllValidIds());
        Set<Long> validTeacherIds = new HashSet<>(teacherRepository.findAllValidIds());
        Set<Long> validPeriodIds = new HashSet<>(academicPeriodRepository.findAllValidIds());

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            Iterator<Row> rowIterator = sheet.iterator();
            int rowNum = 0;
            if (rowIterator.hasNext()) {
                rowIterator.next(); // Saltar encabezado
                rowNum++;
            }

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                rowNum++;
                totalRecords++;

                try {
                    CourseSectionRequest request = ExcelUtils.extractCourseSectionFromRow(row);

                    if (!validCourseIds.contains(request.courseId())) {
                        throw new BadRequestException("Curso no encontrado con id: " + request.courseId());
                    }
                    if (!validTeacherIds.contains(request.teacherId())) {
                        throw new BadRequestException("Profesor no encontrado con id: " + request.teacherId());
                    }
                    if (!validPeriodIds.contains(request.academicPeriodId())) {
                        throw new BadRequestException("Periodo académico no encontrado con id: " + request.academicPeriodId());
                    }

                    if (request.weeklySchedules() != null && !request.weeklySchedules().isEmpty()) {
                        List<WeeklySchedule> schedules = request.weeklySchedules().stream()
                                .map(ws -> new WeeklySchedule(null,
                                        DayOfWeek.valueOf(ws.day().toUpperCase()),
                                        LocalTime.parse(ws.startTime()),
                                        LocalTime.parse(ws.endTime()),
                                        null, null, true))
                                .collect(Collectors.toList());
                        ValidateOverlaps(schedules);
                    }

                    saveSingleCourseSectionInTransaction(request);
                    successCount++;
                } catch (Exception e) {
                    errorCount++;
                    String cellValues = "";
                    for (int i = 0; i < row.getLastCellNum(); i++) {
                        cellValues += "[" + i + ":" + ExcelUtils.getStringCellValue(row, i) + "] ";
                    }
                    errors.add("Error en fila " + rowNum + ": " + e.getMessage() + " | Valores: " + cellValues);
                }
            }
        } catch (IOException e) {
            throw new BadRequestException("Error al leer el archivo Excel: " + e.getMessage());
        }

        return CourseSectionBatchUploadResponse.builder()
                .totalRecords(totalRecords)
                .successCount(successCount)
                .errorCount(errorCount)
                .errors(errors)
                .build();
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void saveSingleCourseSectionInTransaction(CourseSectionRequest request) {
        // Este método guarda cada sección en una transacción independiente
        save(request);
    }

    // Student
    @Transactional(readOnly = true)
    @Override
    public List<CourseSectionResponse> findCurrentCourseSectionsByStudentId(Long studentId) {
        AcademicPeriodProjection currentPeriod = academicPeriodRepository
                .findCurrentAcademicPeriod()
                .orElseThrow(() -> new NotFoundException("No hay período académico disponible actualmente"));

        List<CourseSection> courseSections = courseSectionRepository
                .findByStudentIdAndPeriodIdAndAvailable(studentId, currentPeriod.getId());

        return courseSections.stream()
                .map(courseSectionMapper::courseSectionToCourseSectionResponse)
                .collect(Collectors.toList());
    }

    // Teacher

    @Transactional(readOnly = true)
    @Override
    public List<CourseSectionResponse> findCurrentCourseSectionsByTeacherId(Long teacherId) {
        AcademicPeriodProjection currentPeriod = academicPeriodRepository
                    .findCurrentAcademicPeriod()
                    .orElseThrow(() -> new NotFoundException("No hay período académico disponible actualmente"));


        List<CourseSection> courseSections = courseSectionRepository
                .findByTeacherIdAndPeriodIdAndAvailable(teacherId, currentPeriod.getId());

        return courseSections.stream()
                .map(courseSectionMapper::courseSectionToCourseSectionResponse)
                .collect(Collectors.toList());
    }

}
