package pe.edu.bausate.app.domain.enumerate;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Component
public class EnumRegistry {
    private final Map<String, Class<? extends Enum<?>>> registry = new HashMap<>();

    public EnumRegistry() {
        registry.put("applicant-status", ApplicantStatus.class);
        registry.put("document-id-type", DocumentIdType.class);
        registry.put("enrollment-detail-status", EnrollmentDetailStatus.class);
        registry.put("enrollment-mode", EnrollmentMode.class);
        registry.put("enrollment-status", EnrollmentStatus.class);
        registry.put("period-status", PeriodStatus.class);
        registry.put("person-type", PersonType.class);
        registry.put("enrollment-modality", EnrollmentModality.class);
        registry.put("study-mode", StudyMode.class);
        registry.put("disability-type", DisabilityType.class);
        registry.put("gender", Gender.class);
        registry.put("high-school-type", HighSchoolType.class);
        registry.put("faculty-type", FacultyType.class);
        registry.put("awareness-method", AwarenessMethod.class);
        registry.put("value-type", ValueType.class);
    }

    public Optional<Class<? extends Enum<?>>> getEnumClass(String name) {
        return Optional.ofNullable(registry.get(name));
    }

    public Set<String> getAvailableEnums() {
        return registry.keySet();
    }

}
