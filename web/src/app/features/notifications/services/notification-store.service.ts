import { Injectable, computed, inject, signal } from '@angular/core';
import { Subject, interval, takeUntil } from 'rxjs';

import { AppNotification } from '../models/notification.model';
import { NotificationService } from './notification.service';

const POLLING_INTERVAL_MS = 20000;
const LAST_SEEN_KEY = 'orquestrador.notifications.lastSeenAt';

@Injectable({
  providedIn: 'root'
})
export class NotificationStoreService {
  private readonly notificationService = inject(NotificationService);

  private stopPolling$: Subject<void> | null = null;

  readonly notifications = signal<AppNotification[]>([]);
  private readonly lastSeenAt = signal(this.readLastSeenAt());

  readonly unreadCount = computed(() => {
    const lastSeen = this.lastSeenAt();

    if (!lastSeen) {
      return this.notifications().length;
    }

    return this.notifications().filter(
      notification => new Date(notification.created_at).getTime() > lastSeen
    ).length;
  });

  startPolling(): void {
    if (this.stopPolling$) {
      return;
    }

    this.stopPolling$ = new Subject<void>();

    this.refresh();

    interval(POLLING_INTERVAL_MS)
      .pipe(takeUntil(this.stopPolling$))
      .subscribe(() => this.refresh());
  }

  stopPolling(): void {
    this.stopPolling$?.next();
    this.stopPolling$?.complete();
    this.stopPolling$ = null;
  }

  markAllSeen(): void {
    const now = Date.now();
    this.lastSeenAt.set(now);

    try {
      localStorage.setItem(LAST_SEEN_KEY, String(now));
    } catch {
      // localStorage indisponível (modo privado, etc.) — segue sem persistir.
    }
  }

  private refresh(): void {
    this.notificationService.list().subscribe({
      next: notifications => this.notifications.set(notifications),
      error: () => {
        // Falha silenciosa: mantém a última lista conhecida até o próximo polling.
      }
    });
  }

  private readLastSeenAt(): number | null {
    try {
      const value = localStorage.getItem(LAST_SEEN_KEY);
      return value ? Number(value) : null;
    } catch {
      return null;
    }
  }
}
