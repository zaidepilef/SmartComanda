import { INavData } from '@coreui/angular';

export const navItems: INavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    iconComponent: { name: 'cil-speedometer' }
  },
  {
    name: 'Usuarios',
    url: '/users',
    iconComponent: { name: 'cil-people' }
  },
  {
    name: 'Tenants',
    url: '/tenants',
    iconComponent: { name: 'cil-building' }
  },
  {
    name: 'Tables',
    url: '/tables',
    iconComponent: { name: 'cil-list' }
  },
  {
    name: 'Typography',
    url: '/typography',
    iconComponent: { name: 'cil-pencil' }
  },
  {
    name: 'Icons',
    url: '/icons',
    iconComponent: { name: 'cil-star' }
  }
];
