// Interfaces para el formulario de registro
export interface RegistroRequest {
  nombreInstitucion: string;
  usuario: string;
  password: string;
  confirmPassword: string;
}

export interface RegistroFormData {
  nombreInstitucion: string;
  usuario: string;
  password: string;
  confirmPassword: string;
}

// Interfaces para la respuesta del servicio
export interface RegistroResponse {
  success: boolean;
  message: string;
  userId?: number;
  token?: string;
}

export interface RegistroError {
  success: false;
  message: string;
  errorCode?: string;
  validationErrors?: string[];
}

// Estados del componente
export interface RegistroState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
