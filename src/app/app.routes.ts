import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes
  { 
    path: 'login',
    loadComponent: () => import('./shared/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'register',
    loadComponent: () => import('./shared/register/register.component').then(m => m.RegisterComponent)
  },
  // Ecommerce routes
  {
    path: '',
    loadComponent: () => import('./ecommerce/ecommerce.component').then(m => m.EcommerceComponent),
    children: [
      // Public routes
      { 
        path: 'listrecords/:idGroup',
        loadComponent: () => import('./ecommerce/listrecords/listrecords.component').then(m => m.ListrecordsComponent)
      },
      { 
        path: 'cart-details',
        loadComponent: () => import('./ecommerce/cart-details/cart-details.component').then(m => m.CartDetailsComponent)
      },
      { 
        path: '',
        loadComponent: () => import('./ecommerce/listgroups/listgroups.component').then(m => m.ListgroupsComponent)
      },
      // Protected routes (require authentication)
      { 
        path: 'listgroups',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/listgroups/listgroups.component').then(m => m.ListgroupsComponent)
      },
      { 
        path: 'genres',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/genres/genres.component').then(m => m.GenresComponent)
      },
      { 
        path: 'groups',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/groups/groups.component').then(m => m.GroupsComponent)
      },
      { 
        path: 'records',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/records/records.component').then(m => m.RecordsComponent)
      },
      { 
        path: 'carts',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/carts/carts.component').then(m => m.CartsComponent)
      },
      { 
        path: 'orders',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/orders/orders.component').then(m => m.OrdersComponent)
      },
      { 
        path: 'admin-orders',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/admin-orders/admin-orders.component').then(m => m.AdminOrdersComponent)
      },
      { 
        path: 'users',
        canActivate: [], // Add AuthGuard here if needed
        loadComponent: () => import('./ecommerce/users/users.component').then(m => m.UsersComponent)
      },
    ]
  },
  { path: '**', redirectTo: '' }
];

