import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-modal-bienvenida',
  imports: [],
  templateUrl: './modal-bienvenida.html',
  styleUrl: './modal-bienvenida.css'
})
export class ModalBienvenida {
  visible = signal(true);

  activar() {
    this.visible.set(false);
    this.hablar("Asistencia activada. Tu camino profesional en la informática empieza aquí.");
  }

  cerrar() {
    this.visible.set(false);
    window.speechSynthesis.cancel();
  }

  hablar(texto: string) {
    window.speechSynthesis.cancel();
    const m = new SpeechSynthesisUtterance(texto);
    m.lang = 'es-ES';
    window.speechSynthesis.speak(m);
  }
}