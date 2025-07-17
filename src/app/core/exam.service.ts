import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, combineLatest } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface Exame {
  id: string;
  patientId: number; 
  examType: string;
  date: string;
  time: string;
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  resultLink: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getExamsFromApi(): Observable<Exame[]> {
    return this.http.get<Exame[]>(`${this.apiUrl}/exams`).pipe(
      catchError(error => {
        console.error('Erro ao buscar exames da API:', error);
        return of([]);
      }),
      map(exams => exams || [])
    );
  }

  private getExamsFromLocalStorage(): Exame[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    const storedExamsStr = localStorage.getItem('agendamentosDoPaciente');
    let allLocalStorageExams: Exame[] = storedExamsStr ? JSON.parse(storedExamsStr) : [];

    const filteredLocalStorageExams = allLocalStorageExams.filter(exam => {
      return exam.patientId === Number(currentUser.id);
    });

    return filteredLocalStorageExams;
  }

  createExam(newExamData: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink'>): Observable<Exame> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Erro: Tentativa de criar exame sem usuário logado.');
      return of(null as any);
    }

    const examId = `local_${Date.now()}`;
    const examToSave: Exame = {
      ...newExamData, 
      id: examId,
      patientId: Number(currentUser.id), 
      status: 'Agendado',
      resultLink: null
    };

    const storedExamsStr = localStorage.getItem('agendamentosDoPaciente');
    let allLocalStorageExams: Exame[] = storedExamsStr ? JSON.parse(storedExamsStr) : [];
    allLocalStorageExams.push(examToSave);
    localStorage.setItem('agendamentosDoPaciente', JSON.stringify(allLocalStorageExams));

    return of(examToSave);
  }

  getPatientExams(): Observable<Exame[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.warn('Tentativa de carregar exames sem usuário logado.');
      return of([]);
    }

    const currentUserIdNum = Number(currentUser.id);

    return combineLatest([
      this.getExamsFromApi()
    ]).pipe(
      map(([apiExams]) => {
        const filteredApiExams = apiExams.filter(exam => exam.patientId === currentUserIdNum);

        const localStorageExams = this.getExamsFromLocalStorage();

        const combinedExams = [...filteredApiExams, ...localStorageExams];

        combinedExams.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

        return combinedExams;
      })
    );
  }
}