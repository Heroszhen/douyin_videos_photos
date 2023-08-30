import { Component, Input, OnInit } from '@angular/core';
import { IVideoPlayerParams, videoType } from 'src/app/interfaces/ivideoPlayerParams';

@Component({
  selector: 'app-videoplayer',
  templateUrl: './videoplayer.component.html',
  styleUrls: ['./videoplayer.component.scss']
})
export class VideoplayerComponent implements OnInit {
  @Input() params:IVideoPlayerParams = null!;
  videoType = videoType;
  constructor() { }

  ngOnInit(): void {
  }

}
