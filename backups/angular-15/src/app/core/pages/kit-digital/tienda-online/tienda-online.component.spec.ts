import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiendaOnlineComponent } from './tienda-online.component';

describe('TiendaOnlineComponent', () => {
  let component: TiendaOnlineComponent;
  let fixture: ComponentFixture<TiendaOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiendaOnlineComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TiendaOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
