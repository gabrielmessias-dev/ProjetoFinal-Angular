// src/app/pages/marcacao/marcacao.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth.service';
import { ExamService, Exame } from '../../core/exam.service';
import { PoliticaModalComponent } from "../../shared/politica-modal/politica-modal.component";

@Component({
  selector: 'app-marcacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PoliticaModalComponent
],
  templateUrl: './marcacao.component.html',
  styleUrl: './marcacao.component.css'
})
export class MarcacaoComponent implements OnInit {
  novoExame: Omit<Exame, 'id' | 'patientId' | 'status' | 'resultLink' | 'firestoreId'> = {
    examType: '',
    date: '',
    time: ''
  };

  agendamentoSucesso = false;
  agendamentoErro = false;
  dataPassadaErro = false;
  horarioInvalidoErro = false;
  arquivoObrigatorioErro = false; // <<<< ADICIONADO AQUI: Para a mensagem de erro do arquivo
  mostrarModal: boolean = false;

  minDate: string;
  availableTimes: string[] = [];

  selectedMedicalFile: File | null = null; // <<<< ADICIONADO AQUI: Para armazenar o arquivo selecionado
  // pedidoMedicoInput: any; // REMOVIDO: Não precisamos de [(ngModel)] em input type="file" diretamente

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

  abrirModal() {
    this.mostrarModal = true;
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

  // <<<< NOVO MÉTODO PARA LER O ARQUIVO SELECIONADO >>>>
  onFileSelected(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      this.selectedMedicalFile = fileList[0]; // Captura o objeto File
      this.arquivoObrigatorioErro = false; // Limpa o erro se um arquivo foi selecionado
    } else {
      this.selectedMedicalFile = null;
    }
  }

  agendarExame(): void {
    this.agendamentoSucesso = false;
    this.agendamentoErro = false;
    this.dataPassadaErro = false;
    this.horarioInvalidoErro = false;
    this.arquivoObrigatorioErro = false; // <<<< Reseta o erro do arquivo

    // Validação de campos obrigatórios (texto e selects)
    if (!this.novoExame.examType || !this.novoExame.date || !this.novoExame.time) {
      this.agendamentoErro = true;
      return;
    }

    // <<<< NOVA VALIDAÇÃO: Arquivo de requisição médica >>>
    if (!this.selectedMedicalFile) { // Verifica se o arquivo foi selecionado
      this.arquivoObrigatorioErro = true;
      return;
    }

    // ... (restante das validações de data e hora) ...

    const selectedDateTime = new Date(`${this.novoExame.date}T${this.novoExame.time}`);
    const now = new Date();

    if (selectedDateTime < now) {
      this.dataPassadaErro = true;
      return;
    }

    const [hours] = this.novoExame.time.split(':').map(Number);
    if (hours < 9 || hours >= 21) {
      this.horarioInvalidoErro = true;
      return;
    }

    // O service.createExam(this.novoExame) já está configurado para não usar o arquivo em si.
    // O arquivo é apenas para validação visual/UX neste momento do TCC.
    this.examService.createExam(this.novoExame).subscribe({
      next: (exam) => {
        if (exam) {
          this.agendamentoSucesso = true;
          this.novoExame = {
            examType: '',
            date: '',
            time: ''
          };
          this.selectedMedicalFile = null; // Limpa o arquivo selecionado após agendar
          this.router.navigate(['/historico']);
        } else {
            this.agendamentoErro = true;
            console.error('Erro no agendamento: service retornou null.');
        }
      },
      error: (err) => {
        console.error('Erro na subscrição do agendamento:', err);
        this.agendamentoErro = true;
      }
    });
  }
}