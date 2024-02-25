import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { ApiService } from 'src/app/services/api.service';

interface IQueryParams {
  token:string
}

@Component({
  selector: 'app-tailwindcss',
  templateUrl: './tailwindcss.component.html',
  styleUrls: ['./tailwindcss.component.scss']
})
export class TailwindcssComponent implements OnInit {
  token:string = "";
  constructor(
    private activedroute: ActivatedRoute, 
    private apiService: ApiService
  ) { 
    this.activedroute.queryParams.subscribe((params:any) => {
      if (params["token"] !== undefined) {
        this.token = params["token"];
        localStorage.setItem('token', this.token);
        this.apiService.checkToken(this.token);
      }
    });

    // this.activedroute.params.subscribe((params)=>{
    //   if (params["token"] !== undefined) {
    //     this.token = params["token"];
    //     this.apiService.checkToken(this.token);
    //   }
    // });
  }

  ngOnInit(): void {
    this.makeParticles();
  }

  makeParticles() {
    //https://www.bilibili.com/video/BV1eR4y1k7wv/
    const canvas = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx = canvas?.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 200;

    const particleNum = 100;
    const lineDistance = 120;
    const colorRGB = '254, 250, 224';
    let particles = new Array<Particle>;
    let interactionParticle = null;
    
    class Particle {
      x:number;
      y:number;
      velocityX:number; 
      velocityY:number; 
      size:number;  
      color:string;
      constructor(
        x:number,
        y:number,
        velocityX:number, 
        velocityY:number, 
        size:number,  
        color:string) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx?.beginPath();
        ctx?.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        if(ctx !== null)ctx.fillStyle = this.color;
      }

      update() {
        if (this.x < 0 || this.x > canvas.width) {
          this.velocityX *= -1;
        }
        if(this.y < 0 || this.y > canvas.height) {
          this.velocityY *= -1;
        }
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.draw();
      }
    }

    function getRandomArbitrary(min:number, max:number):number {
      return Math.random() * (max - min) + min;
    }

    function createParticles() {
      for (let i = 0; i < particleNum; i++) {
        let size = getRandomArbitrary(1, 3);
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        let velocityX = getRandomArbitrary(-2, 2);
        let velocityY = getRandomArbitrary(-2, 2);
        let color = `rgba(${colorRGB}, ${1 - size / 3})`;
        particles.push(new Particle(x, y, velocityX, velocityY, size, color));
      }
    }

    function connect() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = 0; j < particles.length; j++) {
          let p1 = particles[i];
          let p2 = particles[j];
          let distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
          if (distance < lineDistance) {
            if(ctx !== null)ctx.strokeStyle = `rgba(${colorRGB}, ${1 - distance / lineDistance})`;
            ctx?.beginPath();
            ctx?.moveTo(p1.x, p1.y);
            ctx?.lineTo(p2.x, p2.y);
            ctx?.stroke();
          }
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      for(let i = 0; i < particles.length; i++) {
        particles[i].update();
      }
      connect();
    }

    createParticles();
    animate();
  } 
}
