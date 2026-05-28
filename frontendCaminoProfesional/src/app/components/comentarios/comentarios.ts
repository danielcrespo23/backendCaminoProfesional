import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.css']
})
export class Comentarios implements OnInit {
  @Output() comentariosCambiaron = new EventEmitter<void>();

  auth = inject(Auth);

  comentarios: any[] = [];
  nuevoComentario: string = '';
  isLoggedIn: boolean = false;
  nombreUsuario: string = '';
  activeReplyId: number | null = null;
  nuevaRespuesta: string = '';

  private apiUrl = 'http://localhost/backend/api';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.comprobarSesion();
    this.cargarComentarios();
  }

  comprobarSesion(): void {
    this.http.get<any>(`${this.apiUrl}/check-session.php`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.authenticated && res.user) {
            this.isLoggedIn = true;
            this.nombreUsuario = res.user.nombre;
          } else {
            this.isLoggedIn = false;
          }
        },
        error: () => { this.isLoggedIn = false; }
      });
  }

  cargarComentarios(): void {
    const urlSinCache = `${this.apiUrl}/get_comentarios.php?t=${new Date().getTime()}`;
    this.http.get<any[]>(urlSinCache, { withCredentials: true })
      .subscribe({
        next: (data) => {
          this.comentarios = data.map(c => ({
            ...c,
            parent_id: c.parent_id ?? c.PARENT_ID ?? null
          }));
        },
        error: (err) => console.error('Error al cargar comentarios:', err)
      });
  }

  obtenerComentariosPrincipales(): any[] {
    return this.comentarios.filter(c => !c.parent_id);
  }

  obtenerRespuestas(idPrincipal: number): any[] {
    return this.comentarios.filter(c => Number(c.parent_id) === Number(idPrincipal));
  }

  toggleReplyBox(id: number): void {
    this.activeReplyId = this.activeReplyId === id ? null : id;
    this.nuevaRespuesta = '';
  }

  enviarComentario(): void {
    if (!this.nuevoComentario.trim()) return;
    this.http.post<any>(`${this.apiUrl}/guardar_comentario.php`, { texto_comentario: this.nuevoComentario }, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.nuevoComentario = '';
            this.cargarComentarios();
            this.comentariosCambiaron.emit();
          }
        },
        error: (err) => console.error('Error al enviar comentario:', err)
      });
  }

  enviarRespuesta(parentId: number): void {
    if (!this.nuevaRespuesta.trim()) return;
    this.http.post<any>(
      `${this.apiUrl}/guardar_comentario.php`,
      { texto_comentario: this.nuevaRespuesta, parent_id: parentId },
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.nuevaRespuesta = '';
          this.activeReplyId = null;
          this.cargarComentarios();
          this.comentariosCambiaron.emit();
        }
      },
      error: (err) => console.error('Error al enviar respuesta:', err)
    });
  }

  borrarComentario(id: any): void {
    Swal.fire({
      title: '¿Borrar comentario?',
      text: 'Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ff4757',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result: any) => {
      if (result.isConfirmed) {
        this.comentarios = this.comentarios.filter(c => c.id !== id && c.id !== String(id));
        this.comentariosCambiaron.emit();
        this.http.delete(`${this.apiUrl}/borrar_comentario.php?id=${id}`, { withCredentials: true })
          .subscribe({
            next: () => {},
            error: () => {
              this.cargarComentarios();
              this.comentariosCambiaron.emit();
            }
          });
      }
    });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }
}
