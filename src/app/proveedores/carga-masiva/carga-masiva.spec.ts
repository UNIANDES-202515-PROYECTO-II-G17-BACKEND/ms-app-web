import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CargaMasiva } from './carga-masiva';

describe('CargaMasiva - Unit Tests', () => {
  let component: CargaMasiva;
  let mockCargaMasivaService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  const mockProveedores = [
    {
      id: '1',
      nombre: 'Proveedor 1',
      tipo_de_persona: 'JURIDICA',
      documento: '12345678',
      tipo_documento: 'NIT',
      pais: 'co',
      direccion: 'Calle 123',
      telefono: '1234567890',
      email: 'prov1@test.com',
      pagina_web: 'http://prov1.com',
      activo: true
    },
    {
      id: '2',
      nombre: 'Proveedor 2',
      tipo_de_persona: 'JURIDICA',
      documento: '87654321',
      tipo_documento: 'NIT',
      pais: 'co',
      direccion: 'Calle 456',
      telefono: '0987654321',
      email: 'prov2@test.com',
      pagina_web: 'http://prov2.com',
      activo: false
    }
  ];

  beforeEach(() => {
    mockCargaMasivaService = jasmine.createSpyObj('CargaMasivaService', [
      'obtenerProveedores',
      'cargarProductosMasivos'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));
    mockCargaMasivaService.obtenerProveedores.and.returnValue(of(mockProveedores));

    component = new CargaMasiva(
      new FormBuilder(),
      mockCargaMasivaService,
      mockRouter,
      mockDialog
    );

    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.cargaForm).toBeDefined();
  });

  it('debe inicializar formulario con valores por defecto', () => {
    expect(component.cargaForm.get('pais')?.value).toBe('co');
    expect(component.cargaForm.get('proveedor')?.value).toBe('');
    expect(component.cargaForm.get('archivo')?.value).toBe('');
  });

  it('debe validar campos requeridos', () => {
    const form = component.cargaForm;
    expect(form.valid).toBeFalse();

    expect(form.get('pais')?.hasError('required')).toBeFalse();
    expect(form.get('proveedor')?.hasError('required')).toBeTrue();
    expect(form.get('archivo')?.hasError('required')).toBeTrue();
  });

  it('debe cargar proveedores activos al inicializar', (done) => {
    setTimeout(() => {
      expect(mockCargaMasivaService.obtenerProveedores).toHaveBeenCalledWith('co');
      expect(component.proveedores.length).toBe(1);
      expect(component.proveedores[0].id).toBe('1');
      expect(component.state.loadingProveedores).toBeFalse();
      done();
    }, 10);
  });

  it('debe manejar error al cargar proveedores', (done) => {
    const mockError = { error: { detail: 'Error al cargar' } };
    mockCargaMasivaService.obtenerProveedores.and.returnValue(throwError(() => mockError));

    component.cargarProveedores('co');

    setTimeout(() => {
      expect(component.state.loadingProveedores).toBeFalse();
      expect(component.state.error).toBe('Error al cargar los proveedores. Por favor, intente nuevamente.');
      expect(component.proveedores).toEqual([]);
      done();
    }, 10);
  });

  it('debe recargar proveedores cuando cambia el país', () => {
    component.cargaForm.patchValue({ pais: 'mx', proveedor: '1' });
    
    component.onPaisChange();

    expect(component.cargaForm.get('proveedor')?.value).toBe('');
    expect(mockCargaMasivaService.obtenerProveedores).toHaveBeenCalledWith('mx');
  });

  it('debe validar que el archivo sea CSV', () => {
    const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
    const event = { target: { files: [mockFile] } };

    component.onFileSelected(event);

    expect(component.state.error).toBe('El archivo debe ser un CSV');
    expect(component.selectedFile).toBeNull();
    expect(component.fileName).toBe('');
  });

  it('debe aceptar archivo CSV válido', () => {
    const mockFile = new File(['content'], 'productos.csv', { type: 'text/csv' });
    const event = { target: { files: [mockFile] } };

    component.onFileSelected(event);

    expect(component.selectedFile).toBe(mockFile);
    expect(component.fileName).toBe('productos.csv');
    expect(component.state.error).toBeNull();
  });

  it('no debe enviar si el formulario es inválido', () => {
    component.onSubmit();

    expect(mockCargaMasivaService.cargarProductosMasivos).not.toHaveBeenCalled();
  });

  it('debe cargar productos exitosamente sin errores', (done) => {
    const mockFile = new File(['content'], 'productos.csv', { type: 'text/csv' });
    component.selectedFile = mockFile;
    component.cargaForm.patchValue({
      pais: 'co',
      proveedor: '1',
      archivo: 'productos.csv'
    });

    const mockResponse = {
      total: 10,
      insertados: 10,
      errores: []
    };

    mockCargaMasivaService.cargarProductosMasivos.and.returnValue(of(mockResponse));

    component.onSubmit();

    setTimeout(() => {
      expect(mockCargaMasivaService.cargarProductosMasivos).toHaveBeenCalledWith(mockFile, 'co', '1');
      expect(component.state.isLoading).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe cargar productos con algunos errores', (done) => {
    const mockFile = new File(['content'], 'productos.csv', { type: 'text/csv' });
    component.selectedFile = mockFile;
    component.cargaForm.patchValue({
      pais: 'co',
      proveedor: '1',
      archivo: 'productos.csv'
    });

    const mockResponse = {
      total: 10,
      insertados: 7,
      errores: ['Error 1', 'Error 2', 'Error 3']
    };

    mockCargaMasivaService.cargarProductosMasivos.and.returnValue(of(mockResponse));

    component.onSubmit();

    setTimeout(() => {
      expect(component.state.isLoading).toBeFalse();
      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.type).toBe('warning');
      done();
    }, 10);
  });

  it('debe manejar error al cargar productos', (done) => {
    const mockFile = new File(['content'], 'productos.csv', { type: 'text/csv' });
    component.selectedFile = mockFile;
    component.cargaForm.patchValue({
      pais: 'co',
      proveedor: '1',
      archivo: 'productos.csv'
    });

    const mockError = { error: { detail: 'Error en la carga' } };
    mockCargaMasivaService.cargarProductosMasivos.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    setTimeout(() => {
      expect(component.state.isLoading).toBeFalse();
      expect(component.state.error).toBe('Error en la carga');
      expect(mockDialog.open).toHaveBeenCalled();
      const dialogData = mockDialog.open.calls.mostRecent().args[1].data;
      expect(dialogData.type).toBe('error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
      done();
    }, 10);
  });

  it('debe navegar hacia atrás al home', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debe inicializar estado correctamente', () => {
    expect(component.state.isLoading).toBeFalse();
    expect(component.state.loadingProveedores).toBeFalse();
    expect(component.state.error).toBeNull();
  });

  it('debe inicializar variables de archivo vacías', () => {
    const newComponent = new CargaMasiva(
      new FormBuilder(),
      mockCargaMasivaService,
      mockRouter,
      mockDialog
    );
    
    expect(newComponent.selectedFile).toBeNull();
    expect(newComponent.fileName).toBe('');
    expect(newComponent.proveedores).toEqual([]);
  });
});
