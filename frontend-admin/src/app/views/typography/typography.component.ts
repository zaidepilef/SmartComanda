import { Component } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent
} from '@coreui/angular';

@Component({
  selector: 'app-typography',
  templateUrl: './typography.component.html',
  imports: [CardComponent, CardBodyComponent, CardHeaderComponent]
})
export class TypographyComponent {}
