import { BehaviorSubject, Observable } from "rxjs";
import { GameStateModel } from "../models/gamestate.model";

export class GameStateService {
    gameState_subject: BehaviorSubject<GameStateModel>;
    gameState$: Observable<GameStateModel>;
    lastPassedTime: number;
    constructor() {
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
        t.BuyTimeMachine(),
        this.next(t)
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
        return this.next(t),
        e
    }
}