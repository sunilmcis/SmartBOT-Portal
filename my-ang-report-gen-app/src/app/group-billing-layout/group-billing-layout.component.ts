import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders
} from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  Subject,
  Subscription,
  interval,
  switchMap,
  takeUntil
} from 'rxjs';

import { AuthService } from '../services/auth.service';

type BillingProcessStatus =
  | 'idle'
  | 'uploading'
  | 'uploaded'
  | 'validating'
  | 'billing'
  | 'tax_invoice'
  | 'completed'
  | 'failed';

type BillingProcessStage =
  | 'uploaded'
  | 'validating'
  | 'billing'
  | 'tax_invoice'
  | 'completed';

type BillingOutputType =
  | 'billing'
  | 'rejection'
  | 'summary'
  | 'tax-invoice'
  | 'all';

interface BillingUploadResponse {
  success: boolean;
  batchId: string;
  status: BillingProcessStatus;
  message?: string;
}

interface BillingStatusResponse {
  success: boolean;
  batchId: string;
  status: BillingProcessStatus;
  stage?: string;
  message?: string;
  progress?: number;

  totalRecords?: number;
  validRecords?: number;
  rejectedRecords?: number;
  warningRecords?: number;
  taxInvoiceCount?: number;

  billingFileAvailable?: boolean;
  billingFileName?: string;

  rejectionFileAvailable?: boolean;
  rejectionFileName?: string;

  summaryFileAvailable?: boolean;
  summaryFileName?: string;

  taxInvoiceFileAvailable?: boolean;
  taxInvoiceFileName?: string;

  errorMessage?: string;

  logs?: BillingProcessLog[];
}

interface BillingProcessLog {
  time: string;
  message: string;
}

