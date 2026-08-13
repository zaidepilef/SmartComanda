import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  readonly form = this.#fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  error = '';
  loading = false;

  constructor() {
    if (this.#authService.isAuthenticated()) {
      void this.#router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.error = '';
    this.loading = true;

    const { firstName, lastName, email, password } = this.form.getRawValue();

    this.#authService
      .register({ firstName, lastName, email, password })
      .subscribe({
        next: () => {
          void this.#router.navigate(['/login']);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.error ?? 'No se pudo crear la cuenta. Intenta nuevamente.';
        }
      });
  }
}
