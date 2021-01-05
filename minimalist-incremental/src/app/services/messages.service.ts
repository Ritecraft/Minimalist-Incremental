import { Message } from "@angular/compiler/src/i18n/i18n_ast";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import {MessageModel} from "../models/message.model"
@Injectable()
export class MessagesService 
{
    messages_subject: BehaviorSubject<MessageModel[]>;
    messages$: Observable<MessageModel[]>;

    constructor()
    {
        let s: MessageModel[] = [];
        this.messages_subject = new BehaviorSubject(s);
        this.messages$ = this.messages_subject.asObservable();
    }

    publish(message: string, ...args: any[])
    {
        let messages = this.messages_subject.value;
        if(message.length > 0)
        {
          messages.push(new MessageModel(message, args));
          if(messages.length > 20)
          {
            messages.splice(0,1);
          }
          this.messages_subject.next(messages);
        }
    }
}

