import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface PopupData {
  type: 'success' | 'error';
  message: string;
}

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <div class="p-4">
      <h2 mat-dialog-title>
        {{ data.type === 'success' ? '✅ Éxito' : '❌ Error' }}
      </h2>
      <div mat-dialog-content>
        <p>{{ data.message }}</p>
      </div>
      <div mat-dialog-actions class="flex justify-content-end">
        <button mat-button (click)="close()">OK</button>
      </div>
    </div>
  `
})
export class PopupComponent {
  constructor(
    public dialogRef: MatDialogRef<PopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PopupData
  ) {}

  close(): void {
    this.dialogRef.close();
  }
}
