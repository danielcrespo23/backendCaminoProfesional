import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Dam } from './dam';

describe('Dam', () => {
  let component: Dam;
  let fixture: ComponentFixture<Dam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dam],
    }).compileComponents();

    fixture = TestBed.createComponent(Dam);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
