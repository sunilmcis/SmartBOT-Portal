
// src/app/testing/task.model.ts
export interface Task {
  id?: number;
  title: string;
  description: string;
  assigned_to: string;
  status: string;
  due_date: string; // or Date if you're handling date objects
}
