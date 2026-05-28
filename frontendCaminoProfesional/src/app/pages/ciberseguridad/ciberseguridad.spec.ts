import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Ciberseguridad } from './ciberseguridad';

describe('Ciberseguridad', () => {
  let component: Ciberseguridad;
  let fixture: ComponentFixture<Ciberseguridad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Ciberseguridad],
    }).compileComponents();

    fixture = TestBed.createComponent(Ciberseguridad);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
