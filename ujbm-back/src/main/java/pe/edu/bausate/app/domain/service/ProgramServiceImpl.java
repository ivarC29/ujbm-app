package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.dto.ProgramRequest;
import pe.edu.bausate.app.application.dto.ProgramResponse;
import pe.edu.bausate.app.application.mapper.ProgramMapper;
import pe.edu.bausate.app.domain.models.Program;
import pe.edu.bausate.app.domain.models.projection.ProgramSelectProjection;
import pe.edu.bausate.app.domain.repository.ProgramRepository;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProgramServiceImpl implements ProgramService {

    private final ProgramRepository programRepository;
    private final ProgramMapper programMapper;

    @Override
    public ProgramResponse createProgram(ProgramRequest request) {
        Program program = this.programMapper.programRequestToProgram(request);
        Program savedProgram = this.programRepository.save(program);

        log.info("Programa creado con ID: {}", savedProgram.getId());
        return this.programMapper.programToProgramResponse(savedProgram);
    }

    @Override
    public List<ProgramSelectProjection> getProgramPublic() {
        return this.programRepository.findOnlyIdAndName();
    }


}
