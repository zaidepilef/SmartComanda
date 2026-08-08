import { Component } from '@angular/core';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent
} from '@coreui/angular';
import { IconDirective } from '@coreui/icons-angular';

@Component({
  selector: 'app-icons',
  templateUrl: './icons.component.html',
  imports: [
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    RowComponent,
    ColComponent,
    IconDirective
  ]
})
export class IconsComponent {
  public icons = [
    'cilSpeedometer',
    'cilList',
    'cilPencil',
    'cilStar',
    'cilBell',
    'cilEnvelopeOpen',
    'cilMenu',
    'cilMoon',
    'cilSun',
    'cilContrast',
    'cilUser',
    'cilSettings',
    'cilLockLocked',
    'cilAccountLogout',
    'cilBasket',
    'cilDollar',
    'cilCalculator',
    'cilNotes',
    'cilChart',
    'cilChartPie',
    'cilTask',
    'cilMagnifyingGlass'
  ];
}
