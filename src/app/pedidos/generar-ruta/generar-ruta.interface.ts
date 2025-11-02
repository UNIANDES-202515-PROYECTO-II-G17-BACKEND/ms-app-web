export interface ItemPedido {
  producto_id: string;
  cantidad: number;
  precio_unitario: string;
  impuesto_pct: string;
  descuento_pct: string | null;
  sku: string | null;
  ubicacion_id: string | null;
}

export interface Pedido {
  id: string;
  codigo: string;
  tipo: string;
  estado: string;
  proveedor_id: string | null;
  oc_id: string | null;
  cliente_id: number;
  vendedor_id: number;
  bodega_origen_id: string;
  bodega_destino_id: string | null;
  total: string;
  items: ItemPedido[];
  fecha_compromiso: string;
}

export interface GenerarRutaResponse {
  message?: string;
  ruta_id?: string;
  fecha?: string;
  pedidos_incluidos?: number;
  [key: string]: any;
}
