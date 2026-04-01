import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio';
import { PrincipalComponent } from './pages/principal/principal';
import { ParqueaderosComponent } from './pages/parqueaderos/parqueaderos';
import { ReservasComponent } from './pages/reservas/reservas';
import { VerReservasComponent } from './pages/ver-reservas/ver-reservas';
import { PerfilComponent } from './pages/perfil/perfil';

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'principal', component: PrincipalComponent },
  { path: 'parqueaderos', component: ParqueaderosComponent },
  { path: 'reservas', component: ReservasComponent },
  { path: 'ver-reservas', component: VerReservasComponent },
  { path: 'perfil', component: PerfilComponent },
];