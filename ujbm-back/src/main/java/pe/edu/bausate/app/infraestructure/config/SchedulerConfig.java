package pe.edu.bausate.app.infraestructure.config;

import ch.qos.logback.classic.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;


@Configuration
public class SchedulerConfig {
    Logger log;
    @Bean
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("scheduled-task-");

        scheduler.setErrorHandler(throwable ->
            log.error("Error in scheduled task", throwable));
        scheduler.initialize();
        return scheduler;
    }
}