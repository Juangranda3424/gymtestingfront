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

  constructor(private service: Classes, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Class[]) => (this.classes = data));
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