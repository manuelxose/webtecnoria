import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BiAnaliticaComponent } from './bi-analitica.component';

describe('BiAnaliticaComponent', () => {
  let component: BiAnaliticaComponent;
  let fixture: ComponentFixture<BiAnaliticaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BiAnaliticaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BiAnaliticaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
