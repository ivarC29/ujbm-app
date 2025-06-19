package pe.edu.bausate.app.domain.service.imports;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.domain.models.Ubigeo;
import pe.edu.bausate.app.domain.repository.UbigeoRepository;

import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UbigeoImportService {
    private final UbigeoRepository ubigeoRepository;

    @Transactional
    public void importarDesdeCSV(String rutaCsv) throws IOException {
        List<Ubigeo> ubList = new ArrayList<>();

        // Obtener IDs ya existentes en la BD (Se quito por sobrecarga de consultas se manejara en el initializer)
//        Set<Long> existingIds = new HashSet<>(ubigeoRepository.findAllIds());

        try (BufferedReader br = Files.newBufferedReader(Paths.get(rutaCsv))) {
            String linea;
            boolean skipHeader = true;

            while ((linea = br.readLine()) != null) {
                if (skipHeader) {
                    skipHeader = false;
                    continue;
                }

                String[] campos = linea.split(";", -1);

                Long id = Long.parseLong(campos[0].trim());

//                if (existingIds.contains(id)) {
//                    continue; // saltar duplicado
//                }

                String reniecCode = padLeft(campos[1], 6);
                String ubigeoInei = padLeft(campos[2], 6);

                String departmentCode = padLeft(campos[3], 2);
                String departmentName = campos[4].trim();

                String provinceCode = padLeft(campos[5].substring(2), 2);
                String provinceName = campos[6].trim();

                String districtCode = padLeft(ubigeoInei.substring(4), 2);
                String districtName = campos[7].trim();

                Ubigeo ubigeo = Ubigeo.builder()
                        .id(id)
                        .departmentCode(departmentCode)
                        .provinceCode(provinceCode)
                        .districtCode(districtCode)
                        .departmentName(departmentName)
                        .provinceName(provinceName)
                        .districtName(districtName)
                        .reniecCode(reniecCode)
                        .country("Perú")
                        .available(true)
                        .build();

                ubList.add(ubigeo);
            }
        }

        ubigeoRepository.saveAll(ubList);
    }

    private String padLeft(String value, int length) {
        if (value == null || value.trim().isEmpty()) return "0".repeat(length);
        return String.format("%0" + length + "d", Integer.parseInt(value.trim()));
    }
}
