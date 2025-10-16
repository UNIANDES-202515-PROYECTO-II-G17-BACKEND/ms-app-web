export interface VendedorRequest {
  username: string;
  role: string;
  institution_name: string;
  password: string;
  full_name: string;
  document_type: string;
  document_number: string;
  telephone: string;
  email: string;
}

export interface VendedorResponse {
  message: string;
  vendedor?: any;
}
