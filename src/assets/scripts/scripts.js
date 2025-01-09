const spreadsheetId = '1EyZ0U4_lsD5Xi3IBmNkz2Rgo4LV4OoWC3Ldw2E2GrBM';
const sheetName = 'Database';
const apiKey = 'AIzaSyDwiv0JN7BQeuc6XEYLBf_uTHhYZNj-65I';
const initialRangeStart = 1;
const rowsPerFetch = 18000;

const chartInstances = {};

let rawData = [];
let filteredData = [];

const fields = {
    select_tahun: 1,
    select_bulan: 2,
    select_tanggal: 3,
    select_up3: 4,
    select_ulp: 5,
    select_penyulang: 6,
    select_zona: 7,
    select_kelompok_gangguan: 8,
    select_cuaca: 9,
    select_jenis_gangguan: 11,
};

const sortOrder = {
    bulan: ["JANUARI", "FEBRUARI", "MARET", "APRIL", "MEI", "JUNI", "JULI", "AGUSTUS", "SEPTEMBER", "OKTOBER", "NOVEMBER", "DESEMBER"],
};

const chartRandomColor = () => {
    const materialColors = [
        "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B", "#D32F2F", "#1976D2", "#388E3C", "#0288D1", "#8E24AA", "#7B1FA2", "#0288D1", "#5C6BC0", "#FF5722", "#673AB7", "#FF7043", "#2196F3", "#673AB7", "#0097A7", "#4CAF50", "#388E3C", "#FF9800", "#8BC34A", "#F57C00", "#FF3D00", "#795548", "#78909C", "#536DFE", "#FF4081", "#18FFFF", "#00C853", "#FFAB00", "#8D6E63", "#9E9E9E", "#607D8B", "#00E5FF", "#FF5722", "#00B8D4", "#E64A19", "#FBC02D", "#29B6F6", "#7E57C2"
    ];
    return materialColors[Math.floor(Math.random() * materialColors.length)];
};

const chartRender = (data, chartElementId, chartType, title, generateChartDataFn) => {
    const ctx = document.getElementById(chartElementId).getContext('2d');
    const chartData = generateChartDataFn(data);

    if (chartData) {
        // Destroy the previous chart instance if it exists
        if (chartInstances[chartElementId]) {
            chartInstances[chartElementId].destroy();
        }

        // Create a new chart instance
        chartInstances[chartElementId] = new Chart(ctx, {
            type: chartType,
            data: chartData.data,
            options: chartData.options
        });
    } else {
        document.getElementById(chartElementId).classList.add('hidden');
    }
};

const selectOptionsRender = (selectId, values) => {
    if (selectId === "select_tahun") {
        return values.sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
    }
    if (selectId === "select_bulan") {
        return values.sort((a, b) => sortOrder.bulan.indexOf(a.toUpperCase()) - sortOrder.bulan.indexOf(b.toUpperCase()));
    }
    if (selectId === "select_tanggal") {
        return values.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    }
    return values.sort();
};

const selectOptionsUpdate = () => {
    Object.entries(fields).forEach(([selectId, columnIndex]) => {
        document.getElementById(selectId).innerHTML = `<option value="0">Semua</option>${selectOptionsRender(selectId, [...new Set(rawData.map(row => row[columnIndex]))].filter(Boolean)).map(value => `<option value="${value}">${value}</option>`).join('')}`;
    });
};

const tableDataSort = (data) => {
    return data.sort((dataA, dataB) => {
        const compare = (dataA, dataB, customSort = false) => {
            return dataA !== dataB ? (customSort ? sortOrder.bulan.indexOf(dataA) - sortOrder.bulan.indexOf(dataB) : dataA - dataB) : 0;
        };

        if (dataA[1] !== dataB[1]) return compare(dataB[1], dataA[1]);
        if (dataA[2] !== dataB[2]) return compare(dataA[2], dataB[2], true);
        if (parseInt(dataA[3], 10) !== parseInt(dataB[3], 10)) return parseInt(dataA[3], 10) - parseInt(dataB[3], 10);
        return dataA.slice(4).join('').localeCompare(dataB.slice(4).join(''));
    });
};

