package pe.edu.bausate.app.infraestructure.config;

public class ApiPaths {
    private static final String VERSION = "v1";

    public static final String API_BASE = "/api/" + VERSION;
    public static final String ACTUATOR = "/actuator";
    public static final String DOCUMENTATION = "/ujbm-docs";
    public static final String SWAGGER_UI = "/swagger-ui";
    public static final String SWAGGER_RESOURCES = "/v3/api-docs";
    public static final String AUTH = API_BASE + "/auth";
    public static final String REPORT = API_BASE + "/report";
    public static final String PUBLIC_LEVEL = API_BASE + "/public";
    public static final String ADMIN_LEVEL =  API_BASE + "/admin";
    public static final String STUDENT_LEVEL = API_BASE + "/student";
    public static final String TEACHER_LEVEL = API_BASE + "/teacher";
    public static final String INTERVIEWER_LEVEL = API_BASE + "/interviewer";

    // Public endpoints
    public static final String ENUMS_PUBLIC = PUBLIC_LEVEL +"/enums";
    public static final String PROGRAM_PUBLIC = PUBLIC_LEVEL + "/program";
    public static final String APPLICANT_PUBLIC = PUBLIC_LEVEL + "/applicant";
    public static final String UBIGEO_PUBLIC =  PUBLIC_LEVEL +"/ubigeo";
    public static final String GOVERNMENT_PUBLIC = PUBLIC_LEVEL + "/government";

    // Admin endpoints
    public static final String APPLICANT_ADMIN = ADMIN_LEVEL + "/applicant";
    public static final String COURSE_SECTION_ADMIN = ADMIN_LEVEL + "/course-section";
    public static final String COURSE_ADMIN = ADMIN_LEVEL + "/course";
    public static final String PARAMETER_ADMIN = ADMIN_LEVEL + "/system-parameter";
    public static final String TEACHER_ADMIN = ADMIN_LEVEL + "/teacher";
    public static final String STUDENT_ADMIN = ADMIN_LEVEL + "/student";
    public static final String ACADEMIC_PERIOD_ADMIN = ADMIN_LEVEL + "/academic-period";
    public static final String ENROLLMENT_ADMIN = ADMIN_LEVEL + "/enrollment";
    public static final String DASHBOARD_ADMIN = ADMIN_LEVEL + "/dashboard";
    public static final String EXAM_ADMIN = ADMIN_LEVEL + "/exam";
    public static final String INTERVIEWER_ADMIN = ADMIN_LEVEL + "/interviewer";
    public static final String APPOINTMENT_ADMIN = ADMIN_LEVEL + "/appointment";
    // Student endpoints
    public static final String COURSE_SECTION_STUDENT = STUDENT_LEVEL + "/course-section";
    public static final String ENROLLMENT_STUDENT = STUDENT_LEVEL + "/enrollment";

    // Teacher endpoints
    public static final String COURSE_SECTION_TEACHER = TEACHER_LEVEL + "/course-section";

    //interviewer endpoints

}
