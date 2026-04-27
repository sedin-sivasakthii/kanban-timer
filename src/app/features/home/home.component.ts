import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ProjectService } from '../../core/services/project.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  private projectService = inject(ProjectService);
  private userService = inject(UserService);
  public router = inject(Router);

  userName = this.userService.user()?.name || 'User';
  projects = this.projectService.projects;
  newProjectName = '';
  editingProjectId: string | null = null;
  editedProjectName: string = '';

  confirmDeleteProjectId: string | null = null;

  createProject(): void {
    if (this.newProjectName.trim()) {
      const project = this.projectService.createProject(this.newProjectName.trim());
      this.newProjectName = '';
      this.router.navigate(['/project', project.id]);
    }
  }

  startEdit(event: Event, project: any): void {
    event.stopPropagation();
    this.editingProjectId = project.id;
    this.editedProjectName = project.name;
    this.confirmDeleteProjectId = null;
  }

  saveEdit(event: Event): void {
    event.stopPropagation();
    if (this.editingProjectId && this.editedProjectName.trim()) {
      this.projectService.updateProjectName(this.editingProjectId, this.editedProjectName.trim());
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.editingProjectId = null;
    this.editedProjectName = '';
  }

  requestDelete(event: Event, projectId: string): void {
    event.stopPropagation();
    this.confirmDeleteProjectId = projectId;
    this.editingProjectId = null;
  }

  confirmDelete(event: Event, projectId: string): void {
    event.stopPropagation();
    this.projectService.deleteProject(projectId);
    this.confirmDeleteProjectId = null;
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.confirmDeleteProjectId = null;
  }
}
