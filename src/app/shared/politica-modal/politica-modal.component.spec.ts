import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticaModalComponent } from './politica-modal.component';

describe('PoliticaModalComponent', () => {
  let component: PoliticaModalComponent;
  let fixture: ComponentFixture<PoliticaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
