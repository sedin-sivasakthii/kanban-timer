import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { UserService } from './core/services/user.service';

@Component({
  standalone: true,
  imports: [RouterOutlet, OnboardingComponent],
  template: `
    <app-onboarding *ngIf="first"></app-onboarding>
    <router-outlet *ngIf="!first"></router-outlet>
  `
})
export class AppComponent {
  first = false;

  constructor(private user: UserService) {
    this.first = this.user.isFirstTime();
  }
}