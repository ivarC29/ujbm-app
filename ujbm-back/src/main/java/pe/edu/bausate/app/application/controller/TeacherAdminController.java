package pe.edu.bausate.app.application.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.teacher.*;
import pe.edu.bausate.app.domain.service.TeacherService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.TEACHER_ADMIN)
@RequiredArgsConstructor
public class TeacherAdminController {

    private final TeacherService teacherService;

    @GetMapping("/autocomplete")
    public ResponseEntity<List<TeacherAutocompleteResponse>> autocomplete(@RequestParam String query) {
        return ResponseEntity.ok(teacherService.autocompleteAvailableTeachers(query));
    }

    @PostMapping
    public ResponseEntity<TeacherCreateResponse> createTeacher(@RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.createTeacher(request));
    }

    @PostMapping("/table-filter")
    public ResponseEntity<Page<TeacherTableInfoResponse>> filterTeachers(@RequestBody TeacherFilterRequest filterRequest) {
        return ResponseEntity.ok(teacherService.filterTeachers(filterRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeacherResponse> updateTeacher(@PathVariable Long id, @RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.updateTeacher(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return ResponseEntity.noContent().build();
    }
}
