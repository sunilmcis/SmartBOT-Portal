import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskHistoryDialogComponent } from './task-history-dialog.component';

describe('TaskHistoryDialogComponent', () => {
  let component: TaskHistoryDialogComponent;
  let fixture: ComponentFixture<TaskHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskHistoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
