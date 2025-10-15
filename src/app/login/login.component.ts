import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { LoginService } from './login.service';
import { PopupComponent } from '../shared/popup/popup.component';
import {
  LoginRequest,
  LoginResponse
} from './login.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup<{
    username: any;
    password: any;
  }>;

  // Estado del componente
  state = {
    isLoading: false,
    error: null as string | null
  };

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.loginForm.value;
      const loginRequest: LoginRequest = {
        username: formValue.username || '',
        password: formValue.password || ''
      };

      this.loginService.login(loginRequest).subscribe({
        next: (response: LoginResponse) => {
          this.state.isLoading = false;

          // Guardar el token
          localStorage.setItem('access_token', response.access_token);

          // Mostrar popup de éxito
          const dialogRef = this.dialog.open(PopupComponent, {
            data: {
              type: 'success',
              message: '¡Login exitoso! Bienvenido a MediSupply.'
            }
          });

          // Navegar al home después de cerrar el popup
          dialogRef.afterClosed().subscribe(() => {
            this.router.navigate(['/home']);
          });
        },
        error: (error: any) => {
          this.state.isLoading = false;

          // Extraer mensaje de error de la API
          const errorMessage = error.error?.detail || 'Error de autenticación. Verifica tus credenciales.';
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
}
