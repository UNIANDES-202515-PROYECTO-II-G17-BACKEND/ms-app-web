export interface CargaMasivaResponse {
  message: string;
  productos_procesados?: number;
  productos_exitosos?: number;
  productos_fallidos?: number;
  errores?: any[];
}
