import { chartRandomColor, chartRender } from './modules/charts';
import { fetchData } from './modules/fetch';
import { loaders } from './modules/loaders';

let dataFiltered = [];

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

const formats = {
    months: [
        'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI', 'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
    ],
};

const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
};

const selectOptionsRender = (selectID, values) => {
    if (selectID === 'select_tahun') {
        return values.sort((dataA, dataB) => parseInt(dataB, 10) - parseInt(dataA, 10));
    }

    if (selectID === 'select_bulan') {
        return values.sort((dataA, dataB) => formats.months.indexOf(dataA.toUpperCase()) - formats.months.indexOf(dataB.toUpperCase()));
    }

    if (selectID === 'select_tanggal') {
        return values.sort((dataA, dataB) => {
            parseInt(dataA, 10) - parseInt(dataB, 10)
        });
    }

    return values.sort();
};

const chartRenderTotalGangguanUP3 = (data) => {
    const chartData = {};
    let totalEntries = 0;

    const selectedBulan = Array.from(document.querySelector('#select_bulan').selectedOptions).map(opt => opt.value);

    const isAllSelected = selectedBulan.includes("0");
    const filteredBulan = isAllSelected ? formats.months : selectedBulan.map(bulan => bulan.toUpperCase());

    data.forEach((row) => {
        const selectUP3 = row[fields.select_up3];
        const selectBulan = row[fields.select_bulan].toUpperCase();

        if (!isAllSelected && !filteredBulan.includes(selectBulan)) {
            return;
        }

        chartData[selectUP3] = chartData[selectUP3] || {};
        chartData[selectUP3][selectBulan] = (chartData[selectUP3][selectBulan] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = isAllSelected ? formats.months : filteredBulan;
    const chartDataSets = [];

    Object.keys(chartData).forEach((dataKey) => {
        const dataPerBulan = chartLabels.map((bulan) => chartData[dataKey][bulan] || 0);
        chartDataSets.push({
            label: dataKey,
            data: dataPerBulan,
            backgroundColor: chartRandomColor(),
        });
    });

    return {
        data: {
            labels: chartLabels,
            datasets: chartDataSets,
        },
        options: {
            responsive: true,
            indexAxis: 'x',
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} GANGGUAN (UP3)`,
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            return `TOTAL GANGGUAN: ${formatNumber(tooltipItem.raw)}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    beginAtZero: true,
                },
                y: {
                    beginAtZero: true,
                },
            },
        },
    };
};

const chartRenderJenisGangguanULP = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach((row) => {
        const selectULP = row[fields.select_ulp];
        const selectJenisGangguan = row[fields.select_jenis_gangguan];

        chartData[selectULP] = chartData[selectULP] || {};
        chartData[selectULP][selectJenisGangguan] = (chartData[selectULP][selectJenisGangguan] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = Object.keys(chartData);
    const chartDataSets = [];
    const chartTotal = {};

    const allJenisGangguan = new Set();
    Object.values(chartData).forEach(datas => {
        Object.keys(datas).forEach(jenisGangguan => {
            allJenisGangguan.add(jenisGangguan);
        });
    });

    allJenisGangguan.forEach(jenisGangguan => {
        const dataJenisGangguan = chartLabels.map(label => chartData[label][jenisGangguan] || 0);
        chartLabels.forEach(label => {
            chartTotal[label] = (chartTotal[label] || 0) + (chartData[label][jenisGangguan] || 0);
        });

        chartDataSets.push({
            label: jenisGangguan,
            data: dataJenisGangguan,
            backgroundColor: chartRandomColor(),
        });
    });

    chartDataSets.push({
        label: 'TOTAL',
        data: chartLabels.map(label => chartTotal[label]),
    });

    return {
        data: {
            labels: chartLabels,
            datasets: chartDataSets
        },
        options: {
            responsive: true,
            indexAxis: 'y',
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} JENIS GANGGUAN (ULP)`
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            return `TOTAL JENIS GANGGUAN: ${formatNumber(chartTotal[tooltipItem.label])}`;
                        }
                    }
                },
            },
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            },
        },
    };
};

const chartRenderPenyebabGangguan = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach(row => {
        const selectKelompokGangguan = row[fields.select_kelompok_gangguan];

        chartData[selectKelompokGangguan] = (chartData[selectKelompokGangguan] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = Object.keys(chartData);
    const chartValues = Object.values(chartData);

    const chartTotal = chartValues.reduce((sum, value) => sum + value, 0);

    return {
        data: {
            labels: chartLabels,
            datasets: [{
                data: chartValues,
                backgroundColor: chartLabels.map(() => chartRandomColor()),
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} PENYEBAB GANGGUAN`
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function () {
                            return `JUMLAH: ${formatNumber(chartTotal)}`;
                        },
                    }
                },
                legend: {
                    position: 'bottom',
                },
            },
        },
    };
};

