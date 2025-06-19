package pe.edu.bausate.app.domain.service;

import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.models.auth.User;

public interface UserService {

    User createStudentUser(Student student);

    User createTeacherUser(Teacher teacher);

    void updatePassword(String username, String newPassword);

    void deleteUserByUsername(String username);
}
