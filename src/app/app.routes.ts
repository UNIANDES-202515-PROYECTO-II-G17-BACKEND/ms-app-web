import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro.component').then(m => m.RegistroComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
    // TODO: Descomentar las children routes cuando se creen los componentes
    /*
    children: [
      // Rutas de Proveedores
      { path: 'proveedores/registro', loadComponent: () => import('./proveedores/registro-proveedores/registro-proveedores.component').then(m => m.RegistroProveedoresComponent) },
      { path: 'proveedores/carga-individual', loadComponent: () => import('./proveedores/carga-individual/carga-individual.component').then(m => m.CargaIndividualComponent) },
      { path: 'proveedores/carga-masiva', loadComponent: () => import('./proveedores/carga-masiva/carga-masiva.component').then(m => m.CargaMasivaComponent) },

      // Rutas de Vendedores
      { path: 'vendedores/registro', loadComponent: () => import('./vendedores/registro-vendedores/registro-vendedores.component').then(m => m.RegistroVendedoresComponent) },
      { path: 'vendedores/plan-venta', loadComponent: () => import('./vendedores/plan-venta/plan-venta.component').then(m => m.PlanVentaComponent) },

      // Ruta de Productos (sin submenús)
      { path: 'productos', loadComponent: () => import('./productos/productos.component').then(m => m.ProductosComponent) },

      // Rutas de Pedidos
      { path: 'pedidos/consulta', loadComponent: () => import('./pedidos/consulta-pedidos/consulta-pedidos.component').then(m => m.ConsultaPedidosComponent) },
      { path: 'pedidos/generar-ruta', loadComponent: () => import('./pedidos/generar-ruta/generar-ruta.component').then(m => m.GenerarRutaComponent) },
      { path: 'pedidos/crear', loadComponent: () => import('./pedidos/crear-pedido/crear-pedido.component').then(m => m.CrearPedidoComponent) },
      { path: 'pedidos/estado', loadComponent: () => import('./pedidos/estado-pedido/estado-pedido.component').then(m => m.EstadoPedidoComponent) },

      // Ruta de Reportes (sin submenús)
      { path: 'reportes', loadComponent: () => import('./reportes/reportes.component').then(m => m.ReportesComponent) }
    ]
    */
  },
  { path: '**', redirectTo: '/login' }
];
