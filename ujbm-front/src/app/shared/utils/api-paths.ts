import { environment } from "@environments/environment";

export class ApiPaths {
   private static readonly HOST = environment.backendUrl;
  private static readonly VERSION = environment.backendVersion;
  private static readonly API_PREFIX = environment.apiPrefix;
  
  // Base paths
  public static readonly API_BASE = `${ApiPaths.API_PREFIX}/${ApiPaths.VERSION}`;
  public static readonly ROOT = ApiPaths.API_BASE;
  public static readonly AUTH = `${ApiPaths.API_BASE}/auth`;
  public static readonly PUBLIC_LEVEL = `${ApiPaths.API_BASE}/public`;
  public static readonly ADMIN_LEVEL = `${ApiPaths.API_BASE}/admin`;
  public static readonly TEACHER_LEVEL = `${ApiPaths.API_BASE}/teacher`;
  public static readonly STUDENT_LEVEL = `${ApiPaths.API_BASE}/student`;
   
  //ENUM
  public static readonly ENUMS = `${ApiPaths.PUBLIC_LEVEL}/enums`;
  public static readonly ENUM_ENROLLLMENT_STATUS_PUBLIC = `${ApiPaths.ENUMS}/enrollment-status`;
  public static readonly ENUM_ENROLLMENT_DETAIL_STATUS_PUBLIC = `${ApiPaths.ENUMS}/enrollment-detail-status`;
  public static readonly ENUM_VALUE_TYPE_PUBLIC = `${ApiPaths.ENUMS}/value-type`;

  // Public endpoints
  public static readonly ENUMS_PUBLIC = `${ApiPaths.PUBLIC_LEVEL}/enums`;
  public static readonly PROGRAM_PUBLIC = `${ApiPaths.PUBLIC_LEVEL}/program`;
  public static readonly APPLICANT_PUBLIC = `${ApiPaths.PUBLIC_LEVEL}/applicant`;
  public static readonly UBIGEO_PUBLIC = `${ApiPaths.PUBLIC_LEVEL}/ubigeo`;
  public static readonly GOVERNMENT_PUBLIC = `${ApiPaths.PUBLIC_LEVEL}/government`;
 
  // Admin endpoints
  public static readonly APPLICANT_ADMIN = `${ApiPaths.ADMIN_LEVEL}/applicant`;
  public static readonly COURSE_SECTION_ADMIN = `${ApiPaths.ADMIN_LEVEL}/course-section`;
  public static readonly COURSE_ADMIN = `${ApiPaths.ADMIN_LEVEL}/course`;
  public static readonly STUDENT_ADMIN = `${ApiPaths.ADMIN_LEVEL}/student`;
  public static readonly PARAMETER_ADMIN = `${ApiPaths.ADMIN_LEVEL}/system-parameter`;
  public static readonly TEACHER_ADMIN = `${ApiPaths.ADMIN_LEVEL}/teacher`;
  public static readonly ACADEMIC_PERIOD_ADMIN = `${ApiPaths.ADMIN_LEVEL}/academic-period`;
  public static readonly ENROLLMENT_ADMIN = `${ApiPaths.ADMIN_LEVEL}/enrollment`;
  public static readonly DASHBOARD_ADMIN = `${ApiPaths.ADMIN_LEVEL}/dashboard`;
  public static readonly EXAM_ADMIN = `${ApiPaths.ADMIN_LEVEL}/exam`;

  //teacher endpoints
  public static readonly COURSE_SECTION_TEACHER = `${ApiPaths.TEACHER_LEVEL}/course-section`;

  //student endpoint
  public static readonly ENROLLMENT_STUDENT = `${ApiPaths.STUDENT_LEVEL}/enrollment`;

  
  public static getFullUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${this.HOST}/${cleanPath}`;
  }
}
