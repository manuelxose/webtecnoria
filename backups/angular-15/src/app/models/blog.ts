export interface BlogI {

    id?: string;
    title: string;
    description: string;
    image: string;
    images?: string[];
    date: string;
    shortDescription: string;
    comments: number;
    likes: number;
    views: number;
    tags?: string;
    author: string;
    content?: any;
    faqs?: FaqI[];
    keywords?: [];

}

export interface ContentI {
 
    titulo: string;
    descripcion: string;
    imagen?: string;

}

export interface FaqI {

    pregunta: string;
    respuesta: string;

}