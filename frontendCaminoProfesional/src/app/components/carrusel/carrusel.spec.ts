import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-carrusel',
  standalone: true,
  templateUrl: './carrusel.html',
  styleUrls: ['./carrusel.css']
})
export class CarruselComponent implements AfterViewInit {
  @ViewChild('carrusel') carruselRef!: ElementRef;
  
  velocidad = 1;
  direccion = 1;

  ngAfterViewInit() {
    setInterval(() => this.moverCarrusel(), 20);
  }

  moverCarrusel() {
    const carrusel = this.carruselRef.nativeElement;
    if (carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth) {
      this.direccion = -1;
    }
    if (carrusel.scrollLeft <= 0) {
      this.direccion = 1;
    }
    carrusel.scrollLeft += this.velocidad * this.direccion;
  }
}