package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.application.dto.config.SystemParameterDto;
import pe.edu.bausate.app.application.dto.config.SystemParameterResponse;
import pe.edu.bausate.app.domain.models.SystemParameter;

import java.util.List;

public interface SystemParameterService {
    SystemParameter create(SystemParameterDto dto);
    void delete(String key);
    Object get(String key);
    SystemParameter update(SystemParameterDto dto);
    List<SystemParameterResponse> getAll();
    SystemParameter setEditable(String key, Boolean editable);
}
