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

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  controlado: boolean;
}

export interface ClienteInstitucional {
  id: number;
  username: string;
  role: string;
  institution_name: string | null;
  full_name: string;
  document_type: string | null;
  document_number: string | null;
  email: string | null;
  telephone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface PlanVentaRequest {
  id_vendedor: string;
  periodo: string;
  territorio: string;
  meta_monto: number;
  meta_unidades: number;
  meta_clientes: number;
  fecha_inicio: string;
  fecha_fin: string;
  ids_productos: string[];
  id_cliente_objetivo: string;
}

export interface PlanVentaResponse {
  message?: string;
  id?: string;
  [key: string]: any;
}
