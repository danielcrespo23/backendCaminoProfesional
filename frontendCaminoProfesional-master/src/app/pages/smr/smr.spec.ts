import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Smr } from './smr';

describe('Smr', () => {
  let component: Smr;
  let fixture: ComponentFixture<Smr>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Smr],
    }).compileComponents();

    fixture = TestBed.createComponent(Smr);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
