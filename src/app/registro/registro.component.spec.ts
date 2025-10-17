import { FormBuilder } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { RegistroComponent } from './registro.component';

describe('RegistroComponent - Unit Tests', () => {
  let component: RegistroComponent;
  let mockRegistroService: jasmine.SpyObj<any>;
  let mockRouter: jasmine.SpyObj<any>;
  let mockDialog: jasmine.SpyObj<any>;
  let mockDialogRef: jasmine.SpyObj<any>;

  beforeEach(() => {
    mockRegistroService = jasmine.createSpyObj('RegistroService', ['registro']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);

    mockDialog.open.and.returnValue(mockDialogRef);
    mockDialogRef.afterClosed.and.returnValue(of(true));

    component = new RegistroComponent(
      new FormBuilder(),
      mockRegistroService,
      mockRouter,
      mockDialog
    );

    component.ngOnInit();
  });

  it('should create component instance', () => {
    expect(component).toBeTruthy();
    expect(component.registroForm).toBeDefined();
  });

  it('should initialize form with default values', () => {
    expect(component.registroForm.get('institution_name')?.value).toBe('');
    expect(component.registroForm.get('username')?.value).toBe('');
    expect(component.registroForm.get('role')?.value).toBe('admin');
    expect(component.registroForm.get('password')?.value).toBe('');
    expect(component.registroForm.get('confirmPassword')?.value).toBe('');
  });

  it('should validate required fields', () => {
    const form = component.registroForm;
    expect(form.valid).toBeFalse();
    expect(form.get('institution_name')?.hasError('required')).toBeTrue();
    expect(form.get('username')?.hasError('required')).toBeTrue();
    expect(form.get('password')?.hasError('required')).toBeTrue();
    expect(form.get('confirmPassword')?.hasError('required')).toBeTrue();
  });

  it('should validate minimum length for fields', () => {
    const form = component.registroForm;

    form.patchValue({
      institution_name: 'ab',
      username: 'ab',
      password: '12345'
    });

    expect(form.get('institution_name')?.hasError('minlength')).toBeTrue();
    expect(form.get('username')?.hasError('minlength')).toBeTrue();
    expect(form.get('password')?.hasError('minlength')).toBeTrue();

    form.patchValue({
      institution_name: 'Valid Institution',
      username: 'validuser',
      password: 'validpass123'
    });

    expect(form.get('institution_name')?.hasError('minlength')).toBeFalse();
    expect(form.get('username')?.hasError('minlength')).toBeFalse();
    expect(form.get('password')?.hasError('minlength')).toBeFalse();
  });

  it('should validate password match', () => {
    const form = component.registroForm;

    form.patchValue({
      password: 'password123',
      confirmPassword: 'diferente123'
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
    expect(mockRegistroService.registro).not.toHaveBeenCalled();
  });

  it('should call service with correct data when form is valid', () => {
    const formData = {
      institution_name: 'Test Institution',
      username: 'testuser',
      role: 'admin',
      password: 'password123',
      confirmPassword: 'password123'
    };

    component.registroForm.patchValue(formData);
    mockRegistroService.registro.and.returnValue(of({ success: true }));

    component.onSubmit();

    expect(mockRegistroService.registro).toHaveBeenCalledWith({
      institution_name: formData.institution_name,
      username: formData.username,
      role: formData.role,
      password: formData.password
    });
  });

  it('should show success popup and navigate on successful registration', () => {
    component.registroForm.patchValue({
      institution_name: 'Test Institution',
      username: 'testuser',
      role: 'admin',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockRegistroService.registro.and.returnValue(of({ success: true }));
    component.onSubmit();

    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should test password match getter', () => {
    component.registroForm.patchValue({
      password: 'password123',
      confirmPassword: 'different123'
    });
    component.registroForm.get('confirmPassword')?.markAsTouched();

    expect(component.passwordMismatch).toBeTrue();

    component.registroForm.get('confirmPassword')?.setValue('password123');
    expect(component.passwordMismatch).toBeFalse();
  });

  it('should test loading state getter', () => {
    expect(component.isLoading).toBeFalse();

    component.state.isLoading = true;
    expect(component.isLoading).toBeTrue();
  });

  it('should handle registration error', () => {
    component.registroForm.patchValue({
      institution_name: 'Test Institution',
      username: 'testuser',
      role: 'admin',
      password: 'password123',
      confirmPassword: 'password123'
    });

    const mockError = { error: { detail: 'Username already exists' } };
    mockRegistroService.registro.and.returnValue(throwError(() => mockError));

    component.onSubmit();

    expect(component.state.isLoading).toBeFalse();
    expect(component.state.error).toBe('Username already exists');
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should test showPasswordMismatchMessage getter', () => {
    const form = component.registroForm;

    form.patchValue({ password: 'password123', confirmPassword: 'different123' });
    form.get('password')?.markAsTouched();
    form.get('confirmPassword')?.markAsTouched();

    expect(component.showPasswordMismatchMessage).toBeTrue();

    form.get('confirmPassword')?.setValue('password123');
    expect(component.showPasswordMismatchMessage).toBeFalse();
  });

  it('should test password validator with empty values', () => {
    const emptyControl = new FormBuilder().group({
      password: [''],
      confirmPassword: ['']
    });

    expect(component.passwordMatchValidator(emptyControl)).toBeNull();
  });

  it('should reset state on new submission', () => {
    component.state.error = 'Previous error';
    component.state.success = true;

    component.registroForm.patchValue({
      institution_name: 'Test Institution',
      username: 'testuser',
      role: 'admin',
      password: 'password123',
      confirmPassword: 'password123'
    });

    mockRegistroService.registro.and.returnValue(of({ success: true }));
    component.onSubmit();

    expect(component.state.error).toBeNull();
    expect(component.state.success).toBeTrue();
  });
});
