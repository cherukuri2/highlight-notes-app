import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlDisplayComponent } from './html-display.component';

describe('HtmlDisplayComponent', () => {
  let component: HtmlDisplayComponent;
  let fixture: ComponentFixture<HtmlDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HtmlDisplayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmlDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
