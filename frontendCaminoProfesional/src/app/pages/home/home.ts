import { Component, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { timeout, TimeoutError } from 'rxjs';
import { Auth, Usuario } from '../../services/auth';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';
import { Carrusel } from '../../components/carrusel/carrusel';
import { Comentarios } from '../../components/comentarios/comentarios';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    Header,
    Footer,
    Carrusel,
    Comentarios
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home {
  auth = inject(Auth);
  http = inject(HttpClient);

  usuariosMock = signal<Usuario[]>([]);
  solicitudesInfo = signal<any[]>([]);
  mostrarExito = signal(false);
  mensaje = signal('');
  enviando = signal(false);

  formulario = {
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    grados: ''
  };

  comentariosAdmin = signal<any[]>([]);

  constructor() {
    effect(() => {
      if (this.auth.esAdmin()) {
        this.cargarUsuarios();
        this.cargarSolicitudes();
        this.cargarComentariosAdmin();
      }
    });
  }

  hablar(texto: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }

  enviar() {
    if (this.enviando()) return;

    this.enviando.set(true);
    this.mensaje.set('');
    this.mostrarExito.set(false);

    this.http.post('http://localhost/backend/api/solicitar_info.php', this.formulario, { withCredentials: true })
      .pipe(timeout(10000))
      .subscribe({
        next: (response: any) => {
          this.enviando.set(false);
          if (response.success) {
            this.formulario = { email: '', nombre: '', apellido: '', telefono: '', grados: '' };
            this.mostrarExito.set(true);
            setTimeout(() => this.mostrarExito.set(false), 5000);
            if (this.auth.esAdmin()) {
              this.cargarSolicitudes();
            }
          } else {
            this.mensaje.set('❌ ' + response.message);
          }
        },
        error: (err) => {
          this.enviando.set(false);
          this.mensaje.set(err instanceof TimeoutError
            ? '❌ La solicitud tardó demasiado. Inténtalo de nuevo.'
            : '❌ Error al enviar la solicitud');
        }
      });
  }

  cerrarExito() {
    this.mostrarExito.set(false);
  }

  cargarUsuarios() {
    this.auth.getUsuarios().subscribe({
      next: (response) => {
        if (response.success) {
          this.usuariosMock.set(response.data);
        }
      },
      error: (err) => console.error('Error cargando usuarios:', err)
    });
  }

  cargarSolicitudes() {
    this.http.get('http://localhost/backend/api/get_solicitudes.php', { withCredentials: true }).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.solicitudesInfo.set(response.data);
        }
      },
      error: (err) => console.error('Error cargando solicitudes de info:', err)
    });
  }

  borrarUsuario(email: string, nombre: string) {
    Swal.fire({
      title: '¿Eliminar usuario?',
      text: `Vas a borrar a ${nombre} (${email}). Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4757',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost/backend/api/borrar_usuario.php?email=${email}`, { withCredentials: true })
          .subscribe({
            next: (respuesta: any) => {
              if (respuesta.success) {
                Swal.fire('¡Borrado!', 'El usuario ha sido eliminado.', 'success');
                this.cargarUsuarios();
              }
            },
            error: (err) => {
              console.error('Error al borrar:', err);
              Swal.fire('Error', 'Hubo un error al borrar el usuario.', 'error');
            }
          });
      }
    });
  }

  cargarComentariosAdmin() {
    this.http.get<any[]>(`http://localhost/backend/api/get_comentarios.php?t=${new Date().getTime()}`, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.comentariosAdmin.set(data);
        },
        error: (err) => console.error('Error cargando comentarios:', err)
      });
  }

  borrarComentarioAdmin(id: any) {
    Swal.fire({
      title: '¿Eliminar comentario?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4757',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost/backend/api/borrar_comentario.php?id=${id}`, { withCredentials: true })
          .subscribe({
            next: (respuesta: any) => {
              if (respuesta.success) {
                Swal.fire('¡Borrado!', 'El comentario ha sido eliminado.', 'success');
                this.cargarComentariosAdmin();
              }
            },
            error: (err) => {
              console.error('Error al borrar comentario:', err);
              Swal.fire('Error', 'Hubo un error al borrar el comentario.', 'error');
            }
          });
      }
    });
  }

  borrarSolicitud(id: any, nombre: string) {
    Swal.fire({
      title: '¿Eliminar solicitud?',
      text: `Vas a borrar la solicitud de ${nombre}. Esta acción es irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4757',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost/backend/api/borrar_solicitud.php?id=${id}`, { withCredentials: true })
          .subscribe({
            next: (respuesta: any) => {
              if (respuesta.success) {
                Swal.fire('¡Borrada!', 'La solicitud ha sido eliminada.', 'success');
                this.cargarSolicitudes();
              }
            },
            error: (err) => {
              console.error('Error al borrar solicitud:', err);
              Swal.fire('Error', 'Hubo un error al borrar la solicitud.', 'error');
            }
          });
      }
    });
  }
}
