import { Injectable, signal, inject } from '@angular/core';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly USER_KEY = 'kb_user';
  private storage = inject(StorageService);

  user = signal<User | null>(this.storage.getItem<User>(this.USER_KEY));

  setUser(name: string): void {
    const newUser = { name };
    this.storage.setItem(this.USER_KEY, newUser);
    this.user.set(newUser);
  }

  isLoggedIn(): boolean {
    return !!this.user();
  }
}
