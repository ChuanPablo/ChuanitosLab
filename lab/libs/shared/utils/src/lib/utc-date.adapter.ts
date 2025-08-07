import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class UtcDateAdapter extends NativeDateAdapter {
  override createDate(year: number, month: number, date: number): Date {
    console.log('creating date via UTCDateAdapter...');
    // Create date at noon to avoid timezone issues
    const result = new Date(year, month, date, 12, 0, 0);
    return result;
  }

  override parse(value: any): Date | null {
    if (typeof value === 'string' && value.length > 0) {
      const timestamp = Date.parse(value);
      if (!isNaN(timestamp)) {
        const date = new Date(timestamp);
        date.setHours(12, 0, 0, 0);
        return date;
      }
    }
    return super.parse(value);
  }

  override getFirstDayOfWeek(): number {
    return 1; // Monday
  }
}
