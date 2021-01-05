import { Pipe, PipeTransform } from '@angular/core';

export class StringFormatter {
    public static Format(value: string, ...args: any[]) : string
    {
        let result = value;
        for(let i = 0; i < args.length; i++)
        {
            result = result.replace('{' + i + '}', args[i] + '');
        }
        return result;
    }

    public static TranslateAndFormat(service: any ,value: string, ...args: any[]) : string
    {
        return this.Format(service.instant(value), ...args);
    }
}

@Pipe({name: 'stringFormat'})
export class StringFormatPipe implements PipeTransform {
  transform(value: string, args: any[]): string {
    return StringFormatter.Format(value, ...args);
  }
}