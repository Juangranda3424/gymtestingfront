import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Trainers } from '../../services/trainers';
import { Trainer } from '../../models/trainer';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  trainers: Trainer[] = [];

  constructor(private service: Trainers, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Trainer[]) => (this.trainers = data));
  }

  navigateToCreate() {
    this.router.navigate(['/trainers/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/trainers/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.trainers = this.trainers.filter(t => t.id_entrenador !== id);
      });
    }
  }
}