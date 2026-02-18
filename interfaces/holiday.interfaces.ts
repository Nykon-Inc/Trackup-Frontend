export interface IHolidayItem {
    id: string;
    name: string;
    date: string;
}

export interface IHoliday {
    holidays: IHolidayItem[];
    nextHoliday: IHolidayItem | null
}