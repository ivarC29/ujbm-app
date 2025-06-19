package pe.edu.bausate.app.application.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import pe.edu.bausate.app.application.dto.WeeklyScheduleRequest;
import pe.edu.bausate.app.application.dto.WeeklyScheduleResponse;
import pe.edu.bausate.app.domain.models.WeeklySchedule;

@Mapper(componentModel = "spring")
public interface WeeklyScheduleMapper {

    WeeklyScheduleResponse weeklyScheduleToWeeklyScheduleResponse(WeeklySchedule weeklySchedule);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "courseSection", ignore = true)
    WeeklySchedule weeklyScheduleRequestToWeeklySchedule(WeeklyScheduleRequest request);
}
