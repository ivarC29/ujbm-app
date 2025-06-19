package pe.edu.bausate.app.domain.report;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Map;

@Component
public class ExcelReportStrategy implements ReportStrategy {
    @Override
    public byte[] generateReport(String templateName, Map<String, Object> data) {
        try (Workbook workbook = new HSSFWorkbook()) {
            // Crear una hoja en el libro
            Sheet sheet = workbook.createSheet("Reporte");

            // Crear estilos para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Si hay datos tablas, procesamos la primera que encontremos como ejemplo
            if (data.containsKey("items") && data.get("items") instanceof List) {
                List<Map<String, Object>> items = (List<Map<String, Object>>) data.get("items");
                if (!items.isEmpty()) {
                    // Crear fila de encabezados basada en las claves del primer elemento
                    Map<String, Object> firstItem = items.get(0);
                    Row headerRow = sheet.createRow(0);
                    int colIdx = 0;

                    for (String key : firstItem.keySet()) {
                        Cell cell = headerRow.createCell(colIdx++);
                        cell.setCellValue(capitalize(key));
                        cell.setCellStyle(headerStyle);
                    }

                    // Llenar datos
                    int rowIdx = 1;
                    for (Map<String, Object> item : items) {
                        Row row = sheet.createRow(rowIdx++);
                        colIdx = 0;
                        for (Object value : item.values()) {
                            Cell cell = row.createCell(colIdx++);
                            setCellValue(cell, value);
                        }
                    }

                    // Autoajustar columnas
                    for (int i = 0; i < firstItem.size(); i++) {
                        sheet.autoSizeColumn(i);
                    }
                }
            } else {
                // Si no hay estructura de tabla, crear filas simples con pares clave-valor
                int rowIdx = 0;
                for (Map.Entry<String, Object> entry : data.entrySet()) {
                    if (!(entry.getValue() instanceof Map) && !(entry.getValue() instanceof List)) {
                        Row row = sheet.createRow(rowIdx++);

                        Cell keyCell = row.createCell(0);
                        keyCell.setCellValue(capitalize(entry.getKey()));
                        keyCell.setCellStyle(headerStyle);

                        Cell valueCell = row.createCell(1);
                        setCellValue(valueCell, entry.getValue());
                    }
                }
                sheet.autoSizeColumn(0);
                sheet.autoSizeColumn(1);
            }

            // Procesar secciones especiales si existen
            if (data.containsKey("invoice") && data.get("invoice") instanceof Map) {
                Map<String, Object> invoice = (Map<String, Object>) data.get("invoice");
                Sheet invoiceSheet = workbook.createSheet("Factura");

                // Crear sección de encabezado
                Row titleRow = invoiceSheet.createRow(0);
                Cell titleCell = titleRow.createCell(0);
                titleCell.setCellValue("FACTURA");

                CellStyle titleStyle = workbook.createCellStyle();
                Font titleFont = workbook.createFont();
                titleFont.setBold(true);
                titleFont.setFontHeightInPoints((short) 16);
                titleStyle.setFont(titleFont);
                titleCell.setCellStyle(titleStyle);

                // Datos básicos de factura
                Row dateRow = invoiceSheet.createRow(1);
                dateRow.createCell(0).setCellValue("Fecha:");
                dateRow.createCell(1).setCellValue(String.valueOf(invoice.get("date")));

                Row numberRow = invoiceSheet.createRow(2);
                numberRow.createCell(0).setCellValue("Número de Factura:");
                numberRow.createCell(1).setCellValue(String.valueOf(invoice.get("number")));

                Row clientRow = invoiceSheet.createRow(3);
                clientRow.createCell(0).setCellValue("Cliente:");
                clientRow.createCell(1).setCellValue(String.valueOf(invoice.get("clientName")));

                // Tabla de items
                if (invoice.containsKey("items") && invoice.get("items") instanceof List) {
                    List<Map<String, Object>> items = (List<Map<String, Object>>) invoice.get("items");
                    if (!items.isEmpty()) {
                        Row headerRow = invoiceSheet.createRow(5);
                        String[] headers = {"Descripción", "Cantidad", "Precio Unitario", "Total"};
                        for (int i = 0; i < headers.length; i++) {
                            Cell cell = headerRow.createCell(i);
                            cell.setCellValue(headers[i]);
                            cell.setCellStyle(headerStyle);
                        }

                        int rowIdx = 6;
                        for (Map<String, Object> item : items) {
                            Row row = invoiceSheet.createRow(rowIdx++);
                            row.createCell(0).setCellValue(String.valueOf(item.get("description")));

                            Cell quantityCell = row.createCell(1);
                            setCellValue(quantityCell, item.get("quantity"));

                            Cell unitPriceCell = row.createCell(2);
                            setCellValue(unitPriceCell, item.get("unitPrice"));

                            Cell totalCell = row.createCell(3);
                            setCellValue(totalCell, item.get("total"));
                        }

                        // Totales al final
                        Row emptyRow = invoiceSheet.createRow(rowIdx++);
                        Row subtotalRow = invoiceSheet.createRow(rowIdx++);
                        subtotalRow.createCell(2).setCellValue("Subtotal:");
                        Cell subtotalCell = subtotalRow.createCell(3);
                        setCellValue(subtotalCell, invoice.get("subtotal"));

                        Row taxRow = invoiceSheet.createRow(rowIdx++);
                        taxRow.createCell(2).setCellValue("IVA (21%):");
                        Cell taxCell = taxRow.createCell(3);
                        setCellValue(taxCell, invoice.get("tax"));

                        Row totalRow = invoiceSheet.createRow(rowIdx++);
                        totalRow.createCell(2).setCellValue("TOTAL:");
                        Cell totalCell = totalRow.createCell(3);
                        setCellValue(totalCell, invoice.get("total"));

                        CellStyle totalStyle = workbook.createCellStyle();
                        Font totalFont = workbook.createFont();
                        totalFont.setBold(true);
                        totalStyle.setFont(totalFont);
                        totalCell.setCellStyle(totalStyle);

                        // Autoajustar columnas
                        for (int i = 0; i < 4; i++) {
                            invoiceSheet.autoSizeColumn(i);
                        }
                    }
                }
            }

            // Escribir a ByteArrayOutputStream
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error generating Excel report", e);
        }
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setCellValue("");
        } else if (value instanceof Number) {
            cell.setCellValue(((Number) value).doubleValue());
        } else if (value instanceof Boolean) {
            cell.setCellValue((Boolean) value);
        } else {
            cell.setCellValue(String.valueOf(value));
        }
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) {
            return str;
        }
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    @Override
    public String getContentType() {
        return "application/vnd.ms-excel";
    }

    @Override
    public String getFileExtension() {
        return "xls";
    }
}
