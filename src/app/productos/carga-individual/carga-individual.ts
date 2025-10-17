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
import { CargaIndividualService } from './carga-individual.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { ProductoRequest, ProductoResponse } from './carga-individual.interface';

@Component({
  selector: 'app-carga-individual',
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
  templateUrl: './carga-individual.html',
  styleUrl: './carga-individual.css'
})
export class CargaIndividual implements OnInit {
  productoForm!: FormGroup;

  // Estado del componente
  state = {
    isLoading: false,
    error: null as string | null
  };

  // Opciones para los selects
  categorias = [
    { value: 'MEDICAMENTO', label: 'Medicamento' },
    { value: 'DISPOSITIVO_MEDICO', label: 'Dispositivo Médico' },
    { value: 'EQUIPO', label: 'Equipo' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'REACTIVO', label: 'Reactivo' }
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
    private productoService: CargaIndividualService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(10)]],
      categoria: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      stock: ['', [Validators.required, Validators.min(0)]],
      proveedor_id: [''],
      pais: ['', Validators.required],
      activo: [true]
    });
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.productoForm.value;
      const country = formValue.pais || 'co';

      const productoData: ProductoRequest = {
        nombre: formValue.nombre,
        descripcion: formValue.descripcion,
        categoria: formValue.categoria,
        precio: parseFloat(formValue.precio),
        stock: parseInt(formValue.stock),
        proveedor_id: formValue.proveedor_id || undefined,
        activo: formValue.activo ?? true
      };

      this.productoService.registrarProducto(productoData, country).subscribe({
        next: (response: ProductoResponse) => {
          this.state.isLoading = false;

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: response.message || '¡Producto registrado exitosamente!'
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
          const errorMessage = error.error?.detail || error.error?.message || 'Error al registrar el producto. Inténtalo de nuevo.';
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
