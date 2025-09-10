import { Component, OnInit, ViewChild, afterNextRender, afterRender, OnDestroy, ElementRef, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';

// PrimeNG
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageModule } from 'primeng/message';

// Services & Interfaces
import { IGenre } from '../ecommerce.interface';
import { GenresService } from '../services/genres.service';

@Component({
    selector: 'app-genres',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ConfirmDialogModule,
        TooltipModule,
        MessageModule
    ],
    templateUrl: './genres.component.html',
    providers: [ConfirmationService, MessageService]
})
export class GenresComponent implements OnInit, OnDestroy {
  @ViewChild('genresTable') genresTable!: ElementRef<HTMLTableElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  private lastScrollPosition: number = 0;
  private resizeObserver!: ResizeObserver;
  private destroy$ = new Subject<void>();

  // Services injected using inject()
  private genresService = inject(GenresService);
  private confirmationService = inject(ConfirmationService);
  private elementRef = inject(ElementRef);
  private messageService = inject(MessageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    // After the initial render
    afterNextRender(() => {
      this.initializeGenresTable();
      this.setupTableResizeObserver();
      this.focusSearchInput();
    });

    // After each render
    afterRender(() => {
      this.updateTableVisuals();
      this.restoreScrollPosition();
    });
  }
  @ViewChild('form') form!: NgForm;
  visibleError = false;
  errorMessage = '';
  genres: IGenre[] = [];
  filteredGenres: IGenre[] = [];
  visibleConfirm = false;
  searchTerm: string = '';

  genre: IGenre = {
    idMusicGenre: 0,
    nameMusicGenre: '',
  };

  ngOnInit(): void {
    this.getGenres();
  }

  getGenres() {
    this.genresService.getGenres().subscribe({
      next: (data: any) => {
        this.visibleError = false;

        // Extract the $values array from the response
        this.genres = data.$values || [];
        this.filteredGenres = [...this.genres];
        
        // Manually trigger change detection
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        this.visibleError = true;
        this.controlError(err);
        this.cdr.detectChanges();
      },
    });
  }
  save() {
    if (this.genre.idMusicGenre === 0) {
      this.genresService.addGenre(this.genre).subscribe({
        next: (data) => {
          this.visibleError = false;
          this.form.reset();
          this.getGenres();
        },
        error: (err) => {
          console.log(err);
          this.visibleError = true;
          this.controlError(err);
        },
      });
    } else {
      this.genresService.updateGenre(this.genre).subscribe({
        next: (data) => {
          this.visibleError = false;
          this.cancelEdition();
          this.form.reset();
          this.getGenres();
        },
        error: (err) => {
          this.visibleError = true;
          this.controlError(err);
        },
      });
    }
  }

  edit(genre: IGenre) {
    this.genre = { ...genre };
  }

  cancelEdition() {
    this.genre = {
      idMusicGenre: 0,
      nameMusicGenre: '',
    };
  }

  confirmDelete(genre: IGenre) {
    this.confirmationService.confirm({
      message: `Delete the genre ${genre.nameMusicGenre}?`,
      header: 'Are you sure?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteGenre(genre.idMusicGenre!),
    });
  }

  deleteGenre(id: number) {
    this.genresService.deleteGenre(id).subscribe({
      next: (data) => {
        this.visibleError = false;
        this.form.reset({
          name: '',
        });
        this.getGenres();
      },
      error: (err) => {
        this.visibleError = true;
        this.controlError(err);
      },
    });
  }

  private initializeGenresTable(): void {
    // Configure custom events for table rows
    const genreRows = document.querySelectorAll('.genre-row');
    genreRows.forEach(row => {
      // Add hover effect
      row.addEventListener('mouseenter', () => {
        row.classList.add('hovered');
      });
      row.addEventListener('mouseleave', () => {
        row.classList.remove('hovered');
      });
      
      // Add row selection handler
      row.addEventListener('click', (event) => {
        // Avoid selection when clicking buttons or links
        if (!(event.target as HTMLElement).closest('button') && 
            !(event.target as HTMLElement).closest('a')) {
          const genreId = row.getAttribute('data-genre-id');
          if (genreId) {
            const genre = this.genres.find(g => g.idMusicGenre === Number(genreId));
            if (genre) {
              this.edit(genre);
            }
          }
        }
      });
    });
  }

  private setupTableResizeObserver(): void {
    if (!this.genresTable) return;
    
    this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        console.log('The gender table has been resized:', entry.contentRect);
        this.adjustTableColumns();
      });
    });
    
    this.resizeObserver.observe(this.genresTable.nativeElement);
  }

  private adjustTableColumns(): void {
    if (!this.genresTable) return;
    
    const table = this.genresTable.nativeElement;
    const containerWidth = table.offsetWidth;
    const headers = table.querySelectorAll('th');
    
    // Adjust column widths based on container width
    if (containerWidth < 600) {
      // Mobile view
      headers.forEach((header, index) => {
        if (index > 0) {
          header.style.display = 'none';
        } else {
          header.style.display = 'table-cell';
          header.style.width = '100%';
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
    // Update table styles based on state
    const genreRows = document.querySelectorAll('.genre-row');
    
    genreRows.forEach((row, index) => {
      // Alternate row styles
      if (index % 2 === 0) {
        row.classList.add('even');
        row.classList.remove('odd');
      } else {
        row.classList.add('odd');
        row.classList.remove('even');
      }
      
      // Highlight the currently selected genre
      const genreId = row.getAttribute('data-genre-id');
      if (genreId && this.genre.idMusicGenre === Number(genreId)) {
        row.classList.add('selected');
      } else {
        row.classList.remove('selected');
      }
    });
  }
  
  private restoreScrollPosition(): void {
    if (this.lastScrollPosition > 0 && this.genresTable) {
      this.genresTable.nativeElement.scrollTop = this.lastScrollPosition;
    }
  }
  
  private focusSearchInput(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }

  filterGenres() {
    const term = this.searchTerm.toLowerCase();
    this.filteredGenres = this.genres.filter((genre) =>
      genre.nameMusicGenre.toLowerCase().includes(term)
    );
  }
  controlError(err: any) {
    if (err.error && typeof err.error === 'object' && err.error.message) {
      this.errorMessage = err.error.message;
    } else if (typeof err.error === 'string') {
      // If `err.error` is a string, it is assumed to be the error message
      this.errorMessage = err.error;
    } else {
      // Handles the case where no useful error message is received
      this.errorMessage = 'An unexpected error has occurred';
    }
  }

  ngOnDestroy(): void {
    // Save scroll position before destroying the component
    if (this.genresTable) {
      this.lastScrollPosition = this.genresTable.nativeElement.scrollTop;
    }
    
    // Clear the resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }
}
