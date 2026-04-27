# KanbanTimer Codebase Documentation

This document provides an in-depth, file-by-file explanation of the logic and functionality implemented in the KanbanTimer application.

---

## 1. Core Module (`src/app/core`)

The Core module contains the foundational data structures and services used across the entire app.

### A. Models (`src/app/core/models`)
These files define the "shape" of our data using TypeScript interfaces.

*   **`user.model.ts`**: 
    1. `export interface User {`: Defines the user structure.
    2. `name: string;`: Stores the user's display name.
*   **`task.model.ts`**:
    1. `export interface Task {`: Defines the task structure.
    2. `id: string;`: Unique identifier (UUID).
    3. `title: string;`: The text of the task.
    4. `timeLogs: { [columnName: string]: number };`: An object tracking seconds per column.
    5. `lastMovedAt: number;`: Timestamp of the last movement or creation.
*   **`column.model.ts`**:
    1. `import { Task } from './task.model';`: Imports task definition.
    2. `export interface Column {`: Defines the column structure.
    3. `id: string;`: Unique identifier.
    4. `name: string;`: Name of the column (e.g., "Todo").
    5. `tasks: Task[];`: Array of tasks inside this column.
    6. `isDefault?: boolean;`: Optional flag to protect default columns.
*   **`project.model.ts`**:
    1. `import { Column } from './column.model';`: Imports column definition.
    2. `export interface Project {`: Defines the project structure.
    3. `id: string;`: Unique identifier.
    4. `name: string;`: The project's name.
    5. `columns: Column[];`: The lists/columns belonging to this project.

### B. Services (`src/app/core/services`)
These contain the "brains" of the application.

*   **`storage.service.ts`**:
    *   **Logic**: A wrapper for `localStorage`. 
    *   **Why?**: It handles the `JSON.stringify` and `JSON.parse` logic centrally, preventing errors if the storage is empty or corrupted.
*   **`user.service.ts`**:
    *   **Logic**: Manages the current user state using an Angular **Signal**.
    *   **Functionality**: `isLoggedIn()` checks if a user exists. `setUser()` saves the name and updates the Signal, which instantly updates the "Hello, Name" text in the UI.
*   **`timer.service.ts`**:
    *   **Logic**: Pure utility service for time formatting.
    *   **Functionality**: `formatTime(seconds)` converts raw numbers (like 90) into strings (like "1m 30s").
*   **`project.service.ts` (The Timer Logic)**:
    1. `projects = signal<Project[]>(...)`: Uses Angular Signals for reactive state.
    2. `createProject(name)`: Generates a project with a UUID and 6 default columns.
    3. `moveTask(projectId, sourceColId, targetColId, taskId, newIndex)`:
        *   Finds the task in the source column.
        *   Calculates `duration = Date.now() - task.lastMovedAt`.
        *   Adds `duration` (in seconds) to `task.timeLogs[sourceCol.name]`.
        *   Updates `task.lastMovedAt = Date.now()`.
        *   Moves the task to the target column at the specified index.
    4. `updateProject(id, updater)`: A private helper that deep-clones the project list, applies changes, and saves back to storage. Deep cloning ensures the Signal detects the change.

---

## 2. Features Module (`src/app/features`)

This contains the actual screens (components) of the app.

### A. Onboarding (`src/app/features/onboarding`)
*   **Logic**: A simple form to capture the user's name.
*   **Flow**: Once `getStarted()` is called, it saves to `UserService` and uses the `Router` to navigate to the home page.

### B. Home (Project List) (`src/app/features/home`)
*   **`home.component.ts`**:
    1. `editingProjectId`: Tracks which project is being renamed.
    2. `confirmDeleteProjectId`: Tracks which project is showing the "Delete?" prompt.
    3. `startEdit()`: Stops click propagation (to prevent opening the project) and sets the edit ID.
    4. `saveEdit()`: Calls `projectService.updateProjectName()` and clears the edit state.
    5. `requestDelete()`: Opens the inline confirmation UI.

### C. Board (`src/app/features/board`)
*   **`board.component.ts`**:
    1. `project = computed(...)`: Reactively finds the current project from the ID in the route.
    2. `addTask()`: Calls the service to add a task to a specific column.
    3. `confirmDeleteColumn()`: 
        *   Checks if the column has tasks.
        *   If it does, it sets `deletingColumnId` to show the migration dropdown.
        *   If empty, it shows a simple inline "Delete?" prompt.
    4. `drop()`: Handles the drag-and-drop event from `@angular/cdk/drag-drop`.
    5. `getTimeLogEntries()`: Converts the `timeLogs` object into an array for easy looping in the template.

---

## 3. App Core

*   **`app.routes.ts`**:
    *   **Guards**: 
        *   `authGuard`: Prevents users from seeing projects if they haven't set a name.
        *   `onboardingGuard`: Prevents users from going back to the onboarding screen if they are already logged in.
*   **`app.component.html`**:
    *   Contains only `<router-outlet />`, acting as the "shell" that swaps between Onboarding, Home, and Board.
*   **`styles.css`**:
    *   Defines a global **CSS Variable** system (`--primary-color`, `--card-bg`, etc.). This makes it easy to change the "Minimalist" theme from one place.

---

## Summary of Key Design Decisions
1.  **Icon-less UI**: We used text-based buttons ("Delete", "View Logs") to keep the UI clean and "minimalist" as requested.
2.  **No Pop-ups**: By using inline states (`editingId`, `deletingId`), we avoided browser `alert()` and `confirm()` boxes which are often blocked by browsers or disrupt the user flow.
3.  **Local First**: No backend is required. Everything stays on the user's machine via `localStorage`.
