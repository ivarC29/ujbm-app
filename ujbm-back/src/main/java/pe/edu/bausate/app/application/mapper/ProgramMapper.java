package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import pe.edu.bausate.app.application.dto.ProgramRequest;
import pe.edu.bausate.app.application.dto.ProgramResponse;
import pe.edu.bausate.app.domain.models.Program;

@Mapper(componentModel = "spring", uses = {FacultyMapper.class})
public interface ProgramMapper {
    Program programRequestToProgram(ProgramRequest programRequest);
    ProgramResponse programToProgramResponse(Program program);
}
