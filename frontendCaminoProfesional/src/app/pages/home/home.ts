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
  comprasAdmin = signal<any[]>([]);

  private nombresCursos: Record<number, string> = {
    1: 'Python desde cero',
    2: 'JavaScript moderno (ES6+)',
    3: 'Java para principiantes',
    4: 'Apuntes: Bases de Datos',
    5: 'Apuntes: Programación en C',
    6: 'Git & GitHub completo',
    7: 'Docker desde cero',
    8: 'Linux para desarrolladores'
  };

  nombreCurso(id: number): string {
    return this.nombresCursos[id] ?? `Curso #${id}`;
  }

  constructor() {
    effect(() => {
      if (this.auth.esAdmin()) {
        this.cargarUsuarios();
        this.cargarSolicitudes();
        this.cargarComentariosAdmin();
        this.cargarComprasAdmin();
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

  esSuperAdmin(): boolean {
    return this.auth.esSuperAdmin();
  }

  hacerAdmin(email: string, nombre: string) {
    Swal.fire({
      title: '¿Dar permisos de Admin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2ecc71',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, hacer Admin',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.post('http://localhost/backend/api/hacer_admin.php', { email }, { withCredentials: true })
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                Swal.fire('¡Actualizado!', `${nombre} ahora es administrador.`, 'success');
                this.cargarUsuarios();
              }
            },
            error: (err) => {
              console.error('Error al hacer admin:', err);
              Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
            }
          });
      }
    });
  }

  quitarAdmin(email: string, nombre: string) {
    Swal.fire({
      title: '¿Quitar permisos de Admin?',
      text: `Vas a degradar a ${nombre} a usuario normal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, quitar permisos',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.post('http://localhost/backend/api/quitar_admin.php', { email }, { withCredentials: true })
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                Swal.fire('¡Hecho!', `${nombre} ya no es administrador.`, 'success');
                this.cargarUsuarios();
              }
            },
            error: (err) => {
              console.error('Error al quitar admin:', err);
              Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error');
            }
          });
      }
    });
  }

  hacerSuperAdmin(email: string, nombre: string) {
    Swal.fire({
      title: '¿Ascender a Super Admin?',
      text: `${nombre} podrá gestionar a otros administradores.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2e9fff',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ascender',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.post('http://localhost/backend/api/hacer_super_admin.php', { email }, { withCredentials: true })
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                Swal.fire('¡Ascendido!', `${nombre} ahora es superadmin.`, 'success');
                this.cargarUsuarios();
              }
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error')
          });
      }
    });
  }

  degradarSuperAdmin(email: string, nombre: string) {
    Swal.fire({
      title: '¿Quitar Super Admin?',
      text: `${nombre} pasará a ser admin normal.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f39c12',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.http.post('http://localhost/backend/api/degradar_super_admin.php', { email }, { withCredentials: true })
          .subscribe({
            next: (res: any) => {
              if (res.success) {
                Swal.fire('¡Hecho!', `${nombre} ya no es superadmin.`, 'success');
                this.cargarUsuarios();
              }
            },
            error: () => Swal.fire('Error', 'No se pudo actualizar el usuario.', 'error')
          });
      }
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
        // Quitar de la lista local de forma inmediata
        this.comentariosAdmin.update(lista => lista.filter(c => c.id !== id));

        this.http.delete(`http://localhost/backend/api/borrar_comentario.php?id=${id}`, { withCredentials: true })
          .subscribe({
            next: (respuesta: any) => {
              if (respuesta.success) {
                Swal.fire('¡Borrado!', 'El comentario ha sido eliminado.', 'success');
              }
            },
            error: (err) => {
              console.error('Error al borrar comentario:', err);
              Swal.fire('Error', 'Hubo un error al borrar el comentario.', 'error');
              this.cargarComentariosAdmin(); // Restaurar si falló
            }
          });
      }
    });
  }

  cargarComprasAdmin() {
    this.http.get<any>('http://localhost/backend/api/get_compras_admin.php', { withCredentials: true })
      .subscribe({
        next: (res) => { if (res.success) this.comprasAdmin.set(res.data); },
        error: (err) => console.error('Error cargando compras:', err)
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
