import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Memberships } from '../../services/memberships';
import { Membership } from '../../models/membership';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  memberships: Membership[] = [];

  constructor(private service: Memberships, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Membership[]) => (this.memberships = data));
  }

  navigateToCreate() {
    this.router.navigate(['/memberships/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/memberships/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.memberships = this.memberships.filter(m => m.id_membresia !== id);
      });
    }
  }
}