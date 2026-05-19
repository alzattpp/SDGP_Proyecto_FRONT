import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';

@Component({
  selector: 'app-principal',
  imports: [RouterLink, UsuarioNavbarComponent],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class PrincipalComponent {}
