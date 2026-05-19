import { Routes } from '@angular/router';
import { adminGuestGuard, guestGuard, roleGuard } from './auth/role.guard';
import { InicioComponent } from './pages/inicio/inicio';
import { PrincipalComponent } from './pages/principal/principal';
import { ParqueaderosComponent } from './pages/parqueaderos/parqueaderos';
import { ReservasComponent } from './pages/reservas/reservas';
import { VerReservasComponent } from './pages/ver-reservas/ver-reservas';
import { PerfilComponent } from './pages/perfil/perfil';
import { PagosComponent } from './pages/pagos/pagos';
import { ParqueaderosVisitantesComponent } from './pages/parqueaderos-visitantes/parqueaderos-visitantes';
import { TrabajadorInicioComponent } from './pages/trabajador-inicio/trabajador-inicio';
import { GestionComponent } from './pages/gestion/gestion';
import { ReservasTrabajadorComponent } from './pages/reservas-trabajador/reservas-trabajador';
import { PagosTrabajadorComponent } from './pages/pagos-trabajador/pagos-trabajador';
import { PerfilTrabajadorComponent } from './pages/perfil-trabajador/perfil-trabajador';
import { AdminLoginComponent } from './pages/admin-login/admin-login';
import { AdminPerfilComponent } from './pages/admin-perfil/admin-perfil';
import { AdminParqueaderosComponent } from './pages/admin-parqueaderos/admin-parqueaderos';
import { AdminTrabajadoresComponent } from './pages/admin-trabajadores/admin-trabajadores';
import { AdminReservasComponent } from './pages/admin-reservas/admin-reservas';
import { AdminPagosComponent } from './pages/admin-pagos/admin-pagos';
import { AdminReportesComponent } from './pages/admin-reportes/admin-reportes';

export const routes: Routes = [
  { path: '', component: InicioComponent, canActivate: [guestGuard] },
  {
    path: 'principal',
    component: PrincipalComponent,
    canActivate: [roleGuard(['usuario'])],
  },
  { path: 'pagos', component: PagosComponent, canActivate: [roleGuard(['usuario'])] },
  {
    path: 'parqueaderos',
    component: ParqueaderosComponent,
    canActivate: [roleGuard(['usuario'])],
  },
  {
    path: 'parqueaderos-visitantes',
    component: ParqueaderosVisitantesComponent,
    canActivate: [roleGuard(['usuario'])],
  },
  { path: 'reservas', component: ReservasComponent, canActivate: [roleGuard(['usuario'])] },
  {
    path: 'ver-reservas',
    component: VerReservasComponent,
    canActivate: [roleGuard(['usuario'])],
  },
  { path: 'perfil', component: PerfilComponent, canActivate: [roleGuard(['usuario'])] },
  {
    path: 'trabajador',
    component: TrabajadorInicioComponent,
    canActivate: [roleGuard(['trabajador'])],
  },
  { path: 'gestion', component: GestionComponent, canActivate: [roleGuard(['trabajador'])] },
  {
    path: 'trabajador/reservas',
    component: ReservasTrabajadorComponent,
    canActivate: [roleGuard(['trabajador'])],
  },
  {
    path: 'trabajador/pagos',
    component: PagosTrabajadorComponent,
    canActivate: [roleGuard(['trabajador'])],
  },
  {
    path: 'trabajador/perfil',
    component: PerfilTrabajadorComponent,
    canActivate: [roleGuard(['trabajador'])],
  },
  {
    path: 'admin',
    redirectTo: 'admin/perfil',
    pathMatch: 'full',
  },
  {
    path: 'admin/login',
    component: AdminLoginComponent,
    canActivate: [adminGuestGuard],
  },
  {
    path: 'admin/perfil',
    component: AdminPerfilComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  {
    path: 'admin/parqueaderos',
    component: AdminParqueaderosComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  {
    path: 'admin/trabajadores',
    component: AdminTrabajadoresComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  {
    path: 'admin/reservas',
    component: AdminReservasComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  {
    path: 'admin/pagos',
    component: AdminPagosComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  {
    path: 'admin/reportes',
    component: AdminReportesComponent,
    canActivate: [roleGuard(['administrador'])],
  },
  { path: '**', redirectTo: '' },
];
