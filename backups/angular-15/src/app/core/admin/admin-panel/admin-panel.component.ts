import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Validators, Editor, Toolbar,toHTML } from 'ngx-editor';
import { BlogService } from 'src/app/services/blog.service';
import { FirestoreService } from 'src/app/services/firebase.service';
import { Ng2ImgMaxService } from 'ng2-img-max';
import { fromEvent, map, Observable, switchMap } from 'rxjs';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})


 export class AdminPanelComponent  implements OnInit{

  public mostrar = false;
  public post: any = {
    title: '',
    content: '',
    image: '',
    date: '',
    shortDescription: '',
    comments: 0,
    likes: 0,
    views: 0,
    tags: 'Seleccione una o varias etiquetas',
    author: 'Manuel Gonzalez',
    keywords: [],
    keyword: '',
  }
  public editordoc =  {
    type: "doc",
    content: []
  } 
  public keywords = [];
  public editor: Editor;
  public toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  bloglist: any[];
  editar: boolean;
  mostrar_empresas: boolean = false;
  public busqueda:any = {
    negocio: '',
    lugar: '',
  }
  public form: FormGroup;


  constructor(
    private blogService: BlogService,
    private firebase: FirestoreService,
    private ng2ImgMax: Ng2ImgMaxService
  ) { 
      this.editar = false;
     
  }

 

    public ngOnInit(): void {

      this.form = new FormGroup({
        editorContent: new FormControl(
          { value: this.editordoc, disabled: false },
          Validators.required()
        ),
      });
    
    this.editor = new Editor()

      this.blogService.getAllBlogs().subscribe((blogs) => {
        this.bloglist = blogs.docs.map((blog) => {
          return {
            id: blog.id,
            ...blog.data()
          }
        })
        console.log(this.bloglist);
  
      })
      
  
    }
    public setCat(category: string){
      this.post.tags = category;
    }

    public borrarPost(post: any){
      console.log(post);
      
      this.blogService.deleteBlog(post)
      this.blogService.getAllBlogs().subscribe((blogs) => {
        this.bloglist = blogs.docs.map((blog) => {
          return {
            id: blog.id,
            ...blog.data()
          }
        })
        console.log(this.bloglist);
  
      })
    }

    public createPost(){

      console.log(this.editar,'editar');
      
      this.post.date = new Date().toLocaleDateString();
      console.log(this.form.value.editorContent);
      if(!this.editar && this.form.value.editorContent === undefined){
        console.log(this.post.content);
        
        this.post.content =  toHTML(this.post.content);
      }
      if(this.post.image !== '' && !this.editar){
        const reader = new FileReader();
        reader.readAsDataURL(this.post.image);
        reader.onload = () => {
        this.post.image = reader.result;
      }}
      if(this.editar){
        this.blogService.updateBlog(this.post);
        this.editar = false;
      }else{  

      this.blogService.uploadBlog(this.post);
      }
    }

    public showForm(){
      console.log(this.form.value);
    }

    public uploadFile(event){
      
     this.resizeImage(event.target.files[0])
    
    }

    public editarPost(post: any){
      console.log("el post a editar",post);
      this.blogService.setBlog(post);
      this.editar = true;
      this.mostrar = !this.mostrar;
      this.post = post;
      this.form.value.editorContent = post.content;
      this.form.setValue({
        editorContent: post.content
      })
    }

    public crearPost(){
      this.mostrar = !this.mostrar;
      this.form.setValue({
        editorContent: this.editordoc
      })
      this.post = {
        title: '',
        content: '',
        image: '',
        date: '',
        shortDescription: '',
        comments: 0,
        likes: 0,
        views: 0,
        tags: 'Seleccione una o varias etiquetas',
        keywords: [],
      }

    }

    public addKeyword(){
      this.post.keywords.push(this.post.keyword);
      console.log(this.post.keywords);
    }
    public mostarEmpresas(){
      this.mostrar = false
      this.mostrar_empresas = true;
      return this.mostrar_empresas;
    }


    public async rasterearEmpresas2(){

      let url = `https://www.google.com/maps/search/${this.busqueda.negocio}/@42.2417643,-8.7464538,13z`;
      console.log(url);
      console.log("entrando a rastreo");
      
      //TODO llamar a la funcion de firebase
      await this.firebase.callFunction(url, 'companyScraper')

        
    }

    public async rasterearEmpresas(){
      let query = `${this.busqueda.negocio},${this.busqueda.lugar}`;
      await this.firebase.callFunction(query, 'companyScraper2')
   }
  
///funcion para reducir tamaño de imagen manteniendo la calidad lo maximo posible, tamñaño maximo 200kb

resizeImage(file: File): void {
  // Establecer el tamaño máximo de la imagen en píxeles
  const MAX_SIZE = 1200;

  // Establecer el tamaño máximo del archivo en KB
  const MAX_FILE_SIZE = 300;

  // Crear una instancia de Ng2ImgMaxService

  // Comprimir la imagen a un tamaño máximo de 300 KB
  this.ng2ImgMax.compressImage(file, MAX_FILE_SIZE).pipe(
    switchMap(result => {
      // Obtener la imagen comprimida
      console.log('Compressed image size is now ' + result.size / 1024 + ' kB');
      console.log("result", result);
     

      // Crear una instancia de Image para obtener el tamaño original
      const img = new Image();
      img.src = URL.createObjectURL(result);

      return fromEvent(img, 'load').pipe(
        map(() => {
          // Obtener las dimensiones originales de la imagen
          const originalWidth = img.width;
          const originalHeight = img.height;

          // Establecer el tamaño máximo de la imagen en función del lado largo
          let maxWidth, maxHeight;
          if (originalWidth > originalHeight) {
            maxWidth = MAX_SIZE;
            maxHeight = MAX_SIZE * (originalHeight / originalWidth);
          } else {
            maxHeight = MAX_SIZE;
            maxWidth = MAX_SIZE * (originalWidth / originalHeight);
          }

          // Crear un canvas para redimensionar la imagen
          const canvas = document.createElement('canvas');
          canvas.width = maxWidth;
          canvas.height = maxHeight;

          // Redimensionar la imagen en el canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

          // Convertir la imagen a formato WebP
          return canvas.toBlob(blob => {
            const title = this.post.title.replace(/[^a-zA-Z0-9- ]/g, "").replace(/á/gi, "a").replace(/é/gi, "e").replace(/í/gi, "i").replace(/ó/gi, "o").replace(/ú/gi, "u");
            const newFile = new File([blob], `${title}.webp`, { type: 'image/webp' });

            // Asignar el archivo a this.post.image
            this.post.image = newFile;
          }, 'image/webp', 0.9);
        })
      );
    })
  ).subscribe({
    next: () => console.log('Imagen comprimida y convertida a webp'),
    error: (error) => console.error('Error al comprimir y convertir la imagen:', error),
    complete: () => console.log('Proceso de compresión y conversión de la imagen completo')
  });
}



  }


