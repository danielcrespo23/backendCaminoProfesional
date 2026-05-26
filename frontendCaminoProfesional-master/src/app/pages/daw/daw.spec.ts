import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Daw } from './daw';

describe('Daw', () => {
  let component: Daw;
  let fixture: ComponentFixture<Daw>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Daw],
    }).compileComponents();

    fixture = TestBed.createComponent(Daw);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
