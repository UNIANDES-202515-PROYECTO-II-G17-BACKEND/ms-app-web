// Interface para listar proveedores
export interface Proveedor {
  id: string;
  nombre: string;
  tipo_de_persona: string;
  documento: string;
  tipo_documento: string;
  pais: string;
  direccion: string;
  telefono: string;
  email: string;
  pagina_web: string;
  activo: boolean;
}

// Interface para crear producto
export interface ProductoRequest {
  sku: string;
  nombre: string;
  categoria: string;
  temp_min: number;
  temp_max: number;
  controlado: boolean;
}

export interface ProductoResponse {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  controlado: boolean;
}

// Interface para asociar producto con proveedor
export interface ProductoProveedorRequest {
  producto_id: string;
  sku_proveedor: string;
  precio: number;
  moneda: string;
  lead_time_dias: number;
  lote_minimo: number;
  activo: boolean;
}

export interface ProductoProveedorResponse {
  message: string;
}
