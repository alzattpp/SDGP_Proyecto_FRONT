import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';

@Component({
  selector: 'app-trabajador-inicio',
  imports: [RouterLink, TrabajadorNavbarComponent],
  templateUrl: './trabajador-inicio.html',
  styleUrl: './trabajador-inicio.css',
})
export class TrabajadorInicioComponent {}
