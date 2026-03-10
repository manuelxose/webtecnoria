import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenciaAvanzadaComponent } from './presencia-avanzada.component';

describe('PresenciaAvanzadaComponent', () => {
  let component: PresenciaAvanzadaComponent;
  let fixture: ComponentFixture<PresenciaAvanzadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenciaAvanzadaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PresenciaAvanzadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
