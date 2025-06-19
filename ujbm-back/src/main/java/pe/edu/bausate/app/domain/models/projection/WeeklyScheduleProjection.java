package pe.edu.bausate.app.domain.models.projection;

import java.time.LocalTime;

public interface WeeklyScheduleProjection {
    Long getId();

    String getDay();

    LocalTime getStartTime();

    LocalTime getEndTime();

    Boolean getAvailable();
}
