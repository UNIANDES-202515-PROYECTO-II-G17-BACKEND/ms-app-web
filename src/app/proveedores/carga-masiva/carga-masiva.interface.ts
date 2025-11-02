export interface Proveedor {
  nombre: string;
  tipo_de_persona: 'NATURAL' | 'JURIDICA';
  documento: string;
  tipo_documento: string;
  pais: string;
  direccion: string;
  telefono: string;
  email: string;
  pagina_web: string | null;
  activo: boolean;
  id: string;
}

export interface CargaMasivaResponse {
  total: number;
  insertados: number;
  errores: any[];
}
