import { PLATFORM_ID } from '@angular/core';

import { HomeComponent } from './home.component';

describe('HomeComponent - Unit Tests', () => {
  let component: HomeComponent;
  let mockRouter: jasmine.SpyObj<any>;
  let mockPlatformId: Object;

  beforeEach(() => {
    // Crear mocks
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockPlatformId = 'browser'; // Simular plataforma browser

    // Mock de localStorage
    spyOn(localStorage, 'getItem');
    spyOn(localStorage, 'removeItem');

    // Mock de atob para decodificar JWT
    spyOn(window, 'atob');

    // Crear instancia del componente directamente
    component = new HomeComponent(mockRouter, mockPlatformId);
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.usuario).toBeDefined();
    expect(component.menuItems).toBeDefined();
    expect(component.expandedMenus).toBeDefined();
  });

  it('should initialize with default user data', () => {
    expect(component.usuario.nombre).toBe('');
    expect(component.usuario.avatar).toBe('person');
  });

  it('should have correct menu structure', () => {
    expect(component.menuItems).toHaveSize(5);

    // Verificar menú Proveedores
    const proveedoresMenu = component.menuItems.find(item => item.key === 'proveedores');
    expect(proveedoresMenu).toBeDefined();
    expect(proveedoresMenu?.subItems).toHaveSize(3);

    // Verificar menú Vendedores
    const vendedoresMenu = component.menuItems.find(item => item.key === 'vendedores');
    expect(vendedoresMenu).toBeDefined();
    expect(vendedoresMenu?.subItems).toHaveSize(2);

    // Verificar menú Productos (tiene subItems)
    const productosMenu = component.menuItems.find(item => item.key === 'productos');
    expect(productosMenu).toBeDefined();
    expect(productosMenu?.subItems).toBeDefined();
    expect(productosMenu?.subItems).toHaveSize(2);
    expect(productosMenu?.subItems).toEqual([
      { label: 'Carga individual de productos', route: '/home/productos/carga-individual' },
      { label: 'Carga masiva de productos', route: '/home/productos/carga-masiva' }
    ]);

    // Verificar menú Reportes (sin subItems, ruta directa)
    const reportesMenu = component.menuItems.find(item => item.key === 'reportes');
    expect(reportesMenu).toBeDefined();
    expect(reportesMenu?.route).toBe('/home/reportes');
    expect(reportesMenu?.subItems).toBeUndefined();
  });

  it('should decode token and set username on ngOnInit', () => {
    const mockToken = 'header.eyJ1c2VybmFtZSI6InRlc3R1c2VyIn0.signature';
    const decodedPayload = '{"username":"testuser"}';

    (localStorage.getItem as jasmine.Spy).and.returnValue(mockToken);
    (window.atob as jasmine.Spy).and.returnValue(decodedPayload);

    component.ngOnInit();

    expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
    expect(window.atob).toHaveBeenCalledWith('eyJ1c2VybmFtZSI6InRlc3R1c2VyIn0');
    expect(component.usuario.nombre).toBe('testuser');
  });

  it('should handle missing token on ngOnInit', () => {
    (localStorage.getItem as jasmine.Spy).and.returnValue(null);

    component.ngOnInit();

    expect(localStorage.getItem).toHaveBeenCalledWith('access_token');
    expect(window.atob).not.toHaveBeenCalled();
    // El nombre permanece vacío
    expect(component.usuario.nombre).toBe('');
  });

  it('should handle invalid token on ngOnInit', () => {
    const mockToken = 'invalid.token.format';

    (localStorage.getItem as jasmine.Spy).and.returnValue(mockToken);
    (window.atob as jasmine.Spy).and.throwError('Invalid token');

    spyOn(console, 'error');

    component.ngOnInit();

    expect(console.error).toHaveBeenCalledWith('Error al decodificar token:', jasmine.any(Error));
    expect(component.usuario.nombre).toBe('Usuario');
  });

  it('should toggle menu expansion', () => {
    const menuKey = 'proveedores';

    // Inicialmente no expandido
    expect(component.isMenuExpanded(menuKey)).toBeFalse();

    // Expandir menú
    component.toggleMenu(menuKey);
    expect(component.isMenuExpanded(menuKey)).toBeTrue();

    // Contraer menú
    component.toggleMenu(menuKey);
    expect(component.isMenuExpanded(menuKey)).toBeFalse();
  });

  it('should return false for non-expanded menus', () => {
    expect(component.isMenuExpanded('nonexistent')).toBeFalse();
  });

  it('should navigate to specified route', () => {
    const testRoute = '/home/productos';

    component.navigateTo(testRoute);

    expect(mockRouter.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should detect active route correctly', () => {
    // Mock del router.url
    Object.defineProperty(mockRouter, 'url', {
      writable: true,
      value: '/home'
    });

    expect(component.hasActiveRoute()).toBeFalse();

    // Cambiar a una ruta activa
    mockRouter.url = '/home/productos';
    expect(component.hasActiveRoute()).toBeTrue();
  });

  it('should logout and clear token', () => {
    component.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('access_token');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle token with missing username', () => {
    const mockToken = 'header.eyJ1c2VyaWQiOjEyM30.signature';
    const decodedPayload = '{"userid":123}'; // Sin username

    (localStorage.getItem as jasmine.Spy).and.returnValue(mockToken);
    (window.atob as jasmine.Spy).and.returnValue(decodedPayload);

    component.ngOnInit();

    expect(component.usuario.nombre).toBe('Usuario');
  });

  it('should handle multiple menu toggles', () => {
    const menu1 = 'proveedores';
    const menu2 = 'vendedores';

    // Expandir ambos menús
    component.toggleMenu(menu1);
    component.toggleMenu(menu2);

    expect(component.isMenuExpanded(menu1)).toBeTrue();
    expect(component.isMenuExpanded(menu2)).toBeTrue();

    // Contraer solo el primero
    component.toggleMenu(menu1);

    expect(component.isMenuExpanded(menu1)).toBeFalse();
    expect(component.isMenuExpanded(menu2)).toBeTrue();
  });

  it('should not access localStorage in server environment', () => {
    // Crear componente con plataforma server
    const serverComponent = new HomeComponent(mockRouter, 'server');

    serverComponent.ngOnInit();

    // No debe acceder a localStorage
    expect(localStorage.getItem).not.toHaveBeenCalled();
    expect(serverComponent.usuario.nombre).toBe('');
  });

  it('should not remove localStorage in server environment during logout', () => {
    // Crear componente con plataforma server
    const serverComponent = new HomeComponent(mockRouter, 'server');

    serverComponent.logout();

    // No debe acceder a localStorage pero sí navegar
    expect(localStorage.removeItem).not.toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
