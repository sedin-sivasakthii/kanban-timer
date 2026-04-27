export interface Task {
  id: string;
  title: string;
  timeLogs: { [columnName: string]: number }; // Time in seconds
  lastMovedAt: number;
}
