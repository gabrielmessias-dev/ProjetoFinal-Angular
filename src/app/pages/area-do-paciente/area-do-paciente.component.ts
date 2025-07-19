import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-area-do-paciente',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './area-do-paciente.component.html',
  styleUrl: './area-do-paciente.component.css'
})
export class AreaDoPacienteComponent implements OnInit {
  currentUser: any;
  userCpf: string = '123.456.789-00'; 
  userBirthDate: string = '01/01/1990'; 
  showCpf: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userFromAuth = this.authService.getCurrentUser();
    if (userFromAuth) {
      this.currentUser = {
        ...userFromAuth,
        name: userFromAuth.name || userFromAuth.email
      };
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleCpfVisibility(): void {
    this.showCpf = !this.showCpf;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}