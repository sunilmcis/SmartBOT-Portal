@Injectable({ providedIn: 'root' })
export class ResignationService {
  private baseUrl = 'http://localhost:3017/api/resignations';

  constructor(private http: HttpClient) {}

  submit(data: any) {
    return this.http.post(`${this.baseUrl}`, data);
  }

  getMy(empId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/employee/${empId}`);
  }

  getManagerPending(managerId: number) {
    return this.http.get<any[]>(`${this.baseUrl}/manager/${managerId}/pending`);
  }

  managerDecision(id: number, body: any) {
    return this.http.put(`${this.baseUrl}/${id}/manager`, body);
  }

  getHrPending() {
    return this.http.get<any[]>(`${this.baseUrl}/hr/pending`);
  }

  hrDecision(id: number, body: any) {
    return this.http.put(`${this.baseUrl}/${id}/hr`, body);
  }
}
