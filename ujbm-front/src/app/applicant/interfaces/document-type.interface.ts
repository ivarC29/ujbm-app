export interface DocumentType {
    code: string;
    label: string;
  }
  
  export interface DocumentTypeResponse {
    data: DocumentType[];
  }

 export interface ReniecResponse {
    nombres: string;
    apellidoPaterno: string;
    apellidoMaterno: string;
    nombreCompleto: string;
    tipoDocumento: string;
    numeroDocumento: string;
    digitoVerificador: string;
  }

  export interface SunatResponse {
  name: string;
  lastname: string;
}