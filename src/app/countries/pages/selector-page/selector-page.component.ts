import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Region, SmallCountry } from '../../interfaces/country.interface';
import { CountriesService } from '../../services/countries.service';
import { Observable, filter, map, of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
})
export class SelectorPageComponent implements OnInit {
  public myForm: FormGroup = this.fb.group({
    region: ['', Validators.required],
    country: ['', Validators.required],
    border: ['', Validators.required],
  });

  public countriesByRegion: SmallCountry[] = [];
  public countriesByAlphaCode: SmallCountry[] = [];
  public bordersCountries: SmallCountry[] = [];

  constructor(
    private fb: FormBuilder,
    private countriesService: CountriesService
  ) {}

  ngOnInit(): void {
    this.onRegionChange();
    this.onCountryChange();
  }

  get regions(): Region[] {
    return this.countriesService.regions;
  }

  onRegionChange(): void {
    this.myForm.controls['region'].valueChanges
      .pipe(
        switchMap((region) =>
          this.countriesService.getCountriesByRegion(region)
        ),
        tap(() => this.myForm.controls['country'].setValue('')),
        map((countries) => {
          return countries.sort((a, b) => {
            return a.name.common > b.name.common ? 1 : -1;
          });
        })
      )
      .subscribe((countries) => (this.countriesByRegion = countries));
  }

  onCountryChange(): void {
    this.myForm.controls['country'].valueChanges
      .pipe(
        tap(() => this.myForm.controls['border'].setValue('')),
        filter((value) => value.length > 0),
        switchMap((alphaCode) => {
          return this.countriesService.getCountryByAlphaCode(alphaCode);
        }),
        switchMap((country) => {
          return this.countriesService.getCountryBordersByCode(country.borders);
        })
      )
      .subscribe(
        (bordersCountries) => (this.bordersCountries = bordersCountries)
      );
  }
}
