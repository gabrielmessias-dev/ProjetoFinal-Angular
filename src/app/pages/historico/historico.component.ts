// src/app/pages/historico/historico.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, Subject } from 'rxjs'; 
import { tap, catchError, takeUntil } from 'rxjs/operators';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ExamService, Exame } from '../../core/exam.service';
import { AuthService } from '../../core/auth.service';

declare var bootstrap: any;

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
export class HistoricoComponent implements OnInit, OnDestroy { 
  exames$: Observable<Exame[]> | null = null;
  loading = true; 

  selectedExam: Exame | null = null;
  cancelReason: string = '';
  otherCancelReason: string = '';
  cancelError: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private examService: ExamService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.exames$ = this.examService.getPatientExamsRealtime().pipe(
      tap(() => this.loading = false),
      catchError(error => {
        console.error('Erro ao carregar exames realtime:', error);
        this.loading = false;
        return of([]);
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    if (this.selectedExam && this.selectedExam.firestoreId) {
      const updates: Partial<Exame> = { status: 'Cancelado' as 'Cancelado' };

      this.examService.updateExam(this.selectedExam.firestoreId, updates).subscribe({
        next: () => {
          console.log(`Exame ${this.selectedExam?.id} cancelado no Firestore.`);

          const modalElement = document.getElementById('cancelExamModal');
          if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal?.hide();
          }
          // loadExams() REMOVIDO AQUI
        },
        error: (err) => {
          console.error('Erro ao cancelar exame no Firestore:', err);
          this.cancelError = 'Falha ao cancelar exame. Verifique suas permissões ou conexão.';
        }
      });
    } else {
      this.cancelError = 'Não é possível cancelar este exame. Ele não é um agendamento válido no sistema online.';
      console.warn(`Tentativa de cancelar exame sem firestoreId. Exame:`, this.selectedExam);
    }
  }

  deleteExam(exam: Exame): void {
    if (confirm(`Tem certeza que deseja deletar o exame de ${exam.examType} agendado para ${exam.date}?`)) {
      if (exam.firestoreId) {
        this.examService.deleteExam(exam.firestoreId).subscribe({
          next: () => {
            console.log(`Exame ${exam.id} deletado do Firestore.`);
          },
          error: (err) => {
            console.error('Erro ao deletar exame:', err);
            alert('Falha ao deletar exame. Verifique suas permissões ou conexão.');
          }
        });
      } else {
        alert('Não foi possível deletar este exame. ID do Firestore ausente.');
      }
    }
  }
}