import { Component, OnInit, Input } from '@angular/core';
import { log } from 'console';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit { 

  @Input() blogData: Array<{
    image: string;
    title: string;
    like: string;
    message: string;
    name: string;
    date: string;
  }>;

  constructor() { }

  ngOnInit(): void {}


}
