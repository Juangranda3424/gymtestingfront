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
}