const tableRenderHealthIndex = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "UP3", "JUMLAH", "ENS (kWh)"];

        const dataDetail = data.reduce((acc, row) => {
            const selectUP3 = row[fields.select_up3];
            const ensKwh = parseFloat(row[10].trim());

            if (!acc[selectUP3]) {
                acc[selectUP3] = {
                    count: 0, selectUP3,
                    totalEns: 0
                };
            }

            acc[selectUP3].count += 1;
            acc[selectUP3].totalEns += ensKwh;

            return acc;
        }, {});

        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { count, selectUP3, totalEns } = details;

            return {
                no: index + 1,
                selectUP3,
                jumlah: count,
                ensKwh: totalEns,
            };
        });

        rankingData.sort((dataA, dataB) => dataB.jumlah - dataA.jumlah);
        const totalJumlah = rankingData.reduce((total, row) => total + row.jumlah, 0);
        const totalEns = rankingData.reduce((total, row) => total + row.ensKwh, 0);

        const tableRows = rankingData.map((row, index) => `<tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder"><td class="px-2 py-1.5">${index + 1}</td><td class="px-2 py-1.5 text-start">${row.selectUP3}</td><td class="px-2 py-1.5">${formatNumber(row.jumlah)}</td><td class="px-2 py-1.5">${formatNumber(row.ensKwh)} kWh</td></tr>`
        ).join('');

        const totalRow = `<tr class="whitespace-nowrap border-t text-center border-colorBorder dark:border-colorDarkBorder"><td colspan="2" class="px-2 py-1.5 font-bold">TOTAL</td><td class="px-2 py-1.5 font-bold">${formatNumber(totalJumlah)}</td><td class="px-2 py-1.5 font-bold">${formatNumber(totalEns)} kWh</td></tr>`;

        element.innerHTML = `<div class="relative overflow-x-auto shadow-md sm:rounded-lg"><table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta"><thead class="bg-colorMeta/10 text-xs uppercase"><tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr></thead><tbody>${tableRows}${totalRow}</tbody></table></div>`;
    }
};

