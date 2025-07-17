// src/app/pages/historico/historico.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ExamService, Exame } from '../../core/exam.service';
import { AuthService } from '../../core/auth.service';

declare var bootstrap: any; // Para tipagem do objeto global do Bootstrap

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    RouterLink,
    DatePipe
  ],
  templateUrl: './historico.component.html',
  styleUrl: './historico.component.css'
})
export class HistoricoComponent implements OnInit {
  exames: Exame[] = [];
  loading = true;

  // Propriedades para o modal de cancelamento
  selectedExam: Exame | null = null;
  cancelReason: string = '';
  otherCancelReason: string = '';
  cancelError: string = '';

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.loading = true;
    this.examService.getPatientExams().pipe(
      tap(() => this.loading = false),
      catchError(error => {
        console.error('Erro ao carregar exames:', error);
        this.loading = false;
        return of([]);
      })
    ).subscribe(data => {
      this.exames = data;
    });
  }

  logout(): void {
    this.authService.logout();
  }

  openCancelModal(exam: Exame): void {
    this.selectedExam = { ...exam };
    this.cancelReason = '';
    this.otherCancelReason = '';
    this.cancelError = '';

    const modalElement = document.getElementById('cancelExamModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmCancel(): void {
    this.cancelError = '';

    if (!this.cancelReason) {
      this.cancelError = 'Por favor, selecione um motivo para o cancelamento.';
      return;
    }
    if (this.cancelReason === 'Outro motivo' && !this.otherCancelReason.trim()) {
      this.cancelError = 'Por favor, especifique o outro motivo.';
      return;
    }

    if (this.selectedExam) {
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) { // currentUser.id é STRING (UID do Firebase)
        this.cancelError = 'Erro: Usuário não logado.';
        return;
      }

      const storedExamsStr = localStorage.getItem('agendamentosDoPaciente');
      let allLocalStorageExams: Exame[] = JSON.parse(storedExamsStr || '[]');

      // <<<< CORREÇÃO FINAL AQUI: Removido Number() >>>>>
      // Agora compara patientId (string) com currentUser.id (string)
      const examIndexInLocalStorage = allLocalStorageExams.findIndex(
        e => e.id === this.selectedExam?.id && e.patientId === currentUser.id
      );

      if (examIndexInLocalStorage !== -1) {
        allLocalStorageExams[examIndexInLocalStorage].status = 'Cancelado';
        localStorage.setItem('agendamentosDoPaciente', JSON.stringify(allLocalStorageExams));
        console.log(`Exame ${this.selectedExam.id} cancelado no localStorage.`);
      } else {
        console.warn(`Exame ${this.selectedExam.id} é da API. O cancelamento não será persistente após recarregar a página.`);
      }

      const examInDisplayList = this.exames.find(e => e.id === this.selectedExam?.id);
      if (examInDisplayList) {
        examInDisplayList.status = 'Cancelado';
      }

      const modalElement = document.getElementById('cancelExamModal');
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();
      }

      this.loadExams();
    }
  }
}