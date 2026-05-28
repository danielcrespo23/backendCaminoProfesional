import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

export interface Usuario {
  nombre: string;
  email: string;
  apellido?: string;
  telefono?: string;
  grados?: string;
  esAdmin: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: Usuario;
}

interface RegisterResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface SessionResponse {
  authenticated: boolean;
  user?: Usuario;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private apiUrl = 'http://localhost/backend/api';
  // ← Aquí apunta al backend

  // Signals para reactividad
  usuario = signal<Usuario | null>(null);
  esAdmin = signal<boolean>(false);
  isAuthenticated = signal<boolean>(false);

  // BehaviorSubject para compatibilidad con guards
  private authStatus = new BehaviorSubject<boolean>(false);
  authStatus$ = this.authStatus.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.checkSession();
  }

  // Verificar sesión al iniciar la app
  checkSession(): void {
    this.http.get<SessionResponse>(`${this.apiUrl}/check-session.php`, { withCredentials: true })
      .pipe(
        catchError(() => of({ authenticated: false } as SessionResponse))
      )
      .subscribe(response => {
        if (response.authenticated && response.user) {
          this.setUserData(response.user);
        } else {
          this.clearUserData();
        }
      });
  }

  // Login
  login(email: string, clave: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login.php`,
      { email, clave },
      { withCredentials: true }
    ).pipe(
      tap(response => {
        // Solo hacemos cosas aquí si es un éxito real (200 OK)
        if (response.success && response.user) {
          this.setUserData(response.user);
        }
      })
      // Eliminamos el catchError para que el error 401 llegue tal cual al componente
    );
  }

  // Registro
  register(data: {
    email: string;
    nombre: string;
    apellido: string;
    clave?: string;
    telefono?: string;
    grados?: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(
      `${this.apiUrl}/register.php`,
      data,
      { withCredentials: true }
    ).pipe(
      catchError(error => {
        console.error('Error en registro:', error);
        return of({
          success: false,
          message: error.error?.message || 'Error al registrar usuario'
        });
      })
    );
  }

  // Logout
  logout(): void {
    this.http.post(`${this.apiUrl}/logout.php`, {}, { withCredentials: true })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe(() => {
        this.clearUserData();
        // 🔥 CAMBIAMOS EL ROUTER POR LA RECARGA COMPLETA PARA EVITAR EL BUG DE LOS COMENTARIOS
        window.location.href = '/';
      });
  }

  // Obtener usuarios (admin)
  getUsuarios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/usuarios.php`, { withCredentials: true });
  }

  // Helpers privados
  private setUserData(user: Usuario): void {
    this.usuario.set(user);
    this.esAdmin.set(user.esAdmin);
    this.isAuthenticated.set(true);
    this.authStatus.next(true);
  }

  private clearUserData(): void {
    this.usuario.set(null);
    this.esAdmin.set(false);
    this.isAuthenticated.set(false);
    this.authStatus.next(false);
  }
}
