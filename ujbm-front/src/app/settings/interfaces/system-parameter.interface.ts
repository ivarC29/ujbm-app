export interface SystemParameter {
  key: string;
  value: string;
  description: string;
  dataType: string;
  editable: boolean;
}

export interface SystemParameterDto {
  key: string;
  value: string;
  description: string;
  dataType: string;
}