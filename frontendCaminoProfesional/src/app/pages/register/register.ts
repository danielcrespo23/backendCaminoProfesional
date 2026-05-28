import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  auth = inject(Auth);
  router = inject(Router);

  email = '';
  nombre = '';
  apellido = '';
  clave = '';
  telefono = '';
  grados = '';
  mensaje = '';
  mensajeExito = '';
  enviando = false;

  register() {
    if (this.enviando) return;

    this.enviando = true;
    this.mensaje = '';
    this.mensajeExito = '';

    this.auth.register({
      email: this.email,
      nombre: this.nombre,
      apellido: this.apellido,
      clave: this.clave,
      telefono: this.telefono,
      grados: this.grados
    }).subscribe({
      next: (response) => {
        this.enviando = false;
        if (response.success) {
          this.mensajeExito = 'Cuenta creada correctamente. Redirigiendo al login...';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else {
          this.mensaje = response.message;
        }
      },
      error: () => {
        this.enviando = false;
        this.mensaje = 'Error al registrar usuario';
      }
    });
  }
}
