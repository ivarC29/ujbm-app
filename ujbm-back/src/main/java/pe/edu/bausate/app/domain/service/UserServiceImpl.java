package pe.edu.bausate.app.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pe.edu.bausate.app.domain.models.Student;
import pe.edu.bausate.app.domain.models.Teacher;
import pe.edu.bausate.app.domain.models.auth.Role;
import pe.edu.bausate.app.domain.models.auth.User;
import pe.edu.bausate.app.domain.repository.RoleRepository;
import pe.edu.bausate.app.domain.repository.UserRepository;
import pe.edu.bausate.app.infraestructure.util.helper.StudentUtils;
import pe.edu.bausate.app.infraestructure.util.helper.UserUtils;

import java.util.Collections;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService{

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    private final PasswordEncoder passwordEncoder;

    @Override
    public User createStudentUser(Student student) {
        String username = student.getCode().toLowerCase();
        String password = UserUtils.generateRandomPassword();

        Role studentRole = roleRepository.findByName("ROLE_STUDENT")
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        Set<Role> roles = Collections.singleton(studentRole);

        User user = User.builder()
                .username(username)
                .email(student.getPerson().getEmail())
                .password(passwordEncoder.encode(password))
                .roles(roles)
                .person(student.getPerson())
                .enabled(true)
                .build();
        user.setRawPassword(password);
        return userRepository.save(user);
    }

    @Override
    public User createTeacherUser(Teacher teacher) {
        String username = teacher.getCode().toLowerCase();
        String password = UserUtils.generateRandomPassword();

        Role studentRole = roleRepository.findByName("ROLE_TEACHER")
                .orElseThrow(() -> new IllegalArgumentException("Rol no encontrado"));

        Set<Role> roles = Collections.singleton(studentRole);

        User user = User.builder()
                .username(username)
                .email(teacher.getPerson().getEmail())
                .password(passwordEncoder.encode(password))
                .roles(roles)
                .person(teacher.getPerson())
                .enabled(true)
                .build();
        user.setRawPassword(password);
        return userRepository.save(user);
    }

    @Override
    public void updatePassword(String username, String newPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public void deleteUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con username: " + username));

        if (Boolean.FALSE.equals(user.getEnabled())) {
            throw new RuntimeException("El usuario con username: " + username + " ya ha sido eliminado.");
        }

        user.setEnabled(false);
        userRepository.save(user);
    }
}
