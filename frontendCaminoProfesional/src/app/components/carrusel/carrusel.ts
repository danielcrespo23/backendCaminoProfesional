import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  imports: [],
  templateUrl: './carrusel.html',
  styleUrl: './carrusel.css'
})
export class Carrusel implements AfterViewInit, OnDestroy {
  @ViewChild('carrusel') carruselRef!: ElementRef<HTMLDivElement>;
  private intervalId?: number;
  private direccion = 1;

  empresas = [
    { img: 'imagenesempresas/APPLE.webp', nombre: 'APPLE' },
    { img: 'imagenesempresas/nvidia.jpg', nombre: 'NVIDIA' },
    { img: 'imagenesempresas/KPMG.jpg', nombre: 'KPMG' },
    { img: 'imagenesempresas/MICROSOFT.jpg', nombre: 'MICROSOFT' },
    { img: 'imagenesempresas/TELEFONICA.jpg', nombre: 'TELEFONICA' },
    { img: 'imagenesempresas/OPENAI.webp', nombre: 'OPEN AI' },
    { img: 'imagenesempresas/AMAZON.webp', nombre: 'AMAZON' }
  ];

  ngAfterViewInit() {
    this.intervalId = window.setInterval(() => {
      const c = this.carruselRef.nativeElement;
      if (c.scrollLeft + c.clientWidth >= c.scrollWidth) this.direccion = -1;
      if (c.scrollLeft <= 0) this.direccion = 1;
      c.scrollLeft += this.direccion;
    }, 20);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}