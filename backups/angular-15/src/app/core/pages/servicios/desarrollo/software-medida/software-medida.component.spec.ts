import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoftwareMedidaComponent } from './software-medida.component';

describe('SoftwareMedidaComponent', () => {
  let component: SoftwareMedidaComponent;
  let fixture: ComponentFixture<SoftwareMedidaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SoftwareMedidaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SoftwareMedidaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
