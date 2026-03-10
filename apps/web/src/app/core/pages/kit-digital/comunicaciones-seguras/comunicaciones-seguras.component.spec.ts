import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunicacionesSegurasComponent } from './comunicaciones-seguras.component';

describe('ComunicacionesSegurasComponent', () => {
  let component: ComunicacionesSegurasComponent;
  let fixture: ComponentFixture<ComunicacionesSegurasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComunicacionesSegurasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunicacionesSegurasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
