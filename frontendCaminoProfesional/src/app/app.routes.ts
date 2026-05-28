import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Daw } from './pages/daw/daw';
import { Dam } from './pages/dam/dam';
import { Asir } from './pages/asir/asir';
import { Smr } from './pages/smr/smr';
import { Ciberseguridad } from './pages/ciberseguridad/ciberseguridad';
import { Bigdata } from './pages/bigdata/bigdata';
import { Ia } from './pages/ia/ia';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { Cursos } from './pages/cursos/cursos';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cursos', component: Cursos },
  { path: 'daw', component: Daw },
  { path: 'dam', component: Dam },
  { path: 'asir', component: Asir },
  { path: 'smr', component: Smr },
  { path: 'ciberseguridad', component: Ciberseguridad },
  { path: 'bigdata', component: Bigdata },
  { path: 'ia', component: Ia },
  { path: '**', redirectTo: '' }
];