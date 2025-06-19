package pe.edu.bausate.app.infraestructure.util.helper;

import org.apache.coyote.BadRequestException;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import pe.edu.bausate.app.application.dto.WeeklyScheduleRequest;
import pe.edu.bausate.app.application.dto.coursesection.CourseSectionRequest;

import java.util.ArrayList;
import java.util.List;

public class ExcelUtils {
    // Métodos auxiliares para leer celdas

    public static boolean isExcelFile(String filename) {
        return filename != null &&
                (filename.endsWith(".xlsx") || filename.endsWith(".xls"));
    }

    public static String excelTimeToString(double excelTime) {
        int totalMinutes = (int) Math.round(excelTime * 24 * 60);
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;
        return String.format("%02d:%02d", hours, minutes);
    }

    public static String getStringCellValue(Row row, int cellIndex) {
        Cell cell = row.getCell(cellIndex);
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                // Si la columna es de hora (índice 6 u 7), convertir a HH:mm
                if (cellIndex == 6 || cellIndex == 7) {
                    return excelTimeToString(cell.getNumericCellValue());
                }
                double value = cell.getNumericCellValue();
                if (value == Math.floor(value)) {
                    return String.valueOf((long) value);
                } else {
                    return String.valueOf(value);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case BLANK:
                return null;
            default:
                return cell.toString().trim();
        }
    }

    public static Long getLongCellValue(Row row, int cellIndex) throws BadRequestException {
        String value = getStringCellValue(row, cellIndex);
        if (value == null) return null;

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Valor inválido para ID en columna " + (cellIndex + 1));
        }
    }

    public static Integer getIntCellValue(Row row, int cellIndex) throws BadRequestException {
        String value = getStringCellValue(row, cellIndex);
        if (value == null) return null;

        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new BadRequestException("Valor inválido para capacidad en columna " + (cellIndex + 1));
        }
    }

    // CourseSection
    public static CourseSectionRequest extractCourseSectionFromRow(Row row) throws BadRequestException {
        Long courseId = getLongCellValue(row, 0);
        String section = getStringCellValue(row, 1);
        Long teacherId = getLongCellValue(row, 2);
        Integer vacancies = getIntCellValue(row, 3);
        Long academicPeriodId = getLongCellValue(row, 4);

        List<WeeklyScheduleRequest> weeklySchedules = new ArrayList<>();
        String day = getStringCellValue(row, 5);
        String startTime = getStringCellValue(row, 6);
        String endTime = getStringCellValue(row, 7);
        if (day != null && startTime != null && endTime != null) {
            weeklySchedules.add(new WeeklyScheduleRequest(day, startTime, endTime));
        } else {
            throw new BadRequestException("El horario semanal (día, hora inicio, hora fin) es obligatorio y debe estar completo");
        }

        if (courseId == null) {
            throw new BadRequestException("El ID del curso es obligatorio");
        }
        if (teacherId == null) {
            throw new BadRequestException("El ID del profesor es obligatorio");
        }
        if (academicPeriodId == null) {
            throw new BadRequestException("El ID del periodo académico es obligatorio");
        }

        return new CourseSectionRequest(
                courseId,
                section,
                teacherId,
                vacancies,
                academicPeriodId,
                weeklySchedules
        );
    }
}
