package pe.edu.bausate.app.infraestructure.util.helper;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

public class PageableUtils {
    public static PageRequest fromFilterRequest(
            Integer page, Integer size, String sortBy, String sortDirection) {
        int pageNumber = page != null ? page : 0;
        int pageSize = size != null ? size : 8;
        String sortField = sortBy != null ? sortBy : "id";
        String direction = sortDirection != null ? sortDirection : "ASC";
        Sort sort = Sort.by(Sort.Direction.fromString(direction), sortField);
        return PageRequest.of(pageNumber, pageSize, sort);
    }


    public static PageRequest fromFilterRequestWithJoins(
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection) {

        // Default values
        int pageNum = (page != null) ? page : 0;
        int pageSize = (size != null) ? size : 10;
        String sort = (sortBy != null) ? sortBy : "enrollmentDate";
        String direction = (sortDirection != null) ? sortDirection.toUpperCase() : "DESC";


        if ("studentName".equals(sort)) {
            sort = "student.person.name";
        } else if ("programName".equals(sort)) {
            sort = "student.program.name";
        } else if ("academicPeriodName".equals(sort)) {
            sort = "academicPeriod.name";
        } else if ("studentCode".equals(sort)) {
            sort = "student.code";
        }

        return PageRequest.of(
                pageNum,
                pageSize,
                direction.equals("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sort);
    }
}
