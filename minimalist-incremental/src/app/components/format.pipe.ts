import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/

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