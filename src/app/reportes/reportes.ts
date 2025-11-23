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
import { Vendedor, Visita } from './reportes.interface';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  cargandoVendedores = signal<boolean>(false);
  cargandoVisitas = signal<boolean>(false);

  // Datos estáticos
  paises = [
    { codigo: 'co', nombre: 'Colombia' },
    { codigo: 'mx', nombre: 'México' },
    { codigo: 'pe', nombre: 'Perú' },
    { codigo: 'ec', nombre: 'Ecuador' }
  ];

  // Columnas para la tabla de visitas
  visitasColumns: string[] = ['cliente', 'direccion', 'ciudad', 'contacto', 'fecha', 'estado'];

  constructor(
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

  generarPDF(): void {
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
}
