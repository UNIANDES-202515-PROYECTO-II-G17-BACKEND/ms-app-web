import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CargaMasivaService } from './carga-masiva.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { CargaMasivaResponse } from './carga-masiva.interface';

@Component({
  selector: 'app-carga-masiva',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatDialogModule
  ],
  templateUrl: './carga-masiva.html',
  styleUrl: './carga-masiva.css'
})
export class CargaMasiva implements OnInit {
  cargaForm!: FormGroup;
  selectedFile: File | null = null;
  fileName: string = '';

  // Estado del componente
  state = {
    isLoading: false,
    error: null as string | null
  };

  // Opciones para los selects
  paises = [
    { value: 'co', label: 'Colombia' },
    { value: 'mx', label: 'México' },
    { value: 'pe', label: 'Perú' },
    { value: 'cl', label: 'Chile' },
    { value: 'ar', label: 'Argentina' }
  ];

  constructor(
    private fb: FormBuilder,
    private cargaMasivaService: CargaMasivaService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargaForm = this.fb.group({
      pais: ['', Validators.required],
      archivo: ['', Validators.required]
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
      this.cargaForm.patchValue({ archivo: file.name });
    }
  }

  onSubmit(): void {
    if (this.cargaForm.valid && this.selectedFile) {
      this.state.isLoading = true;
      this.state.error = null;

      const country = this.cargaForm.value.pais || 'co';

      this.cargaMasivaService.cargarProductosMasivos(this.selectedFile, country).subscribe({
        next: (response: CargaMasivaResponse) => {
          this.state.isLoading = false;

          const mensaje = `
            ${response.message || 'Carga masiva completada'}

            Productos procesados: ${response.productos_procesados || 0}
            Exitosos: ${response.productos_exitosos || 0}
            Fallidos: ${response.productos_fallidos || 0}
          `;

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: response.productos_fallidos ? 'warning' : 'success',
              message: mensaje
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
          const errorMessage = error.error?.detail || error.error?.message || 'Error al procesar el archivo. Inténtalo de nuevo.';
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
