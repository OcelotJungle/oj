import { CAR_COURIER_ADDITION, DAYS_IN_WEEK, EMPTY_COURIER_ROWS } from "../consts";
import { Weekdays } from "../../utils/complex/weekday";
import CourierType from "../enums/courier-type";
import { STATS, STYLES } from "./metadata";
import WeekdayStats from "./weekday-stats";
import { iterateWeek } from "../utils";
import Courier from "./courier";
import ExcelJS from "exceljs";

export default class ExcelWorker {
    workbook: ExcelJS.Workbook;
    sheet: ExcelJS.Worksheet;

    couriersPaneLength!: number;
    firstStatsRow!: number;

    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.sheet = this.workbook.addWorksheet();
    }

    fill(couriers: Courier[], weekdays: WeekdayStats[]) {
        this.couriersPaneLength = couriers.length + EMPTY_COURIER_ROWS;
        this.firstStatsRow = this.couriersPaneLength + 3;

        this.fillHeaders();
        this.fillCouriers(couriers);
        this.fillStats(weekdays);
        this.applyStyles(couriers);

        return this;
    }

    private cell(r: number, c: number) { return this.sheet.getCell(r, c) }

    private fillHeaders() {
        iterateWeek(day => this.cell(1, day + 2).value = Weekdays.getRuName(day).capitalize());

        this.cell(this.firstStatsRow, 1).value = `${STATS.couriers.morning}  `;
        this.cell(this.firstStatsRow + 1, 1).value = `${STATS.couriers.evening}  `;
        this.cell(this.firstStatsRow + 2, 1).value = `${STATS.couriers.total}  `;
        this.cell(1, 10).value = STATS.hours.total;
    }

    private fillCouriers(couriers: Courier[]) {
        const totalHours = couriers.reduce((total, courier, r) => {
            this.cell(r + 2, 1).value = courier.name;
            if(courier.type === CourierType.CAR) this.cell(r + 2, 1).value += ` ${CAR_COURIER_ADDITION}`;

            courier.days.forEach((day, c) => {
                if(!day.isWeekend) this.cell(r + 2, c + 2).value = day.toString();
            });

            this.cell(r + 2, 10).value = courier.total;
            return total + courier.total;
        }, 0);

        this.cell(this.firstStatsRow, 10).value = totalHours;
    }

    private fillStats(weekdays: WeekdayStats[]) {
        const fsr = this.firstStatsRow;
        weekdays.forEach((day, c) => {
            this.cell(fsr, c + 2).value = day.morning;
            this.cell(fsr + 1, c + 2).value = day.evening;
            this.cell(fsr + 2, c + 2).value = day.total;
        });
    }
    
    private applyStyles(couriers: Courier[]) {
        const fsr = this.firstStatsRow;

        // Views
        this.sheet.views[0] = { zoomScale: 150 };
        
        // Widths
        this.sheet.getColumn(1).width = 24;
        this.sheet.getColumn(9).width = this.sheet.getColumn(10).width = 11;
        iterateWeek(day => this.sheet.getColumn(day + 2).width = 16);

        // Aligns
        [
            this.cell(fsr, 1),
            this.cell(fsr + 1, 1),
            this.cell(fsr + 2, 1)
        ].forEach(cell => cell.alignment = STYLES.alignment.right);
        for(let r = 1; r <= fsr + 2; r++) {
            for(let c = 2; c <= 10; c++) {
                this.cell(r, c).alignment = STYLES.alignment.center;
            }
        }

        // Fonts
        for(let r = 1; r <= fsr + 2; r++) {
            for(let c = 1; c <= 10; c++) {
                this.cell(r, c).font = { size: 12 };
            }
        }

        // Colors
        for(let r = 2; r <= this.couriersPaneLength + 1; r++) {
            const argb = STYLES.colors.couriers[r % 2][couriers[r - 2]?.type ?? "bike"];
            for(let c = 1; c <= 10; c++) {
                this.cell(r, c).fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb }
                };
            }
        }

        // Conditional formatting
        this.sheet.addConditionalFormatting({
            ref: `${this.cell(fsr, 2).$col$row}:${this.cell(fsr + 1, DAYS_IN_WEEK + 1).$col$row}`,
            rules: [STYLES.conditionalFormatting.gradient, STYLES.conditionalFormatting.tooMuch]
        });

        // Borders
        const cellsToSetBorder = [this.cell(fsr, 10)];
        for(let r = 1; r <= this.couriersPaneLength + 1; r++)
            for(let c = 1; c <= 10; c++) cellsToSetBorder.push(this.cell(r, c));
        
        
        for(let r = fsr; r <= fsr + 2; r++)
            iterateWeek(c => cellsToSetBorder.push(this.cell(r, c)), 1, 2);
        cellsToSetBorder.forEach(cell => cell.border = STYLES.borders.default);
    }

    async save(path: string) { await this.workbook.xlsx.writeFile(path) }
}