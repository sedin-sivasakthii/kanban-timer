import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/projects/project-list/project-list.component')
        .then(m => m.ProjectListComponent)
  },
  {
    path: 'project/:id',
    loadComponent: () =>
      import('./features/board/board.component')
        .then(m => m.BoardComponent)
  }
];