import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.css']
})
export class ProjectListComponent {
  projects = [];
  name = '';

  constructor(private service: ProjectService, private router: Router) {
    this.projects = this.service.getProjects();
  }

  create() {
    const p = this.service.createProject(this.name);
    this.router.navigate(['/project', p.id]);
  }

  open(id: string) {
    this.router.navigate(['/project', id]);
  }

  countTasks(p: any) {
    return p.columns.reduce((sum, c) => sum + c.tasks.length, 0);
  }
}