export interface Reporte {
  id: number;
  nombre: string;
  tipo: string;
  fecha: string;
}

export interface Vendedor {
  id: number;
  username: string;
  role: string;
  institution_name: string;
  full_name: string;
  document_type: string;
  document_number: string;
  email: string;
  telephone: string;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Visita {
  id: string;
  id_vendedor: string;
  id_cliente: string;
  direccion: string;
  ciudad: string;
  contacto: string;
  fecha: string;
  estado: string;
}

export interface VendedoresResponse {
  vendedores: Vendedor[];
}

export interface VisitasResponse {
  visitas: Visita[];
}
