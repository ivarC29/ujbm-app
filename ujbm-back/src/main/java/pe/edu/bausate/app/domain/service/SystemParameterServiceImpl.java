package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.application.dto.config.SystemParameterDto;
import pe.edu.bausate.app.application.dto.config.SystemParameterResponse;
import pe.edu.bausate.app.domain.enumerate.ValueType;
import pe.edu.bausate.app.domain.models.SystemParameter;
import pe.edu.bausate.app.domain.repository.SystemParameterRepository;
import pe.edu.bausate.app.infraestructure.util.helper.SystemParameterUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemParameterServiceImpl implements SystemParameterService {

    private final SystemParameterRepository repository;

    public SystemParameter create(SystemParameterDto dto) {
        if (repository.existsByKey(dto.key())) {
            throw new IllegalArgumentException("Parámetro ya existe.");
        }

        ValueType type = SystemParameterUtils.inferValueType(dto.value());

        SystemParameter parameter = SystemParameter.builder()
                .key(dto.key())
                .value(dto.value())
                .description(dto.description())
                .valueType(type)
                .available(true)
                .build();

        return repository.save(parameter);
    }

    public void delete(String key) {
        SystemParameter parameter = repository.findByKeyAndAvailableTrue(key)
                .orElseThrow(() -> new NoSuchElementException("No existe el parámetro " + key));
        parameter.setAvailable(false);
        repository.save(parameter);
    }

    public Object get(String key) {
        SystemParameter parameter = repository.findByKeyAndAvailableTrue(key)
                .orElseThrow(() -> new NoSuchElementException("No existe el parámetro " + key));
        // para date
        if (parameter.getValueType() == ValueType.DATE) {
            try {
                return LocalDate.parse(parameter.getValue());
            } catch (Exception e) {
                throw new IllegalArgumentException("Valor de fecha inválido para el parámetro " + key, e);
            }
        }
        return SystemParameterUtils.convertToTypedValue(parameter.getValue(), parameter.getValueType());

    }

    public SystemParameter update(SystemParameterDto dto) {
        SystemParameter parameter = repository.findByKeyAndAvailableTrue(dto.key())
                .orElseThrow(() -> new NoSuchElementException("No existe el parámetro " + dto.key()));

        if (!parameter.getEditable()) {
            throw new IllegalStateException("El parámetro no es editable.");
        }

        ValueType type = SystemParameterUtils.inferValueType(dto.value());

        parameter.setValue(dto.value());
        parameter.setValueType(type);
        parameter.setDescription(dto.description());

        return repository.save(parameter);
    }

    @Override
    public List<SystemParameterResponse> getAll() {
        List<SystemParameter> parameters = repository.findAllByAvailableTrue();
        return parameters.stream()
                .map(param -> new SystemParameterResponse(
                        param.getKey(),
                        String.valueOf(SystemParameterUtils.convertToTypedValue(param.getValue(), param.getValueType())),
                        param.getDescription(),
                        param.getValueType().getDisplayName(),
                        param.getEditable()))
                .collect(Collectors.toList());
    }

    @Override
    public SystemParameter setEditable(String key, Boolean editable) {
        SystemParameter parameter = repository.findByKeyAndAvailableTrue(key)
                .orElseThrow(() -> new NoSuchElementException("No existe el parámetro " + key));

        parameter.setEditable(editable);
        return repository.save(parameter);
    }
}
