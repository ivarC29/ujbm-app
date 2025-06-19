package pe.edu.bausate.app.infraestructure.startup;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import pe.edu.bausate.app.domain.repository.UbigeoRepository;
import pe.edu.bausate.app.domain.service.imports.UbigeoImportService;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@Component
@RequiredArgsConstructor
@Slf4j
public class UbigeoDataInitializer {

    private final UbigeoRepository ubigeoRepository;
    private final UbigeoImportService ubigeoImportService;

    @PostConstruct
    public void initUbigeos() {
        if (ubigeoRepository.count() == 0) {
            String rutaCsv = "data/init/ubigeos.csv"; // puedes cambiarla a la ruta que prefieras

            try {
                Path path = Path.of(rutaCsv);
                if (Files.exists(path)) {
                    log.info("Importando datos de ubigeo desde: {}", rutaCsv);
                    ubigeoImportService.importarDesdeCSV(rutaCsv);
                    log.info("Importación completada exitosamente.");
                } else {
                    log.warn("No se encontró el archivo CSV de ubigeo en la ruta: {}", rutaCsv);
                }
            } catch (IOException e) {
                log.error("Error al importar datos de ubigeo: {}", e.getMessage(), e);
            }
        } else {
            log.info("La tabla ubigeo ya contiene datos. No se realizará la importación.");
        }
    }
}