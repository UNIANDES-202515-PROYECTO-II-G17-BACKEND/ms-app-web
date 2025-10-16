import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { RegistroProveedores } from './registro-proveedores';

describe('RegistroProveedores - Unit Tests', () => {
  let component: RegistroProveedores;
  let mockProveedorService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  beforeEach(() => {
    // Crear mocks
    mockProveedorService = jasmine.createSpyObj('RegistroProveedoresService', ['registrarProveedor']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));

    // Crear instancia del componente directamente
    component = new RegistroProveedores(
      new FormBuilder(),
      mockProveedorService,
      mockRouter,
      mockDialog
    );

    // Llamar ngOnInit manualmente
    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.proveedorForm).toBeDefined();
  });

  it('should initialize form with default values', () => {
    expect(component.proveedorForm.get('nombre')?.value).toBe('');
    expect(component.proveedorForm.get('tipo_de_persona')?.value).toBe('');
    expect(component.proveedorForm.get('documento')?.value).toBe('');
    expect(component.proveedorForm.get('tipo_documento')?.value).toBe('');
    expect(component.proveedorForm.get('pais')?.value).toBe('CO');
    expect(component.proveedorForm.get('direccion')?.value).toBe('');
    expect(component.proveedorForm.get('telefono')?.value).toBe('');
    expect(component.proveedorForm.get('email')?.value).toBe('');
    expect(component.proveedorForm.get('pagina_web')?.value).toBe('');
    expect(component.proveedorForm.get('activo')?.value).toBe(true);
  });

  it('should have tiposPersona options defined', () => {
    expect(component.tiposPersona).toBeDefined();
    expect(component.tiposPersona.length).toBe(2);
    expect(component.tiposPersona[0].value).toBe('NATURAL');
    expect(component.tiposPersona[1].value).toBe('JURIDICA');
  });

  it('should have tiposDocumento options defined', () => {
    expect(component.tiposDocumento).toBeDefined();
    expect(component.tiposDocumento.length).toBe(4);
    expect(component.tiposDocumento[0].value).toBe('CC');
    expect(component.tiposDocumento[1].value).toBe('NIT');
  });

  it('should validate required fields', () => {
    const form = component.proveedorForm;
    expect(form.valid).toBeFalse();

    expect(form.get('nombre')?.hasError('required')).toBeTrue();
    expect(form.get('tipo_de_persona')?.hasError('required')).toBeTrue();
    expect(form.get('documento')?.hasError('required')).toBeTrue();
    expect(form.get('tipo_documento')?.hasError('required')).toBeTrue();
    expect(form.get('pais')?.hasError('required')).toBeFalse(); // Has default value
    expect(form.get('direccion')?.hasError('required')).toBeTrue();
    expect(form.get('telefono')?.hasError('required')).toBeTrue();
    expect(form.get('email')?.hasError('required')).toBeTrue();
    expect(form.get('pagina_web')?.hasError('required')).toBeTrue();
  });

  it('should validate email format', () => {
    const emailControl = component.proveedorForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();

    emailControl?.setValue('valid@email.com');
    expect(emailControl?.hasError('email')).toBeFalse();
  });

  it('should validate telefono pattern', () => {
    const telefonoControl = component.proveedorForm.get('telefono');

    // Invalid phone
    telefonoControl?.setValue('123');
    expect(telefonoControl?.hasError('pattern')).toBeTrue();

    // Valid phone
    telefonoControl?.setValue('+573001234567');
    expect(telefonoControl?.hasError('pattern')).toBeFalse();

    telefonoControl?.setValue('3001234567');
    expect(telefonoControl?.hasError('pattern')).toBeFalse();
  });

  it('should validate pagina_web URL pattern', () => {
    const webControl = component.proveedorForm.get('pagina_web');

    // Invalid URL
    webControl?.setValue('not-a-url');
    expect(webControl?.hasError('pattern')).toBeTrue();

    // Valid URLs
    webControl?.setValue('https://www.example.com');
    expect(webControl?.hasError('pattern')).toBeFalse();

    webControl?.setValue('http://example.com');
    expect(webControl?.hasError('pattern')).toBeFalse();
  });

  it('should validate minimum length for nombre', () => {
    const nombreControl = component.proveedorForm.get('nombre');

    nombreControl?.setValue('ab');
    expect(nombreControl?.hasError('minlength')).toBeTrue();

    nombreControl?.setValue('Valid Name');
    expect(nombreControl?.hasError('minlength')).toBeFalse();
  });

  it('should validate minimum length for documento', () => {
    const docControl = component.proveedorForm.get('documento');

    docControl?.setValue('1234');
    expect(docControl?.hasError('minlength')).toBeTrue();

    docControl?.setValue('12345');
    expect(docControl?.hasError('minlength')).toBeFalse();
  });

  it('should validate minimum length for direccion', () => {
    const dirControl = component.proveedorForm.get('direccion');

    dirControl?.setValue('Cra 1');
    expect(dirControl?.hasError('minlength')).toBeTrue();

    dirControl?.setValue('Carrera 1 #23-45');
    expect(dirControl?.hasError('minlength')).toBeFalse();
  });

  it('should not call service when form is invalid', () => {
    component.onSubmit();
    expect(mockProveedorService.registrarProveedor).not.toHaveBeenCalled();
  });

  it('should call service with correct data when form is valid', () => {
    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    mockProveedorService.registrarProveedor.and.returnValue(of({
      success: true,
      message: 'Proveedor registrado'
    }));

    component.onSubmit();

    expect(mockProveedorService.registrarProveedor).toHaveBeenCalledWith({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });
  });

  it('should handle successful registration', () => {
    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    const mockResponse = {
      success: true,
      message: 'Proveedor registrado exitosamente'
    };

    mockProveedorService.registrarProveedor.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
    expect(component.state.isLoading).toBeFalse();
  });

  it('should handle registration error with detail', () => {
    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    const mockError = {
      error: {
        detail: 'El proveedor ya existe'
      }
    };

    mockProveedorService.registrarProveedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.isLoading).toBeFalse();
    expect(component.state.error).toBe('El proveedor ya existe');
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle registration error with message', () => {
    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    const mockError = {
      error: {
        message: 'Error de validación'
      }
    };

    mockProveedorService.registrarProveedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.error).toBe('Error de validación');
  });

  it('should handle registration error without detail or message', () => {
    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    const mockError = { status: 500 };

    mockProveedorService.registrarProveedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.error).toBe('Error al registrar el proveedor. Inténtalo de nuevo.');
  });

  it('should test loading state getter', () => {
    expect(component.isLoading).toBeFalse();

    component.state.isLoading = true;
    expect(component.isLoading).toBeTrue();
  });

  it('should navigate back to home when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should reset state on new submission', () => {
    component.state.error = 'Previous error';

    component.proveedorForm.patchValue({
      nombre: 'Proveedor Test',
      tipo_de_persona: 'JURIDICA',
      documento: '1234567890',
      tipo_documento: 'NIT',
      pais: 'CO',
      direccion: 'Calle 123 #45-67',
      telefono: '+573001234567',
      email: 'test@proveedor.com',
      pagina_web: 'https://www.proveedor.com',
      activo: true
    });

    mockProveedorService.registrarProveedor.and.returnValue(of({
      success: true
    }));

    component.onSubmit();

    expect(component.state.error).toBeNull();
  });
});
