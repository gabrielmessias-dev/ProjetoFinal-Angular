// src/app/core/exam.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, combineLatest, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

// <<<< IMPORTAÇÕES DO FIRESTORE >>>>
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  where,
  DocumentReference,
  CollectionReference
} from '@angular/fire/firestore';
// <<<< FIM IMPORTAÇÕES FIRESTORE >>>>

// Interface para um exame
export interface Exame {
  id: string; // Este será o ID do documento do Firestore (gerado automaticamente)
  patientId: string; // UID do usuário Firebase
  examType: string;
  date: string;
  time: string;
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  resultLink: string | null;
  firestoreId?: string; // Propriedade opcional para armazenar o ID do documento Firestore
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private examsCollection: CollectionReference<Exame>;

  constructor(
    private authService: AuthService,
    private firestore: Firestore
  ) {
    this.examsCollection = collection(this.firestore, 'exams') as CollectionReference<Exame>;
  }

  private getExamsFromApi(): Observable<Exame[]> {
    // Este método não é mais chamado diretamente na getPatientExams() com Firestore.
    // Ele pode ser removido junto com a dependência HttpClient quando a migração for 100% testada.
    return of([]);
  }

  private getExamsFromLocalStorage(): Exame[] {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      return [];
    }
    const storedExamsStr = localStorage.getItem('agendamentosDoPaciente');
    let allLocalStorageExams: Exame[] = JSON.parse(storedExamsStr || '[]');

    const filteredLocalStorageExams = allLocalStorageExams.filter(exam => {
      return exam.patientId === currentUser.id;
    });

    return filteredLocalStorageExams;
  }

  createExam(newExamData: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink' | 'firestoreId'>): Observable<Exame> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('Erro: Tentativa de criar exame sem usuário logado.');
      return of(null as any);
    }

    const examToSave: Omit<Exame, 'id' | 'firestoreId'> = {
      ...newExamData,
      patientId: currentUser.id,
      status: 'Agendado',
      resultLink: null
    };

    return from(addDoc(this.examsCollection, examToSave)).pipe(
      map(docRef => { // <<<< CORREÇÃO 1 AQUI: Removida a tipagem explícita 'DocumentReference<Exame>' para deixar o TypeScript inferir
        console.log('Exame adicionado ao Firestore com ID:', docRef.id);
        // Garante que o retorno é do tipo Exame, mesmo com docRef inferido
        return { ...examToSave, id: docRef.id, firestoreId: docRef.id } as Exame; // <<<< Forçando o cast para Exame
      }),
      catchError(error => {
        console.error('Erro ao adicionar exame ao Firestore:', error);
        return of(null as any);
      })
    );
  }

  updateExam(examFirestoreId: string, updates: Partial<Exame>): Observable<void> {
    const docRef = doc(this.firestore, 'exams', examFirestoreId) as DocumentReference<Exame>;
    return from(updateDoc(docRef, updates)).pipe(
      catchError(error => {
        console.error('Erro ao atualizar exame no Firestore:', error);
        return of(null as any);
      })
    );
  }

  getPatientExams(): Observable<Exame[]> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.warn('Tentativa de carregar exames sem usuário logado.');
      return of([]);
    }

    const q = query(this.examsCollection, where('patientId', '==', currentUser.id));

    // <<<< CORREÇÃO 2 AQUI: Removido 'as string' do idField >>>>
    return collectionData(q, { idField: 'firestoreId' }).pipe( // 'idField' deve ser uma string literal, não uma string genérica
      map(docs => {
        const mappedExams: Exame[] = docs.map(docData => {
          // Garante que todos os campos da interface Exame são atribuídos e tipados corretamente
          return {
            id: docData['id'] || docData['firestoreId'] || '', // Pega o id original (se existiu) ou o firestoreId
            patientId: String(docData['patientId']), // Garante que patientId é string
            examType: docData['examType'] || '',
            date: docData['date'] || '',
            time: docData['time'] || '',
            status: docData['status'] || 'Agendado',
            resultLink: docData['resultLink'] || null,
            firestoreId: docData['firestoreId'] || ''
          } as Exame; // Forçar o cast para Exame é útil aqui
        });

        const localStorageExams = this.getExamsFromLocalStorage();

        const combinedExams = [...mappedExams, ...localStorageExams];

        combinedExams.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });

        return combinedExams;
      }),
      catchError(error => {
        console.error('Erro ao buscar exames do Firestore:', error);
        return of([]);
      })
    );
  }
}