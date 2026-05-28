import { Component } from '@angular/core';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  onSubmit(formData: any) {
    console.log('Form submitted:', formData);
    alert('¡Gracias por registrarte! Hemos recibido tu información. Te contactaremos pronto para completar tu configuración.');
    // In a real application, you would send this data to your backend service
  }
}