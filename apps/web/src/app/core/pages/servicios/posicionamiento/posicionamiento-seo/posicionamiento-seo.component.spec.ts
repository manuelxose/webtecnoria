import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosicionamientoSeoComponent } from './posicionamiento-seo.component';

describe('PosicionamientoSeoComponent', () => {
  let component: PosicionamientoSeoComponent;
  let fixture: ComponentFixture<PosicionamientoSeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosicionamientoSeoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosicionamientoSeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
