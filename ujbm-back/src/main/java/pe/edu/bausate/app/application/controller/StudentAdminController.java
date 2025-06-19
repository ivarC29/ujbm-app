package pe.edu.bausate.app.application.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.student.*;
import pe.edu.bausate.app.domain.service.StudentService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

@RestController
@RequestMapping(ApiPaths.STUDENT_ADMIN)
@RequiredArgsConstructor
public class StudentAdminController {

    private final StudentService studentService;

    @PostMapping("/table-filter")
    public ResponseEntity<Page<StudentTableInfoResponse>> filterStudents(@RequestBody StudentFilterRequest filterRequest) {
        return ResponseEntity.ok(studentService.filterStudents(filterRequest));
    }

    @PostMapping
    public ResponseEntity<StudentCreateResponse> createStudent(@RequestBody StudentRequest request) {
        StudentCreateResponse response = studentService.createStudent(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        StudentResponse response = studentService.findById(id);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(@PathVariable Long id, @RequestBody StudentRequest request) {
        StudentResponse response = studentService.updateStudent(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
