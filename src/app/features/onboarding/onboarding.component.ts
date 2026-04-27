import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  name = '';

  getStarted(): void {
    if (this.name.trim()) {
      this.userService.setUser(this.name.trim());
      this.router.navigate(['/']);
    }
  }
}
