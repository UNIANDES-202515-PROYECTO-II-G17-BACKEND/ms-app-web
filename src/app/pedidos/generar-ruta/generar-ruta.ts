import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GenerarRutaService } from './generar-ruta.service';
import { PopupComponent } from '../../shared/popup/popup.component';
import { Pedido, GenerarRutaResponse } from './generar-ruta.interface';

@Component({
  selector: 'app-generar-ruta',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './generar-ruta.html',
  styleUrl: './generar-ruta.css'
})
export class GenerarRuta implements OnInit {
  rutaForm!: FormGroup;
  fechasDisponibles = signal<string[]>([]);
  pedidosAprobados = signal<Pedido[]>([]);
  loadingPedidos = signal(false);
  generandoRuta = signal(false);
  error = signal<string | null>(null);
  paisSeleccionado = signal('co');

  paises = [
    { codigo: 'co', nombre: 'Colombia' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'pe', nombre: 'Perú' },
    { codigo: 'ec', nombre: 'Ecuador' }
  ];

  constructor(
    private fb: FormBuilder,
    private generarRutaService: GenerarRutaService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.rutaForm = this.fb.group({
      fecha: ['', Validators.required]
    });

    this.cargarPedidos();
  }

  cargarPedidos(): void {
    console.log('Iniciando carga de pedidos...');
    this.loadingPedidos.set(true);
    this.error.set(null);
    this.fechasDisponibles.set([]);
    this.pedidosAprobados.set([]);

    this.generarRutaService.obtenerPedidos(this.paisSeleccionado()).subscribe({
      next: (pedidos: Pedido[]) => {
        console.log('Pedidos recibidos del servicio:', pedidos);

        // Filtrar solo pedidos APROBADOS
        const aprobados = pedidos.filter(pedido => pedido.estado === 'APROBADO');
        this.pedidosAprobados.set(aprobados);

        // Extraer fechas únicas de compromiso
        const fechasSet = new Set(aprobados.map(pedido => pedido.fecha_compromiso));
        const fechasArray = Array.from(fechasSet).sort();
        this.fechasDisponibles.set(fechasArray);

        console.log('Pedidos APROBADOS encontrados:', aprobados.length);
        console.log('Fechas disponibles:', fechasArray);
        console.log('Cambiando loadingPedidos a false...');

        this.loadingPedidos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.loadingPedidos.set(false);
        this.error.set('Error al cargar los pedidos. Por favor, intente nuevamente.');
        this.fechasDisponibles.set([]);
        this.pedidosAprobados.set([]);
      }
    });
  }

  onSubmit(): void {
    if (this.rutaForm.valid) {
      this.generandoRuta.set(true);
      this.error.set(null);

      const fecha = this.rutaForm.value.fecha;

      this.generarRutaService.generarRuta(fecha, this.paisSeleccionado()).subscribe({
        next: (response: GenerarRutaResponse) => {
          this.generandoRuta.set(false);

          const mensaje = response.message || 'Ruta generada exitosamente';

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
          console.error('Error al generar ruta:', error);
          this.generandoRuta.set(false);

          const errorMessage = error.error?.message || error.error?.detail || 'Error al generar la ruta. Por favor, intente nuevamente.';

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

  onPaisChange(pais: string): void {
    this.paisSeleccionado.set(pais);
    this.rutaForm.patchValue({ fecha: '' }); // Limpiar fecha seleccionada
    this.cargarPedidos();
  }

  getPedidosPorFecha(fecha: string): number {
    return this.pedidosAprobados().filter(pedido => pedido.fecha_compromiso === fecha).length;
  }

  getNombrePais(): string {
    const pais = this.paises.find(p => p.codigo === this.paisSeleccionado());
    return pais ? pais.nombre : this.paisSeleccionado();
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}
