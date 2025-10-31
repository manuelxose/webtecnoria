import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaAdwordsComponent } from './agencia-adwords.component';

describe('AgenciaAdwordsComponent', () => {
  let component: AgenciaAdwordsComponent;
  let fixture: ComponentFixture<AgenciaAdwordsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaAdwordsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaAdwordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
