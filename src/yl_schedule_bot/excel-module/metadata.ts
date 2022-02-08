import { Alignment, Border, ConditionalFormattingRule } from "exceljs";

export const STATS = {
    hours: {
        total: "Итого"
    },
    couriers: {
        morning: "Утром",
        evening: "Вечером",
        total: "Итого"
    }
};

export const STYLES: {
    alignment: { [key: string]: Partial<Alignment> };
    colors: { couriers: { bike: string; car: string; }[] };
    borders: { [key: string]: { [key: string]: Partial<Border> } };
    conditionalFormatting: { [key: string]: ConditionalFormattingRule };
} = {
    alignment: {
        right: { horizontal: "right" },
        center: { horizontal: "center" }
    },
    colors: {
        couriers: [
            {
                bike: "FFE2EFDA",
                car: "FFFFFF00"
            },
            {
                bike: "FFFCE4D6",
                car: "FFFFFF00"
            }
        ]
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
            priority: 0,
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
};