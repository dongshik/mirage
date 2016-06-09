import {Pipe, PipeTransform} from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 |  exponentialStrength:10}}
 *   formats to: 1024
*/
declare var moment;
@Pipe({name: 'prettyJson'})
export class prettyJson implements PipeTransform {
  transform(value : Object) : any {
	return JSON.stringify(value, null, 4);
  }
}
@Pipe({name: 'prettyTime'})
export class prettyTime implements PipeTransform {
  transform(value : Object) : any {
	return moment(value, 'DD-MM hh:mm A');
  }
}