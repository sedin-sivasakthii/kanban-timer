import { Injectable, signal, inject } from '@angular/core';
import { Project } from '../models/project.model';
import { Column } from '../models/column.model';
import { Task } from '../models/task.model';
import { StorageService } from './storage.service';
 
@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly PROJECTS_KEY = 'kb_projects';
  private storage = inject(StorageService);
 
  projects = signal<Project[]>(this.storage.getItem<Project[]>(this.PROJECTS_KEY) || []);
 
  private readonly DEFAULT_COLUMNS: string[] = [
    'Todo', 'Working', 'Testing', 'Review', 'Actual Testing', 'Completed'
  ];
 
  createProject(name: string): Project {
    const id = crypto.randomUUID();
    const columns: Column[] = this.DEFAULT_COLUMNS.map(colName => ({
      id: crypto.randomUUID(),
      name: colName,
      tasks: [],
      isDefault: colName === 'Todo' || colName === 'Completed'
    }));
 
    const newProject: Project = { id, name, columns };
    const currentProjects = this.projects();
    const updatedProjects = [...currentProjects, newProject];
    this.saveProjects(updatedProjects);
    return newProject;
  }
 
  getProjectById(id: string): Project | undefined {
    return this.projects().find(p => p.id === id);
  }
 
  deleteProject(id: string): void {
    const updatedProjects = this.projects().filter(p => p.id !== id);
    this.saveProjects(updatedProjects);
  }
 
  updateProjectName(id: string, name: string): void {
    const updatedProjects = this.projects().map(p => 
      p.id === id ? { ...p, name } : p
    );
    this.saveProjects(updatedProjects);
  }
 
  addTask(projectId: string, columnId: string, title: string): void {
    this.updateProject(projectId, project => {
      const column = project.columns.find(c => c.id === columnId);
      if (column) {
        const newTask: Task = {
          id: crypto.randomUUID(),
          title,
          timeLogs: {},
          lastMovedAt: Date.now()
        };
        column.tasks.push(newTask);
      }
    });
  }
 
  deleteTask(projectId: string, columnId: string, taskId: string): void {
    this.updateProject(projectId, project => {
      const column = project.columns.find(c => c.id === columnId);
      if (column) {
        column.tasks = column.tasks.filter(t => t.id !== taskId);
      }
    });
  }
 
  moveTask(projectId: string, sourceColId: string, targetColId: string, taskId: string, newIndex: number): void {
    this.updateProject(projectId, project => {
      const sourceCol = project.columns.find(c => c.id === sourceColId);
      const targetCol = project.columns.find(c => c.id === targetColId);
      if (!sourceCol || !targetCol) return;
 
      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      if (taskIndex === -1) return;
 
      const [task] = sourceCol.tasks.splice(taskIndex, 1);
      const now = Date.now();
      const durationSeconds = Math.floor((now - task.lastMovedAt) / 1000);
      task.timeLogs[sourceCol.name] = (task.timeLogs[sourceCol.name] || 0) + durationSeconds;
      task.lastMovedAt = now;
 
      targetCol.tasks.splice(newIndex, 0, task);
    });
  }
 
  addColumn(projectId: string, name: string): void {
    this.updateProject(projectId, project => {
      const completedIndex = project.columns.findIndex(c => c.name === 'Completed');
      const newColumn = {
        id: crypto.randomUUID(),
        name,
        tasks: [],
        isDefault: false
      };
 
      if (completedIndex !== -1) {
        project.columns.splice(completedIndex, 0, newColumn);
      } else {
        project.columns.push(newColumn);
      }
    });
  }
 
  deleteColumn(projectId: string, columnId: string, targetColumnId?: string): void {
    this.updateProject(projectId, project => {
      const colIndex = project.columns.findIndex(c => c.id === columnId);
      if (colIndex === -1) return;
 
      const column = project.columns[colIndex];
      if (column.isDefault && (column.name === 'Todo' || column.name === 'Completed')) return;
 
      if (column.tasks.length > 0 && targetColumnId) {
        const targetCol = project.columns.find(c => c.id === targetColumnId);
        if (targetCol) {
          targetCol.tasks.push(...column.tasks);
        }
      }
 
      project.columns.splice(colIndex, 1);
    });
  }
 
  private updateProject(id: string, updater: (project: Project) => void): void {
    const currentProjects = JSON.parse(JSON.stringify(this.projects()));
    const project = currentProjects.find((p: Project) => p.id === id);
    if (project) {
      updater(project);
      this.saveProjects(currentProjects);
    }
  }
 
  private saveProjects(projects: Project[]): void {
    this.storage.setItem(this.PROJECTS_KEY, projects);
    this.projects.set(projects);
  }
}