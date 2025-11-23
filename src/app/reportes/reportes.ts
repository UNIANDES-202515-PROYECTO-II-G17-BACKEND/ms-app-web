import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportesService } from './reportes.service';
import { Vendedor, Visita, PlanVentaCompleto } from './reportes.interface';

@Component({
  selector: 'app-reportes',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatNativeDateModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reportes.html',
  styleUrl: './reportes.css'
})
export class Reportes {
  reporteForm: FormGroup;

  // Signals para el estado
  paisSeleccionado = signal<string>('');
  vendedores = signal<Vendedor[]>([]);
  visitas = signal<Visita[]>([]);
  planesVenta = signal<PlanVentaCompleto[]>([]);
  cargandoVendedores = signal<boolean>(false);
  cargandoVisitas = signal<boolean>(false);
  cargandoPlanesVenta = signal<boolean>(false);

  // Datos estáticos
  paises = [
    { codigo: 'co', nombre: 'Colombia' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'pe', nombre: 'Perú' },
    { codigo: 'ec', nombre: 'Ecuador' }
  ];

  // Columnas para las tablas
  visitasColumns: string[] = ['cliente', 'direccion', 'ciudad', 'contacto', 'fecha', 'estado'];
  planesVentaColumns: string[] = ['vendedor', 'cliente', 'territorio', 'periodo', 'meta_monto', 'meta_unidades', 'productos', 'fechas', 'estado'];  constructor(
    private fb: FormBuilder,
    private reportesService: ReportesService
  ) {
    this.reporteForm = this.fb.group({
      pais: ['', Validators.required],
      vendedor: ['', Validators.required],
      fecha: ['', Validators.required]
    });
  }

  onPaisChange(): void {
    const paisCodigo = this.reporteForm.get('pais')?.value;
    if (paisCodigo) {
      this.paisSeleccionado.set(paisCodigo);
      this.reporteForm.patchValue({
        vendedor: '',
        fecha: ''
      });
      this.visitas.set([]);
      this.cargarVendedores(paisCodigo);
    }
  }

  cargarVendedores(pais: string): void {
    this.cargandoVendedores.set(true);
    this.reportesService.getVendedores(pais).subscribe({
      next: (vendedores) => {
        this.vendedores.set(vendedores);
        this.cargandoVendedores.set(false);
      },
      error: (error) => {
        console.error('Error cargando vendedores:', error);
        this.cargandoVendedores.set(false);
      }
    });
  }

  generarReporteVisitas(): void {
    if (this.reporteForm.valid) {
      const { pais, vendedor, fecha } = this.reporteForm.value;
      const fechaFormateada = this.formatearFecha(fecha);

      this.cargandoVisitas.set(true);
      this.reportesService.getVisitas(pais, vendedor, fechaFormateada).subscribe({
        next: (visitas) => {
          this.visitas.set(visitas);
          this.cargandoVisitas.set(false);
        },
        error: (error) => {
          console.error('Error cargando visitas:', error);
          this.cargandoVisitas.set(false);
        }
      });
    }
  }

  private formatearFecha(fecha: Date): string {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getNombrePais(codigo: string): string {
    const pais = this.paises.find(p => p.codigo === codigo);
    return pais ? pais.nombre : '';
  }

  getNombreVendedor(id: number): string {
    const vendedor = this.vendedores().find(v => v.id === id);
    return vendedor ? vendedor.full_name : '';
  }

  getPlanesActivos(): number {
    return this.planesVenta().filter(plan => plan.activo).length;
  }

  getPlanesInactivos(): number {
    return this.planesVenta().filter(plan => !plan.activo).length;
  }

  async generarPDF(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF();
    const visitas = this.visitas();
    const vendedorNombre = this.getNombreVendedor(this.reporteForm.get('vendedor')?.value);
    const paisNombre = this.getNombrePais(this.reporteForm.get('pais')?.value);
    const fecha = this.reporteForm.get('fecha')?.value;
    const fechaFormateada = this.formatearFecha(fecha);

    // Configurar documento
    doc.setFontSize(20);
    doc.setTextColor(124, 77, 255);
    doc.text('Reporte de Visitas Pendientes', 20, 20);

    // Información del reporte
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`País: ${paisNombre}`, 20, 40);
    doc.text(`Vendedor: ${vendedorNombre}`, 20, 50);
    doc.text(`Fecha: ${fechaFormateada}`, 20, 60);
    doc.text(`Total de visitas: ${visitas.length}`, 20, 70);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 80);

