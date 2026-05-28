import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  auth = inject(Auth);

  scrollToForm() {
    document.getElementById('puestostrabajoyformulario')
      ?.scrollIntoView({ behavior: 'smooth' });
  }

  // 🔥 Nueva función para controlar el cierre de sesión
  cerrarSesion() {
    this.auth.logout(); // Ahora solo llama al servicio, y el servicio hará la recarga
  }
}
