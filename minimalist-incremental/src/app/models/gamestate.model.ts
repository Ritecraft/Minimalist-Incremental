export class GameStateModel {

public money: number;
public eventCashLevel: number;
    canBuyMine = false;
    canBuyQuarry = false;
    income = 0;
    baseQuarryCost: number;
    baseMineCost: number;
    cachedCosts: {[baseCost: number] : number};
    totalTime: number;
    timeTravel: TimeTravelState;
    mineLevel: number;
    quarryLevel: number;
    adventure: AdventureState;


    constructor(money = 0, timeTravel = new TimeTravelState, mineLevel = 0, quarryLevel = 0, totalTime = 0, eventCashLevel = 0, adventure = new AdventureState) {
       
         this.baseQuarryCost = 2e3,
        this.baseMineCost = 200,
       
        this.cachedCosts = {},
        this.totalTime = 0,
        this.money = money,
        this.timeTravel = timeTravel,
        this.mineLevel = mineLevel,
        this.quarryLevel = quarryLevel,
        this.totalTime = totalTime,
        this.adventure = adventure,
        this.eventCashLevel = eventCashLevel,
        this.setBuys()
    }
    BuyTimeMachine() {
        if (this.timeTravel.canBuyTimeMachine) {
            this.money -= this.getTimeMachineCost(),
            this.timeTravel.intervalLevel += 1;
            let t = this.timeTravel.intervalLevel % 3 + 1;
            this.timeTravel.entropy += t,
            this.timeTravel.maxEntropy += t,
            this.timeTravel.entropySigils = this.timeTravel.maxEntropy.toString().length
        }
    }
    BuyQuarry() {
        this.canBuyQuarry && (this.money -= this.getQuarryCost(), this.quarryLevel += 1)
    }
    BuyMine() {
        this.canBuyMine && (this.money -= this.getMineCost(), this.mineLevel += 1)
    }
    copy() {
        return new GameStateModel(this.money, this.timeTravel.copy(), this.mineLevel, this.quarryLevel, this.totalTime, this.eventCashLevel, this.adventure.copy())
    }
    getMultiplier(t: number) {
        let e = 1 + 1 / Math.sqrt(t);
        return Math.pow(.995, Math.sqrt(this.quarryLevel)) * e
    }
    getCost(baseCost: number, level: number) {
        return this.cachedCosts[baseCost] || (this.cachedCosts[baseCost] = baseCost * Math.pow(this.getMultiplier(baseCost), level)),
        this.cachedCosts[baseCost]
    }
    getQuarryCost() {
        return this.getCost(this.baseQuarryCost, this.quarryLevel)
    }
    getMineCost() {
        return this.getCost(this.baseMineCost, this.mineLevel)
    }
    getTimeMachineCost() {
        return this.getCost(this.timeTravel.baseCost, this.timeTravel.intervalLevel - (this.timeTravel.paradoxEngineLevel + this.timeTravel.getSigilCount()))
    }
    setBuys() {
        this.canBuyMine = this.money >= this.getMineCost(),
        this.canBuyQuarry = this.money >= this.getQuarryCost(),
        this.timeTravel.setBuys(this.money >= this.getTimeMachineCost()),
        this.income = 1e3 / this.GetInterval() * this.GetMoneyDelta()
    }
    Tick(timePassed : number) {
        let e = this.GetInterval(),
        n = this.GetMoneyDelta();
        for (this.totalTime += timePassed; this.totalTime > e; )
            this.totalTime -= e, this.money += n, this.adventure.Tick()
    }
    GetInterval() {
        return this.timeTravel.GetInterval()
    }
    GetMoneyDelta() {
        return this.mineLevel > 0 ? this.mineLevel + this.eventCashLevel : this.eventCashLevel
    }
}
class AdventureState {
    coolDown: number;
    boredom: number;
    knownEvents: {[id: number]: number};
    constructor(coolDown = 0, knownEvents = {}, boredom = 0) {
        this.coolDown = coolDown,
        this.knownEvents = knownEvents
        this.boredom = boredom;
    }
    copy() {
        return new AdventureState(this.coolDown, this.knownEvents, this.boredom)
    }
    randomIntFromInterval(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    getRandomEvent(gameState: GameStateModel) {
        if (this.coolDown > 0)
            return "";
        let e = EventsProvider.GetAllEvents();
        if (e = e.filter(e => this.isValid(e, gameState)), this.coolDown = 5, 0 == e.length)
            return "";
        let n = 0;
        for (let o = 0; o < e.length; o++)
            n += e[o].weight;
        let r = n - Math.floor(n),
        s = 1;
        r > 0 && (s = 1 / r),
        n *= s;
        let i = this.randomIntFromInterval(0, n - 1);
        i.toString();
        for (let o = 0; o < e.length; o++) {
            if (i < e[o].weight * s)
                return e[o].apply(gameState), this.knownEvents[o] += 1, e[o].message;
            i -= e[o].weight * s
        }
        return ""
    }
    Tick() {
        this.coolDown > 0 && (this.coolDown -= 1)
    }
    isValid(event: EventModel, gameState: GameStateModel) {
        return this.knownEvents[event.id] || (this.knownEvents[event.id] = 0),
        this.knownEvents[event.id] < event.maxCount && event.isValid(gameState)
    }
}
class EventModel {
    id: number;
    message: string;
    maxCount: number;
    weight: number;
    isValid: any;
    apply: any;
    constructor(id : number, maxCount : number, weight : number, isValid : (g :GameStateModel) => boolean, apply : (g: GameStateModel) => void, message : string) {
        this.id = id,
        this.message = message,
        this.maxCount = maxCount,
        this.weight = weight,
        this.isValid = isValid,
        this.apply = apply
    }
}
export class EventsProvider {
    static events: EventModel[];
    static Init() {
        this.events = [],
        this.events.push(
            new EventModel(0, 1, 2, t => !0, t => (t.eventCashLevel += 1, t), "You found an useful comment on the internet - free cash working from home?"), 
       
            new EventModel(1, 20, 6, t => !0, t => (t.money += 1, t), "You found a coin on the streets. Lucky you!"), 
            new EventModel(2, 1e8, 2, t => !0, t => t, "Nothing cool happens.")),
            new EventModel(3, 1, .1, t => t.money >= 20, t => (t.eventCashLevel += 1, t.money -= 20, t), "You paid 20$ for an auto-survey discord bot. It's basically free money!"), 
            new EventModel(4, 20, .4, t => t.adventure.boredom >= 5, t => (t.adventure.boredom += 2, t.money += 10, t), "You were so bored you picked up an actual shift in a real job. Pay is not good though."), 
            new EventModel(5, 1, .1, t => t.adventure.boredom >= 10 && t.eventCashLevel > 1, t => (t.eventCashLevel += 1, t), "While trolling on discord you accidentally started a cult worshipping your bot. (+ 1 base income)"), 
            new EventModel(6, 1, .1, t => t.adventure.boredom >= 20 && t.timeTravel.maxEntropy > 1, t => (t.timeTravel.eventSigils += 1, t), "While doodling out of boredom your pencil disapperead. That's normal, right? (+ 1 sigil)")
    }
    static GetAllEvents() {
        return this.events
    }
}
class TimeTravelState {
    static primeCosts = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 1000000001];
    cachedDilation: number;
    intervalLevel: number;
    entropy: number;
    timeCrystalLevel: number;
    paradoxEngineLevel: number;
    butterflyResonatorLevel: number;
    interval: number;
    maxEntropy: number;
    entropySigils: number;
    baseCost: number;
    canBuyTimeMachine: boolean;
    canBuyCrystal: boolean;
    canBuyButterfly: boolean;
    canBuyParadox: boolean;
    eventSigils: number;
    constructor(intervalLevel = 0, butterflyResonatorLevel = 0, paradoxEngineLevel = 0, timeCrystalLevel = 0, entropy = 0, entropySigils = 0, maxEntropy = 0, eventSigils = 0) {
      
        this.intervalLevel = 0,
        this.entropy = 0,
        this.timeCrystalLevel = 0,
        this.paradoxEngineLevel = 0,
        this.butterflyResonatorLevel = 0,
        this.interval = 1e3,
        this.maxEntropy = 0,
        this.entropySigils = 0,
        this.baseCost = 20,
        this.canBuyTimeMachine = false,
        this.canBuyCrystal = false,
        this.canBuyButterfly = false,
        this.canBuyParadox = false,
        this.cachedDilation = 0,
        this.entropy = entropy,
        this.maxEntropy = maxEntropy,
        this.entropySigils = entropySigils,
        this.timeCrystalLevel = timeCrystalLevel,
        this.paradoxEngineLevel = paradoxEngineLevel,
        this.butterflyResonatorLevel = butterflyResonatorLevel,
        this.intervalLevel = intervalLevel
        this.eventSigils = eventSigils;
    }
    copy() {
        return new TimeTravelState(this.intervalLevel, this.butterflyResonatorLevel, this.paradoxEngineLevel, this.timeCrystalLevel, this.entropy, this.entropySigils, this.maxEntropy, this.eventSigils)
    }
    BuyTimeCrystal() {
        this.canBuyCrystal && (this.entropy -= TimeTravelState.primeCosts[this.timeCrystalLevel], this.timeCrystalLevel += 1)
    }
    BuyParadox() {
        this.canBuyParadox && (this.entropy -= TimeTravelState.primeCosts[this.paradoxEngineLevel], this.paradoxEngineLevel += 1)
    }
    BuyButterfly() {
        this.canBuyButterfly && (this.entropy -= TimeTravelState.primeCosts[this.butterflyResonatorLevel], this.butterflyResonatorLevel += 1)
    }
    GetTimeDilation() {
        if (this.cachedDilation > 0)
            return this.cachedDilation;
        let t = .01,
        e = .99,
        n = e - t * (this.butterflyResonatorLevel + this.getSigilCount()),
        r = 0;
        for (; n < t; )
            r += e / t - (this.butterflyResonatorLevel + this.getSigilCount() + r), e = t, t /= 10, n = e - t * (this.butterflyResonatorLevel + this.getSigilCount());
        return this.cachedDilation = n,
        n
    }
    GetInterval() {
        return (this.interval - (this.timeCrystalLevel + this.getSigilCount())) * Math.pow(this.GetTimeDilation(), this.intervalLevel + this.paradoxEngineLevel + this.getSigilCount())
    }
    setBuys(canBuy : boolean) {
        this.canBuyTimeMachine = canBuy,
        this.canBuyCrystal = this.entropy >= TimeTravelState.primeCosts[this.timeCrystalLevel],
        this.canBuyButterfly = this.entropy >= TimeTravelState.primeCosts[this.butterflyResonatorLevel],
        this.canBuyParadox = this.entropy >= TimeTravelState.primeCosts[this.paradoxEngineLevel]
    }

    getSigilCount()
    {
        return this.eventSigils + this.entropySigils;
    }
}