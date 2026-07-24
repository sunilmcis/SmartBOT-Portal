import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FirstItem {
  id: number;
  name: string;
}

interface SecondItem {
  id: number;
  description: string;
}

@Component({
  selector: 'app-two-table-fetch',
 // standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h2>Fetch Related Data from Oracle Tables</h2>
      <label for="firstSelect">Select Item from First Table:</label>
      <select id="firstSelect" [(ngModel)]="selectedFirstId" (change)="onFirstSelectChange()" >
        <option value="" disabled selected>Select an item</option>
        <option *ngFor="let item of firstItems" [value]="item.id">{{item.name}}</option>
      </select>

      <div *ngIf="secondItems && secondItems.length">
        <label for="secondSelect">Related Items from Second Table:</label>
        <select id="secondSelect">
          <option *ngFor="let sItem of secondItems" [value]="sItem.id">{{sItem.description}}</option>
        </select>
      </div>

      <div *ngIf="selectedFirstId && (!secondItems || secondItems.length === 0)">
        <p>No related items found in second table.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 480px;
      margin: 30px auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #f9f9f9;
      padding: 25px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0,0,0,0.12);
    }
    label {
      display: block;
      margin-top: 20px;
      margin-bottom: 8px;
      color: #333;
      font-weight: bold;
    }
    select {
      width: 100%;
      padding: 8px 12px;
      font-size: 1rem;
      border-radius: 6px;
      border: 1.5px solid #ccc;
      transition: border-color 0.3s ease;
    }
    select:focus {
      border-color: #007bff;
      outline: none;
    }
    h2 {
      color: #222;
      text-align: center;
    }
    p {
      margin-top: 15px;
      color: #777;
      font-style: italic;
    }
  `]
})
export class TwoTableFetchComponent implements OnInit {
  firstItems: FirstItem[] = [];
  secondItems: SecondItem[] = [];
  selectedFirstId?: number;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadFirstTableData();
  }

  loadFirstTableData(): void {
    this.http.get<FirstItem[]>('http://localhost:3000/api/first-table').subscribe({
      next: data => {
        this.firstItems = data;
      },
      error: err => {
        console.error('Error loading first table data', err);
        this.firstItems = [];
      }
    });
  }

  onFirstSelectChange(): void {
    if (this.selectedFirstId !== undefined && this.selectedFirstId !== null) {
      this.http.get<SecondItem[]>(`http://localhost:3000/api/second-table?parentId=${this.selectedFirstId}`).subscribe({
        next: data => {
          this.secondItems = data;
        },
        error: err => {
          console.error('Error loading second table data', err);
          this.secondItems = [];
        }
      });
    } else {
      this.secondItems = [];
    }
  }
}

