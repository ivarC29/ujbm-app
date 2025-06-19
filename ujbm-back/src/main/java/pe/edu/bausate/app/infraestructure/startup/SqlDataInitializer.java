package pe.edu.bausate.app.infraestructure.startup;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class SqlDataInitializer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void initializeSqlData() {
        String sqlFilePath = "data/init/init_data.sql"; // Ruta del archivo SQL

        try {
            if (shouldExecuteSql()) {
                ClassPathResource resource = new ClassPathResource(sqlFilePath);
                if (resource.exists()) {
                    log.info("Ejecutando archivo SQL de inicialización: {}", sqlFilePath);
                    try (InputStream inputStream = resource.getInputStream()) {
                        String sql = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
                        jdbcTemplate.execute(sql);
                        log.info("Inicialización de la base de datos completada.");
                    }
                } else {
                    log.warn("No se encontró el archivo SQL en la ruta: {}", sqlFilePath);
                }
            } else {
                log.info("Las tablas ya contienen datos. No se ejecutará el archivo SQL.");
            }
        } catch (IOException e) {
            log.error("Error al leer el archivo SQL: {}", e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error al ejecutar el archivo SQL: {}", e.getMessage(), e);
        }
    }

    private boolean shouldExecuteSql() {
        String[] tables = {"role", "users", "users_roles", "faculty", "program"};

        for (String table : tables) {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM " + table, Integer.class);
            if (count != null && count > 0) {
                return false; // Si alguna tabla tiene datos, no se ejecuta el SQL
            }
        }
        return true; // Todas las tablas están vacías
    }
}