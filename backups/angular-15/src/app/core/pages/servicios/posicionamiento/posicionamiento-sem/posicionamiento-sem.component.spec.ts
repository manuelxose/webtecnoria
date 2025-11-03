import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosicionamientoSemComponent } from './posicionamiento-sem.component';

describe('PosicionamientoSemComponent', () => {
  let component: PosicionamientoSemComponent;
  let fixture: ComponentFixture<PosicionamientoSemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosicionamientoSemComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosicionamientoSemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
