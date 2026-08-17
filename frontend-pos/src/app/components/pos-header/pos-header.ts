import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { PosStore } from '../../store/pos-store.service';

@Component({
  selector: 'app-pos-header',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './pos-header.html',
  styleUrls: ['./pos-header.scss'],
})
export class PosHeader implements OnInit, OnDestroy {
  readonly #store = inject(PosStore);
  readonly #router = inject(Router);

  readonly branch = this.#store.branch;
  readonly cashSession = this.#store.cashSession;

  now = new Date();

  #timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.#timer = setInterval(() => {
      this.now = new Date();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.#timer) {
      clearInterval(this.#timer);
    }
  }

  timeLabel(): string {
    return this.now.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  dateLabel(): string {
    return this.now.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  goToCaja(): void {
    void this.#router.navigate(['/cash']);
  }
}