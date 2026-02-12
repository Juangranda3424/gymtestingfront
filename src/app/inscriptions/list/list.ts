import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Inscriptions } from '../../services/inscriptions';
import { Inscription } from '../../models/inscription';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  inscriptions: Inscription[] = [];
  currentPage = 1;
  pageSize = 5;

  constructor(private service: Inscriptions, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Inscription[]) => (this.inscriptions = data));
  }

  navigateToCreate() {
    this.router.navigate(['/inscriptions/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/inscriptions/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.inscriptions = this.inscriptions.filter(i => i.id_inscripcion !== id);
      });
    }
  }

  get paginatedInscriptions(): Inscription[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.inscriptions.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.inscriptions.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get visiblePages(): number[] {
    const total = this.totalPages;
    if (total <= 5) {
      return this.pages;
    }
    if (this.currentPage <= 3) {
      return this.pages.slice(0, 5);
    }
    if (this.currentPage >= total - 2) {
      return this.pages.slice(total - 5, total);
    }
    return this.pages.slice(this.currentPage - 3, this.currentPage + 2);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
}