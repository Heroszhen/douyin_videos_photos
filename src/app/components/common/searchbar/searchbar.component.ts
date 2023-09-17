import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IData } from 'src/app/interfaces/IData';
import { StoreService } from 'src/app/services/store.service';
import { wait, readFile } from 'src/app/utils/util';
import { createWorker } from 'tesseract.js';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss']
})
export class SearchbarComponent implements OnInit, OnDestroy {
  keywords:string = "";
  @Output() toSendKeywords = new EventEmitter<IData>();
  @Input() propositions:Array<string> = [];
  elmindex:number = -1;
  pageItem:number = 1;
  action:number = -1;
  section:number|null =null;
  photo_video_action:number|null = null;
  photo_video_url:string = "";
  @ViewChild('video') video: ElementRef<HTMLVideoElement> = null!;
  @ViewChild('canvas') canvas: ElementRef<HTMLCanvasElement> = null!;
  constructor(private storeService:StoreService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.turnOffCamera();
  }

  closeSearchSection(): void{
    this.storeService.toSearch$.next([false]);
  }

  avoidUp(e:Event): void|boolean{
    e.stopPropagation();
    if((e as KeyboardEvent).keyCode === 38){
      //e.returnValue=false;

      return false;
    }
  }

  //action 1:search elment keywords 2:get by keywords, 3:get  by proposition
  sendKeywords(e:Event|null, action:number = 1, keywords:string|null = null): void{
    if (e !== null) {
      let keyCode:number = (e as KeyboardEvent).keyCode;
      if ([13, 38, 40].includes(keyCode)){
        e.stopPropagation();
        this.changeElmindex(keyCode);
  
        return;
      }
    }

    this.toSendKeywords.emit({status:1, data:{action:action, keywords: keywords === null ? this.keywords : keywords}});
    this.elmindex = -1;
    this.pageItem = 1;
    this.propositions = [];
  }

  changeElmindex(keyCode:number): void{
    //38 up,40 down, 13 entrée
    if (this.propositions.length > 0) {
      if (keyCode === 13){
        if (this.elmindex === -1)this.sendKeywords(null, 2);
        else this.sendKeywords(null, 3, this.propositions[this.elmindex]);
      } else {
        if (this.elmindex === -1)this.elmindex = 0;
        else if (keyCode === 38) {
          if (this.elmindex <= 1)this.elmindex = 0;
          else this.elmindex--;
        } else if (keyCode === 40) {
          if (this.elmindex >= this.propositions.length - 2)this.elmindex = this.propositions.length - 1;
          else this.elmindex++;
        }
      }
    } else {
      this.sendKeywords(null, 2);
    }
  }

  async switchSection(s:number|null) : Promise<void> {
    this.turnOffCamera();
    this.resetPhoto_video();
    this.section = s;
  }

  
  async handleInputFile(e:Event): Promise<void> {
    let files:FileList | null = (e.target as HTMLInputElement).files;
    if (files === null)return;

    let file:File|null = files.item(0);
    if (file === null)return;

    if (file.type.includes("image")) {
      this.photo_video_url = (await readFile(file)).target.result;
      this.doOCR(file);
    }
  }

  async openCamera(): Promise<void>{
    this.photo_video_action = 2;
    this.photo_video_url = "";
    await wait(0.1);

    navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    .then((stream) => {
      if (this.video !== undefined) {
        this.video.nativeElement.srcObject = stream;
        this.video.nativeElement.play();
      } 
    })
    .catch((err) => {
      console.error(err);
    });
  }

  turnOffCamera(): void {
    const mediaStream = <MediaStream>this.video?.nativeElement.srcObject;
    if (mediaStream !== undefined && mediaStream !== null) {
      // Through the MediaStream, you can get the MediaStreamTracks with getTracks():
      const tracks = mediaStream.getTracks();
      // Tracks are returned as an array, so if you know you only have one, you can stop it with: 
      tracks[0].stop();
      // Or stop all like so:
      tracks.forEach(track => track.stop());
    }
    this.video = null!;
  }

  resetPhoto_video():void{
    this.photo_video_action = null;
    this.photo_video_url = "";
    this.canvas?.nativeElement.getContext('2d')?.clearRect(0, 0, this.canvas.nativeElement.width,this.canvas.nativeElement.height);
  }

  takePhoto() {
    let canvas:HTMLCanvasElement = this.canvas.nativeElement;
    canvas.setAttribute("width", this.video.nativeElement.videoWidth.toString());
    canvas.setAttribute("height", this.video.nativeElement.videoHeight.toString());
    const context:CanvasRenderingContext2D|null = canvas.getContext("2d");
    if (context === null)return;
    context.drawImage(this.video.nativeElement, 0, 0, this.video.nativeElement.videoWidth, this.video.nativeElement.videoHeight);
    const data:string = canvas.toDataURL("image/png");
    this.doOCR(data);
  }

  async doOCR(file: File | string): Promise<void> {
    this.storeService.loading$.next([true, '']);
    let worker = await createWorker();
    await worker.loadLanguage('eng+fra+chi_sim');
    await worker.initialize('eng+fra+chi_sim');
    const { data: { text } } = await worker.recognize(file);
    await worker.terminate();

    this.storeService.loading$.next([false, '']);
    
    this.switchSection(null);
    this.keywords = text.trim();
    
    // let result:string|null = window.prompt(`Souhaites-tu faire une recherche par ${text}?`);
    // if (result !== null) {
    //   this.switchSection(null);
    //   this.keywords = text;console.log(this.keywords)
    // }
  }
}
