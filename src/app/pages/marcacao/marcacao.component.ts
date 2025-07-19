// src/app/pages/marcacao/marcacao.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { ExamService, Exame } from '../../core/exam.service';

@Component({
  selector: 'app-marcacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './marcacao.component.html',
  styleUrl: './marcacao.component.css'
})
export class MarcacaoComponent implements OnInit {
  novoExame: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink'> = { 
    examType: '',
    date: '',
    time: ''
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

    // Validação básica do formulário
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

    const [hours, minutes] = this.novoExame.time.split(':').map(Number);

    if (hours < 9 || hours >= 21) {
      this.horarioInvalidoErro = true;
      return;
    }

    this.examService.createExam(this.novoExame).subscribe({ 
      next: (exam) => {
        this.agendamentoSucesso = true;

        this.novoExame = {
          examType: '',
          date: '',
          time: ''
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