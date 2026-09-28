import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

import {
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { NotificationBell } from '../../../features/notifications/components/notification-bell/notification-bell';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
    NotificationBell
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update(
      collapsed => !collapsed
    );
  }
}