import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RegistroProveedoresService } from './registro-proveedores.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { ProveedorRequest, ProveedorResponse } from './registro-proveedores.interface';

@Component({
  selector: 'app-registro-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDialogModule
  ],
  templateUrl: './registro-proveedores.html',
  styleUrl: './registro-proveedores.css'
})
export class RegistroProveedores implements OnInit {
  proveedorForm!: FormGroup;

  // Estado del componente
  state = {
    isLoading: false,
    error: null as string | null
  };

  // Opciones para los selects
  tiposPersona = [
    { value: 'NATURAL', label: 'Persona Natural' },
    { value: 'JURIDICA', label: 'Persona Jurídica' }
  ];

  tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'NIT', label: 'NIT' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'PP', label: 'Pasaporte' }
  ];

  constructor(
    private fb: FormBuilder,
    private proveedorService: RegistroProveedoresService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.proveedorForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      tipo_de_persona: ['', Validators.required],
      documento: ['', [Validators.required, Validators.minLength(5)]],
      tipo_documento: ['', Validators.required],
      pais: ['CO', Validators.required],
      direccion: ['', [Validators.required, Validators.minLength(10)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{10,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      pagina_web: ['', [Validators.required, Validators.pattern(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/)]],
      activo: [true]
    });
  }

  onSubmit(): void {
    if (this.proveedorForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.proveedorForm.value;
      const proveedorRequest: ProveedorRequest = {
        nombre: formValue.nombre || '',
        tipo_de_persona: formValue.tipo_de_persona || 'JURIDICA',
        documento: formValue.documento || '',
        tipo_documento: formValue.tipo_documento || 'NIT',
        pais: formValue.pais || 'CO',
        direccion: formValue.direccion || '',
        telefono: formValue.telefono || '',
        email: formValue.email || '',
        pagina_web: formValue.pagina_web || '',
        activo: formValue.activo ?? true
      };

      this.proveedorService.registrarProveedor(proveedorRequest).subscribe({
        next: (response: ProveedorResponse) => {
          this.state.isLoading = false;

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: response.message || '¡Proveedor registrado exitosamente!'
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
          const errorMessage = error.error?.detail || error.error?.message || 'Error al registrar el proveedor. Inténtalo de nuevo.';
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
