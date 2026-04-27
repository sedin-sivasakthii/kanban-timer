import { Routes } from '@angular/router';
import { OnboardingComponent } from './features/onboarding/onboarding.component';
import { HomeComponent } from './features/home/home.component';
import { BoardComponent } from './features/board/board.component';
import { inject } from '@angular/core';
import { UserService } from './core/services/user.service';
import { Router } from '@angular/router';
 
const authGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  if (userService.isLoggedIn()) { return true; }
  return router.parseUrl('/onboarding');
};
 
const onboardingGuard = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  if (!userService.isLoggedIn()) { return true; }
  return router.parseUrl('/');
};
 
export const routes: Routes = [
  { path: 'onboarding', component: OnboardingComponent, canActivate: [onboardingGuard] },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'project/:id', component: BoardComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];