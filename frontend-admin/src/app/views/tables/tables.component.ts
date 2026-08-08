import { Component } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  TableDirective
} from '@coreui/angular';

@Component({
  selector: 'app-tables',
  templateUrl: './tables.component.html',
  imports: [CardComponent, CardBodyComponent, CardHeaderComponent, TableDirective]
})
export class TablesComponent {
  public products = [
    { name: 'Lomo a lo pobre', category: 'Platos', price: '$12.900', stock: 20 },
    { name: 'Pasta Alfredo', category: 'Pastas', price: '$9.200', stock: 35 },
    { name: 'Ensalada César', category: 'Ensaladas', price: '$7.100', stock: 40 },
    { name: 'Pizza Margarita', category: 'Pizzas', price: '$10.500', stock: 18 }
  ];
}
