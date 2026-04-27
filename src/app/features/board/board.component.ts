import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { ProjectService } from '../../core/services/project.service';
import { TimerService } from '../../core/services/timer.service';
import { Project } from '../../core/models/project.model';
import { Task } from '../../core/models/task.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DragDropModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private projectService = inject(ProjectService);
  public timerService = inject(TimerService);

  projectId: string | null = null;
  project = computed(() => this.projectService.projects().find(p => p.id === this.projectId));

  newTaskTitle = '';
  newColumnName = '';
  showStatsTaskId: string | null = null;
  deletingColumnId: string | null = null;
  targetMigrationColumnId: string = '';
  confirmDeleteTaskId: string | null = null;

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id');
  }

  addTask(columnId: string): void {
    if (this.newTaskTitle.trim() && this.projectId) {
      this.projectService.addTask(this.projectId, columnId, this.newTaskTitle.trim());
      this.newTaskTitle = '';
    }
  }

  requestDeleteTask(taskId: string): void {
    this.confirmDeleteTaskId = taskId;
    this.showStatsTaskId = null;
  }

  confirmDeleteTask(columnId: string, taskId: string): void {
    if (this.projectId) {
      this.projectService.deleteTask(this.projectId, columnId, taskId);
      this.confirmDeleteTaskId = null;
    }
  }

  cancelDeleteTask(): void {
    this.confirmDeleteTaskId = null;
  }

  addColumn(): void {
    if (this.newColumnName.trim() && this.projectId) {
      this.projectService.addColumn(this.projectId, this.newColumnName.trim());
      this.newColumnName = '';
    }
  }

  confirmDeleteColumn(columnId: string): void {
    if (!this.projectId) return;
    const proj = this.project();
    if (!proj) return;
    const column = proj.columns.find(c => c.id === columnId);
    if (!column) return;

    if (column.tasks.length > 0) {
      this.deletingColumnId = columnId;
      const otherCols = proj.columns.filter(c => c.id !== columnId);
      if (otherCols.length > 0) {
        this.targetMigrationColumnId = otherCols[0].id;
      }
    } else {
      this.deletingColumnId = columnId;
      this.targetMigrationColumnId = '';
    }
  }

  executeDeleteColumn(): void {
    if (this.projectId && this.deletingColumnId) {
      this.projectService.deleteColumn(this.projectId, this.deletingColumnId, this.targetMigrationColumnId || undefined);
      this.cancelDeleteColumn();
    }
  }

  cancelDeleteColumn(): void {
    this.deletingColumnId = null;
    this.targetMigrationColumnId = '';
  }

  getOtherColumns(currentColId: string) {
    return this.project()?.columns.filter(c => c.id !== currentColId) || [];
  }

  drop(event: CdkDragDrop<Task[]>, targetColId: string): void {
    if (!this.projectId) return;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const sourceColId = event.previousContainer.id;
      const taskId = event.item.data.id;
      this.projectService.moveTask(this.projectId, sourceColId, targetColId, taskId, event.currentIndex);
    }
  }

  toggleStats(taskId: string): void {
    this.showStatsTaskId = this.showStatsTaskId === taskId ? null : taskId;
  }

  getTimeLogEntries(task: Task): { key: string, value: number }[] {
    return Object.entries(task.timeLogs).map(([key, value]) => ({ key, value }));
  }
}
