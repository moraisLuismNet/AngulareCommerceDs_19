import { Component, OnInit, OnDestroy, afterNextRender, afterRender, ElementRef, ViewChild, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';

// PrimeNG
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

// Services & Interfaces
import { OrderService } from '../services/order.service';
import { IOrder } from '../ecommerce.interface';

@Component({
    selector: 'app-admin-orders',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        InputTextModule,
        ButtonModule,
        TooltipModule,
        ProgressSpinnerModule,
        MessageModule,
        ToastModule
    ],
    templateUrl: './admin-orders.component.html',
    styleUrls: ['./admin-orders.component.css'],
    providers: [MessageService]
})
export class AdminOrdersComponent implements OnInit, OnDestroy {
  orders: IOrder[] = [];
  filteredOrders: IOrder[] = [];
  loading = true;
  searchText: string = '';
  expandedOrderId: number | null = null;
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  @ViewChild('ordersTable') ordersTable!: ElementRef<HTMLTableElement>;
  private lastScrollPosition: number = 0;
  private resizeObserver!: ResizeObserver;

  // Services injected using inject()
  private orderService = inject(OrderService);
  private messageService = inject(MessageService);
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // After the initial render
    afterNextRender(() => {
      this.initializeOrdersTable();
      this.setupTableResizeObserver();
    });

    // After each render
    afterRender(() => {
      this.updateTableVisuals();
      this.restoreScrollPosition();
    });
  }

  ngOnInit(): void {
    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        // Force change detection with new arrays
        this.orders = orders ? [...orders] : [];
        this.filteredOrders = [...this.orders];
        this.loading = false;
        // Force change detection manually
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'The orders could not be loaded. Please try again.'
        });
        this.orders = [];
        this.filteredOrders = [];
        this.loading = false;
      },
    });
  }

  toggleOrderDetails(orderId: number): void {
    // Create a new reference to trigger change detection
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }

  isOrderExpanded(orderId: number): boolean {
    return this.expandedOrderId === orderId;
  }

  onSearchChange() {
    this.filterOrders(this.searchText);
  }

  private filterOrders(searchText: string): void {
    if (!searchText) {
      // Create new array reference to trigger change detection
      this.filteredOrders = [...this.orders];
      return;
    }

    const searchLower = searchText.toLowerCase();
    this.filteredOrders = this.orders.filter(
      (order) =>
        order.userEmail.toLowerCase().includes(searchLower) ||
        order.idOrder.toString().includes(searchLower) ||
        order.paymentMethod.toLowerCase().includes(searchLower) ||
        (order.orderDate &&
          new Date(order.orderDate).toLocaleDateString().includes(searchLower))
    );
  }

  ngOnDestroy(): void {
    // Save scroll position before destroying the component
    if (this.ordersTable) {
      this.lastScrollPosition = this.ordersTable.nativeElement.scrollTop;
    }
    
    // Clear the resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeOrdersTable(): void {
    // Configure custom events for table rows
    const orderRows = document.querySelectorAll('.order-row');
    orderRows.forEach(row => {
      // Add hover effect
      row.addEventListener('mouseenter', () => {
        row.classList.add('hovered');
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('hovered');
      });
      
      // Add row click handler
      row.addEventListener('click', () => {
        const orderId = row.getAttribute('data-order-id');
        if (orderId) {
          this.toggleOrderDetails(Number(orderId));
        }
      });
    });
  }

  private setupTableResizeObserver(): void {
    if (!this.ordersTable) return;
    
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        // Adjust table design based on table size
        console.log('Table size changed:', entry.contentRect);
        
        // Adjust column widths
        this.adjustTableColumns();
      });
    });
    
    this.resizeObserver.observe(this.ordersTable.nativeElement);
  }

  private adjustTableColumns(): void {
    if (!this.ordersTable) return;
    
    const table = this.ordersTable.nativeElement;
    const containerWidth = table.offsetWidth;
    const headers = table.querySelectorAll('th');
    
    // Adjust widths based on container width
    if (containerWidth < 768) {
      // Mobile view
      headers.forEach((header, index) => {
        if (index > 1) {
          header.style.display = 'none';
        } else {
          header.style.display = 'table-cell';
          header.style.width = index === 0 ? '60%' : '40%';
        }
      });
    } else {
      // Desktop view
      headers.forEach(header => {
        header.style.display = 'table-cell';
        header.style.width = ''; // Restore default width
      });
    }
  }

  private updateTableVisuals(): void {
    // Update styles based on state
    const orderRows = document.querySelectorAll('.order-row');
    
    orderRows.forEach((row, index) => {
      // Alternate row styles
      if (index % 2 === 0) {
        row.classList.add('even');
        row.classList.remove('odd');
      } else {
        row.classList.add('odd');
        row.classList.remove('even');
      }
      
      // Highlight recent orders (last 24 hours)
      const dateCell = row.querySelector('.order-date');
      if (dateCell) {
        const orderDate = new Date(dateCell.textContent || '');
        const now = new Date();
        const hoursDiff = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60);
        
        if (hoursDiff < 24) {
          row.classList.add('recent-order');
        } else {
          row.classList.remove('recent-order');
        }
      }
    });
  }
  
  private restoreScrollPosition(): void {
    if (this.lastScrollPosition > 0 && this.ordersTable) {
      this.ordersTable.nativeElement.scrollTop = this.lastScrollPosition;
    }
  }
}
