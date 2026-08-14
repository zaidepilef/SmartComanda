import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { IconComponent } from '../../icons/icon.component';
import { DefaultFooterComponent } from './default-footer/default-footer.component';
import { DefaultHeaderComponent } from './default-header/default-header.component';
import { navItems } from './_nav';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    IconComponent,
    DefaultHeaderComponent,
    DefaultFooterComponent
  ]
})
export class DefaultLayoutComponent {
  public readonly navItems = [...navItems];
  readonly sidebarOpen = signal(false);

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
