import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
