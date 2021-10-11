import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Campaign, Campus, Criteria, University } from './campaign.model';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  baseURL: string = environment.apiUrl + '/api/v1.0/campaigns';
  uniURL: string = environment.apiUrl + '/api/v1.0/universities';

  constructor(private httpClient: HttpClient) { }

  getCampaigns(): Observable<Campaign[]> {
    return this.httpClient.get<Campaign[]>(`${this.baseURL}`);
  }

  getCriterions(id:string) {
    return this.httpClient.post<Criteria[]>(`${this.baseURL}`,id);
  }

  insertCampaign(campaign: Campaign) {
    return this.httpClient.post<Campaign>(`${this.baseURL}`, campaign);
  }

  deleteCampaign(campaign: Campaign) {
    return this.httpClient.delete<boolean>(`${this.baseURL}/${campaign.id}`);
  }

  updateCampaign(campaign: Campaign) {
    return this.httpClient.put<Campaign>(`${this.baseURL}`, campaign);
  }

  getUni(): Observable<University[]> {
    return this.httpClient.get<University[]>(`${this.uniURL}`);
  }

}
