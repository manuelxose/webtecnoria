import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailMarketingComponent } from './email-marketing.component';

describe('EmailMarketingComponent', () => {
  let component: EmailMarketingComponent;
  let fixture: ComponentFixture<EmailMarketingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailMarketingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailMarketingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
