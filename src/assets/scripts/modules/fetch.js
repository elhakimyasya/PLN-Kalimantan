import { loaders } from "./loaders";

export const fetchData = async (options) => {
    const sheetID = options.sheetID;
    const sheetName = options.sheetName;
    const sheetAPI = options.sheetAPI;

    const sheetRowStart = options.sheetRowStart || 'A';
    const sheetRowEnd = options.sheetRowEnd || 'Z';

    let rangeStart = typeof options.rangeStart === 'number' ? options.rangeStart : 1;
    let rangeEnd = typeof options.rangeEnd === 'number' ? options.rangeEnd : 100;

    if (sheetID && sheetName && sheetAPI) {
        try {
            const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetID}/values/${sheetName}!${sheetRowStart}${rangeStart}:${sheetRowEnd}${rangeStart + rangeEnd - 1}?alt=json&key=${sheetAPI}`);

            const data = await response.json();
            if (data.values) {
                return [...data.values];
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            loaders('.loaders', 'hide');
        }
    }
};
