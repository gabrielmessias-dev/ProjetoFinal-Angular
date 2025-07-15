import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaDoPacienteComponent } from './area-do-paciente.component';

describe('AreaDoPacienteComponent', () => {
  let component: AreaDoPacienteComponent;
  let fixture: ComponentFixture<AreaDoPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaDoPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaDoPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
