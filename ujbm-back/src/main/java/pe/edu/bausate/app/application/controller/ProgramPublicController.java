package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import pe.edu.bausate.app.domain.models.projection.ProgramSelectProjection;
import pe.edu.bausate.app.domain.service.ProgramService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.PROGRAM_PUBLIC)
@RequiredArgsConstructor
@Tag(name = "Programs", description = "Operaciones relacionadas a las carreras universitarias")
public class ProgramPublicController {
    private final ProgramService programService;

    @GetMapping
    public ResponseEntity<List<ProgramSelectProjection>> getPrograms() {
        return ResponseEntity.ok(this.programService.getProgramPublic());
    }

}
