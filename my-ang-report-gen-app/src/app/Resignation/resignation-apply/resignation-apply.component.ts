export class ResignationApplyComponent {
  form = this.fb.group({
    reason: ['', Validators.required],
    requestedLastDay: [''],
    commentsEmployee: ['']
  });

  constructor(
    private fb: FormBuilder,
    private resignationService: ResignationService,
    private auth: AuthService // where you keep current user
  ) {}

  submit() {
    if (this.form.invalid) return;

    const user = this.auth.currentUser; // contains empId, managerId etc.

    const payload = {
      employeeId: user.empId,
      managerId: user.managerEmpId, // or from user.role mapping
      ...this.form.value
    };

    this.resignationService.submit(payload).subscribe({
      next: () => alert('Resignation submitted'),
      error: err => console.error(err)
    });
  }
}
