// Interface para el producto de la lista
export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  categoria: string;
  controlado: boolean;
}

// Interface para la ubicación del producto
export interface UbicacionProducto {
  ubicacion_id: string;
  bodega_id: string;
  ciudad: string;
  pasillo: string;
  estante: string;
  posicion: string;
  cantidad: number;
}

// Interface para la respuesta de productos
export interface ProductosResponse {
  productos: Producto[];
  total: number;
}
