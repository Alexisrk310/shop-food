export const STORE_TIMEZONE = 'America/Bogota';
export const CLOSING_HOUR = 1; // 1 AM

export function isStoreOpen(): { isOpen: boolean; message?: string } {
    // Get current time in Colombia
    const now = new Date();
    const colombiaTime = new Date(now.toLocaleString('en-US', { timeZone: STORE_TIMEZONE }));

    const hour = colombiaTime.getHours();
    // Store is open effectively "all day" except the gap between closing and opening.
    // Assuming opening time is in the morning (e.g., 8 AM? or 11 AM?).
    // For now, user only said "hasta la 1am".
    // This implies if it's 2 AM, 3 AM, 4 AM, 5 AM... it's closed.
    // Let's assume it opens at some point, or just blocks "after 1 AM".
    // If "until 1 AM", that usually means orders are allowed 00:00 - 01:00, and standard hours 10:00 - 23:59.
    // So likely closed from 01:00 to ~08:00 or 10:00.

    // Let's implement a safe block: Closed from 01:00 to 08:00 (arbitrary opening, but safe for "late night").
    // If hour is 1, 2, 3, 4, 5, 6, 7 => Closed.

    if (hour >= CLOSING_HOUR && hour < 8) { // Assuming 8 AM opening
        return {
            isOpen: false,
            message: 'Cerrado. Horario de atención hasta la 1:00 AM'
        };
    }

    return { isOpen: true };
}
