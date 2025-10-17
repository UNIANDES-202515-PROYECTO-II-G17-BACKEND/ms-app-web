export interface ProveedorRequest {
  nombre: string;
  tipo_de_persona: 'NATURAL' | 'JURIDICA';
  documento: string;
  tipo_documento: string;
  pais: string;
  direccion: string;
  telefono: string;
  email: string;
  pagina_web: string;
  activo: boolean;
}

export interface ProveedorResponse {
  message?: string;
  id?: string;
}
