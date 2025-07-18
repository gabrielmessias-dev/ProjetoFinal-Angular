// src/app/core/exam.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs'; 
import { map, catchError, tap, switchMap } from 'rxjs/operators'; 
import { AuthService } from './auth.service';

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
  CollectionReference,
  orderBy, 

} from '@angular/fire/firestore';

export interface Exame {
  id: string; 
  patientId: string; 
  examType: string;
  date: string;
  time: string;
  status: 'Agendado' | 'Concluído' | 'Cancelado';
  resultLink: string | null;
  firestoreId?: string; 
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

  createExam(newExamData: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink' | 'firestoreId'>): Observable<Exame> {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('ExamService.createExam: Usuário não logado.');
      return of(null as any);
    }
    const examToSave: Omit<Exame, 'id' | 'firestoreId'> = {
      ...newExamData,
      patientId: currentUser.id,
      status: 'Agendado',
      resultLink: null
    };
    return from(addDoc(this.examsCollection, examToSave)).pipe(
      tap(docRef => console.log('Firestore: Exame adicionado com sucesso, ID:', docRef.id)),
      map(docRef => ({ ...examToSave, id: docRef.id, firestoreId: docRef.id } as Exame)),
      catchError(error => {
        console.error('Firestore: ERRO ao adicionar exame:', error);
        return of(null as any);
      })
    );
  }

  updateExam(examFirestoreId: string, updates: Partial<Exame>): Observable<void> {
    const docRef = doc(this.firestore, 'exams', examFirestoreId) as DocumentReference<Exame>;
    return from(updateDoc(docRef, updates)).pipe(
      catchError(error => {
        console.error('Firestore: ERRO ao atualizar exame:', error);
        return of(null as any);
      })
    );
  }

  deleteExam(examFirestoreId: string): Observable<void> {
    const docRef = doc(this.firestore, 'exams', examFirestoreId) as DocumentReference<Exame>;
    return from(deleteDoc(docRef)).pipe(
      catchError(error => {
        console.error('Firestore: ERRO ao deletar exame:', error);
        return of(null as any);
      })
    );
  }

  getPatientExamsRealtime(): Observable<Exame[]> {

    return this.authService.isLoggedIn$.pipe(
      switchMap(isLoggedIn => {
        if (!isLoggedIn) {
          console.warn('Firestore: getPatientExamsRealtime chamado sem usuário logado.');
          return of([]);
        }
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) { 
          return of([]);
        }

        const q = query(
          this.examsCollection,
          where('patientId', '==', currentUser.id),
          orderBy('date', 'asc'), // Ordena por data
          orderBy('time', 'asc')  // Depois por hora
        );

        return collectionData(q, { idField: 'firestoreId' }).pipe(
          map(docs => {
            const mappedExams: Exame[] = docs.map(docData => ({
              id: docData['id'] || docData['firestoreId'] || '',
              patientId: String(docData['patientId']),
              examType: docData['examType'] || '',
              date: docData['date'] || '',
              time: docData['time'] || '',
              status: docData['status'] || 'Agendado',
              resultLink: docData['resultLink'] || null,
              firestoreId: docData['firestoreId'] || ''
            }) as Exame);
            return mappedExams;
          }),
          catchError(error => {
            console.error('Firestore: ERRO no stream de exames:', error);
            return of([]);
          })
        );
      })
    );
  }
}