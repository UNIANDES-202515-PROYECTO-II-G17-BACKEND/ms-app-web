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
import { CargaMasivaResponse, Proveedor } from './carga-masiva.interface';

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
  proveedores: Proveedor[] = [];

  // Estado del componente
  state = {
    isLoading: false,
    loadingProveedores: false,
    error: null as string | null
  };

  constructor(
    private fb: FormBuilder,
    private cargaMasivaService: CargaMasivaService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.cargaForm = this.fb.group({
      pais: ['co', Validators.required],
      proveedor: ['', Validators.required],
      archivo: ['', Validators.required]
    });

    // Cargar proveedores para el país por defecto
    this.cargarProveedores('co');
  }

  onPaisChange(): void {
    const pais = this.cargaForm.get('pais')?.value;
    if (pais) {
      this.cargaForm.patchValue({ proveedor: '' });
      this.cargarProveedores(pais);
    }
  }

  cargarProveedores(pais: string): void {
    this.state.loadingProveedores = true;
    this.state.error = null;

    this.cargaMasivaService.obtenerProveedores(pais).subscribe({
      next: (response: Proveedor[]) => {
        // Filtrar solo proveedores activos
        this.proveedores = response.filter(p => p.activo);
        this.state.loadingProveedores = false;
      },
      error: (error) => {
        console.error('Error al cargar proveedores:', error);
        this.state.loadingProveedores = false;
        this.state.error = 'Error al cargar los proveedores. Por favor, intente nuevamente.';
        this.proveedores = [];
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validar que sea un archivo CSV
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.state.error = 'El archivo debe ser un CSV';
        this.selectedFile = null;
        this.fileName = '';
        this.cargaForm.patchValue({ archivo: '' });
        return;
      }

      this.selectedFile = file;
      this.fileName = file.name;
      this.cargaForm.patchValue({ archivo: file.name });
      this.state.error = null;
    }
  }

  onSubmit(): void {
    if (this.cargaForm.valid && this.selectedFile) {
      this.state.isLoading = true;
      this.state.error = null;

      const country = this.cargaForm.value.pais;
      const proveedorId = this.cargaForm.value.proveedor;

      this.cargaMasivaService.cargarProductosMasivos(this.selectedFile, country, proveedorId).subscribe({
        next: (response: CargaMasivaResponse) => {
          this.state.isLoading = false;

          const tieneErrores = response.errores && response.errores.length > 0;
          const fallidos = response.total - response.insertados;

          let mensaje = `Carga completada exitosamente\n\n`;
          mensaje += `Total de productos procesados: ${response.total}\n`;
          mensaje += `Productos insertados: ${response.insertados}\n`;

          if (fallidos > 0) {
            mensaje += `✗ Productos con errores: ${fallidos}`;
          }

          // Mostrar popup de éxito o warning
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: tieneErrores ? 'warning' : 'success',
              message: mensaje
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            // Volver al home
            this.router.navigate(['/home']);
          });
        },
        error: (error) => {
          console.error('Error en la carga masiva:', error);
          this.state.isLoading = false;

          const errorMessage = error.error?.message || error.error?.detail || 'Error al cargar los productos. Por favor, verifique el archivo e intente nuevamente.';

          this.state.error = errorMessage;

          // También mostrar popup de error
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'error',
              message: errorMessage
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            // Volver al home
            this.router.navigate(['/home']);
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
