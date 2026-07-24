import { Component,OnInit  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface AlertRecord {
  staff: string;
  [year: string]: string | number; // dynamic keys for years
}

interface MedicareAlertRecord {
  trans: string;
  [count: string]:  string | number; // dynamic keys for years
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit{

    //currentDate: String= new Date();
    currentDate: string = '';
//     Transaction: string = '';
    currentYear: number = new Date().getFullYear();
    prevYear: number = this.currentYear - 1;
    twoYearsAgo: number = this.currentYear - 2;
    grandTotal1: number=0;
    grandTotal2: number=0;
    totCount: number=0;

    rowColors: string[] = [
      '#fde68a', // amber
      '#fca5a5', // red
      '#a5f3fc', // light cyan
      '#c4b5fd', // purple
      '#bbf7d0', // mint green
      '#fbcfe8', // pink
      '#fdba74', // orange
      '#93c5fd', // light blue
      '#d8b4fe', // violet
      '#fef08a', // yellow
      '#6ee7b7', // teal
      '#f87171'  // coral
    ];

    alertRecords: AlertRecord[] = [];
    medicareAlertRecord: MedicareAlertRecord[]=[];

  public color: string = '#ff0000';
  // Bar Chart
  public barChartType: 'bar' = 'bar';
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    scales: {
      x: {},
      y: {
        beginAtZero: true
      }
    }
  };
  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr'],
    datasets: [
      {
        data: [65, 59, 80, 81],
        label: 'Sales',
        backgroundColor: '#42A5F5'
      }
    ]
  };

  // Pie Chart
  public pieChartType: 'pie' = 'pie';
  public pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true
  };
  public pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: ['Group', 'Individual', 'Health'],
    datasets: [
      {
        data: [550, 300, 200],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
      }
    ]
  };

// Wave Chart
public waveChartType: 'line' = 'line';
public waveChartOptions: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  elements: {
    line: {
      tension: 0.4 // 👈 wave effect
    }
  },
  plugins: {
    legend: {
      display: true
    }
  }
};

public waveChartData: ChartConfiguration<'line'>['data'] = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  datasets: [
    {
      label: 'Timeline Activity',
      data: [10, 20, 15, 25, 22, 30, 18],
      borderColor: '#6a1b9a',
      backgroundColor: 'rgba(106, 27, 154, 0.3)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#6a1b9a'
    }
  ]
};

public currentTime: string = '';
// public currentDate: Date = new Date();
//
// alertRecords: AlertRecord[] = [];

ngOnInit() {
  this.updateTime();
  this.updateDate();
  setInterval(() => this.updateTime(), 1000); // update every second

//   const currentYear = new Date().getFullYear();

      this.alertRecords = [
            {
              staff: 'Rozaima',
              [this.currentDate]: 2,
              [this.prevYear]: 0,
              [this.twoYearsAgo]: 0,
              [this.grandTotal1]:2
            },
            {
              staff: 'Sanisah',
              [this.currentDate]: 4,
              [this.prevYear]: 34,
              [this.twoYearsAgo]: 3,
              [this.grandTotal1]:41
            },
            {
              staff: 'Suzana',
              [this.currentDate]: 3,
              [this.prevYear]: 0,
              [this.twoYearsAgo]: 0,
              [this.grandTotal1]:3
            },
            {
              staff: 'Yokekim',
              [this.currentDate]: 0,
              [this.prevYear]: 5,
              [this.twoYearsAgo]: 5,
              [this.grandTotal1]:10
            },
            {
              staff: 'Ziela',
              [this.currentDate]: 3,
              [this.prevYear]: 0,
              [this.twoYearsAgo]: 0,
              [this.grandTotal1]:3
            },


          ];
      this.medicareAlertRecord  = [
            {
              trans: 'REINSTATE',
              [this.totCount]: 30
            },
            {
              trans: 'CANCEL',
              [this.totCount]: 1
            },
            {
              trans: 'LAPSE',
              [this.totCount]: 20
            },
            {
              trans: 'NEW',
              [this.totCount]: 12
            },
            {
              trans: 'UPGRADE/DOWNGRADE',
              [this.totCount]: 0
            },
            {
              trans: 'REPRINT',
              [this.totCount]: 0
            },
            {
              trans: 'ADDITION',
              [this.totCount]: 0
            },
          {
              trans: 'DELETION',
              [this.totCount]: 2
            }

          ];

}

updateTime() {
  const now = new Date();
  this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}


updateDate() {
  const now = new Date();
  this.currentDate = now.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}




}
