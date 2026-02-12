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

  constructor(private service: Clients, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Client[]) => this.clients = data);
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