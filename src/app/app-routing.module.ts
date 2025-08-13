import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthGuard } from './guards/auth-guard.service';

// Import standalone components
import { LoginComponent } from './shared/login/login.component';
import { RegisterComponent } from './shared/register/register.component';
import { ListrecordsComponent } from './ecommerce/listrecords/listrecords.component';
import { OrdersComponent } from './ecommerce/orders/orders.component';
import { CartDetailsComponent } from './ecommerce/cart-details/cart-details.component';
import { CartsComponent } from './ecommerce/carts/carts.component';
import { EcommerceComponent } from './ecommerce/ecommerce.component';
import { RecordsComponent } from './ecommerce/records/records.component';
import { GenresComponent } from './ecommerce/genres/genres.component';
import { GroupsComponent } from './ecommerce/groups/groups.component';
import { ListgroupsComponent } from './ecommerce/listgroups/listgroups.component';
import { AdminOrdersComponent } from './ecommerce/admin-orders/admin-orders.component';
import { UsersComponent } from './ecommerce/users/users.component';

export const canActivate = () => {
  const guard = inject(AuthGuard);
  if (!guard.isLoggedIn()) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
  }
  return true;
};

export const appRoutes: Routes = [
  // Public routes
  { 
    path: 'login', 
    component: LoginComponent,
    title: 'Login'
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    title: 'Register'
  },
  { 
    path: 'listrecords/:idGroup', 
    component: ListrecordsComponent,
    title: 'Records List'
  },
  { 
    path: 'cart-details', 
    component: CartDetailsComponent,
    title: 'Cart Details'
  },
  
  // Ecommerce routes
  {
    path: '',
    component: EcommerceComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'listgroups', 
        pathMatch: 'full',
        title: 'Home'
      },
      { 
        path: 'records', 
        component: RecordsComponent,
        title: 'Records'
      },
      { 
        path: 'genres', 
        component: GenresComponent,
        title: 'Genres'
      },
      { 
        path: 'groups', 
        component: GroupsComponent,
        title: 'Groups'
      },
      { 
        path: 'listgroups', 
        component: ListgroupsComponent,
        title: 'Groups List'
      },
      { 
        path: 'listrecords', 
        redirectTo: 'listgroups', 
        pathMatch: 'full'
      },
      { 
        path: 'listrecords/:idGroup', 
        component: ListrecordsComponent,
        title: 'Records List'
      },
      { 
        path: 'admin-orders', 
        component: AdminOrdersComponent, 
        canActivate: [canActivate],
        title: 'Admin Orders'
      },
      { 
        path: 'users', 
        component: UsersComponent, 
        canActivate: [canActivate],
        title: 'Users'
      },
    ]
  },

  // Protected routes
  {
    path: '',
    canActivate: [canActivate],
    children: [
      { 
        path: 'orders', 
        component: OrdersComponent,
        title: 'My Orders'
      },
      { 
        path: 'carts', 
        component: CartsComponent,
        title: 'My Carts'
      },
    ],
  },
  
  // Redirect all other routes to home
  { 
    path: '**', 
    redirectTo: '' 
  },
];
