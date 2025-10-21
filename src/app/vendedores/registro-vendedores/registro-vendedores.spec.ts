import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { RegistroVendedores } from './registro-vendedores';

describe('RegistroVendedores - Unit Tests', () => {
  let component: RegistroVendedores;
  let mockVendedorService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  beforeEach(() => {
    // Crear mocks
    mockVendedorService = jasmine.createSpyObj('RegistroVendedoresService', ['registrarVendedor']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));

    // Crear instancia del componente directamente
    component = new RegistroVendedores(
      new FormBuilder(),
      mockVendedorService,
      mockRouter,
      mockDialog
    );

    // Llamar ngOnInit manualmente
    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.vendedorForm).toBeDefined();
  });

  it('should initialize form with empty values', () => {
    expect(component.vendedorForm.get('username')?.value).toBe('');
    expect(component.vendedorForm.get('full_name')?.value).toBe('');
    expect(component.vendedorForm.get('document_type')?.value).toBe('');
    expect(component.vendedorForm.get('document_number')?.value).toBe('');
    expect(component.vendedorForm.get('institution_name')?.value).toBe('');
    expect(component.vendedorForm.get('pais')?.value).toBe('');
    expect(component.vendedorForm.get('telephone')?.value).toBe('');
    expect(component.vendedorForm.get('email')?.value).toBe('');
    expect(component.vendedorForm.get('password')?.value).toBe('');
    expect(component.vendedorForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.vendedorForm;
    expect(form.valid).toBeFalse();

    expect(form.get('username')?.hasError('required')).toBeTrue();
    expect(form.get('full_name')?.hasError('required')).toBeTrue();
    expect(form.get('document_type')?.hasError('required')).toBeTrue();
    expect(form.get('document_number')?.hasError('required')).toBeTrue();
    expect(form.get('institution_name')?.hasError('required')).toBeTrue();
    expect(form.get('pais')?.hasError('required')).toBeTrue();
    expect(form.get('telephone')?.hasError('required')).toBeTrue();
    expect(form.get('email')?.hasError('required')).toBeTrue();
    expect(form.get('password')?.hasError('required')).toBeTrue();
    expect(form.get('confirmPassword')?.hasError('required')).toBeTrue();
  });

  it('should validate minLength for fields', () => {
    const usernameControl = component.vendedorForm.get('username');
    const fullNameControl = component.vendedorForm.get('full_name');
    const documentControl = component.vendedorForm.get('document_number');
    const institutionControl = component.vendedorForm.get('institution_name');
    const passwordControl = component.vendedorForm.get('password');

    usernameControl?.setValue('abc');
    expect(usernameControl?.hasError('minlength')).toBeTrue();

    fullNameControl?.setValue('ab');
    expect(fullNameControl?.hasError('minlength')).toBeTrue();

    documentControl?.setValue('1234');
    expect(documentControl?.hasError('minlength')).toBeTrue();

    institutionControl?.setValue('ab');
    expect(institutionControl?.hasError('minlength')).toBeTrue();

    passwordControl?.setValue('123');
    expect(passwordControl?.hasError('minlength')).toBeTrue();
  });

  it('should validate email format', () => {
    const emailControl = component.vendedorForm.get('email');

    emailControl?.setValue('invalid-email');
    expect(emailControl?.hasError('email')).toBeTrue();

    emailControl?.setValue('test@example.com');
    expect(emailControl?.hasError('email')).toBeFalse();
  });

  it('should validate telephone pattern', () => {
    const telephoneControl = component.vendedorForm.get('telephone');

    // Formato inválido
    telephoneControl?.setValue('123');
    expect(telephoneControl?.hasError('pattern')).toBeTrue();

    telephoneControl?.setValue('abcdefghij');
    expect(telephoneControl?.hasError('pattern')).toBeTrue();

    // Formatos válidos
    telephoneControl?.setValue('1234567890');
    expect(telephoneControl?.hasError('pattern')).toBeFalse();

    telephoneControl?.setValue('+573001234567');
    expect(telephoneControl?.hasError('pattern')).toBeFalse();
  });

  it('should validate password match', () => {
    const form = component.vendedorForm;

    form.patchValue({
      password: 'password123',
      confirmPassword: 'different123'
    });
    expect(form.hasError('passwordMismatch')).toBeTrue();

    form.patchValue({
      password: 'password123',
      confirmPassword: 'password123'
    });
    expect(form.hasError('passwordMismatch')).toBeFalse();
  });

  it('should not call service when form is invalid', () => {
    component.onSubmit();
    expect(mockVendedorService.registrarVendedor).not.toHaveBeenCalled();
  });

  it('should call service with correct data when form is valid', () => {
    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockVendedorService.registrarVendedor.and.returnValue(of({
      success: true,
      message: 'Vendedor registrado exitosamente'
    }));

    component.onSubmit();

    expect(mockVendedorService.registrarVendedor).toHaveBeenCalledWith({
      username: 'testuser',
      role: 'seller',
      institution_name: 'Test Institution',
      password: 'password123',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      telephone: '+573001234567',
      email: 'test@example.com'
    }, 'co');
  });

  it('should handle successful registration', () => {
    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockResponse = {
      success: true,
      message: '¡Vendedor registrado exitosamente!'
    };

    mockVendedorService.registrarVendedor.and.returnValue(of(mockResponse));

    component.onSubmit();

    expect(component.state.isLoading).toBeFalse();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should handle registration error with detail message', () => {
    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockError = {
      error: {
        detail: 'Username already exists'
      }
    };

    mockVendedorService.registrarVendedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.isLoading).toBeFalse();
    expect(component.state.error).toBe('Username already exists');
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle registration error with message property', () => {
    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockError = {
      error: {
        message: 'Database error'
      }
    };

    mockVendedorService.registrarVendedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.error).toBe('Database error');
  });

  it('should handle registration error without specific message', () => {
    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockError = { status: 500 };

    mockVendedorService.registrarVendedor.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.error).toBe('Error al registrar el vendedor. Inténtalo de nuevo.');
  });

  it('should test loading state getter', () => {
    expect(component.isLoading).toBeFalse();

    component.state.isLoading = true;
    expect(component.isLoading).toBeTrue();
  });

  it('should navigate to home when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should have correct document types options', () => {
    expect(component.tiposDocumento.length).toBe(4);
    // Component uses short codes: CC, NIT, PASAPORTE, CE
    expect(component.tiposDocumento[0].value).toBe('CC');
    expect(component.tiposDocumento[1].value).toBe('NIT');
    expect(component.tiposDocumento[2].value).toBe('PASAPORTE');
    expect(component.tiposDocumento[3].value).toBe('CE');
  });

  it('should have correct countries options', () => {
    expect(component.paises.length).toBe(5);
    expect(component.paises[0].value).toBe('co');
    expect(component.paises[1].value).toBe('mx');
    expect(component.paises[2].value).toBe('pe');
    expect(component.paises[3].value).toBe('cl');
    expect(component.paises[4].value).toBe('ar');
  });

  it('should reset state on new submission', () => {
    component.state.error = 'Previous error';

    component.vendedorForm.patchValue({
      username: 'testuser',
      full_name: 'Test User Name',
      document_type: 'CEDULA_CIUDADANIA',
      document_number: '12345678',
      institution_name: 'Test Institution',
      pais: 'co',
      telephone: '+573001234567',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockVendedorService.registrarVendedor.and.returnValue(of({
      success: true,
      message: 'Success'
    }));

    component.onSubmit();

    expect(component.state.error).toBeNull();
  });

  it('should test password validator with empty values', () => {
    const validator = component.passwordMatchValidator;

    const fb = new FormBuilder();
    const emptyControl = fb.group({
      password: [''],
      confirmPassword: ['']
    });

    expect(validator(emptyControl)).toBeNull();
  });
});
