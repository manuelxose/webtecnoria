import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArribaFlechaComponent } from './arriba-flecha.component';

describe('ArribaFlechaComponent', () => {
  let component: ArribaFlechaComponent;
  let fixture: ComponentFixture<ArribaFlechaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ArribaFlechaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArribaFlechaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
