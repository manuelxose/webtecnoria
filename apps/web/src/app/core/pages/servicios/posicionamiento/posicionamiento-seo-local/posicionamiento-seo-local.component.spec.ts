import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosicionamientoSeoLocalComponent } from './posicionamiento-seo-local.component';

describe('PosicionamientoSeoLocalComponent', () => {
  let component: PosicionamientoSeoLocalComponent;
  let fixture: ComponentFixture<PosicionamientoSeoLocalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosicionamientoSeoLocalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosicionamientoSeoLocalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
