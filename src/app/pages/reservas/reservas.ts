import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';

@Component({
  selector: 'app-reservas',
  imports: [RouterLink, UsuarioNavbarComponent],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class ReservasComponent {}
