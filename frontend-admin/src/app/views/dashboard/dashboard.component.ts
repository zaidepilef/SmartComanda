import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { ChartOptions, ChartType } from 'chart.js';
import {
  CardBodyComponent,
  CardComponent,
  CardHeaderComponent,
  ColComponent,
  RowComponent,
  TableDirective
} from '@coreui/angular';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';

interface IStatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  imports: [
    RowComponent,
    ColComponent,
    CardComponent,
    CardBodyComponent,
    CardHeaderComponent,
    IconDirective,
    ChartjsComponent,
    TableDirective,
    NgClass
  ]
})
export class DashboardComponent {
  public statCards: IStatCard[] = [
    { title: 'Pedidos hoy', value: '42', icon: 'cilBasket', color: 'primary' },
    { title: 'Ingresos del día', value: '$386.500', icon: 'cilDollar', color: 'success' },
    { title: 'Pedidos pendientes', value: '7', icon: 'cilNotes', color: 'warning' },
    { title: 'Ticket promedio', value: '$9.200', icon: 'cilCalculator', color: 'info' }
  ];

  public chartType: ChartType = 'bar';

  public chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    }
  };

  public chartLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  public chartData = {
    labels: this.chartLabels,
    datasets: [
      {
        label: 'Pedidos',
        backgroundColor: '#4f5d73',
        data: [42, 55, 38, 61, 47, 70, 52]
      },
      {
        label: 'Ingresos (x $10.000)',
        backgroundColor: '#321fdb',
        data: [31, 44, 28, 52, 39, 63, 45]
      }
    ]
  };

  public recentOrders = [
    { id: 'SC-001', table: 'Mesa 3', items: '2 x Pasta', total: '$18.400', status: 'Entregado' },
    { id: 'SC-002', table: 'Mesa 1', items: '1 x Lomo', total: '$12.900', status: 'En preparación' },
    { id: 'SC-003', table: 'Mesa 5', items: '3 x Ensalada', total: '$21.300', status: 'Pendiente' },
    { id: 'SC-004', table: 'Mesa 2', items: '1 x Pizza', total: '$15.200', status: 'Entregado' }
  ];
}
