import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Asir } from './asir';

describe('Asir', () => {
  let component: Asir;
  let fixture: ComponentFixture<Asir>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Asir],
    }).compileComponents();

    fixture = TestBed.createComponent(Asir);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