@Component({
  selector: 'app-group-billing-layout',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatTooltipModule
  ],

  templateUrl:
    './group-billing-layout.component.html',

  styleUrls: [
    './group-billing-layout.component.css'
  ]
})
export class GroupBillingLayoutComponent
  implements OnInit, OnDestroy {

  /*
   * SmartBOT Node.js backend:
   * http://localhost:3017/api/group-billing
   *
   * Change this URL when deploying to UAT or production.
   */
  private readonly apiBaseUrl =
    'http://localhost:3017/api/group-billing';

  readonly maxFileSizeMb = 25;

  selectedFile: File | null = null;
  username: string | null = null;

  // User-entered billing parameters
  policyNo = '';

  processGTL = false;
  processGHS = false;
  processGOP = false;

  billNoGTL = '';
  billNoGHS = '';
  billNoGOP = '';

  isDragging = false;
  isProcessing = false;
  isDownloading = false;

  processStarted = false;
  validationAvailable = false;

  processStatus: BillingProcessStatus = 'idle';

  batchId: string | null = null;
  uploadTime: string | null = null;

  progress = 0;

  processMessage =
    'Waiting for the billing input file.';

  errorMessage = '';
  backendErrorMessage = '';

  totalRecords = 0;
  validRecords = 0;
  rejectedRecords = 0;
  warningRecords = 0;
  taxInvoiceCount = 0;

  billingFileAvailable = false;
  billingFileName: string | null = null;

  rejectionFileAvailable = false;
  rejectionFileName: string | null = null;

  summaryFileAvailable = false;
  summaryFileName: string | null = null;

  taxInvoiceFileAvailable = false;
  taxInvoiceFileName: string | null = null;

  processLogs: BillingProcessLog[] = [];

  private pollingSubscription:
    Subscription | null = null;

  private readonly destroy$ =
    new Subject<void>();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.loadUserFromLocalStorage();

    this.username =
      this.authService.getUsername();
  }

  ngOnDestroy(): void {
    this.stopPolling();

    this.destroy$.next();
    this.destroy$.complete();
  }

  get statusDisplayName(): string {
    const statusNames:
      Record<BillingProcessStatus, string> = {
        idle: 'Not Started',
        uploading: 'Uploading',
        uploaded: 'Uploaded',
        validating: 'Validating',
        billing: 'Generating Billing',
        tax_invoice: 'Generating Tax Invoice',
        completed: 'Completed',
        failed: 'Failed'
      };

    return statusNames[this.processStatus];
  }

  get statusClass(): string {
    return `status-${this.processStatus}`;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isProcessing) {
      this.isDragging = true;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging = false;

    if (this.isProcessing) {
      return;
    }

    const file =
      event.dataTransfer?.files?.[0];

    if (file) {
      this.validateAndSetFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input =
      event.target as HTMLInputElement;

    const file =
      input.files?.[0];

    if (file) {
      this.validateAndSetFile(file);
    }
  }

  removeFile(
    input: HTMLInputElement
  ): void {
    if (this.isProcessing) {
      return;
    }

    this.selectedFile = null;
    this.errorMessage = '';

    input.value = '';
  }

  onProductSelectionChange(
    product: 'GTL' | 'GHS' | 'GOP'
  ): void {
    if (product === 'GTL' && !this.processGTL) {
      this.billNoGTL = '';
    }

    if (product === 'GHS' && !this.processGHS) {
      this.billNoGHS = '';
    }

    if (product === 'GOP' && !this.processGOP) {
      this.billNoGOP = '';
    }

    this.errorMessage = '';
  }

  private validateBillingParameters(): boolean {
    this.errorMessage = '';

    this.policyNo = this.policyNo.trim();
    this.billNoGTL = this.billNoGTL.trim();
    this.billNoGHS = this.billNoGHS.trim();
    this.billNoGOP = this.billNoGOP.trim();

    if (!this.policyNo) {
      this.errorMessage =
        'Please enter the base policy number.';
      return false;
    }

    if (
      !this.processGTL &&
      !this.processGHS &&
      !this.processGOP
    ) {
      this.errorMessage =
        'Please select at least one product: GTL, GHS or GOP.';
      return false;
    }

    if (this.processGTL && !this.billNoGTL) {
      this.errorMessage =
        'Please enter the GTL bill number.';
      return false;
    }

    if (this.processGHS && !this.billNoGHS) {
      this.errorMessage =
        'Please enter the GHS bill number.';
      return false;
    }

    if (this.processGOP && !this.billNoGOP) {
      this.errorMessage =
        'Please enter the GOP bill number.';
      return false;
    }

    return true;
  }

  startBillingProcess(): void {
    if (!this.selectedFile) {
      this.errorMessage =
        'Please select the Group Billing input file.';
      return;
    }

    if (!this.validateBillingParameters()) {
      return;
    }

    this.stopPolling();

    this.resetOutputInformation();

    this.errorMessage = '';
    this.backendErrorMessage = '';

    this.processStarted = true;
    this.isProcessing = true;

    this.processStatus = 'uploading';
    this.progress = 10;

    this.processMessage =
      'Uploading the Group Billing input file...';

    this.addProcessLog(
      'Uploading billing input file.'
    );

    const formData = new FormData();

    /*
     * The backend multer field name should also be billingFile.
     */
    formData.append(
      'billingFile',
      this.selectedFile
    );

    formData.append(
      'uploadedBy',
      this.username ?? 'Unknown User'
    );

    formData.append(
      'policyNo',
      this.policyNo
    );

    formData.append(
      'policyTypeGTL',
      this.processGTL ? 'GTL' : 'N'
    );

    formData.append(
      'billNoGTL',
      this.processGTL ? this.billNoGTL : 'N'
    );

    formData.append(
      'policyTypeGHS',
      this.processGHS ? 'GHS' : 'N'
    );

    formData.append(
      'billNoGHS',
      this.processGHS ? this.billNoGHS : 'N'
    );

    formData.append(
      'policyTypeGOP',
      this.processGOP ? 'GOP' : 'N'
    );

    formData.append(
      'billNoGOP',
      this.processGOP ? this.billNoGOP : 'N'
    );

    this.http
      .post<BillingUploadResponse>(
        `${this.apiBaseUrl}/upload`,
        formData
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          if (!response.success ||
              !response.batchId) {

            this.handleFailure(
              response.message ||
              'The backend did not return a valid batch ID.'
            );

            return;
          }

          this.batchId = response.batchId;

          this.uploadTime =
            new Date().toLocaleString();

          this.processStatus =
            response.status || 'uploaded';

          this.progress = 20;

          this.processMessage =
            response.message ||
            'File uploaded successfully.';

          this.addProcessLog(
            this.processMessage
          );

          this.startPolling();
        },

        error: error => {
          this.handleHttpError(
            error,
            'Unable to upload the billing input file.'
          );
        }
      });
  }

  downloadOutput(
    outputType: BillingOutputType
  ): void {
    if (!this.batchId) {
      this.errorMessage =
        'Billing batch ID is unavailable.';
      return;
    }

    this.isDownloading = true;
    this.errorMessage = '';

    const endpointMap:
      Record<BillingOutputType, string> = {
        billing: 'billing',
        rejection: 'rejection',
        summary: 'summary',
        'tax-invoice': 'tax-invoice',
        all: 'all'
      };

    const endpoint =
      endpointMap[outputType];

    this.http
      .get(
        `${this.apiBaseUrl}/${encodeURIComponent(
          this.batchId
        )}/download/${endpoint}`,
        {
          observe: 'response',
          responseType: 'blob'
        }
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          const fileBlob =
            response.body;

          if (!fileBlob ||
              fileBlob.size === 0) {

            this.isDownloading = false;

            this.errorMessage =
              'The downloaded output file is empty.';

            return;
          }

          const fileName =
            this.extractDownloadFileName(
              response.headers
            ) ||
            this.getDefaultFileName(
              outputType
            );

          this.saveBlob(
            fileBlob,
            fileName
          );

          this.isDownloading = false;
        },

        error: error => {
          this.isDownloading = false;

          this.handleDownloadError(
            error,
            'Unable to download the requested output.'
          );
        }
      });
  }

  resetProcess(): void {
    if (this.isProcessing &&
        this.processStatus !== 'failed') {
      return;
    }

    this.stopPolling();

    this.selectedFile = null;

    this.policyNo = '';

    this.processGTL = false;
    this.processGHS = false;
    this.processGOP = false;

    this.billNoGTL = '';
    this.billNoGHS = '';
    this.billNoGOP = '';

    this.isDragging = false;
    this.isProcessing = false;
    this.isDownloading = false;

    this.processStarted = false;
    this.validationAvailable = false;

    this.processStatus = 'idle';

    this.batchId = null;
    this.uploadTime = null;

    this.progress = 0;

    this.processMessage =
      'Waiting for the billing input file.';

    this.errorMessage = '';
    this.backendErrorMessage = '';

    this.processLogs = [];

    this.resetOutputInformation();
  }

  formatFileSize(
    fileSize: number
  ): string {
    if (fileSize === 0) {
      return '0 Bytes';
    }

    const units = [
      'Bytes',
      'KB',
      'MB',
      'GB'
    ];

    const unitIndex = Math.floor(
      Math.log(fileSize) /
      Math.log(1024)
    );

    const convertedSize =
      fileSize /
      Math.pow(1024, unitIndex);

    return `${convertedSize.toFixed(2)} ${units[unitIndex]}`;
  }

  isStageCompleted(
    stage: BillingProcessStage
  ): boolean {
    const stageOrder:
      BillingProcessStatus[] = [
        'idle',
        'uploading',
        'uploaded',
        'validating',
        'billing',
        'tax_invoice',
        'completed'
      ];

    const currentIndex =
      stageOrder.indexOf(
        this.processStatus
      );

    const stageIndex =
      stageOrder.indexOf(stage);

    return currentIndex >= stageIndex;
  }

  getStageClass(
    stage: BillingProcessStage
  ): string {
    if (this.processStatus === 'failed') {
      return 'stage-failed';
    }

    if (this.processStatus === stage) {
      return 'stage-active';
    }

    if (this.isStageCompleted(stage)) {
      return 'stage-completed';
    }

    return 'stage-pending';
  }

  private validateAndSetFile(
    file: File
  ): void {
    this.errorMessage = '';

    const allowedExtensions = [
      '.xlsx',
      '.xls',
      '.csv'
    ];

    const fileName =
      file.name.toLowerCase();

    const validExtension =
      allowedExtensions.some(
        extension =>
          fileName.endsWith(extension)
      );

    if (!validExtension) {
      this.selectedFile = null;

      this.errorMessage =
        'Invalid file type. Upload an XLSX, XLS or CSV file.';

      return;
    }

    if (file.size === 0) {
      this.selectedFile = null;

      this.errorMessage =
        'The selected file is empty.';

      return;
    }

    const maximumFileSize =
      this.maxFileSizeMb *
      1024 *
      1024;

    if (file.size > maximumFileSize) {
      this.selectedFile = null;

      this.errorMessage =
        `The selected file exceeds the ${this.maxFileSizeMb} MB limit.`;

      return;
    }

    this.selectedFile = file;

    this.addProcessLog(
      `Selected file: ${file.name}`
    );
  }

  private startPolling(): void {
    if (!this.batchId) {
      return;
    }

    this.stopPolling();

    /*
     * The first status request is made immediately.
     * Subsequent requests are made every two seconds.
     */
    this.requestLatestStatus();

    this.pollingSubscription =
      interval(2000)
        .pipe(
          switchMap(() =>
            this.http.get<BillingStatusResponse>(
              `${this.apiBaseUrl}/${encodeURIComponent(
                this.batchId!
              )}/status`
            )
          ),
          takeUntil(this.destroy$)
        )
        .subscribe({
          next: response => {
            this.updateFromStatusResponse(
              response
            );
          },

          error: error => {
            this.handleHttpError(
              error,
              'Unable to retrieve the Group Billing status.'
            );
          }
        });
  }

  private requestLatestStatus(): void {
    if (!this.batchId) {
      return;
    }

    this.http
      .get<BillingStatusResponse>(
        `${this.apiBaseUrl}/${encodeURIComponent(
          this.batchId
        )}/status`
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: response => {
          this.updateFromStatusResponse(
            response
          );
        },

        error: error => {
          this.handleHttpError(
            error,
            'Unable to retrieve the initial billing status.'
          );
        }
      });
  }

  private updateFromStatusResponse(
    response: BillingStatusResponse
  ): void {
    if (!response.success) {
      this.handleFailure(
        response.errorMessage ||
        response.message ||
        'The billing process reported an error.'
      );

      return;
    }

    const previousStatus =
      this.processStatus;

    this.processStatus =
      response.status;

    this.progress =
      response.progress ??
      this.defaultProgressForStatus(
        response.status
      );

    this.processMessage =
      response.message ||
      this.defaultMessageForStatus(
        response.status
      );

    this.totalRecords =
      response.totalRecords ??
      this.totalRecords;

    this.validRecords =
      response.validRecords ??
      this.validRecords;

    this.rejectedRecords =
      response.rejectedRecords ??
      this.rejectedRecords;

    this.warningRecords =
      response.warningRecords ??
      this.warningRecords;

    this.taxInvoiceCount =
      response.taxInvoiceCount ??
      this.taxInvoiceCount;

    this.billingFileAvailable =
      response.billingFileAvailable ??
      this.billingFileAvailable;

    this.billingFileName =
      response.billingFileName ??
      this.billingFileName;

    this.rejectionFileAvailable =
      response.rejectionFileAvailable ??
      this.rejectionFileAvailable;

    this.rejectionFileName =
      response.rejectionFileName ??
      this.rejectionFileName;

    this.summaryFileAvailable =
      response.summaryFileAvailable ??
      this.summaryFileAvailable;

    this.summaryFileName =
      response.summaryFileName ??
      this.summaryFileName;

    this.taxInvoiceFileAvailable =
      response.taxInvoiceFileAvailable ??
      this.taxInvoiceFileAvailable;

    this.taxInvoiceFileName =
      response.taxInvoiceFileName ??
      this.taxInvoiceFileName;

    if (response.logs?.length) {
      this.processLogs =
        response.logs.slice(-20);
    }

    if (
      previousStatus !==
      response.status
    ) {
      this.addProcessLog(
        this.processMessage
      );
    }

    if (
      response.status === 'billing' ||
      response.status === 'tax_invoice' ||
      response.status === 'completed'
    ) {
      this.validationAvailable = true;
    }

    if (response.status === 'completed') {
      this.progress = 100;
      this.isProcessing = false;
      this.validationAvailable = true;

      this.stopPolling();

      this.addProcessLog(
        'Group Billing and Tax Invoice generation completed.'
      );
    }

    if (response.status === 'failed') {
      this.handleFailure(
        response.errorMessage ||
        response.message ||
        'Billing processing failed.'
      );
    }
  }

  private stopPolling(): void {
    this.pollingSubscription
      ?.unsubscribe();

    this.pollingSubscription = null;
  }

  private resetOutputInformation(): void {
    this.totalRecords = 0;
    this.validRecords = 0;
    this.rejectedRecords = 0;
    this.warningRecords = 0;
    this.taxInvoiceCount = 0;

    this.billingFileAvailable = false;
    this.billingFileName = null;

    this.rejectionFileAvailable = false;
    this.rejectionFileName = null;

    this.summaryFileAvailable = false;
    this.summaryFileName = null;

    this.taxInvoiceFileAvailable = false;
    this.taxInvoiceFileName = null;
  }

  private defaultProgressForStatus(
    status: BillingProcessStatus
  ): number {
    const progressMap:
      Record<BillingProcessStatus, number> = {
        idle: 0,
        uploading: 10,
        uploaded: 20,
        validating: 40,
        billing: 65,
        tax_invoice: 85,
        completed: 100,
        failed: this.progress
      };

    return progressMap[status];
  }

  private defaultMessageForStatus(
    status: BillingProcessStatus
  ): string {
    const messageMap:
      Record<BillingProcessStatus, string> = {
        idle:
          'Waiting for billing input.',

        uploading:
          'Uploading billing input file.',

        uploaded:
          'Billing input uploaded successfully.',

        validating:
          'Billing.py is validating the input records.',

        billing:
          'Billing.py is generating the billing output.',

        tax_invoice:
          'Gen_tax_invoice.py is generating tax invoices.',

        completed:
          'Billing and tax invoice generation completed.',

        failed:
          'Group Billing processing failed.'
      };

    return messageMap[status];
  }

  private handleFailure(
    message: string
  ): void {
    this.stopPolling();

    this.processStatus = 'failed';
    this.isProcessing = false;

    this.backendErrorMessage =
      message;

    this.processMessage =
      message;

    this.addProcessLog(
      `Failed: ${message}`
    );
  }

  private handleHttpError(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): void {
    console.error(
      'Group Billing API error:',
      error
    );

    const backendMessage =
      this.extractBackendError(error);

    this.handleFailure(
      backendMessage ||
      fallbackMessage
    );
  }

  private handleDownloadError(
    error: HttpErrorResponse,
    fallbackMessage: string
  ): void {
    console.error(
      'Group Billing download error:',
      error
    );

    this.errorMessage =
      this.extractBackendError(error) ||
      fallbackMessage;
  }

  private extractBackendError(
    error: HttpErrorResponse
  ): string | null {
    if (
      error.error &&
      typeof error.error === 'object'
    ) {
      return (
        error.error.message ||
        error.error.detail ||
        error.error.error ||
        null
      );
    }

    return null;
  }

  private extractDownloadFileName(
    headers: HttpHeaders
  ): string | null {
    const contentDisposition =
      headers.get(
        'content-disposition'
      );

    if (!contentDisposition) {
      return null;
    }

    const utf8Match =
      contentDisposition.match(
        /filename\*=UTF-8''([^;]+)/
      );

    if (utf8Match?.[1]) {
      return decodeURIComponent(
        utf8Match[1]
      );
    }

    const normalMatch =
      contentDisposition.match(
        /filename="?([^";]+)"?/
      );

    return normalMatch?.[1] ?? null;
  }

  private getDefaultFileName(
    outputType: BillingOutputType
  ): string {
    const id =
      this.batchId ||
      new Date().getTime();

    const fileNames:
      Record<BillingOutputType, string> = {
        billing:
          `Group_Billing_${id}.xlsx`,

        rejection:
          `Group_Billing_Rejections_${id}.xlsx`,

        summary:
          `Group_Billing_Summary_${id}.xlsx`,

        'tax-invoice':
          `Tax_Invoices_${id}.zip`,

        all:
          `Group_Billing_Output_${id}.zip`
      };

    return fileNames[outputType];
  }

  private saveBlob(
    blob: Blob,
    fileName: string
  ): void {
    const objectUrl =
      window.URL.createObjectURL(
        blob
      );

    const link =
      document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(
      objectUrl
    );
  }

  private addProcessLog(
    message: string
  ): void {
    const duplicate =
      this.processLogs[
        this.processLogs.length - 1
      ]?.message === message;

    if (duplicate) {
      return;
    }

    this.processLogs.push({
      time:
        new Date().toLocaleTimeString(),

      message
    });

    this.processLogs =
      this.processLogs.slice(-20);
  }
}
