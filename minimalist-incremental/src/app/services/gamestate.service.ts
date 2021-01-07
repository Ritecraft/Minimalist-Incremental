import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { StringFormatter } from "../components/shared/format.pipe";
import { GameStateModel, SkillsProvider } from "../models/gamestate.model";
import { Upgrade } from "../models/upgrade.model";
import { MessagesService } from "./messages.service";

@Injectable()
export class GameStateService {
    gameState_subject: BehaviorSubject<GameStateModel>;
    gameState$: Observable<GameStateModel>;
    
    lastPassedTime: number;
    constructor(private messagesService : MessagesService) {
        this.gameState_subject = new BehaviorSubject(new GameStateModel()),
        this.gameState$ = this.gameState_subject.asObservable(),
        this.lastPassedTime = (new Date).getTime()
    }
    GetElapsedTime() {
        let t = (new Date).getTime(),
        e = t - this.lastPassedTime;
        return this.lastPassedTime = t,
        e
    }
    next(t : GameStateModel) {
        this.gameState_subject.next(t.copy())
    }
    Tick() {
        let t = this.gameState_subject.value.copy(),
        e = this.GetElapsedTime();
        t.Tick(e),
        this.next(t)
    }
    BuyMine() {
        let t = this.gameState_subject.value.copy();
        t.canBuyMine && t.BuyMine(),
        this.next(t)
    }
    BuyQuarry() {
        let t = this.gameState_subject.value.copy();
        t.canBuyQuarry && t.BuyQuarry(),
        this.next(t)
    }
    BuyTimeMachine() {
        let t = this.gameState_subject.value.copy();
        t.BuyTimeMachine();
        if(t.timeTravel.intervalLevel == 1)
        {
            this.messagesService.publish('story.inventor.first',t.timeTravel.foundedDay);
            this.messagesService.publish("story.inventor.firstSigil");
        }
        if(t.timeTravel.intervalLevel == 2)
        {
            this.messagesService.publish('story.inventor.timeTravelLab');
        }
        this.next(t);
    }
    BuyCrystal() {
        let t = this.gameState_subject.value.copy();
        t.timeTravel.BuyTimeCrystal(),

        this.next(t)
    }
    BuyParadox() {
        let t = this.gameState_subject.value.copy();
        t.timeTravel.BuyParadox(),
        this.next(t)
    }
    BuyButterfly() {
        let t = this.gameState_subject.value.copy();
        t.timeTravel.BuyButterfly(),
        this.next(t)
    }
    getEvent() {
        let t = this.gameState_subject.value.copy(),
        e = t.adventure.getRandomEvent(t);
        this.messagesService.publish(e);
        return this.next(t),
        e
    }

    applyUpgrade(u: Upgrade)
    {
        let g = this.gameState_subject.value.copy();
        u.Apply(g);
        if(u.id == 'timeTravel.intervalLevel_0')
        {
            this.messagesService.publish('story.inventor.first',g.timeTravel.foundedDay);
            this.messagesService.publish("story.inventor.firstSigil");
        }
        if(u.id == 'timeTravel.intervalLevel_1')
        {
            this.messagesService.publish('story.inventor.timeTravelLab');
        }
        this.next(g);
    }

    GetStoryMessages(g : GameStateModel, t: any) {
        let result : {texts: string[], category:string}[] = [];
        result.push({texts: [], category: t.instant('story.inventor.path')});
        result.push({texts: [], category: t.instant('story.social.path')});
        if(g.skills.getValue(SkillsProvider.Inventing) > 0) result[0].texts.push(t.instant('story.inventor.head'));
        if(g.timeTravel.intervalLevel > 0) result[0].texts.push(StringFormatter.TranslateAndFormat(t, 'story.inventor.first', g.timeTravel.foundedDay));
        if(g.timeTravel.intervalLevel > 0) result[0].texts.push(t.instant("story.inventor.firstSigil"));
        if(g.timeTravel.intervalLevel > 1) result[0].texts.push(t.instant("story.inventor.timeTravelLab"));
        if(g.skills.getValue(SkillsProvider.Dreaming) > 0) result[0].texts.push(t.instant("story.inventor.dreams"));
 

        if(g.eventCashLevel > 0) result[1].texts.push(t.instant("story.social.surveys"))
        if(g.eventCashLevel > 1) result[1].texts.push(t.instant("story.social.bot"))
        if(g.eventCashLevel > 2) result[1].texts.push(t.instant("story.social.cultStart"))
   
        return result.filter(q => q.texts.length > 0);
    }
}