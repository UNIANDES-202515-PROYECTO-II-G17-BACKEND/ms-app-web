import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  // Datos del usuario
  usuario = {
    nombre: '',
    avatar: 'person'
  };

  // Estado de expansión de menús
  expandedMenus: { [key: string]: boolean } = {};

  // Opciones del menú con submenús
  menuItems = [
    {
      label: 'Proveedores',
      icon: 'business',
      key: 'proveedores',
      subItems: [
        { label: 'Registro de proveedores', route: '/home/proveedores/registro' },
        { label: 'Carga de productos individual', route: '/home/proveedores/carga-individual' },
        { label: 'Carga de productos masivo', route: '/home/proveedores/carga-masiva' }
      ]
    },
    {
      label: 'Vendedores',
      icon: 'people',
      key: 'vendedores',
      subItems: [
        { label: 'Registro de vendedores', route: '/home/vendedores/registro' },
        { label: 'Creación de plan de venta', route: '/home/vendedores/plan-venta' }
      ]
    },
    {
      label: 'Carga de productos',
      icon: 'upload',
      key: 'productos',
      subItems: [
        { label: 'Carga individual de productos', route: '/home/productos/carga-individual' },
        { label: 'Carga masiva de productos', route: '/home/productos/carga-masiva' }
      ]
    },
    {
      label: 'Pedidos',
      icon: 'shopping_cart',
      key: 'pedidos',
      subItems: [
        { label: 'Consulta de pedidos', route: '/home/pedidos/consulta' },
        { label: 'Generar ruta', route: '/home/pedidos/generar-ruta' },
        { label: 'Crear pedido', route: '/home/pedidos/crear' },
        { label: 'Ver estado de pedido', route: '/home/pedidos/estado' }
      ]
    },
    {
      label: 'Reportes',
      icon: 'assessment',
      key: 'reportes',
      route: '/home/reportes' // Sin submenús
    }
  ];

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    // Solo acceder a localStorage en el navegador (no en SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Obtener el username del token JWT
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.usuario.nombre = payload.username || 'Usuario';
        } catch (error) {
          console.error('Error al decodificar token:', error);
          this.usuario.nombre = 'Usuario';
        }
      }
    }
  }

  // Método para expandir/contraer menú
  toggleMenu(menuKey: string): void {
    this.expandedMenus[menuKey] = !this.expandedMenus[menuKey];
  }

  // Verificar si un menú está expandido
  isMenuExpanded(menuKey: string): boolean {
    return this.expandedMenus[menuKey] || false;
  }

  // Navegar a ruta directa (sin submenús)
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  // Verificar si hay una ruta activa (para ocultar el logo)
  hasActiveRoute(): boolean {
    return this.router.url !== '/home';
  }

  // Método para logout
  logout(): void {
    // Limpiar token y navegar al login (solo en browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.router.navigate(['/login']);
  }
}
