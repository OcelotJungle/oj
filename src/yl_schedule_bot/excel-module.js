import ExcelJS from "exceljs";
// import transform from "./transform";

const DAYS_IN_WEEK = 7;
const EMPTY_COURIER_ROWS = 5;

class Metadata {
    static DAYS_OF_WEEK = [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
        "Воскресенье"
    ];

    static STATS = {
        totalHours: "Итого",
        morningCouriers: "Утром",
        eveningCouriers: "Вечером",
        totalCouriers: "Итого"
    };

    static STYLES = {
        alignment: {
            right: { horizontal: "right" },
            center: { horizontal: "center" }
        },
        colors: {
            couriers: ["FFE2EFDA", "FFFCE4D6"],
        },
        borders: {
            default: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
            }
        },
        conditionalFormatting: {
            gradient: {
                type: "colorScale",
                cfvo: [
                    { type: "num", value: 0 },
                    { type: "num", value: 4 },
                    { type: "num", value: 5 }
                ],
                color: [
                    { argb: "FF0000" },
                    { argb: "FFC000" },
                    { argb: "63BE7B"}
                ]
            },
            tooMuch: {
                priority: -10,
                type: "cellIs",
                operator: "greaterThan",
                formulae: ["5"],
                style: {
                    fill: {
                        type: "pattern",
                        pattern: "solid",
                        bgColor: { argb: "FF4472C4" }
                    }
                }
            }
        }
    }
}

class Courier {
    constructor(name, days) {
        // const [name, ...days] = rawRecord.split("\t");
        
        this.name = name;
        this.days = days.map(day => !day.isWeekend ? new Day(day) : null);
        // this.days = days.map(day => day.length ? new Day(day) : null);
        this.total = this.days.filter(day => day).reduce((sum, day) => sum + day.duration, 0);
    }
}

class Day {
    static MAX_MORNING_START_TIME = 13;
    static MIN_EVENING_END_TIME = 20;

    constructor(day) {
        [this.from, this.to] = [day.start, day.end];
        // [this.from, this.to] = this.parseHours(rawTime);
        this.isMorning = this.from <= Day.MAX_MORNING_START_TIME;
        this.isEvening = this.to >= Day.MIN_EVENING_END_TIME;
        this.duration = this.to - this.from;
    }

    // parseHours(rawHours) { return rawHours.replace(/:30/g, ".5").split("-").map(raw => +raw) }
    toString() {
        const stringify = raw => raw % 1 === 0 ? raw : `${Math.trunc(raw)}:30`;
        return `${stringify(this.from)}-${stringify(this.to)}`;
    }
}

class WeekDay {
    constructor() { this.morning = this.evening = this.total = 0; }

    getCounts() {
        return {
            morning: this.morning,
            evening: this.evening,
            total: this.total
        };
    }
}

