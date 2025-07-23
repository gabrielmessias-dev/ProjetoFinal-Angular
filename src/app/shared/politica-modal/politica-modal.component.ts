import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-politica-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politica-modal.component.html',
  styleUrl: './politica-modal.component.css'
})
export class PoliticaModalComponent {
  @Input() isVisible: boolean = false;

  fecharModal() {
    this.isVisible = false;
  }
}
