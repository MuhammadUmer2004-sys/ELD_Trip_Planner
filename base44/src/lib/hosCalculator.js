// HOS (Hours of Service) Calculator for Property-Carrying Drivers
// Rules: 70hrs/8days cycle, 11hr driving limit, 14hr on-duty window, 30min break after 8hrs

const HOS_RULES = {
    MAX_DRIVING_HOURS: 11,
    MAX_ON_DUTY_WINDOW: 14,
    REQUIRED_REST_HOURS: 10,
    BREAK_AFTER_HOURS: 8,
    BREAK_DURATION: 0.5,
    CYCLE_LIMIT: 70,
    CYCLE_DAYS: 8,
    FUEL_STOP_MILES: 1000,
    FUEL_STOP_DURATION: 0.5,
    PICKUP_DURATION: 1,
    DROPOFF_DURATION: 1,
    AVG_SPEED_MPH: 55,
};

export function calculateTrip({ totalDistanceMiles, currentCycleUsed, segments }) {
    // segments: [{type: 'drive_to_pickup'|'pickup'|'drive_to_dropoff'|'dropoff', distanceMiles, coordinates}]

    const stops = [];
    const logEntries = [];

    let currentTime = 0; // hours from trip start
    let drivingToday = 0;
    let onDutyWindowToday = 0;
    let cycleUsed = currentCycleUsed;
    let sinceLastBreak = 0;
    let totalDriven = 0;
    let milesSinceLastFuel = 0;
    let dayNumber = 1;
    let currentDayStart = 0;

    function addLogEntry(status, startTime, duration, day) {
        if (duration <= 0) return;
        logEntries.push({
            day,
            status, // 'off_duty', 'sleeper', 'driving', 'on_duty'
            startHour: startTime - ((day - 1) * 24),
            duration,
            absoluteStart: startTime,
        });
    }

    function takeRestBreak(reason) {
        const restStart = currentTime;
        stops.push({
            type: 'rest',
            reason,
            time: currentTime,
            duration: HOS_RULES.REQUIRED_REST_HOURS,
            mileMarker: totalDriven,
        });
        addLogEntry('sleeper', currentTime, HOS_RULES.REQUIRED_REST_HOURS, dayNumber);
        currentTime += HOS_RULES.REQUIRED_REST_HOURS;

        // Check if we crossed into a new day
        const newDay = Math.floor(currentTime / 24) + 1;
        if (newDay > dayNumber) {
            dayNumber = newDay;
            currentDayStart = (dayNumber - 1) * 24;
        }

        drivingToday = 0;
        onDutyWindowToday = 0;
        sinceLastBreak = 0;
    }

    function takeShortBreak() {
        stops.push({
            type: 'break',
            reason: '30-min required break (8hrs driving)',
            time: currentTime,
            duration: HOS_RULES.BREAK_DURATION,
            mileMarker: totalDriven,
        });
        addLogEntry('off_duty', currentTime, HOS_RULES.BREAK_DURATION, dayNumber);
        currentTime += HOS_RULES.BREAK_DURATION;
        onDutyWindowToday += HOS_RULES.BREAK_DURATION;
        sinceLastBreak = 0;
    }

    function takeFuelStop() {
        stops.push({
            type: 'fuel',
            reason: 'Fuel stop',
            time: currentTime,
            duration: HOS_RULES.FUEL_STOP_DURATION,
            mileMarker: totalDriven,
        });
        addLogEntry('on_duty', currentTime, HOS_RULES.FUEL_STOP_DURATION, dayNumber);
        currentTime += HOS_RULES.FUEL_STOP_DURATION;
        onDutyWindowToday += HOS_RULES.FUEL_STOP_DURATION;
        milesSinceLastFuel = 0;
    }

    function driveSegment(miles) {
        let remaining = miles;

        while (remaining > 0) {
            // Check day boundary
            const newDay = Math.floor(currentTime / 24) + 1;
            if (newDay > dayNumber) {
                dayNumber = newDay;
                currentDayStart = (dayNumber - 1) * 24;
            }

            // Check cycle limit
            if (cycleUsed >= HOS_RULES.CYCLE_LIMIT) {
                takeRestBreak('70-hour cycle limit reached — 34hr restart required');
                // After a 34hr restart, reset cycle (simplified: we use 10hr rest here, 
                // full 34hr restart would reset cycle completely)
                cycleUsed = Math.max(0, cycleUsed - 24); // Approximate cycle recovery
            }

            // Check if 10hr rest is needed
            if (drivingToday >= HOS_RULES.MAX_DRIVING_HOURS || onDutyWindowToday >= HOS_RULES.MAX_ON_DUTY_WINDOW) {
                takeRestBreak('Required 10-hr off-duty (11hr driving / 14hr window reached)');
                continue;
            }

            // Check 30-min break requirement
            if (sinceLastBreak >= HOS_RULES.BREAK_AFTER_HOURS) {
                takeShortBreak();
                continue;
            }

            // Check fuel
            if (milesSinceLastFuel >= HOS_RULES.FUEL_STOP_MILES) {
                takeFuelStop();
                continue;
            }

            // Calculate how far we can drive before next mandatory stop
            const hoursUntilDrivingLimit = HOS_RULES.MAX_DRIVING_HOURS - drivingToday;
            const hoursUntilWindowLimit = HOS_RULES.MAX_ON_DUTY_WINDOW - onDutyWindowToday;
            const hoursUntilBreak = HOS_RULES.BREAK_AFTER_HOURS - sinceLastBreak;
            const milesUntilFuel = HOS_RULES.FUEL_STOP_MILES - milesSinceLastFuel;

            const maxDriveHours = Math.min(hoursUntilDrivingLimit, hoursUntilWindowLimit, hoursUntilBreak);
            const maxDriveMiles = Math.min(maxDriveHours * HOS_RULES.AVG_SPEED_MPH, milesUntilFuel);

            const driveMiles = Math.min(remaining, maxDriveMiles);
            const driveHours = driveMiles / HOS_RULES.AVG_SPEED_MPH;

            if (driveHours > 0) {
                addLogEntry('driving', currentTime, driveHours, dayNumber);
                currentTime += driveHours;
                drivingToday += driveHours;
                onDutyWindowToday += driveHours;
                sinceLastBreak += driveHours;
                cycleUsed += driveHours;
                totalDriven += driveMiles;
                milesSinceLastFuel += driveMiles;
                remaining -= driveMiles;
            }
        }
    }

    function doOnDutyTask(duration, taskName) {
        let remaining = duration;
        while (remaining > 0) {
            const newDay = Math.floor(currentTime / 24) + 1;
            if (newDay > dayNumber) {
                dayNumber = newDay;
                currentDayStart = (dayNumber - 1) * 24;
            }

            if (onDutyWindowToday >= HOS_RULES.MAX_ON_DUTY_WINDOW) {
                takeRestBreak('14-hr on-duty window reached');
                continue;
            }

            const hoursUntilWindowLimit = HOS_RULES.MAX_ON_DUTY_WINDOW - onDutyWindowToday;
            const taskHours = Math.min(remaining, hoursUntilWindowLimit);

            addLogEntry('on_duty', currentTime, taskHours, dayNumber);
            currentTime += taskHours;
            onDutyWindowToday += taskHours;
            cycleUsed += taskHours;
            remaining -= taskHours;
        }
    }

    // Execute trip segments
    for (const segment of segments) {
        if (segment.type === 'drive_to_pickup') {
            stops.push({ type: 'start', reason: 'Trip start', time: currentTime, duration: 0, mileMarker: 0 });
            driveSegment(segment.distanceMiles);
        } else if (segment.type === 'pickup') {
            stops.push({ type: 'pickup', reason: 'Pickup (1hr)', time: currentTime, duration: HOS_RULES.PICKUP_DURATION, mileMarker: totalDriven });
            doOnDutyTask(HOS_RULES.PICKUP_DURATION, 'Pickup');
        } else if (segment.type === 'drive_to_dropoff') {
            driveSegment(segment.distanceMiles);
        } else if (segment.type === 'dropoff') {
            stops.push({ type: 'dropoff', reason: 'Dropoff (1hr)', time: currentTime, duration: HOS_RULES.DROPOFF_DURATION, mileMarker: totalDriven });
            doOnDutyTask(HOS_RULES.DROPOFF_DURATION, 'Dropoff');
        }
    }

    // Add end marker
    stops.push({ type: 'end', reason: 'Trip complete', time: currentTime, duration: 0, mileMarker: totalDriven });

    // Build daily log sheets
    const totalDays = Math.ceil(currentTime / 24) || 1;
    const dailyLogs = [];

    for (let d = 1; d <= totalDays; d++) {
        const dayEntries = logEntries.filter(e => e.day === d);
        const totalDriving = dayEntries.filter(e => e.status === 'driving').reduce((s, e) => s + e.duration, 0);
        const totalOnDuty = dayEntries.filter(e => e.status === 'on_duty').reduce((s, e) => s + e.duration, 0);
        const totalSleeper = dayEntries.filter(e => e.status === 'sleeper').reduce((s, e) => s + e.duration, 0);
        const totalOffDuty = dayEntries.filter(e => e.status === 'off_duty').reduce((s, e) => s + e.duration, 0);
        const accounted = totalDriving + totalOnDuty + totalSleeper + totalOffDuty;
        const remainingOffDuty = Math.max(0, 24 - accounted);

        dailyLogs.push({
            day: d,
            date: d,
            entries: dayEntries.map(e => ({
                status: e.status,
                startHour: Math.max(0, e.startHour),
                endHour: Math.min(24, e.startHour + e.duration),
            })),
            totals: {
                driving: Math.round(totalDriving * 100) / 100,
                onDuty: Math.round(totalOnDuty * 100) / 100,
                sleeper: Math.round(totalSleeper * 100) / 100,
                offDuty: Math.round((totalOffDuty + remainingOffDuty) * 100) / 100,
            },
        });
    }

    return {
        stops,
        dailyLogs,
        summary: {
            totalMiles: Math.round(totalDriven),
            totalTime: Math.round(currentTime * 100) / 100,
            totalDays,
            totalStops: stops.length,
            fuelStops: stops.filter(s => s.type === 'fuel').length,
            restStops: stops.filter(s => s.type === 'rest').length,
        },
    };
}

export { HOS_RULES };