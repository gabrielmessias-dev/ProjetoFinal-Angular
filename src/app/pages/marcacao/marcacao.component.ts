// src/app/pages/marcacao/marcacao.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../core/auth.service';
import { ExamService, Exame } from '../../core/exam.service'; // Importe ExamService e Exame

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
  // Objeto para armazenar os dados do novo exame do formulário
  novoExame: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink'> = { // Tipo ajustado para o que o formulário coleta
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
    // Não precisa mais setar novoExame.patientId aqui, o service fará isso.
  }

  ngOnInit(): void {
    this.generateAvailableTimes();
  }

  private generateAvailableTimes(): void {
    const startHour = 9;
    const endHour = 20; // 21:00 é o último horário, então a hora final é 20 para :30
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

    // Validação da data: impede agendamento para data e hora passadas
    const selectedDateTime = new Date(`${this.novoExame.date}T${this.novoExame.time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      this.dataPassadaErro = true;
      return;
    }

    const [hours, minutes] = this.novoExame.time.split(':').map(Number);

    // Validação de Horário Comercial (9:00h às 21:00h)
    if (hours < 9 || hours >= 21) {
      this.horarioInvalidoErro = true;
      return;
    }

    // A validação de minutos (00/30) já é garantida pelo select no HTML.

    this.examService.createExam(this.novoExame).subscribe({ // Passando novoExame para o service
      next: (exam) => {
        this.agendamentoSucesso = true;
        console.log('Exame agendado com sucesso e salvo no localStorage:', exam);

        // Reseta o formulário
        this.novoExame = {
          examType: '',
          date: '',
          time: ''
        };
        // Redireciona para o histórico após agendar
        this.router.navigate(['/historico']);
      },
      error: (err) => {
        console.error('Erro ao agendar exame:', err);
        this.agendamentoErro = true;
      }
    });
  }
}