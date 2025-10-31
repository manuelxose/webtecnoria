import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BlogI } from '../models/blog';
import { FirestoreService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  public blog:BlogI = {
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

  }

  constructor( 
    private svcFire:FirestoreService,
    @Inject(PLATFORM_ID) private platformId: Object

    ) {
    
   }

  public getAllBlogs(){
    return this.svcFire.setCollection('blog').getAll();
  }

  public setBlog(blog:BlogI){
    this.blog = blog;
    if (isPlatformBrowser(this.platformId))localStorage.setItem('blog', JSON.stringify(this.blog));
    
  }

  public getBlog(){
    this.blog = JSON.parse(localStorage.getItem('blog') || '{}');
    return this.blog;
  }

  public updateViews(){ 
    this.blog.views += 1;
    this.svcFire.setCollection('blog').updateDoc(this.blog);
  }

  public updateLikes(){
    this.blog.likes += 1;
    this.svcFire.setCollection('blog').updateDoc(this.blog);
  }

  public updateComments(){
    this.blog.comments += 1;
    this.svcFire.setCollection('blog').updateDoc(this.blog);
  }

  public uploadImageBlog(file:File, name:string){
    this.svcFire.uploadImageBlog(file, name);
  }

  public deleteBlog(blog:string){
    this.svcFire.setCollection('blog').deleteDoc(blog);
  }

  public uploadBlog(blog:any){
    this.svcFire.setCollection('blog').uploadImageBlog(blog.image, blog.title).then((url) => {
      blog.image = url;
      console.log(blog, 'blog');
      this.svcFire.setCollection('blog').createDoc(blog).then((res) => {
        console.log("se subio el blog: ",res);
        this.indexBlogPost(blog.title);
      });
    });

  }
  public updateBlog(blog:any){
    //si es blog.image no es un File se asume que es una url
    if(!(blog.image instanceof File)){
      this.svcFire.setCollection('blog').updateDoc(blog);
    }
    else{
      //si se sube una imagen nueva se elimina la anterior
      this.svcFire.deleteImageBlog(this.blog.image);

      this.svcFire.setCollection('blog').uploadImageBlog(blog.image, blog.title).then((url) => {
        blog.image = url;
        this.svcFire.setCollection('blog').updateDoc(blog);
      });
    }
  }

  public async indexBlogPost(url:string):Promise<any>{
    url  = "https://www.tecnoriasl.com/blog/" + url;
    this.svcFire.indexBlogPost(url);
  }


}

