import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Classes } from '../../services/classes';
import { Class } from '../../models/class';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  classes: Class[] = [];
  currentPage = 1;
  pageSize = 5;

  constructor(private service: Classes, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Class[]) => (this.classes = data));
  }

  get paginatedClasses(): Class[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.classes.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.classes.length / this.pageSize);
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
    this.router.navigate(['/classes/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/classes/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.classes = this.classes.filter(c => c.id_clase !== id);
      });
    }
  }
}