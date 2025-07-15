import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreparoComponent } from './preparo.component';

describe('PreparoComponent', () => {
  let component: PreparoComponent;
  let fixture: ComponentFixture<PreparoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreparoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreparoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