const tableRender = (data) => {
    const headers = ["NO", "TAHUN", "BULAN", "TGL", "UP3", "ULP", "PENYULANG/KEYPOINT", "ZONA", "KELOMPOK GANGGUAN", "CUACA", "DURASI (Menit)", "JENIS GANGGUAN", "ENS (kWh)"];
    const tableHTML = tableDataSort(data).map(row => `<tr class="whitespace-nowrap border-b text-center">${row.map(cell => `<td class="px-6 py-4">${cell}</td>`).join('')}</tr>`).join('');
    document.getElementById('data-visualization').innerHTML = `<div class="relative overflow-x-auto shadow-md sm:rounded-lg"><table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta"><thead class="bg-colorMeta/10 text-xs uppercase"><tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr></thead><tbody>${tableHTML}</tbody></table></div>`;
};

const chartRenderJenisGangguanULP = (data) => {
    const chartData = {};
    data.forEach(row => {
        const ulp = row[fields.select_ulp];
        const jenisGangguan = row[fields.select_jenis_gangguan];
        chartData[ulp] = chartData[ulp] || {};
        chartData[ulp][jenisGangguan] = (chartData[ulp][jenisGangguan] || 0) + 1;
    });

    const labels = Object.keys(chartData);
    const datasets = [];
    const totalPerULP = {};

    const allJenisGangguan = new Set();
    Object.values(chartData).forEach(ulpData => {
        Object.keys(ulpData).forEach(jenisGangguan => {
            allJenisGangguan.add(jenisGangguan);
        });
    });

    allJenisGangguan.forEach(jenisGangguan => {
        const dataForJenisGangguan = labels.map(ulp => chartData[ulp][jenisGangguan] || 0);
        labels.forEach(ulp => {
            totalPerULP[ulp] = (totalPerULP[ulp] || 0) + (chartData[ulp][jenisGangguan] || 0);
        });

        datasets.push({
            label: jenisGangguan,
            data: dataForJenisGangguan,
            backgroundColor: chartRandomColor(),
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1
        });
    });

    datasets.push({
        label: 'TOTAL',
        data: labels.map(ulp => totalPerULP[ulp]),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1
    });

    return {
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                title: { display: true, text: 'JENIS GANGGUAN (ULP)' },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            const ulp = tooltipItem.label;
                            return `TOTAL: ${totalPerULP[ulp]}`;
                        }
                    }
                },
                datalabels: { 
                    color: '#000',
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value,
                }
            },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            },
        },
        plugins: [ChartDataLabels], 
    };
};

const chartRenderJenisGangguanUP3 = (data) => {
    const chartData = {};
    data.forEach(row => {
        const up3 = row[fields.select_up3];
        const jenisGangguan = row[fields.select_jenis_gangguan];
        chartData[up3] = chartData[up3] || {};
        chartData[up3][jenisGangguan] = (chartData[up3][jenisGangguan] || 0) + 1;
    });

    const labels = Object.keys(chartData);
    const datasets = [];
    const totalPerUP3 = {};

    const allJenisGangguan = new Set();
    Object.values(chartData).forEach(up3Data => {
        Object.keys(up3Data).forEach(jenisGangguan => {
            allJenisGangguan.add(jenisGangguan);
        });
    });

    allJenisGangguan.forEach(jenisGangguan => {
        const dataForJenisGangguan = labels.map(up3 => chartData[up3][jenisGangguan] || 0);
        labels.forEach(up3 => {
            totalPerUP3[up3] = (totalPerUP3[up3] || 0) + (chartData[up3][jenisGangguan] || 0);
        });

        datasets.push({
            label: jenisGangguan,
            data: dataForJenisGangguan,
            backgroundColor: chartRandomColor(),
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1
        });
    });

    datasets.push({
        label: 'TOTAL',
        data: labels.map(up3 => totalPerUP3[up3]),
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1
    });

    return {
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            indexAxis: 'x',
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            },
            plugins: {
                title: { display: true, text: 'JENIS GANGGUAN (UP3)' },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            const up3 = tooltipItem.label;
                            return `TOTAL: ${totalPerUP3[up3]}`;
                        }
                    }
                },
                datalabels: { 
                    color: '#000',
                    anchor: 'end',
                    align: 'end',
                    formatter: (value) => value,
                }
            }
        },
        plugins: [ChartDataLabels], 
    };
};

