import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PlanVentaService } from './plan-venta.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { Vendedor, Producto, ClienteInstitucional, PlanVentaRequest } from './plan-venta.interface';

@Component({
  selector: 'app-plan-venta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatDialogModule,
    MatChipsModule
  ],
  templateUrl: './plan-venta.html',
  styleUrl: './plan-venta.css'
})
export class PlanVenta implements OnInit {
  planForm!: FormGroup;
  vendedores: Vendedor[] = [];
  productos: Producto[] = [];
  clientes: ClienteInstitucional[] = [];

  state = {
    isLoading: false,
    loadingVendedores: false,
    loadingProductos: false,
    loadingClientes: false,
    error: null as string | null
  };

  periodos = [
    { value: 'semanal', label: 'Semanal' },
    { value: 'quincenal', label: 'Quincenal' },
    { value: 'mensual', label: 'Mensual' },
    { value: 'bimestral', label: 'Bimestral' },
    { value: 'trimestral', label: 'Trimestral' },
    { value: 'semestral', label: 'Semestral' },
    { value: 'anual', label: 'Anual' }
  ];

  private country = 'co';

  constructor(
    private fb: FormBuilder,
    private planVentaService: PlanVentaService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.planForm = this.fb.group({
      id_vendedor: ['', Validators.required],
      periodo: ['', Validators.required],
      territorio: ['', [Validators.required, Validators.minLength(3)]],
      meta_monto: ['', [Validators.required, Validators.min(0)]],
      meta_unidades: ['', [Validators.required, Validators.min(1)]],
      meta_clientes: ['', [Validators.required, Validators.min(1)]],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      ids_productos: [[], [Validators.required, this.atLeastOneValidator]],
      id_cliente_objetivo: ['', Validators.required]
    });

    this.cargarDatos();
  }

  atLeastOneValidator(control: any) {
    const value = control.value;
    return value && value.length > 0 ? null : { atLeastOne: true };
  }

  cargarDatos(): void {
    this.cargarVendedores();
    this.cargarProductos();
    this.cargarClientes();
  }

  cargarVendedores(): void {
    this.state.loadingVendedores = true;
    this.planVentaService.obtenerVendedores(this.country).subscribe({
      next: (response) => {
        this.vendedores = response;
        this.state.loadingVendedores = false;
      },
      error: (error) => {
        console.error('Error al cargar vendedores:', error);
        this.state.loadingVendedores = false;
        this.state.error = 'Error al cargar los vendedores';
      }
    });
  }

  cargarProductos(): void {
    this.state.loadingProductos = true;
    this.planVentaService.obtenerProductos(this.country).subscribe({
      next: (response) => {
        this.productos = response;
        this.state.loadingProductos = false;
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.state.loadingProductos = false;
        this.state.error = 'Error al cargar los productos';
      }
    });
  }

  cargarClientes(): void {
    this.state.loadingClientes = true;
    this.planVentaService.obtenerClientesInstitucionales(this.country).subscribe({
      next: (response) => {
        console.log('Clientes cargados:', response);
        console.log('Total de clientes:', response.length);
        if (response.length > 0) {
          console.log('Ejemplo primer cliente:', response[0]);
        }
        this.clientes = response;
        this.state.loadingClientes = false;
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.state.loadingClientes = false;
        this.state.error = 'Error al cargar los clientes institucionales';
      }
    });
  }

  obtenerNombreProducto(productoId: string): string {
    const producto = this.productos.find(p => p.id === productoId);
    return producto ? producto.nombre : '';
  }

  onSubmit(): void {
    if (this.planForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.planForm.value;

      // Formatear fechas a YYYY-MM-DD
      const fechaInicio = new Date(formValue.fecha_inicio);
      const fechaFin = new Date(formValue.fecha_fin);

      // Validar que fecha fin sea mayor a fecha inicio
      if (fechaFin <= fechaInicio) {
        this.state.error = 'La fecha de fin debe ser posterior a la fecha de inicio';
        this.state.isLoading = false;
        return;
      }

      const planRequest: PlanVentaRequest = {
        id_vendedor: String(formValue.id_vendedor),
        periodo: formValue.periodo,
        territorio: formValue.territorio,
        meta_monto: parseFloat(formValue.meta_monto),
        meta_unidades: parseInt(formValue.meta_unidades),
        meta_clientes: parseInt(formValue.meta_clientes),
        fecha_inicio: fechaInicio.toISOString().split('T')[0],
        fecha_fin: fechaFin.toISOString().split('T')[0],
        ids_productos: formValue.ids_productos,
        id_cliente_objetivo: String(formValue.id_cliente_objetivo)
      };

      this.planVentaService.crearPlanVenta(planRequest, this.country).subscribe({
        next: (response) => {
          this.state.isLoading = false;

          const mensaje = response.message || 'Plan de venta creado exitosamente';

          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: mensaje
            }
          });

          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (error) => {
          console.error('Error al crear plan de venta:', error);
          this.state.isLoading = false;

          const errorMessage = error.error?.message || error.error?.detail || 'Error al crear el plan de venta. Por favor, intente nuevamente.';

          this.state.error = errorMessage;

          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'error',
              message: errorMessage
            }
          });

          dialogRef.afterClosed().subscribe(() => {
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
