package pe.edu.bausate.app.infraestructure.util.helper;

import pe.edu.bausate.app.domain.repository.TeacherRepository;

public class TeacherUtils {
    public static String generateUniqueTeacherCode(TeacherRepository teacherRepository) {
        String numericPart = CommonUtils.generateUniqueNumericCode(7, code -> teacherRepository.existsByCode("TCH" + code));
        return "TCH" + numericPart;
    }
}