class ExcelWorker {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.sheet = this.workbook.addWorksheet();
    }

    fillData(couriers, weekdays) {
        this.couriersPaneLength = couriers.length + EMPTY_COURIER_ROWS;
        this.firstStatsRow = this.couriersPaneLength + 3;

        this.fillHeaders();
        this.fillCouriers(couriers);
        this.fillStats(weekdays);
        this.applyStyles();

        return this;
    }

    cell(r, c) { return this.sheet.getCell(r, c); }

    fillHeaders() {
        for(let day = 0; day < DAYS_IN_WEEK; day++) this.cell(1, day + 2).value = Metadata.DAYS_OF_WEEK[day];

        this.cell(this.firstStatsRow, 1).value = `${Metadata.STATS.morningCouriers}  `;
        this.cell(this.firstStatsRow + 1, 1).value = `${Metadata.STATS.eveningCouriers}  `;
        this.cell(this.firstStatsRow + 2, 1).value = `${Metadata.STATS.totalCouriers}  `;
        this.cell(1, 10).value = Metadata.STATS.totalHours;
    }

    fillCouriers(couriers) {
        let totalHours = 0;

        couriers.forEach((courier, i) => {
            totalHours += courier.total;
            this.cell(i + 2, 1).value = courier.name;
            this.cell(i + 2, 10).value = courier.total;
            for(let day = 0; day < DAYS_IN_WEEK; day++)
                if(courier.days[day]) this.cell(i + 2, day + 2).value = courier.days[day].toString();
        });

        this.cell(this.firstStatsRow, 10).value = totalHours;
    }

    fillStats(weekdays) {
        for(let i = 0; i < DAYS_IN_WEEK; i++) {
            this.cell(this.firstStatsRow, i + 2).value = weekdays[i].morning;
            this.cell(this.firstStatsRow + 1, i + 2).value = weekdays[i].evening;
            this.cell(this.firstStatsRow + 2, i + 2).value = weekdays[i].total;
        }
    }
    
    applyStyles() {
        // Views
        this.sheet.views[0] = { zoomScale: 150 };
        
        // Widths
        this.sheet.getColumn(1).width = 24;
        this.sheet.getColumn(9).width = this.sheet.getColumn(10).width = 11;
        for(let i = 0; i < DAYS_IN_WEEK; i++) this.sheet.getColumn(2 + i).width = 16;

        // Aligns
        [
            this.cell(this.firstStatsRow, 1),
            this.cell(this.firstStatsRow + 1, 1),
            this.cell(this.firstStatsRow + 2, 1)
        ].forEach(cell => cell.alignment = Metadata.STYLES.alignment.right);
        for(let r = 1; r <= this.firstStatsRow + 2; r++) {
            for(let c = 2; c <= 10; c++) {
                this.cell(r, c).alignment = Metadata.STYLES.alignment.center;
            }
        }

        // Fonts
        for(let r = 1; r <= this.firstStatsRow + 2; r++) {
            for(let c = 1; c <= 10; c++) {
                this.cell(r, c).font = { size: 12 };
            }
        }

        // Colors
        for(let r = 2; r <= this.couriersPaneLength + 1; r++) {
            for(let c = 1; c <= 10; c++) {
                this.cell(r, c).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: Metadata.STYLES.colors.couriers[r % 2] }
                };
            }
        }

        // Conditional formatting
        this.sheet.addConditionalFormatting({
            ref: `${this.cell(this.firstStatsRow, 2).$col$row}:${this.cell(this.firstStatsRow + 1, DAYS_IN_WEEK + 1).$col$row}`,
            rules: [Metadata.STYLES.conditionalFormatting.gradient, Metadata.STYLES.conditionalFormatting.tooMuch]
        });

        // Borders
        const cellsToSetBorder = [this.cell(this.firstStatsRow, 10)];
        for(let r = 1; r <= this.couriersPaneLength + 1; r++)
            for(let c = 1; c <= 10; c++) cellsToSetBorder.push(this.cell(r, c));
        for(let r = this.firstStatsRow; r <= this.firstStatsRow + 2; r++)
            for(let c = 1; c <= DAYS_IN_WEEK + 1; c++) cellsToSetBorder.push(this.cell(r, c));
        cellsToSetBorder.forEach(cell => cell.border = Metadata.STYLES.borders.default);
    }

    async save(path) { await this.workbook.xlsx.writeFile(path); }
}

function getCouriers(wishes) {
    return wishes
        .filter(wish => !wish.isWeekend)
        .map(({ name, days }) => new Courier(name, days))
        .sort((a, b) => b.total - a.total);
    // return wishes.map(raw => new Courier(raw)).sort((a, b) => b.total - a.total);
}

function getWeekdays(couriers) {
    const weekdays = [];

    for(let i = 0; i < DAYS_IN_WEEK; i++) {
        const weekday = new WeekDay();
        
        for(const courier of couriers) {
            const day = courier.days[i]
            if(day) {
                weekday.total++;
                if(day.isMorning) weekday.morning++;
                if(day.isEvening) weekday.evening++;
            }
        }

        weekdays[i] = weekday;
    }

    return weekdays;
}

export default async function main(wishes, pathToSave) {
    const couriers = getCouriers(wishes);
    const weekdays = getWeekdays(couriers);

    await new ExcelWorker().fillData(couriers, weekdays).save(pathToSave);
}