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
  cdr = inject(ChangeDetectorRef); // 🔨 Nuestro martillo para forzar a Angular a dibujar

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
          // 🔄 LA MAGIA: Recargamos la página real para que los comentarios vean la sesión
          window.location.href = '/'; 
        } else {
          this.mensaje = response?.message || 'Credenciales incorrectas';
          this.cdr.detectChanges(); // 🔨 Refrescamos la pantalla para mostrar el texto rojo
        }
      },
      error: (err) => {
        console.log('Error cazado por Angular:', err); 
        
        this.enviando = false; // Apagamos el botón de carga
        this.mensaje = err.error?.message || 'Usuario o Contraseña incorrectos'; 
        
        this.cdr.detectChanges(); // 🔨 ¡MARTILLAZO para que aparezca el error al instante!
      }
    });
  }
}