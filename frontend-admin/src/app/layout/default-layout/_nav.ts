import { AppIconName } from '../../icons/icon.component';

export interface NavItem {
  name: string;
  url: string;
  icon: AppIconName;
}

export const navItems: NavItem[] = [
  { name: 'Dashboard', url: '/dashboard', icon: 'dashboard' },
  { name: 'Usuarios', url: '/users', icon: 'users' },
  { name: 'Tenants', url: '/tenants', icon: 'building' },
  { name: 'Tables', url: '/tables', icon: 'list' },
  { name: 'Typography', url: '/typography', icon: 'pencil' },
  { name: 'Icons', url: '/icons', icon: 'star' }
];
