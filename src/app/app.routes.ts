import { Routes } from '@angular/router';
import { loginGuard } from './core/login.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'info',
    loadComponent: () => import('./pages/info/info.component').then(m => m.InfoComponent)
  },
  {
    path: 'mitos',
    loadComponent: () => import('./pages/mitos/mitos.component').then(m => m.MitosComponent)
  },
  {
    path: 'preparo',
    loadComponent: () => import('./pages/preparo/preparo.component').then(m => m.PreparoComponent)
  },

  {
    path: 'area-do-paciente',
    canActivate: [loginGuard],
    loadComponent: () => import('./pages/area-do-paciente/area-do-paciente.component').then(m => m.AreaDoPacienteComponent)
  },
  {
    path: 'marcacao',
    canActivate: [loginGuard], 
    loadComponent: () => import('./pages/marcacao/marcacao.component').then(m => m.MarcacaoComponent)
  },
  {
    path: 'historico',
    canActivate: [loginGuard], 
    loadComponent: () => import('./pages/historico/historico.component').then(m => m.HistoricoComponent)
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];