package pe.edu.bausate.app.infraestructure.util.helper;

import org.springframework.core.io.UrlResource;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import java.nio.file.StandardCopyOption;
import java.util.Optional;

public class FileStorageUtils {
    /**
     * Guarda un archivo en un directorio especificado, con un nombre prefijado, conservando su extensión.
     *
     * @param rootPath Ruta raíz relativa (para retornar como referencia, ej. para guardar en DB).
     * @param dir Directorio absoluto donde guardar el archivo.
     * @param prefix Prefijo del nombre del archivo.
     * @param file Archivo a guardar.
     * @return Ruta relativa del archivo guardado.
     * @throws IOException Si ocurre un error al copiar el archivo.
     */
    public static String saveFile(String rootPath, Path dir, String prefix, MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("El archivo " + prefix + " no puede ser nulo ni vacío.");
        }

        String extension = Optional.ofNullable(file.getOriginalFilename())
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse("");

        String filename = prefix + extension;
        Path destination = dir.resolve(filename);

        Files.createDirectories(dir);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return filename;
    }

    /**
     * Devuelve el archivo como recurso descargable.
     *
     * @param baseStoragePath Ruta base donde están los archivos en disco (ej: uploads/applicants).
     * @param relativePath Ruta relativa generada por saveFile (ej: data/applicants/123/foto_123.png).
     * @return Recurso del archivo.
     * @throws IOException Si el archivo no existe o no se puede acceder.
     */
    public static Resource loadFileAsResource(Path baseStoragePath, String relativePath) throws IOException {
        Path filePath = baseStoragePath.resolve(relativePath).normalize();

        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new IOException("No se pudo leer el archivo: " + filePath);
        }
    }

    /**
     * Elimina un archivo si existe.
     *
     * @param file Ruta del archivo.
     * @throws IOException Si ocurre un error al eliminar el archivo.
     */
    public static void deleteFile(Path file) throws IOException {
        Files.deleteIfExists(file);
    }

    /**
     * Obtiene la extensión de un nombre de archivo.
     *
     * @param filename Nombre del archivo.
     * @return Extensión (incluyendo el punto), o cadena vacía si no tiene.
     */
    public static String getExtension(String filename) {
        return Optional.ofNullable(filename)
                .filter(f -> f.contains("."))
                .map(f -> f.substring(f.lastIndexOf(".")))
                .orElse("");
    }
}
