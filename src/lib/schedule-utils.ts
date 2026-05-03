import { addDays, isWeekend, startOfDay, setHours, setMinutes, isAfter, isBefore, addMinutes } from "date-fns";

export const SCHEDULE_CONFIG = {
    SHIFT_1: { start: { h: 7, m: 0 }, end: { h: 11, m: 30 } },
    SHIFT_2: { start: { h: 14, m: 30 }, end: { h: 17, m: 30 } },
    SLOT_DURATION: 60, // Assuming 60 minutes for simplicity, can be adjusted
    WINDOW_DAYS: 15,
};

export function isDateWithinSchedulingWindow(date: Date): boolean {
    const today = startOfDay(new Date());
    const maxDate = addDays(today, SCHEDULE_CONFIG.WINDOW_DAYS);
    
    if (isWeekend(date)) return false;
    if (isBefore(date, today)) return false;
    if (isAfter(date, maxDate)) return false;
    
    return true;
}

export function getAvailableSlotsForDay(date: Date) {
    if (!isDateWithinSchedulingWindow(date)) return [];

    const slots: Date[] = [];
    
    // Shift 1
    let current = setMinutes(setHours(startOfDay(date), SCHEDULE_CONFIG.SHIFT_1.start.h), SCHEDULE_CONFIG.SHIFT_1.start.m);
    const end1 = setMinutes(setHours(startOfDay(date), SCHEDULE_CONFIG.SHIFT_1.end.h), SCHEDULE_CONFIG.SHIFT_1.end.m);
    
    while (isBefore(current, end1)) {
        slots.push(new Date(current));
        current = addMinutes(current, SCHEDULE_CONFIG.SLOT_DURATION);
    }
    
    // Shift 2
    current = setMinutes(setHours(startOfDay(date), SCHEDULE_CONFIG.SHIFT_2.start.h), SCHEDULE_CONFIG.SHIFT_2.start.m);
    const end2 = setMinutes(setHours(startOfDay(date), SCHEDULE_CONFIG.SHIFT_2.end.h), SCHEDULE_CONFIG.SHIFT_2.end.m);
    
    while (isBefore(current, end2)) {
        slots.push(new Date(current));
        current = addMinutes(current, SCHEDULE_CONFIG.SLOT_DURATION);
    }
    
    return slots;
}