    // Preparar datos para la tabla
    const tableData = visitas.map(visita => [
      `ID: ${visita.id_cliente}`,
      visita.direccion,
      visita.ciudad,
      visita.contacto,
      visita.fecha,
      visita.estado.charAt(0).toUpperCase() + visita.estado.slice(1)
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Cliente', 'Dirección', 'Ciudad', 'Contacto', 'Fecha', 'Estado']],
      body: tableData,
      startY: 90,
      theme: 'striped',
      headStyles: {
        fillColor: [124, 77, 255],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { top: 90, left: 20, right: 20, bottom: 20 }
    });

    // Agregar pie de página manualmente
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'MediSupply - Sistema de Gestión Médica',
        20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
    }

    // Descargar PDF
    const fileName = `reporte-visitas-${vendedorNombre.replace(/\s+/g, '-').toLowerCase()}-${fechaFormateada}.pdf`;
    doc.save(fileName);
  }

  // Métodos para planes de venta
  onPaisChangePlanesVenta(pais: string): void {
    this.paisSeleccionado.set(pais);
    this.planesVenta.set([]); // Limpiar datos anteriores
    this.cargarPlanesVenta(pais);
  }

  cargarPlanesVenta(pais: string): void {
    this.cargandoPlanesVenta.set(true);
    this.planesVenta.set([]); // Asegurar que esté vacío durante la carga

    this.reportesService.getPlanesVentaCompletos(pais).subscribe({
      next: (planes) => {
        console.log('Planes recibidos:', planes); // Debug
        this.planesVenta.set(planes || []); // Asegurar que nunca sea null/undefined
        this.cargandoPlanesVenta.set(false);
      },
      error: (error) => {
        console.error('Error cargando planes de venta:', error);
        this.planesVenta.set([]); // Asegurar array vacío en caso de error
        this.cargandoPlanesVenta.set(false);
      }
    });
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(monto);
  }

  formatearPeriodo(fechaInicio: string, fechaFin: string): string {
    const inicio = new Date(fechaInicio).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const fin = new Date(fechaFin).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${inicio} - ${fin}`;
  }

  async generarPDFPlanesVenta(): Promise<void> {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('l', 'mm', 'a4'); // Formato horizontal para más espacio
    const planes = this.planesVenta();
    const paisNombre = this.getNombrePais(this.paisSeleccionado());

    // Configurar documento
    doc.setFontSize(20);
    doc.setTextColor(124, 77, 255);
    doc.text('Reporte de Planes de Venta', 20, 20);

    // Información del reporte
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`País: ${paisNombre}`, 20, 35);
    doc.text(`Total de planes: ${planes.length}`, 20, 45);
    doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 20, 55);

    // Preparar datos para la tabla
    const tableData = planes.map(plan => [
      plan.vendedor_nombre,
      plan.cliente_objetivo_nombre,
      plan.territorio,
      plan.periodo.charAt(0).toUpperCase() + plan.periodo.slice(1),
      this.formatearMonto(plan.meta_monto),
      plan.meta_unidades.toString(),
      plan.meta_clientes.toString(),
      `${plan.productos_count} productos`,
      this.formatearPeriodo(plan.fecha_inicio, plan.fecha_fin),
      plan.activo ? 'Activo' : 'Inactivo'
    ]);

    // Generar tabla
    autoTable(doc, {
      head: [['Vendedor', 'Cliente', 'Territorio', 'Período', 'Meta Monto', 'Meta Unidades', 'Meta Clientes', 'Productos', 'Fechas', 'Estado']],
      body: tableData,
      startY: 65,
      theme: 'striped',
      headStyles: {
        fillColor: [124, 77, 255],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: {
        fontSize: 7
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      margin: { top: 65, left: 20, right: 20, bottom: 20 }
    });

    // Agregar pie de página manualmente
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        'MediSupply - Sistema de Gestión Médica',
        20,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Página ${i} de ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      );
    }

    // Descargar PDF
    const fileName = `reporte-planes-venta-${paisNombre.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
