import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.css']
})
export class LocationsComponent {
  
  ciudades:Array<any> = []
  filename:string="";

  constructor(
    
    private http: HttpClient,
    private router:Router
  

    ) {}

  ngOnInit(): void {
    this.http.get<any>('../../../assets/json/seo_spain.json').subscribe(data => {
      this.ciudades = Object.keys(data).map(key => ({type: key.replace(/\s+/g, "-"), value: data[key], name: key}));
      console.log(this.ciudades)
    });
    
  }

  navigateTo(url: string): void {
    this.router.navigateByUrl(url);
  }

}