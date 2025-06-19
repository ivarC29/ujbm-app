package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.ProgramRequest;
import pe.edu.bausate.app.application.dto.ProgramResponse;
import pe.edu.bausate.app.domain.models.projection.ProgramSelectProjection;

import java.util.List;

public interface ProgramService {

    ProgramResponse createProgram(ProgramRequest request);

    List<ProgramSelectProjection> getProgramPublic();
}
