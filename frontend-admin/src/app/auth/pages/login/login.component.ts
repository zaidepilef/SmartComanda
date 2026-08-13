import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  readonly #fb = inject(FormBuilder);
  readonly #authService = inject(AuthService);
  readonly #router = inject(Router);

  readonly form = this.#fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
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

    const { email, password } = this.form.getRawValue();

    this.#authService.login(email, password).subscribe({
      next: (result) => {
        this.#authService.setToken(result.token);
        void this.#router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.error ?? 'No se pudo iniciar sesión. Intenta nuevamente.';
      }
    });
  }
}
