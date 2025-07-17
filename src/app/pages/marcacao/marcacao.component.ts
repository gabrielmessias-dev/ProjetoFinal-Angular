// src/app/pages/marcacao/marcacao.component.ts
import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../core/auth.service';
import { ExamService, Exame } from '../../core/exam.service';

@Component({
  selector: 'app-marcacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent
  ],
  templateUrl: './marcacao.component.html',
  styleUrl: './marcacao.component.css'
})
export class MarcacaoComponent implements OnInit {
  novoExame: Exame = {
    id: '',
    patientId: 0,
    examType: '',
    date: '',
    time: '',
    status: 'Agendado',
    resultLink: null
  };

  agendamentoSucesso = false;
  agendamentoErro = false;
  dataPassadaErro = false;
  horarioInvalidoErro = false;

  minDate: string;
  availableTimes: string[] = []; 

  constructor(
    private authService: AuthService,
    private router: Router,
    private examService: ExamService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Erro: Usuário não logado ao tentar acessar agendamento. Redirecionando...');
      this.router.navigate(['/login']);
    } else {
      this.novoExame.patientId = Number(currentUser.id);
    }
  }

  ngOnInit(): void { 
    this.generateAvailableTimes();
  }

  private generateAvailableTimes(): void {
    const startHour = 9;
    const endHour = 20;
    this.availableTimes = [];

    for (let h = startHour; h <= endHour; h++) {
      this.availableTimes.push(`${h.toString().padStart(2, '0')}:00`);
      this.availableTimes.push(`${h.toString().padStart(2, '0')}:30`);
    }
  }

  agendarExame(): void {
    this.agendamentoSucesso = false;
    this.agendamentoErro = false;
    this.dataPassadaErro = false;
    this.horarioInvalidoErro = false;

    if (!this.novoExame.examType || !this.novoExame.date || !this.novoExame.time) {
      this.agendamentoErro = true;
      return;
    }

    const selectedDateTime = new Date(`${this.novoExame.date}T${this.novoExame.time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      this.dataPassadaErro = true;
      return;
    }

    this.examService.createExam({
      examType: this.novoExame.examType,
      date: this.novoExame.date,
      time: this.novoExame.time
    }).subscribe({
      next: (exam) => {
        this.agendamentoSucesso = true;
        console.log('Exame agendado com sucesso e salvo no localStorage:', exam);

        this.novoExame = {
          id: '',
          patientId: this.authService.getCurrentUser()?.id ? Number(this.authService.getCurrentUser()?.id) : 0,
          examType: '',
          date: '',
          time: '',
          status: 'Agendado',
          resultLink: null
        };
        this.router.navigate(['/historico']);
      },
      error: (err) => {
        console.error('Erro ao agendar exame:', err);
        this.agendamentoErro = true;
      }
    });
  }
}