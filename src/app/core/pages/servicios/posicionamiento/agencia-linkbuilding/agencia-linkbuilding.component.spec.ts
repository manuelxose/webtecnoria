import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaLinkbuildingComponent } from './agencia-linkbuilding.component';

describe('AgenciaLinkbuildingComponent', () => {
  let component: AgenciaLinkbuildingComponent;
  let fixture: ComponentFixture<AgenciaLinkbuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaLinkbuildingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaLinkbuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
