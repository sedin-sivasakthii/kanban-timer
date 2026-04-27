import { Column } from './column.model';

export interface Project {
  id: string;
  name: string;
  columns: Column[];
}