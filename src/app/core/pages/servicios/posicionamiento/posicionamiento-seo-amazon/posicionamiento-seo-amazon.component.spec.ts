import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosicionamientoSeoAmazonComponent } from './posicionamiento-seo-amazon.component';

describe('PosicionamientoSeoAmazonComponent', () => {
  let component: PosicionamientoSeoAmazonComponent;
  let fixture: ComponentFixture<PosicionamientoSeoAmazonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PosicionamientoSeoAmazonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PosicionamientoSeoAmazonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
