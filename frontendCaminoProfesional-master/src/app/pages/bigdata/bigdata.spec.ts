import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bigdata } from './bigdata';

describe('Bigdata', () => {
  let component: Bigdata;
  let fixture: ComponentFixture<Bigdata>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bigdata],
    }).compileComponents();

    fixture = TestBed.createComponent(Bigdata);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
