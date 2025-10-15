import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';

describe('LoginComponent - Unit Tests', () => {
  let component: LoginComponent;
  let mockLoginService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  beforeEach(() => {
    // Crear mocks
    mockLoginService = jasmine.createSpyObj('LoginService', ['login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));

    // Crear instancia del componente directamente
    component = new LoginComponent(
      new FormBuilder(),
      mockLoginService,
      mockRouter,
      mockDialog
    );

    // Mock de localStorage
    spyOn(localStorage, 'setItem');

    // Llamar ngOnInit manualmente
    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm).toBeDefined();
  });

  it('should initialize form with empty values', () => {
    expect(component.loginForm.get('username')?.value).toBe('');
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.loginForm;
    expect(form.valid).toBeFalse();

    expect(form.get('username')?.hasError('required')).toBeTrue();
    expect(form.get('password')?.hasError('required')).toBeTrue();
  });

  it('should be valid when all fields are filled', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    expect(component.loginForm.valid).toBeTrue();
  });

  it('should not call service when form is invalid', () => {
    // Formulario vacío (inválido)
    component.onSubmit();
    expect(mockLoginService.login).not.toHaveBeenCalled();
  });

  it('should call service with correct data when form is valid', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    mockLoginService.login.and.returnValue(of({
      access_token: 'fake-token',
      token_type: 'bearer'
    }));

    component.onSubmit();

    expect(mockLoginService.login).toHaveBeenCalledWith({
      username: 'testuser',
      password: 'password123'
    });
  });

  it('should handle successful login', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    const mockResponse = {
      access_token: 'fake-token-12345',
      token_type: 'bearer'
    };

    mockLoginService.login.and.returnValue(of(mockResponse));

    component.onSubmit();

    // Verificar que se guardó el token
    expect(localStorage.setItem).toHaveBeenCalledWith('access_token', 'fake-token-12345');

    // Verificar que se mostró el popup de éxito
    expect(mockDialog.open).toHaveBeenCalled();

    // Verificar que se navegó al home
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);

    // Verificar que el estado de loading se resetea
    expect(component.state.isLoading).toBeFalse();
  });

  it('should handle login error', () => {
    component.loginForm.patchValue({
      username: 'wronguser',
      password: 'wrongpassword'
    });

    const mockError = {
      error: {
        detail: 'Invalid credentials'
      }
    };

    mockLoginService.login.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    // Verificar que se manejó el error
    expect(component.state.isLoading).toBeFalse();
    expect(component.state.error).toBe('Invalid credentials');

    // Verificar que se mostró el popup de error
    expect(mockDialog.open).toHaveBeenCalled();

    // No debe guardarse token ni navegar
    expect(localStorage.setItem).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should handle error without detail message', () => {
    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    const mockError = { status: 401 };

    mockLoginService.login.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    // Verificar mensaje por defecto
    expect(component.state.error).toBe('Error de autenticación. Verifica tus credenciales.');
  });

  it('should test loading state getter', () => {
    expect(component.isLoading).toBeFalse();

    component.state.isLoading = true;
    expect(component.isLoading).toBeTrue();
  });

  it('should reset state on new submission', () => {
    // Configurar estado inicial con error
    component.state.error = 'Previous error';

    component.loginForm.patchValue({
      username: 'testuser',
      password: 'password123'
    });

    mockLoginService.login.and.returnValue(of({
      access_token: 'token',
      token_type: 'bearer'
    }));

    component.onSubmit();

    // El error debe ser limpiado
    expect(component.state.error).toBeNull();
  });
});
