import { Injectable } from '@angular/core';
import { Region, SmallCountry } from '../interfaces/country.interface';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { HttpClient } from '@angular/common/http';
import { combineLatest, count, map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {
  private baseUrl: string = 'https://restcountries.com/v3.1';

  private _regions: Region[] = [
    Region.Africa,
    Region.Americas,
    Region.Asia,
    Region.Europe,
    Region.Oceania,
  ];

  constructor(private http: HttpClient) {}

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url: string = `${this.baseUrl}/region/${region}?fields=cca3,name,borders`;

    return this.http.get<SmallCountry[]>(url);
  }

  getCountryByAlphaCode(alphaCode: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${alphaCode}?fields=cca3,name,borders`;
    return this.http.get<SmallCountry>(url).pipe(
      map((country) => ({
        name: country.name,
        cca3: country.cca3,
        borders: country.borders ?? [],
      }))
    );
  }

  getCountryBordersByCode(borders: string[]): Observable<SmallCountry[]> {
    if (!borders) return of([]);

    const contriesRequest: Observable<SmallCountry>[] = [];

    borders.forEach((borderCode) => {
      const request = this.getCountryByAlphaCode(borderCode);
      contriesRequest.push(request);
    });

    return combineLatest(contriesRequest);
  }
}
