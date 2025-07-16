import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from "../../shared/footer/footer.component";
import { CarouselComponent } from "../../shared/carousel/carousel.component";
import { NavbarComponent } from "../../shared/navbar/navbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FooterComponent, CarouselComponent, NavbarComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
