import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
import { ProductoRequest, ProductoResponse, Proveedor, ProductoProveedorRequest } from './carga-individual.interface';
import { forkJoin, switchMap } from 'rxjs';

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

  // Proveedores cargados desde la API
  proveedores: Proveedor[] = [];

  // Opciones para los selects
  categorias = [
    { value: 'MEDICAMENTO', label: 'Medicamento' },
    { value: 'DISPOSITIVO_MEDICO', label: 'Dispositivo Médico' },
    { value: 'EQUIPO', label: 'Equipo' },
    { value: 'MATERIAL', label: 'Material' },
    { value: 'REACTIVO', label: 'Reactivo' }
  ];

  monedas = [
    { value: 'COP', label: 'COP - Peso Colombiano' },
    { value: 'USD', label: 'USD - Dólar' },
    { value: 'EUR', label: 'EUR - Euro' }
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
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Inicializar el formulario con todos los campos requeridos
    this.productoForm = this.fb.group({
      sku: ['', Validators.required],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      categoria: ['', Validators.required],
      temp_min: ['', [Validators.required, Validators.pattern('^-?[0-9]+(\\.[0-9]+)?$')]],
      temp_max: ['', [Validators.required, Validators.pattern('^-?[0-9]+(\\.[0-9]+)?$')]],
      controlado: [false],
      proveedor_id: ['', Validators.required],
      sku_proveedor: ['', Validators.required],
      precio: ['', [Validators.required, Validators.min(0)]],
      moneda: ['COP', Validators.required],
      lead_time_dias: ['', [Validators.required, Validators.min(0)]],
      lote_minimo: ['', [Validators.required, Validators.min(1)]],
      pais: ['co', Validators.required],
      activo: [true]
    });

    // Cargar proveedores después del ciclo de detección de cambios
    setTimeout(() => {
      this.cargarProveedores();
    }, 0);
  }

  // Método para cargar la lista de proveedores
  cargarProveedores(): void {
    this.state.isLoading = true;
    const country = this.productoForm.get('pais')?.value || 'co';

    this.productoService.listarProveedores(country).subscribe({
      next: (proveedores: Proveedor[]) => {
        this.proveedores = proveedores;
        this.state.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
      },
      error: (error: any) => {
        this.state.isLoading = false;
        this.cdr.detectChanges(); // Forzar detección de cambios
        const errorMessage = error.error?.detail || error.error?.message || 'Error al cargar los proveedores.';
        this.dialog.open(PopupComponent, {
          data: {
            type: 'error',
            message: errorMessage
          }
        });
      }
    });
  }

  // Método para recargar proveedores cuando cambie el país
  onPaisChange(): void {
    this.cargarProveedores();
  }

  onSubmit(): void {
    if (this.productoForm.valid) {
      // Usar setTimeout para evitar el error de detección de cambios
      setTimeout(() => {
        this.state.isLoading = true;
        this.state.error = null;
        this.cdr.detectChanges();

        const formValue = this.productoForm.value;
        const country = formValue.pais || 'co';
        const proveedorId = formValue.proveedor_id;

        // Paso 1: Crear el producto
        const productoData: ProductoRequest = {
          sku: formValue.sku,
          nombre: formValue.nombre,
          categoria: formValue.categoria,
          temp_min: parseFloat(formValue.temp_min),
          temp_max: parseFloat(formValue.temp_max),
          controlado: formValue.controlado ?? false
        };

        // Ejecutar el flujo de tres pasos
        this.productoService.crearProducto(productoData, country).pipe(
          switchMap((productoResponse: ProductoResponse) => {
            // Paso 2: Asociar el producto con el proveedor
            const productoProveedorData: ProductoProveedorRequest = {
              producto_id: productoResponse.id,
              sku_proveedor: formValue.sku_proveedor,
              precio: parseFloat(formValue.precio),
              moneda: formValue.moneda,
              lead_time_dias: parseInt(formValue.lead_time_dias),
              lote_minimo: parseInt(formValue.lote_minimo),
              activo: formValue.activo ?? true
            };

            return this.productoService.asociarProductoProveedor(proveedorId, productoProveedorData, country);
          })
        ).subscribe({
          next: () => {
            this.state.isLoading = false;
            this.cdr.detectChanges();

            // Mostrar popup de éxito
            const dialogRef = this.dialog.open(PopupComponent, {
              data: {
                type: 'success',
                message: '¡Producto registrado y asociado al proveedor exitosamente!'
              }
            });

            // Regresar al home después de cerrar el popup
            dialogRef.afterClosed().subscribe(() => {
              this.router.navigate(['/home']);
            });
          },
          error: (error: any) => {
            this.state.isLoading = false;
            this.cdr.detectChanges();

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
      }, 0);
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
