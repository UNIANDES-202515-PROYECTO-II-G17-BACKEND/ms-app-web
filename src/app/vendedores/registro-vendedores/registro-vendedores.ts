import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistroVendedoresService } from './registro-vendedores.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { VendedorRequest, VendedorResponse } from './registro-vendedores.interface';

@Component({
  selector: 'app-registro-vendedores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule
  ],
  templateUrl: './registro-vendedores.html',
  styleUrl: './registro-vendedores.css'
})
export class RegistroVendedores implements OnInit {
  vendedorForm!: FormGroup;

  // Estado del componente
  state = {
    isLoading: false,
    error: null as string | null
  };

  // Opciones para los selects
  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT' },
    { value: 'PASAPORTE', label: 'Pasaporte' },
    { value: 'CE', label: 'Cédula de Extranjería' }
  ];

  paises = [
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'pe', label: 'Perú' },
    { value: 'cl', label: 'Chile' },
    { value: 'ar', label: 'Argentina' }
  ];

  constructor(
    private fb: FormBuilder,
    private vendedorService: RegistroVendedoresService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  // Validador personalizado para confirmar contraseña
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  ngOnInit(): void {
    this.vendedorForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      full_name: ['', [Validators.required, Validators.minLength(3)]],
      document_type: ['', Validators.required],
      document_number: ['', [Validators.required, Validators.minLength(5)]],
      institution_name: ['', [Validators.required, Validators.minLength(3)]],
      pais: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  onSubmit(): void {
    if (this.vendedorForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.vendedorForm.value;

      const vendedorData: VendedorRequest = {
        username: formValue.username,
        role: 'seller', // Siempre es seller
        institution_name: formValue.institution_name,
        password: formValue.password,
        full_name: formValue.full_name,
        document_type: formValue.document_type,
        document_number: formValue.document_number,
        telephone: formValue.telephone,
        email: formValue.email
      };

      const country = formValue.pais;

      this.vendedorService.registrarVendedor(vendedorData, country).subscribe({
        next: (response: VendedorResponse) => {
          this.state.isLoading = false;

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: response.message || '¡Vendedor registrado exitosamente!'
            }
          });

          // Regresar al home después de cerrar el popup
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (error: any) => {
          this.state.isLoading = false;

          // Extraer mensaje de error de la API
          const errorMessage = error.error?.detail || error.error?.message || 'Error al registrar el vendedor. Inténtalo de nuevo.';
          this.state.error = errorMessage;

          // Mostrar popup de error
          this.dialog.open(PopupComponent, {
            data: {
              type: 'error',
              message: errorMessage
            }
          });
        }
      });
    }
  }

  // Getter para facilitar el acceso al estado de loading en el template
  get isLoading(): boolean {
    return this.state.isLoading;
  }

  // Método para volver al home
  goBack(): void {
    this.router.navigate(['/home']);
  }
}
