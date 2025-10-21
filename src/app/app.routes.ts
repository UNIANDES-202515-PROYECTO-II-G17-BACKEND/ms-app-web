import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
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
    loadComponent: () => import('./home/home.component').then(m => m.HomeComponent),
    children: [
      // Rutas de Proveedores
      { path: 'proveedores/registro', loadComponent: () => import('./proveedores/registro-proveedores/registro-proveedores').then(m => m.RegistroProveedores) },
      { path: 'proveedores/carga-individual', loadComponent: () => import('./proveedores/carga-individual/carga-individual').then(m => m.CargaIndividual) },
      { path: 'proveedores/carga-masiva', loadComponent: () => import('./proveedores/carga-masiva/carga-masiva').then(m => m.CargaMasiva) },

      // Rutas de Vendedores
      { path: 'vendedores/registro', loadComponent: () => import('./vendedores/registro-vendedores/registro-vendedores').then(m => m.RegistroVendedores) },
      { path: 'vendedores/plan-venta', loadComponent: () => import('./vendedores/plan-venta/plan-venta').then(m => m.PlanVenta) },

      // Ruta de Productos (consulta de productos)
      { path: 'productos', loadComponent: () => import('./productos/productos').then(m => m.Productos) },

      // Rutas de Pedidos
      { path: 'pedidos/consulta', loadComponent: () => import('./pedidos/consulta-pedidos/consulta-pedidos').then(m => m.ConsultaPedidos) },
      { path: 'pedidos/generar-ruta', loadComponent: () => import('./pedidos/generar-ruta/generar-ruta').then(m => m.GenerarRuta) },
      { path: 'pedidos/crear', loadComponent: () => import('./pedidos/crear-pedido/crear-pedido').then(m => m.CrearPedido) },
      { path: 'pedidos/estado', loadComponent: () => import('./pedidos/estado-pedido/estado-pedido').then(m => m.EstadoPedido) },

      // Ruta de Reportes
      { path: 'reportes', loadComponent: () => import('./reportes/reportes').then(m => m.Reportes) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
