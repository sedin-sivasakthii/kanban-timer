import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private key = 'projects';

  constructor(private storage: StorageService) {}

  getProjects() {
    return this.storage.get(this.key) || [];
  }

  saveProjects(projects: any[]) {
    this.storage.set(this.key, projects);
  }

  createProject(name: string) {
    const project = {
      id: crypto.randomUUID(),
      name,
      columns: this.defaultColumns()
    };

    const projects = this.getProjects();
    projects.push(project);
    this.saveProjects(projects);

    return project;
  }

  defaultColumns() {
    const names = [
      'Todo','Working','Testing','Review','Actual Testing','Completed'
    ];

    return names.map(n => ({
      id: crypto.randomUUID(),
      name: n,
      tasks: []
    }));
  }

  addColumn(project: any, name: string) {
    project.columns.splice(project.columns.length - 1, 0, {
      id: crypto.randomUUID(),
      name,
      tasks: []
    });
  }

  deleteColumn(project: any, colId: string, targetId: string) {
    const col = project.columns.find(c => c.id === colId);
    const target = project.columns.find(c => c.id === targetId);

    target.tasks.push(...col.tasks);
    project.columns = project.columns.filter(c => c.id !== colId);
  }
}