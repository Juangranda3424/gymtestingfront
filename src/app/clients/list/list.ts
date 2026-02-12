import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Clients } from '../../services/clients';
import { Client } from '../../models/client';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  clients: Client[] = [];
  currentPage = 1;
  pageSize = 5;

  constructor(private service: Clients, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Client[]) => this.clients = data);
  }

  get paginatedClients(): Client[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.clients.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.clients.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get visiblePages(): number[] {
    const maxVisible = 5;
    const total = this.totalPages;
    
    if (total <= maxVisible) {
      return this.pages;
    }

    const half = Math.floor(maxVisible / 2);
    let start = this.currentPage - half;
    let end = this.currentPage + half;

    if (start < 1) {
      start = 1;
      end = maxVisible;
    }

    if (end > total) {
      end = total;
      start = total - maxVisible + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
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

  navigateToCreate() {
    this.router.navigate(['/clients/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/clients/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.clients = this.clients.filter(c => c.id_cliente !== id);
      });
    }
  }
}