import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-comentarios',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './comentarios.html',
  styleUrls: ['./comentarios.css']
})
export class Comentarios implements OnInit {
  comentarios: any[] = [];
  nuevoComentario: string = '';
  isLoggedIn: boolean = false;
  nombreUsuario: string = '';

  // ← Apunta al backend PHP en XAMPP
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
        error: () => {
          this.isLoggedIn = false;
        }
      });
  }

  cargarComentarios(): void {
    const urlSinCache = `${this.apiUrl}/get_comentarios.php?t=${new Date().getTime()}`;
    console.log('🕵️‍♂️ Preguntando a PHP en la ruta:', urlSinCache);

    this.http.get<any[]>(urlSinCache, { withCredentials: true })
      .subscribe({
        next: (data) => {
          console.log('📦 ¡Paquete recibido de PHP! Mira lo que trae:', data);
          this.comentarios = data;
        },
        error: (err) => {
          console.error('❌ Error fatal al cargar comentarios:', err);
        }
      });
  }
  
  borrarComentario(id: any): void {
    if (confirm('¿Estás seguro de que quieres borrar este comentario?')) {
      
      this.http.delete(`${this.apiUrl}/borrar_comentario.php?id=${id}`, { withCredentials: true })
        .subscribe({
          next: (respuesta: any) => {
            console.log('Comentario destruido:', respuesta);
            
            // 🔥 LA SOLUCIÓN CLÁSICA: Volvemos a pedir la lista fresca al servidor
            this.cargarComentarios(); 
            
          },
          error: (err) => {
            console.error('Error al intentar borrar:', err);
            alert('Hubo un error al borrar el comentario.');
          }
        });
    }
  }
  enviarComentario(): void {
    if (!this.nuevoComentario.trim()) return;

    const body = { texto_comentario: this.nuevoComentario };

    this.http.post<any>(`${this.apiUrl}/guardar_comentario.php`, body, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.comentarios.unshift({
              nombre_autor: this.nombreUsuario, // ✅ cambiado a nombre_autor
              comentario: this.nuevoComentario, // ✅ cambiado a comentario
              fecha_creacion: new Date().toISOString()
            });
            this.nuevoComentario = '';
          }
        },
        error: (err) => {
          console.error('Error al enviar comentario:', err);
        }
      });
  }

  irAlLogin(): void {
    this.router.navigate(['/login']);
  }
}
