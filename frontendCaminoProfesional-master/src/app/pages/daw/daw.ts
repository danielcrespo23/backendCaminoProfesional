import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-daw',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './daw.html',
  styleUrls: ['./daw.css']
})
export class Daw {
  cursoActivo = 1;
  moduloAbierto: string | null = null;
  faqAbierto: number | null = null;

  toggleModulo(id: string) {
    this.moduloAbierto = this.moduloAbierto === id ? null : id;
  }

  toggleFAQ(id: number) {
    this.faqAbierto = this.faqAbierto === id ? null : id;
  }

  scrollToFormulario() {
    // Redirigir a home con anchor
    window.location.href = '/#puestostrabajoyformulario';
  }

  descargarPDF() {
    // Implementar descarga de PDF
    alert('Funcionalidad de descarga en desarrollo');
  }
}