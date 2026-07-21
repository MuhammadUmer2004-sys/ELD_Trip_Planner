import React, { useRef, useEffect } from "react";

const STATUS_ROWS = [
    { key: "off_duty", label: "Off Duty", short: "OFF", color: "#6b7280" },
    { key: "sleeper", label: "Sleeper Berth", short: "SB", color: "#8b5cf6" },
    { key: "driving", label: "Driving", short: "D", color: "#3b82f6" },
    { key: "on_duty", label: "On Duty (Not Driving)", short: "ON", color: "#f59e0b" },
];

const GRID_LEFT = 90;
const GRID_TOP = 50;
const ROW_HEIGHT = 40;
const HOUR_WIDTH = 34;
const GRID_WIDTH = HOUR_WIDTH * 24;
const GRID_HEIGHT = ROW_HEIGHT * 4;
const CANVAS_WIDTH = GRID_LEFT + GRID_WIDTH + 80;
const CANVAS_HEIGHT = GRID_TOP + GRID_HEIGHT + 60;

export default function ELDLogSheet({ logData, dayNumber, tripDate, driverInfo }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        canvas.style.width = `${CANVAS_WIDTH}px`;
        canvas.style.height = `${CANVAS_HEIGHT}px`;

        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);

        drawLog(ctx, logData);
    }, [logData]);

    function drawLog(ctx, data) {
        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title area
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 14px system-ui, sans-serif";
        ctx.fillText(`Driver's Daily Log — Day ${dayNumber}`, GRID_LEFT, 20);

        ctx.fillStyle = "#64748b";
        ctx.font = "11px system-ui, sans-serif";
        const dateStr = tripDate || `Day ${dayNumber}`;
        ctx.fillText(dateStr, GRID_LEFT, 36);

        // Row labels
        STATUS_ROWS.forEach((row, i) => {
            const y = GRID_TOP + i * ROW_HEIGHT;

            // Row label background
            ctx.fillStyle = i % 2 === 0 ? "#f8fafc" : "#ffffff";
            ctx.fillRect(0, y, GRID_LEFT - 2, ROW_HEIGHT);

            // Label text
            ctx.fillStyle = row.color;
            ctx.font = "bold 10px system-ui, sans-serif";
            ctx.fillText(row.short, 8, y + 16);
            ctx.fillStyle = "#334155";
            ctx.font = "9px system-ui, sans-serif";
            ctx.fillText(row.label, 8, y + 30);
        });

        // Grid background
        STATUS_ROWS.forEach((_, i) => {
            const y = GRID_TOP + i * ROW_HEIGHT;
            ctx.fillStyle = i % 2 === 0 ? "#f8fafc" : "#ffffff";
            ctx.fillRect(GRID_LEFT, y, GRID_WIDTH, ROW_HEIGHT);
        });

        // Grid lines - vertical (hours)
        for (let h = 0; h <= 24; h++) {
            const x = GRID_LEFT + h * HOUR_WIDTH;
            ctx.strokeStyle = h % 6 === 0 ? "#cbd5e1" : "#e2e8f0";
            ctx.lineWidth = h % 6 === 0 ? 1.5 : 0.5;
            ctx.beginPath();
            ctx.moveTo(x, GRID_TOP);
            ctx.lineTo(x, GRID_TOP + GRID_HEIGHT);
            ctx.stroke();

            // Quarter-hour ticks
            if (h < 24) {
                for (let q = 1; q <= 3; q++) {
                    const qx = x + q * (HOUR_WIDTH / 4);
                    ctx.strokeStyle = "#f1f5f9";
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    const tickTop = GRID_TOP;
                    ctx.moveTo(qx, tickTop);
                    ctx.lineTo(qx, GRID_TOP + GRID_HEIGHT);
                    ctx.stroke();
                }
            }
        }

        // Grid lines - horizontal
        for (let i = 0; i <= 4; i++) {
            const y = GRID_TOP + i * ROW_HEIGHT;
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = i === 0 || i === 4 ? 1.5 : 1;
            ctx.beginPath();
            ctx.moveTo(GRID_LEFT, y);
            ctx.lineTo(GRID_LEFT + GRID_WIDTH, y);
            ctx.stroke();
        }

        // Hour labels
        ctx.fillStyle = "#64748b";
        ctx.font = "bold 9px system-ui, sans-serif";
        ctx.textAlign = "center";
        for (let h = 0; h <= 24; h++) {
            const x = GRID_LEFT + h * HOUR_WIDTH;
            const label = h === 0 ? "M" : h === 12 ? "N" : h === 24 ? "M" : h > 12 ? String(h - 12) : String(h);
            ctx.fillText(label, x, GRID_TOP - 6);
        }
        ctx.textAlign = "left";

        // Draw log entries
        if (data?.entries) {
            data.entries.forEach((entry) => {
                const rowIndex = STATUS_ROWS.findIndex(r => r.key === entry.status);
                if (rowIndex === -1) return;

                const row = STATUS_ROWS[rowIndex];
                const startX = GRID_LEFT + Math.max(0, entry.startHour) * HOUR_WIDTH;
                const endX = GRID_LEFT + Math.min(24, entry.endHour) * HOUR_WIDTH;
                const y = GRID_TOP + rowIndex * ROW_HEIGHT + ROW_HEIGHT / 2;

                if (endX <= startX) return;

                // Draw filled bar
                ctx.fillStyle = row.color + "20";
                ctx.fillRect(startX, GRID_TOP + rowIndex * ROW_HEIGHT + 4, endX - startX, ROW_HEIGHT - 8);

                // Draw line
                ctx.strokeStyle = row.color;
                ctx.lineWidth = 3;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(startX, y);
                ctx.lineTo(endX, y);
                ctx.stroke();

                // Draw vertical connectors at transitions
                ctx.strokeStyle = row.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(startX, y - ROW_HEIGHT / 2 + 4);
                ctx.lineTo(startX, y + ROW_HEIGHT / 2 - 4);
                ctx.stroke();
            });

            // Connect entries with vertical lines between rows
            const sortedEntries = [...data.entries].sort((a, b) => a.startHour - b.startHour);
            for (let i = 0; i < sortedEntries.length - 1; i++) {
                const curr = sortedEntries[i];
                const next = sortedEntries[i + 1];
                const currRow = STATUS_ROWS.findIndex(r => r.key === curr.status);
                const nextRow = STATUS_ROWS.findIndex(r => r.key === next.status);

                if (currRow === -1 || nextRow === -1 || currRow === nextRow) continue;

                const x = GRID_LEFT + Math.min(24, curr.endHour) * HOUR_WIDTH;
                const y1 = GRID_TOP + currRow * ROW_HEIGHT + ROW_HEIGHT / 2;
                const y2 = GRID_TOP + nextRow * ROW_HEIGHT + ROW_HEIGHT / 2;

                ctx.strokeStyle = "#94a3b8";
                ctx.lineWidth = 1.5;
                ctx.setLineDash([3, 2]);
                ctx.beginPath();
                ctx.moveTo(x, y1);
                ctx.lineTo(x, y2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
        }

        // Totals on right side
        const totalsX = GRID_LEFT + GRID_WIDTH + 8;
        ctx.font = "bold 9px system-ui, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("Total", totalsX, GRID_TOP - 6);

        STATUS_ROWS.forEach((row, i) => {
            const y = GRID_TOP + i * ROW_HEIGHT + ROW_HEIGHT / 2 + 4;
            const totalKey = row.key === "off_duty" ? "offDuty" : row.key === "on_duty" ? "onDuty" : row.key;
            const hours = data?.totals?.[totalKey] || 0;
            ctx.fillStyle = row.color;
            ctx.font = "bold 12px system-ui, sans-serif";
            ctx.fillText(formatHours(hours), totalsX, y);
        });

        // Grand total
        const grandTotal = Object.values(data?.totals || {}).reduce((s, v) => s + v, 0);
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 11px system-ui, sans-serif";
        ctx.fillText(`Total: ${formatHours(grandTotal)}`, GRID_LEFT, GRID_TOP + GRID_HEIGHT + 20);
    }

    function formatHours(h) {
        const hrs = Math.floor(h);
        const mins = Math.round((h - hrs) * 60);
        return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <canvas
                    ref={canvasRef}
                    style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
                    className="block"
                />
            </div>
        </div>
    );
}