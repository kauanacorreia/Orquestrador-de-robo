import { Component, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Health, HealthStatus } from '../../core/services/health';

@Component({
  selector: 'app-home',
  imports: [MatCardModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  protected readonly loading = signal(true);
  protected readonly status = signal<HealthStatus | null>(null);

  constructor(private readonly health: Health) {}

  ngOnInit(): void {
    this.health.checkHealth().subscribe((status) => {
      this.status.set(status);
      this.loading.set(false);
    });
  }
}