const chartRenderPenyebabGangguan = (data) => {
    const chartData = {};
    data.forEach(row => {
        const penyebabGangguan = row[fields.select_kelompok_gangguan];
        chartData[penyebabGangguan] = (chartData[penyebabGangguan] || 0) + 1;
    });

    const labels = Object.keys(chartData);
    const dataValues = Object.values(chartData);

    const total = dataValues.reduce((sum, value) => sum + value, 0);

    return {
        data: {
            labels: labels,
            datasets: [{
                data: dataValues,
                backgroundColor: labels.map(() => chartRandomColor()),
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: { display: true, text: 'PENYEBAB GANGGUAN' },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            return `JUMLAH KESELURUHAN: ${total}`;
                        },
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        boxWidth: 20,
                        padding: 10
                    }
                },
                datalabels: {  // Aktifkan data labels
                    color: '#000',
                    formatter: (value) => value,
                }
            },
        },
        plugins: [ChartDataLabels],
    };
};

const fetchData = async (rangeStart) => {
    try {
        const range = `A${rangeStart}:Z${rangeStart + rowsPerFetch - 1}`;
        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!${range}?alt=json&key=${apiKey}`);
        const data = await response.json();

        if (data.values) {
            rawData = data.values.slice(1);
            filteredData = [...rawData];

            selectOptionsUpdate();

            tableRender(filteredData);

            chartRender(filteredData, 'chartJenisGangguanULP', 'bar', 'JENIS GANGGUAN', chartRenderJenisGangguanULP);
            chartRender(filteredData, 'chartJenisGangguanUP3', 'bar', 'JENIS GANGGUAN', chartRenderJenisGangguanUP3);
            chartRender(filteredData, 'chartPenyebabGangguan', 'pie', 'PENYEBAB GANGGUAN', chartRenderPenyebabGangguan);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        document.querySelector('.loaders').classList.add('hidden');
        document.documentElement.classList.remove('overflow-hidden');
    }
};

const adjustCanvasHeight = () => {
    const canvas = document.querySelectorAll(['.chart_jenis_gangguan_ulp', '.chart_jenis_gangguan_up3', '.chart_penyebab_gangguan']);
    canvas.forEach((element) => {
        const windowHeight = window.innerHeight;
        element.height = windowHeight * 0.4;
    });
};

const filterData = async () => {
    filteredData = rawData.filter(row =>
        Object.entries(fields).every(([selectId, columnIndex]) => {
            const selectedValue = document.getElementById(selectId).value;
            return selectedValue === "0" || row[columnIndex] === selectedValue;
        })
    );
};

document.querySelectorAll('select').forEach(element => element.addEventListener('change', async () => {
    document.querySelector('.loaders').classList.remove('hidden');
    document.documentElement.classList.add('overflow-hidden');

    await filterData();

    tableRender(filteredData);

    chartRender(filteredData, 'chartJenisGangguanULP', 'bar', 'JENIS GANGGUAN', chartRenderJenisGangguanULP);
    chartRender(filteredData, 'chartJenisGangguanUP3', 'bar', 'JENIS GANGGUAN', chartRenderJenisGangguanUP3);
    chartRender(filteredData, 'chartPenyebabGangguan', 'pie', 'PENYEBAB GANGGUAN', chartRenderPenyebabGangguan);

    document.querySelector('.loaders').classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
}));

// window.addEventListener('resize', adjustCanvasHeight);
fetchData(initialRangeStart);
