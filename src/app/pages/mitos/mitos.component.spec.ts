import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MitosComponent } from './mitos.component';

describe('MitosComponent', () => {
  let component: MitosComponent;
  let fixture: ComponentFixture<MitosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MitosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MitosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
