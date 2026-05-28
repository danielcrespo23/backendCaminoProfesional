import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Header } from '../../components/header/header';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-smr',
  standalone: true,
  imports: [CommonModule, RouterModule, Header, Footer],
  templateUrl: './smr.html',
  styleUrls: ['./smr.css']
})
export class Smr {
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
    window.location.href = '/#puestostrabajoyformulario';
  }

  descargarPDF() {
    alert('Funcionalidad de descarga en desarrollo');
  }
}
