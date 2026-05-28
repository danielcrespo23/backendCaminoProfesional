import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  auth = inject(Auth);
  router = inject(Router);
  cdr = inject(ChangeDetectorRef); // 🎯 Mecanismo para forzar el renderizado de Angular

  email = '';
  clave = '';
  mensaje = '';
  enviando = false;

  login() {
    if (this.enviando) return;

    this.enviando = true;
    this.mensaje = '';

    this.auth.login(this.email, this.clave).subscribe({
      next: (response: any) => {
        this.enviando = false;

        if (response && response.success) {
          // 🎯 Recargamos la página completa para que los comentarios vean la sesión
          window.location.href = '/';
        } else {
          this.mensaje = response?.message || '❌ Usuario o Contraseña incorrectos';
          this.cdr.detectChanges(); // 🎯 Forzar refresco para mostrar el texto rojo
        }
      },
      error: (err) => {
        console.log('Error capturado por Angular:', err);

        this.enviando = false;
        this.mensaje = err.error?.message || '❌ Usuario o Contraseña incorrectos';

        this.cdr.detectChanges(); // 🎯 Forzar que el error aparezca al instante
      }
    });
  }
}
