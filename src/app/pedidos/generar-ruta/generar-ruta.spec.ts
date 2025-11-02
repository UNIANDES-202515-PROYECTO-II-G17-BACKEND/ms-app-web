import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { GenerarRuta } from './generar-ruta';

describe('GenerarRuta - Unit Tests', () => {
  let component: GenerarRuta;
  let mockGenerarRutaService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  const mockPedidos = [
    {
      id: '1',
      codigo: 'PED001',
      tipo: 'VENTA',
      estado: 'APROBADO',
      proveedor_id: null,
      oc_id: null,
      cliente_id: 1,
      vendedor_id: 1,
      bodega_origen_id: 'B001',
      bodega_destino_id: null,
      total: '1000.00',
      items: [],
      fecha_compromiso: '2024-11-15'
    },
    {
      id: '2',
      codigo: 'PED002',
      tipo: 'VENTA',
      estado: 'APROBADO',
      proveedor_id: null,
      oc_id: null,
      cliente_id: 2,
      vendedor_id: 1,
      bodega_origen_id: 'B001',
      bodega_destino_id: null,
      total: '2000.00',
      items: [],
      fecha_compromiso: '2024-11-15'
    },
    {
      id: '3',
      codigo: 'PED003',
      tipo: 'VENTA',
      estado: 'PENDIENTE',
      proveedor_id: null,
      oc_id: null,
      cliente_id: 3,
      vendedor_id: 1,
      bodega_origen_id: 'B001',
      bodega_destino_id: null,
      total: '1500.00',
      items: [],
      fecha_compromiso: '2024-11-16'
    },
    {
      id: '4',
      codigo: 'PED004',
      tipo: 'VENTA',
      estado: 'APROBADO',
      proveedor_id: null,
      oc_id: null,
      cliente_id: 4,
      vendedor_id: 2,
      bodega_origen_id: 'B002',
      bodega_destino_id: null,
      total: '3000.00',
      items: [],
      fecha_compromiso: '2024-11-16'
    }
  ];

  beforeEach(() => {
    mockGenerarRutaService = jasmine.createSpyObj('GenerarRutaService', [
      'obtenerPedidos',
      'generarRuta'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockGenerarRutaService.obtenerPedidos.and.returnValue(of(mockPedidos));

    component = new GenerarRuta(
      new FormBuilder(),
      mockGenerarRutaService,
      mockRouter,
      mockDialog
    );

    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.rutaForm).toBeDefined();
  });

  it('debe inicializar formulario con campo fecha requerido', () => {
    expect(component.rutaForm.get('fecha')?.value).toBe('');
    expect(component.rutaForm.get('fecha')?.hasError('required')).toBeTrue();
  });

  it('debe inicializar señales con valores por defecto', () => {
    const newComponent = new GenerarRuta(
      new FormBuilder(),
      mockGenerarRutaService,
      mockRouter,
      mockDialog
    );

    expect(newComponent.fechasDisponibles()).toEqual([]);
    expect(newComponent.pedidosAprobados()).toEqual([]);
    expect(newComponent.loadingPedidos()).toBeFalse();
    expect(newComponent.generandoRuta()).toBeFalse();
    expect(newComponent.error()).toBeNull();
    expect(newComponent.country).toBe('co');
  });

  it('debe cargar y filtrar pedidos aprobados al inicializar', (done) => {
    setTimeout(() => {
      expect(mockGenerarRutaService.obtenerPedidos).toHaveBeenCalledWith('co');
      expect(component.loadingPedidos()).toBeFalse();

      // Debe filtrar solo los pedidos APROBADOS (3 de 4)
      expect(component.pedidosAprobados().length).toBe(3);
      expect(component.pedidosAprobados().every(p => p.estado === 'APROBADO')).toBeTrue();

      // Debe extraer fechas únicas ordenadas
      expect(component.fechasDisponibles()).toEqual(['2024-11-15', '2024-11-16']);

      expect(component.error()).toBeNull();
      done();
    }, 10);
  });

  it('debe manejar error al cargar pedidos', (done) => {
    mockGenerarRutaService.obtenerPedidos.and.returnValue(throwError(() => new Error('Error de red')));

    component.cargarPedidos();

    setTimeout(() => {
      expect(component.loadingPedidos()).toBeFalse();
      expect(component.error()).toBe('Error al cargar los pedidos. Por favor, intente nuevamente.');
      expect(component.fechasDisponibles()).toEqual([]);
      expect(component.pedidosAprobados()).toEqual([]);
      done();
    }, 10);
  });

  it('debe contar pedidos por fecha correctamente', (done) => {
    setTimeout(() => {
      const pedidos15 = component.getPedidosPorFecha('2024-11-15');
      const pedidos16 = component.getPedidosPorFecha('2024-11-16');
      const pedidosInexistente = component.getPedidosPorFecha('2024-12-01');

      expect(pedidos15).toBe(2); // PED001 y PED002
      expect(pedidos16).toBe(1); // PED004 (PED003 no está aprobado)
      expect(pedidosInexistente).toBe(0);
      done();
    }, 10);
  });

  it('no debe enviar si el formulario es inválido', () => {
    component.onSubmit();

    expect(mockGenerarRutaService.generarRuta).not.toHaveBeenCalled();
    expect(component.generandoRuta()).toBeFalse();
  });

  it('debe generar ruta exitosamente', (done) => {
    component.rutaForm.patchValue({
      fecha: '2024-11-15'
    });

    const mockResponse = {
      message: 'Ruta generada exitosamente',
      ruta_id: 'RUTA123',
      fecha: '2024-11-15',
      pedidos_incluidos: 2
    };

    mockGenerarRutaService.generarRuta.and.returnValue(of(mockResponse));

    component.onSubmit();

    setTimeout(() => {
      expect(mockGenerarRutaService.generarRuta).toHaveBeenCalledWith('2024-11-15', 'co');
      expect(component.generandoRuta()).toBeFalse();
      expect(component.error()).toBeNull();

      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.type).toBe('success');
      expect(dialogData.message).toBe('Ruta generada exitosamente');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe generar ruta con mensaje por defecto si no viene en respuesta', (done) => {
    component.rutaForm.patchValue({
      fecha: '2024-11-16'
    });

    const mockResponse = {
      ruta_id: 'RUTA456',
      fecha: '2024-11-16'
    };

    mockGenerarRutaService.generarRuta.and.returnValue(of(mockResponse));

    component.onSubmit();

    setTimeout(() => {
      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.message).toBe('Ruta generada exitosamente');
      done();
    }, 10);
  });

  it('debe manejar error al generar ruta', (done) => {
    component.rutaForm.patchValue({
      fecha: '2024-11-15'
    });

    const mockError = {
      error: {
        detail: 'No hay pedidos disponibles para la fecha seleccionada'
      }
    };

    mockGenerarRutaService.generarRuta.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    setTimeout(() => {
      expect(component.generandoRuta()).toBeFalse();

      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.type).toBe('error');
      expect(dialogData.message).toBe('No hay pedidos disponibles para la fecha seleccionada');

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe usar mensaje de error genérico si no viene detalle', (done) => {
    component.rutaForm.patchValue({
      fecha: '2024-11-15'
    });

    const mockError = { status: 500 };
    mockGenerarRutaService.generarRuta.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    setTimeout(() => {
      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.message).toBe('Error al generar la ruta. Por favor, intente nuevamente.');
      done();
    }, 10);
  });

  it('debe navegar hacia atrás al home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });


});
