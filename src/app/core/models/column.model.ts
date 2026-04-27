import { Task } from './task.model';
 
export interface Column {
  id: string;
  name: string;
  tasks: Task[];
  isDefault?: boolean;
}
