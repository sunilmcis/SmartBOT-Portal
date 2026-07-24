import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule ],
  template: `<router-outlet></router-outlet>`
})
export class AppComponent {}


// import { Component } from '@angular/core';
// import { RouterModule } from '@angular/router';
//
// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterModule],
//   templateUrl: './app.component.html'
// })
// export class AppComponent {}
//

// import { Component, OnInit } from '@angular/core';
// import { HttpClient, HttpClientModule } from '@angular/common/http';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';
// import { RouterOutlet } from '@angular/router';
// import { DataService } from './data.service';
//
// @Component({
//   selector: 'app-root',
//   standalone: true,
//  // imports: [CommonModule, FormsModule, HttpClientModule, RouterOutlet],
//   imports: [RouterOutlet],
//   providers: [DataService],
//   //templateUrl: './app.component.html'
//   template: `<router-outlet></router-outlet>`
//
// })
// export class AppComponent implements OnInit {
//
//   title = 'My Angular App';
//   items: any[] = []; // Report categories
//   parameters: any[] = []; // Parameters based on selected category
//   selectedCategory: string = '';
//   selectedParameter: string = '';
//   noteContent: string = '';
//
//   constructor(private dataService: DataService, private http: HttpClient) {}
//
//   ngOnInit(): void {
//     this.dataService.getData().subscribe({
//       next: (data) => {
//         // Transform data [["AUT_1"], ["AUT_2"]] → [{ value: "AUT_1", label: "AUT_1" }]
//         this.items = data.map((item: any[]) => ({
//           value: item[0],
//           label: item[0]
//         }));
//       },
//       error: (err) => console.error('Error fetching report categories:', err)
//     });
//   }
//
//   onCategoryChange(event: any): void {
//     const selectedValue = this.selectedCategory; //event.target.value; ${selectedValue}
//     // const selectedValue = event.target.value;
//     if (selectedValue) {
//       this.http
//         .get<any[]>(`http://localhost:3005/api/second-table?parentId=${selectedValue}`)
//         .subscribe({
//           next: (data) => {
//             console.log('Received parameters:', data); // ✅ log it
//             //this.parameters = data;
//             this.parameters = data.map((param: any[]) => ({
//                         value: param[0]
//                       }));
//           },
//           error: (err) => {
//             console.error('Error fetching parameters:', err);
//             this.parameters = [];
//           }
//         });
//     } else {
//       this.parameters = [];
//     }
//   }
// get parameterText(): string {
//     return this.parameters?.map(p => p.value).join(', ') || '';
//   }
//
// saveNote(): void {
//   const blob = new Blob([this.noteContent], { type: 'text/plain' });
//   const url = window.URL.createObjectURL(blob);
//
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'note.txt'; // Default filename
//   a.click();
//
//   window.URL.revokeObjectURL(url); // Clean up
// }
// }
