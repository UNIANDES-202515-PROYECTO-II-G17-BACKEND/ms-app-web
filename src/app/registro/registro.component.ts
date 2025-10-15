import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistroService } from './registro.service';
import { PopupComponent } from '../shared/popup/popup.component';
import {
  RegistroRequest,
  RegistroResponse,
  RegistroState
} from './registro.interface';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;

  // Estado del componente usando interface
  state: RegistroState = {
    isLoading: false,
    error: null,
    success: false
  };

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.registroForm = this.fb.group({
      institution_name: ['', [Validators.required, Validators.minLength(3)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      role: ['admin', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    // Solo validar si ambos campos tienen valores
    if (password && confirmPassword && password.value && confirmPassword.value) {
      if (password.value !== confirmPassword.value) {
        return { 'passwordMismatch': true };
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.registroForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.registroForm.value;
      const registroRequest: RegistroRequest = {
        institution_name: formValue.institution_name || '',
        username: formValue.username || '',
        role: formValue.role || 'admin',
        password: formValue.password || ''
      };

      this.registroService.registro(registroRequest).subscribe({
        next: (response: RegistroResponse) => {
          console.log('Registro exitoso:', response);
          this.state.isLoading = false;
          this.state.success = true;

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: response.message || '¡Registro exitoso!'
            }
          });

          // Redirigir al login después de cerrar el popup
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/login']);
          });
        },
        error: (error: any) => {
          console.error('Error en registro:', error);
          this.state.isLoading = false;

          // Extraer mensaje de error de la API
          const errorMessage = error.error?.detail || 'Error al registrar la cuenta. Inténtalo de nuevo.';
          this.state.error = errorMessage;

          // Mostrar popup de error
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'error',
              message: errorMessage
            }
          });

          // Redirigir al login después de cerrar el popup
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/login']);
          });
        }
      });
    }
  }

  // Getter para facilitar el acceso al estado de loading en el template
  get isLoading(): boolean {
    return this.state.isLoading;
  }

  // Helper para verificar errores de contraseña
  get passwordMismatch(): boolean {
    return this.registroForm.hasError('passwordMismatch') &&
           (this.registroForm.get('confirmPassword')?.touched || false);
  }

  // Helper para mostrar mensaje de contraseñas no coinciden
  get showPasswordMismatchMessage(): boolean {
    const password = this.registroForm.get('password');
    const confirmPassword = this.registroForm.get('confirmPassword');

    return this.registroForm.hasError('passwordMismatch') &&
           password?.touched &&
           confirmPassword?.touched || false;
  }

}
