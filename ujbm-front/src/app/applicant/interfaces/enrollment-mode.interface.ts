export interface EnrollmentMode {
    code: string;
    label: string;
    description?: string;
  }



export interface EnumOptionResponse {
  code: string;
  name?: string;
  label: string;
  description: string;
}

//
export interface EnrollmentModeResponse extends EnumOptionResponse {}