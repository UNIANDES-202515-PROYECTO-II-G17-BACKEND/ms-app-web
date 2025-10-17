export interface ProductoRequest {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: number;
  stock: number;
  proveedor_id?: string;
  activo: boolean;
}

export interface ProductoResponse {
  message: string;
  producto?: any;
}
