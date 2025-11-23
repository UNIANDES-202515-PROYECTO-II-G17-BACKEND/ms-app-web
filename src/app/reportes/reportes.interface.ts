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

export interface PlanVenta {
  id: string;
  id_vendedor: string;
  periodo: string;
  territorio: string;
  meta_monto: number;
  meta_unidades: number;
  meta_clientes: number;
  fecha_inicio: string;
  fecha_fin: string;
  activo: boolean;
  ids_productos: string[];
  id_cliente_objetivo: string;
}

export interface Usuario {
  id: number;
  username: string;
  role: string;
  institution_name: string | null;
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
  stock_total: number;
  certificaciones: any[];
  lotes: any[];
}

export interface PlanVentaCompleto extends PlanVenta {
  vendedor_nombre: string;
  cliente_objetivo_nombre: string;
  productos_nombres: string[];
  productos_count: number;
}
