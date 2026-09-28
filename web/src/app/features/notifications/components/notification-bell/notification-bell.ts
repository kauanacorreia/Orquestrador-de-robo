import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AppNotification } from '../../models/notification.model';
import { NotificationStoreService } from '../../services/notification-store.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule
  ],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.scss'
})
export class NotificationBell implements OnInit, OnDestroy {
  private readonly store = inject(NotificationStoreService);
  private readonly router = inject(Router);

  readonly notifications = this.store.notifications;
  readonly unreadCount = this.store.unreadCount;

  ngOnInit(): void {
    this.store.startPolling();
  }

  ngOnDestroy(): void {
    this.store.stopPolling();
  }

  onMenuOpened(): void {
    this.store.markAllSeen();
  }

  openNotification(notification: AppNotification): void {
    if (notification.link_path) {
      this.router.navigateByUrl(notification.link_path);
    }
  }

  iconFor(notification: AppNotification): string {
    return notification.kind === 'execution_failed' ? 'error' : 'check_circle';
  }

  formatDate(value: string): string {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
