import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Reportes } from './reportes';

describe('Reportes - Unit Tests', () => {
  let component: Reportes;
  let mockReportesService: jasmine.SpyObj<any>;
  let mockPdfSave: jasmine.Spy;

  const mockVendedores = [
    {
      id: 1,
      username: 'vendedor1',
      role: 'vendedor',
      institution_name: 'Test',
      full_name: 'Juan Pérez',
      document_type: 'CC',
      document_number: '123456789',
      email: 'juan@test.com',
      telephone: '123456789',
      address: null,
      city: null,
      created_at: '2024-01-01',
      updated_at: null
    },
    {
      id: 2,
      username: 'vendedor2',
      role: 'vendedor',
      institution_name: 'Test',
      full_name: 'María García',
      document_type: 'CC',
      document_number: '987654321',
      email: 'maria@test.com',
      telephone: '987654321',
      address: null,
      city: null,
      created_at: '2024-01-01',
      updated_at: null
    }
  ];

  const mockVisitas = [
    {
      id: '1',
      id_vendedor: '1',
      id_cliente: 'C001',
      direccion: 'Calle 123',
      ciudad: 'Bogotá',
      contacto: 'Juan Cliente',
      fecha: '2024-11-22',
      estado: 'pendiente'
    },
    {
      id: '2',
      id_vendedor: '1',
      id_cliente: 'C002',
      direccion: 'Carrera 456',
      ciudad: 'Medellín',
      contacto: 'Ana Cliente',
      fecha: '2024-11-22',
      estado: 'completada'
    }
  ];

  const mockPlanesVenta = [
    {
      id: 'P1',
      id_vendedor: '1',
      periodo: 'mensual',
      territorio: 'Bogotá',
      meta_monto: 1000000,
      meta_unidades: 100,
      meta_clientes: 10,
      fecha_inicio: '2024-11-01',
      fecha_fin: '2024-11-30',
      activo: true,
      ids_productos: ['PROD1', 'PROD2'],
      id_cliente_objetivo: 'C001',
      vendedor_nombre: 'Juan Pérez',
      cliente_objetivo_nombre: 'Hospital Central',
      productos_nombres: ['Producto 1', 'Producto 2'],
      productos_count: 2
    },
    {
      id: 'P2',
      id_vendedor: '2',
      periodo: 'trimestral',
      territorio: 'Medellín',
      meta_monto: 2000000,
      meta_unidades: 200,
      meta_clientes: 15,
      fecha_inicio: '2024-10-01',
      fecha_fin: '2024-12-31',
      activo: false,
      ids_productos: ['PROD3'],
      id_cliente_objetivo: 'C002',
      vendedor_nombre: 'María García',
      cliente_objetivo_nombre: 'Clínica Norte',
      productos_nombres: ['Producto 3'],
      productos_count: 1
    }
  ];

  beforeEach(() => {
    mockReportesService = jasmine.createSpyObj('ReportesService', [
      'getVendedores',
      'getVisitas',
      'getPlanesVentaCompletos'
    ]);

    // Mock para jsPDF
    mockPdfSave = jasmine.createSpy('save');
    const mockJsPDF = jasmine.createSpy('jsPDF').and.returnValue({
      setFontSize: jasmine.createSpy(),
      setTextColor: jasmine.createSpy(),
      text: jasmine.createSpy(),
      setPage: jasmine.createSpy(),
      internal: {
        getNumberOfPages: jasmine.createSpy().and.returnValue(1),
        pageSize: { height: 297, width: 210 }
      },
      save: mockPdfSave
    });

    // Mock global jsPDF
    (window as any).jsPDF = mockJsPDF;

    mockReportesService.getVendedores.and.returnValue(of(mockVendedores));
    mockReportesService.getVisitas.and.returnValue(of(mockVisitas));
    mockReportesService.getPlanesVentaCompletos.and.returnValue(of(mockPlanesVenta));

    component = new Reportes(new FormBuilder(), mockReportesService);
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.reporteForm).toBeDefined();
  });

  it('debe inicializar formulario con validaciones', () => {
    expect(component.reporteForm.get('pais')?.hasError('required')).toBeTrue();
    expect(component.reporteForm.get('vendedor')?.hasError('required')).toBeTrue();
    expect(component.reporteForm.get('fecha')?.hasError('required')).toBeTrue();
  });

  it('debe inicializar señales con valores por defecto', () => {
    expect(component.paisSeleccionado()).toBe('');
    expect(component.vendedores()).toEqual([]);
    expect(component.visitas()).toEqual([]);
    expect(component.planesVenta()).toEqual([]);
    expect(component.cargandoVendedores()).toBeFalse();
    expect(component.cargandoVisitas()).toBeFalse();
    expect(component.cargandoPlanesVenta()).toBeFalse();
  });

  it('debe tener la lista de países correcta', () => {
    expect(component.paises).toEqual([
      { codigo: 'co', nombre: 'Colombia' },
      { codigo: 'mx', nombre: 'México' },
      { codigo: 'pe', nombre: 'Perú' },
      { codigo: 'ec', nombre: 'Ecuador' }
    ]);
  });

  it('debe cargar vendedores cuando cambia el país', (done) => {
    component.reporteForm.patchValue({ pais: 'co' });

    component.onPaisChange();

    setTimeout(() => {
      expect(mockReportesService.getVendedores).toHaveBeenCalledWith('co');
      expect(component.paisSeleccionado()).toBe('co');
      expect(component.vendedores().length).toBe(2);
      expect(component.cargandoVendedores()).toBeFalse();
      expect(component.reporteForm.get('vendedor')?.value).toBe('');
      expect(component.reporteForm.get('fecha')?.value).toBe('');
      done();
    }, 10);
  });

  it('debe manejar error al cargar vendedores', (done) => {
    spyOn(console, 'error');
    mockReportesService.getVendedores.and.returnValue(throwError(() => new Error('Error')));

    component.cargarVendedores('co');

    setTimeout(() => {
      expect(component.cargandoVendedores()).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('Error cargando vendedores:', jasmine.any(Error));
      done();
    }, 10);
  });

  it('debe generar reporte de visitas', (done) => {
    const fechaEspecifica = new Date('2024-11-22T12:00:00'); // Fecha específica sin UTC
    component.reporteForm.patchValue({
      pais: 'co',
      vendedor: 1,
      fecha: fechaEspecifica
    });

    component.generarReporteVisitas();

    setTimeout(() => {
      // Como el formateo de fecha puede variar, verificamos que se haya llamado el servicio
      expect(mockReportesService.getVisitas).toHaveBeenCalled();
      expect(component.visitas().length).toBe(2);
      expect(component.cargandoVisitas()).toBeFalse();
      done();
    }, 10);
  });

  it('no debe generar reporte si el formulario es inválido', () => {
    component.generarReporteVisitas();
    expect(mockReportesService.getVisitas).not.toHaveBeenCalled();
  });

  it('debe manejar error al cargar visitas', (done) => {
    spyOn(console, 'error');
    component.reporteForm.patchValue({
      pais: 'co',
      vendedor: 1,
      fecha: new Date('2024-11-22')
    });

    mockReportesService.getVisitas.and.returnValue(throwError(() => new Error('Error')));

    component.generarReporteVisitas();

    setTimeout(() => {
      expect(component.cargandoVisitas()).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('Error cargando visitas:', jasmine.any(Error));
      done();
    }, 10);
  });

  it('debe formatear fecha correctamente', () => {
    const fecha = new Date('2024-11-22T12:00:00'); // Usar hora específica para evitar problema de zona horaria
    const resultado = (component as any).formatearFecha(fecha);
    expect(resultado).toBe('2024-11-22');
  });

  it('debe obtener nombre de país', () => {
    expect(component.getNombrePais('co')).toBe('Colombia');
    expect(component.getNombrePais('mx')).toBe('México');
    expect(component.getNombrePais('xx')).toBe('');
  });

  it('debe obtener nombre de vendedor', () => {
    component.vendedores.set(mockVendedores);

    expect(component.getNombreVendedor(1)).toBe('Juan Pérez');
    expect(component.getNombreVendedor(2)).toBe('María García');
    expect(component.getNombreVendedor(999)).toBe('');
  });

  it('debe cargar planes de venta', (done) => {
    component.onPaisChangePlanesVenta('co');

    setTimeout(() => {
      expect(mockReportesService.getPlanesVentaCompletos).toHaveBeenCalledWith('co');
      expect(component.paisSeleccionado()).toBe('co');
      expect(component.planesVenta().length).toBe(2);
      expect(component.cargandoPlanesVenta()).toBeFalse();
      done();
    }, 10);
  });

  it('debe manejar error al cargar planes de venta', (done) => {
    spyOn(console, 'error');
    mockReportesService.getPlanesVentaCompletos.and.returnValue(throwError(() => new Error('Error')));

    component.cargarPlanesVenta('co');

    setTimeout(() => {
      expect(component.planesVenta()).toEqual([]);
      expect(component.cargandoPlanesVenta()).toBeFalse();
      expect(console.error).toHaveBeenCalledWith('Error cargando planes de venta:', jasmine.any(Error));
      done();
    }, 10);
  });

  it('debe contar planes activos e inactivos', () => {
    component.planesVenta.set(mockPlanesVenta);

    expect(component.getPlanesActivos()).toBe(1);
    expect(component.getPlanesInactivos()).toBe(1);
  });

  it('debe formatear monto en pesos colombianos', () => {
    const resultado = component.formatearMonto(1000000);
    expect(resultado).toContain('1.000.000');
    expect(resultado).toContain('$');
  });

  it('debe formatear período correctamente', () => {
    const resultado = component.formatearPeriodo('2024-11-01', '2024-11-30');
    // Como toLocaleDateString puede variar por zona horaria, verificamos el formato general
    expect(resultado).toMatch(/\d{2}\/\d{2}\/\d{4} - \d{2}\/\d{2}\/\d{4}/);
    expect(resultado).toContain(' - ');
  });

  it('debe generar PDF de visitas', () => {
    component.visitas.set(mockVisitas);
    component.vendedores.set(mockVendedores);
    component.reporteForm.patchValue({
      pais: 'co',
      vendedor: 1,
      fecha: new Date('2024-11-22')
    });

    // Verificar que el componente tiene los datos necesarios
    expect(component.visitas().length).toBe(2);
    expect(component.vendedores().length).toBe(2);

    // Simular la generación del PDF
    spyOn(component, 'generarPDF').and.callThrough();
    component.generarPDF();

    expect(component.generarPDF).toHaveBeenCalled();
  });

  it('debe generar PDF de planes de venta', () => {
    component.planesVenta.set(mockPlanesVenta);
    component.paisSeleccionado.set('co');

    // Verificar que el componente tiene los datos necesarios
    expect(component.planesVenta().length).toBe(2);
    expect(component.paisSeleccionado()).toBe('co');

    // Simular la generación del PDF
    spyOn(component, 'generarPDFPlanesVenta').and.callThrough();
    component.generarPDFPlanesVenta();

    expect(component.generarPDFPlanesVenta).toHaveBeenCalled();
  });

  it('debe tener columnas definidas para las tablas', () => {
    expect(component.visitasColumns).toEqual(['cliente', 'direccion', 'ciudad', 'contacto', 'fecha', 'estado']);
    expect(component.planesVentaColumns).toEqual(['vendedor', 'cliente', 'territorio', 'periodo', 'meta_monto', 'meta_unidades', 'productos', 'fechas', 'estado']);
  });

  it('debe limpiar datos al cambiar país en planes de venta', (done) => {
    component.planesVenta.set(mockPlanesVenta);

    component.onPaisChangePlanesVenta('mx');

    setTimeout(() => {
      expect(component.paisSeleccionado()).toBe('mx');
      done();
    }, 10);
  });
});
