import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
    selector: 'story',
    templateUrl: './story.component.html',
    styleUrls: ['./story.component.scss']
  })
  export class StoryComponent  {
    public messages : {texts: string[], category: string}[] = [];
    constructor(@Inject(MAT_DIALOG_DATA) public data: {messages: {texts: string[], category: string}[]}) { this.messages = data.messages}
  }