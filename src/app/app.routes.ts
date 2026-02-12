import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: '/clients', pathMatch: 'full' }, // Redirige a clients por defecto

  // Clients
  { path: 'clients', loadComponent: () => import('./clients/list/list').then(c => c.List) },
  { path: 'clients/form', loadComponent: () => import('./clients/form/form').then(c => c.Form) },
  { path: 'clients/form/:id', loadComponent: () => import('./clients/form/form').then(c => c.Form) },

  // Trainers
  { path: 'trainers', loadComponent: () => import('./trainers/list/list').then(c => c.List) },
  { path: 'trainers/form', loadComponent: () => import('./trainers/form/form').then(c => c.Form) },
  { path: 'trainers/form/:id', loadComponent: () => import('./trainers/form/form').then(c => c.Form) },

  // Classes
  { path: 'classes', loadComponent: () => import('./classes/list/list').then(c => c.List) },
  { path: 'classes/form', loadComponent: () => import('./classes/form/form').then(c => c.Form) },
  { path: 'classes/form/:id', loadComponent: () => import('./classes/form/form').then(c => c.Form) },

  // Memberships
  { path: 'memberships', loadComponent: () => import('./memberships/list/list').then(c => c.List) },
  { path: 'memberships/form', loadComponent: () => import('./memberships/form/form').then(c => c.Form) },
  { path: 'memberships/form/:id', loadComponent: () => import('./memberships/form/form').then(c => c.Form) },

  // Inscriptions
  { path: 'inscriptions', loadComponent: () => import('./inscriptions/list/list').then(c => c.List) },
  { path: 'inscriptions/form', loadComponent: () => import('./inscriptions/form/form').then(c => c.Form) },
  { path: 'inscriptions/form/:id', loadComponent: () => import('./inscriptions/form/form').then(c => c.Form) },

  // Payments
  { path: 'payments', loadComponent: () => import('./payments/list/list').then(c => c.List) },
  { path: 'payments/form', loadComponent: () => import('./payments/form/form').then(c => c.Form) },
  { path: 'payments/form/:id', loadComponent: () => import('./payments/form/form').then(c => c.Form) },

  { path: '**', redirectTo: '/clients' } // Ruta wildcard para errores
];