import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaMarketingContenidosComponent } from './agencia-marketing-contenidos.component';

describe('AgenciaMarketingContenidosComponent', () => {
  let component: AgenciaMarketingContenidosComponent;
  let fixture: ComponentFixture<AgenciaMarketingContenidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaMarketingContenidosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaMarketingContenidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
