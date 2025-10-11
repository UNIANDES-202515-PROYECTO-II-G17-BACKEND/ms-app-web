// Interfaces para el formulario de login
export interface LoginRequest {
  usuario: string;
  password: string;
}

export interface LoginFormData {
  usuario: string;
  password: string;
}

// Interfaces para la respuesta del servicio
export interface LoginResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export interface LoginError {
  success: false;
  message: string;
  errorCode?: string;
}

// Interface del usuario
export interface User {
  id: number;
  nombre: string;
  email: string;
  role?: string;
  avatar?: string;
}

// Estados del componente
export interface LoginState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

// Configuración del formulario
export interface LoginFormConfig {
  usuarioMinLength?: number;
  passwordMinLength?: number;
  rememberUser?: boolean;
}
