import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Payments } from '../../services/payments';
import { Payment } from '../../models/payment';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  payments: Payment[] = [];
  currentPage = 1;
  pageSize = 5;

  constructor(private service: Payments, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Payment[]) => (this.payments = data));
  }

  navigateToCreate() {
    this.router.navigate(['/payments/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/payments/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.payments = this.payments.filter(p => p.id_pago !== id);
      });
    }
  }

  get paginatedPayments(): Payment[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.payments.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.payments.length / this.pageSize);
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