const tableRenderHealthIndexDetails = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "UP3", "ULP", "PENYULANG", "JUMLAH", "KETERANGAN"];
        const colors = {
            sempurna: "bg-yellow-500 text-white dark:bg-yellow-200",
            sehat: "bg-green-500 text-white dark:bg-green-200",
            sakit: "bg-red-500 text-white dark:bg-red-200",
            kronis: "bg-black text-white",
        };

        const getKeterangan = (count) => {
            if (count === 0) return {
                keterangan: "SEMPURNA", keteranganClass: colors.sempurna
            };

            if (count >= 1 && count <= 3) return {
                keterangan: "SEHAT", keteranganClass: colors.sehat
            };

            if (count >= 4 && count <= 6) return {
                keterangan: "SAKIT", keteranganClass: colors.sakit
            };

            return {
                keterangan: "KRONIS", keteranganClass: colors.kronis
            };
        };

        const dataDetail = data.reduce((acc, row) => {
            const selectUP3 = row[fields.select_up3];
            const selectULP = row[fields.select_ulp];
            const selectPenyulang = row[fields.select_penyulang];

            const keys = `${selectUP3}-${selectULP}-${selectPenyulang}`;
            if (!acc[keys]) {
                acc[keys] = { count: 0, selectUP3, selectULP, selectPenyulang };
            }

            acc[keys].count += 1;

            return acc;
        }, {});

        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { count, selectUP3, selectULP, selectPenyulang } = details;
            const { keterangan, keteranganClass } = getKeterangan(count);

            return {
                no: index + 1,
                selectUP3,
                selectULP,
                selectPenyulang,
                jumlah: count,
                keterangan,
                keteranganClass,
            };
        });

        rankingData.sort((dataA, dataB) => dataB.jumlah - dataA.jumlah);
        const tableRows = rankingData.map((row, index) => `<tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder"><td class="px-2 py-1.5">${index + 1}</td><td class="px-2 py-1.5 text-start">${row.selectUP3}</td><td class="px-2 py-1.5 text-start">${row.selectULP}</td><td class="px-2 py-1.5 text-start">${row.selectPenyulang}</td><td class="px-2 py-1.5">${formatNumber(row.jumlah)}</td><td class="px-2 py-1.5 ${row.keteranganClass}">${row.keterangan}</td></tr>`).join('');

        element.innerHTML = `<div class="relative overflow-x-auto shadow-md sm:rounded-lg"><table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta"><thead class="bg-colorMeta/10 text-xs uppercase"><tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr></thead><tbody>${tableRows}</tbody></table></div>`;
    }
};

const renderAll = (data) => {
    chartRender(data, '.chart_jenis_gangguan_up3', 'bar', 'TOTAL GANGGUAN', chartRenderTotalGangguanUP3);
    chartRender(data, '.chart_jenis_gangguan_ulp', 'bar', 'JENIS GANGGUAN', chartRenderJenisGangguanULP);
    chartRender(data, '.chart_penyebab_gangguan', 'pie', 'PENYEBAB GANGGUAN', chartRenderPenyebabGangguan);

    tableRenderHealthIndex(data, '.table_health_index');
    tableRenderHealthIndexDetails(data, '.table_health_index_details');
};

fetchData({
    sheetID: '1EyZ0U4_lsD5Xi3IBmNkz2Rgo4LV4OoWC3Ldw2E2GrBM',
    sheetName: 'Database',
    sheetAPI: 'AIzaSyDwiv0JN7BQeuc6XEYLBf_uTHhYZNj-65I',
    sheetRowStart: config.sheetRowStart || 'A',
    sheetRowEnd: config.sheetRowEnd || 'M',
    rangeStart: config.rangeStart || 1,
    rangeEnd: config.rangeEnd || 100,
}).then((data) => {
    renderAll(data);

    Object.entries(fields).forEach(([selectID, columnIndex]) => {
        const selectElement = document.getElementById(selectID);
        selectElement.innerHTML = `<option value='0' selected>Semua</option>${selectOptionsRender(selectID, [...new Set(data.map(row => row[columnIndex]))].filter(Boolean)).map(value => `<option value='${value}'>${value}</option>`).join('')}`;
    });

    document.querySelectorAll('select[multiple]').forEach((element) => {
        element.addEventListener('change', async () => {
            loaders('.loaders', 'show');

            dataFiltered = data.filter(row =>
                Object.entries(fields).every(([selectId, columnIndex]) => {
                    const selectedValues = Array.from(document.getElementById(selectId).selectedOptions).map(opt => opt.value);

                    return selectedValues.includes('0') || selectedValues.includes(row[columnIndex]);
                })
            );

            renderAll(dataFiltered);

            loaders('.loaders', 'hide');
        });
    });
});