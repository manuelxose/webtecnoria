import { Component } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { BlogI } from 'src/app/models/blog';
import { BlogService } from 'src/app/services/blog.service';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.css']
})
export class BlogDetailComponent {
     // Set Topbar Option
     Menuoption = 'center';
     Settingicon = true
     alt:string;
     /**
      * Nav Light Class Add
      */
     blog: BlogI = {
        id: '',
        title: '',
        description: '',
        image: '',
        date: '',
        shortDescription: '',
        comments: 0,
        likes: 0,
        views: 0,
        tags: '',
        author: '',
        content: [],
        faqs: [],
        keywords: [],
        
      };

      headers: any;
      html: any;

  constructor(
    private svcBlog: BlogService,
    private meta: Meta,
  ) { 

    this.meta.addTags([
      { name: 'description', content: this.blog.shortDescription },
      { name: 'keywords', content:this.blog.keywords.join(',') },
    ]);
  }

  ngOnInit(): void {

    const parser = new DOMParser();
    this.blog =  this.svcBlog.getBlog();
    this.alt = this.blog.title.replace(/\s/g, '-');
    
    this.html = parser.parseFromString(this.blog.content, 'text/html');
    this.headers = this.html.querySelectorAll('h1, h2');
    
    this.headers.forEach((header, index) => {
      header.setAttribute('id', 'header-' + (index + 1));
      header.setAttribute('class', 'header');
      header.setAttribute('style', 'font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em;');
    });

  
  }

  ngAfterViewInit() {

    const contenido = document.getElementById("blog-content");
    const titulos = contenido.querySelectorAll("h1, h2");
    //selecionar los span dentro de h1 y h2
    const spanh3 = contenido.querySelectorAll("h1>strong>span>span,h2>strong>span>span")
    spanh3.forEach((span) => {
      span.setAttribute("class", "title text-dark title-dark  h3");
      span.setAttribute("style", "font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em!important;");
    })
    const p = contenido.querySelectorAll("p")
    p.forEach((p) => {
      p.setAttribute("class","text-muted")
      p.setAttribute("style","font-size: 1.25rem; font-weight: 400; line-height: 1.5; margin-bottom: 1.66666666em;")
    })

    const spanh4 = contenido.querySelectorAll("h3>strong>span>span").forEach((span) =>{
      span.setAttribute("class","title text-dark title-dark h5")
      span.setAttribute("style","font-size: 1.25rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.666666em;")
    })

    var ol = contenido.querySelectorAll("ol").forEach((ol) =>{
      ol.setAttribute("class","title text-dark title-dark h5")
      ol.setAttribute("style","font-size: 1.25rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.666666em;")
    })

    var li = contenido.querySelectorAll("ol>li>p>span>span").forEach((li) =>{
      li.setAttribute("class","title text-dark title-dark mb-0 h5")
      li.setAttribute("style","font-size: 1.25rem; font-weight: 500; line-height: 1.5; margin-bottom: 1.66666666em;")
    })



    titulos.forEach((titulo, index) => {
      titulo.setAttribute("id", `header-${index + 1}`);
      titulo.setAttribute("class", "header");
      titulo.setAttribute("style", "font-size: 2.2rem; font-weight: 500; line-height: 1.2; margin-bottom: 1.66666em;");
    });

  }



}
