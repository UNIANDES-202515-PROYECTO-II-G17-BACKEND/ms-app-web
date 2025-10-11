import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from './login.service';
import {
  LoginRequest,
  LoginResponse,
  LoginFormData,
  LoginState,
  User
} from './login.interface';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup<{
    usuario: any;
    password: any;
  }>;

  // Estado del componente usando interface
  state: LoginState = {
    isLoading: false,
    error: null,
    user: null
  };

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      usuario: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.state.isLoading = true;
      this.state.error = null;

      const formValue = this.loginForm.value;
      const loginRequest: LoginRequest = {
        usuario: formValue.usuario || '',
        password: formValue.password || ''
      };

      this.loginService.login(loginRequest).subscribe({
        next: (response: LoginResponse) => {
          console.log('Login exitoso:', response);
          this.state.isLoading = false;
          this.state.user = response.user;

          // TODO: Navegar a /home cuando exista la ruta
          // this.router.navigate(['/home']);
          alert(`¡Bienvenido ${response.user.nombre}! (Pendiente: crear ruta /home)`);
        },
        error: (error: any) => {
          console.error('Error en login:', error);
          this.state.isLoading = false;
          this.state.error = 'Error de autenticación. Verifica tus credenciales.';
          alert(this.state.error);
        }
      });
    }
  }

  // Getter para facilitar el acceso al estado de loading en el template
  get isLoading(): boolean {
    return this.state.isLoading;
  }
}
