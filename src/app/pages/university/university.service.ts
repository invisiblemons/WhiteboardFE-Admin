import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Campus, Major, University } from './university.model';

@Injectable({
  providedIn: 'root'
})
export class UniversityService {

  baseURL: string = environment.apiUrl + '/api/v1.0/universities';
  campusURL: string = environment.apiUrl + '/api/v1.0/campuses';
  majorURL: string = environment.apiUrl + '/api/v1.0/majors';

  constructor(private httpClient: HttpClient) { }

  getUniversities(): Observable<University[]> {
    return this.httpClient.get<University[]>(`${this.baseURL}`);
  }

  getCampuses(universityId): Observable<Campus[]> {
    return this.httpClient.get<Campus[]>(`${this.campusURL}?universityId=${universityId}`);
  }

  getMajorsOfCampus(campusId): Observable<Major[]> {
    return this.httpClient.get<Major[]>(`${this.majorURL}?campusId=${campusId}`);
  }

  insertUniversity(university: University) {
    return this.httpClient.post<University>(`${this.baseURL}`, university);
  }

  insertCampus(campus: Campus) {
    return this.httpClient.post<Campus>(`${this.campusURL}`, campus);
  }

  insertMajor(major: Major) {
    return this.httpClient.post<Major>(`${this.majorURL}`, major);
  }

  updateUniversity(university: University) {
    return this.httpClient.put<University>(`${this.baseURL}`, university);
  }

  updateCampus(campus: Campus) {
    return this.httpClient.put<University>(`${this.campusURL}`, campus);
  }

  updateMajor(major: Major) {
    return this.httpClient.put<Major>(`${this.majorURL}`, major);
  }

  deleteUniversity(university: University) {
    return this.httpClient.delete<boolean>(`${this.baseURL}/${university.id}`);
  }

  deleteCampus(id: string) {
    return this.httpClient.delete<boolean>(`${this.campusURL}/${id}`);
  }

  searchUniversityWithId(id: string): Observable<University> {
    return this.httpClient.get<University>(`${this.baseURL}/${id}`);
  }

}