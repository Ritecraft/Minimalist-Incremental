export class MessageModel {
    public text: string;
    public args: any[];

    constructor(text: string, args: any[])
    {
        this.text = text;
        this.args = args;
    }
    
}