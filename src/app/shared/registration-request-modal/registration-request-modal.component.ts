// src/app/shared/registration-request-modal/registration-request-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any; // <<<< ADICIONADO AQUI! ESSENCIAL PARA RECONHECER 'bootstrap'

@Component({
  selector: 'app-registration-request-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './registration-request-modal.component.html',
  styleUrl: './registration-request-modal.component.css'
})
export class RegistrationRequestModalComponent {
  requestData = {
    fullName: '',
    email: '',
    justification: ''
  };
  selectedMedicalFile: File | null = null;
  selectedIdFile: File | null = null;

  lgpdConsent: boolean = false;
  submissionSuccess: boolean = false;
  formError: boolean = false;

  constructor() {}

  onFileSelected(event: Event, field: 'medicalRequest' | 'idDocument'): void {
    const element = event.currentTarget as HTMLInputElement;
    const fileList: FileList | null = element.files;
    if (fileList && fileList.length > 0) {
      if (field === 'medicalRequest') {
        this.selectedMedicalFile = fileList[0];
        console.log('Arquivo de pedido médico selecionado:', this.selectedMedicalFile.name);
      } else if (field === 'idDocument') {
        this.selectedIdFile = fileList[0];
        console.log('Arquivo de documento de identificação selecionado:', this.selectedIdFile.name);
      }
    } else {
      if (field === 'medicalRequest') {
        this.selectedMedicalFile = null;
      } else if (field === 'idDocument') {
        this.selectedIdFile = null;
      }
    }
  }

  submitRequest(): void {
    this.formError = false;
    this.submissionSuccess = false;

    if (!this.requestData.fullName || !this.requestData.email || !this.requestData.justification || !this.lgpdConsent) {
      this.formError = true;
      return;
    }

    console.log('Solicitação de cadastro enviada (simulada):', this.requestData);
    console.log('Pedido Médico Anexado:', this.selectedMedicalFile ? this.selectedMedicalFile.name : 'Nenhum');
    console.log('Documento ID Anexado:', this.selectedIdFile ? this.selectedIdFile.name : 'Nenhum'); // <<<< CORRIGIDO AQUI!
    console.log('Consentimento LGPD:', this.lgpdConsent);

    this.submissionSuccess = true;
    this.formError = false;
  }

  resetForm(): void {
    this.requestData = {
      fullName: '',
      email: '',
      justification: ''
    };
    this.selectedMedicalFile = null;
    this.selectedIdFile = null;
    this.lgpdConsent = false;
    this.submissionSuccess = false;
    this.formError = false;

    const modalElement = document.getElementById('registrationRequestModal');
    if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if(modal) modal.hide();
    }
  }
}