const { chartRender, chartRandomColor } = require("./modules/charts");
const { fetchData } = require("./modules/fetch");
const { loaders } = require("./modules/loaders");

let dataFiltered = [];

const fields = {
    select_tahun: 11,
    select_bulan: 10,
    select_tanggal: 9,
    select_up3: 4,
    select_ulp: 5,
    select_keypoint: 6,
    select_section: 7,
    select_fasa: 8,
    select_tindak_lanjut: 12,
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

const chartRenderArusPickUpPerUP3 = (data) => {
    const chartData = {};
    let totalEntries = 0;

    const selectedUP3 = Array.from(document.querySelector('#select_up3').selectedOptions).map(opt => opt.value);

    const isAllSelected = selectedUP3.includes("0");
    const filteredUP3 = isAllSelected ? [...new Set(data.map(row => row[fields.select_up3]))] : selectedUP3;

    data.forEach((row) => {
        const selectKeypoint = row[fields.select_keypoint];
        const selectUP3 = row[fields.select_up3];

        if (!isAllSelected && !filteredUP3.includes(selectUP3)) {
            return;
        }

        chartData[selectKeypoint] = chartData[selectKeypoint] || {};
        chartData[selectKeypoint][selectUP3] = (chartData[selectKeypoint][selectUP3] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = filteredUP3;
    const chartDataSets = [];

    Object.keys(chartData).forEach((dataKey) => {
        const dataPerUP3 = chartLabels.map((up3) => chartData[dataKey][up3] || 0);
        chartDataSets.push({
            label: dataKey,
            data: dataPerUP3,
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
                    text: `TOTAL ${formatNumber(totalEntries)} ARUS PICK-UP PER UP3`,
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            return `TOTAL ARUS PICK-UP: ${formatNumber(tooltipItem.raw)}`;
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

const chartRenderArusPickUpPerFasaNetral = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach(row => {
        const selectFasa = row[fields.select_fasa];

        chartData[selectFasa] = (chartData[selectFasa] || 0) + 1;

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
                    text: `TOTAL ${formatNumber(totalEntries)} ARUS PICK-UP PER FASA NETRAL`
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            return `JUMLAH: ${formatNumber(value)} (${((value / chartTotal) * 100).toFixed(2)}%)`;
                        },
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

const chartRenderArusPickUpPerUP3Bulan = (data) => {
    const chartData = {};
    let totalEntries = 0;

    const selectBulan = Array.from(document.querySelector('#select_bulan').selectedOptions).map(opt => opt.value);

    const isAllSelected = selectBulan.includes("0");
    const filteredUP3 = isAllSelected ? [...new Set(data.map(row => row[fields.select_bulan]))] : selectBulan;

    data.forEach((row) => {
        const selectUP3 = row[fields.select_up3];
        const selectBln = row[fields.select_bulan];

        if (!isAllSelected && !filteredUP3.includes(selectBln)) {
            return;
        }

        chartData[selectUP3] = chartData[selectUP3] || {};
        chartData[selectUP3][selectBln] = (chartData[selectUP3][selectBln] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = filteredUP3;
    const chartDataSets = [];

    Object.keys(chartData).forEach((dataKey) => {
        const randomColor = chartRandomColor();
        const dataPerUP3 = chartLabels.map((up3) => chartData[dataKey][up3] || 0);
        chartDataSets.push({
            label: dataKey,
            data: dataPerUP3,
            backgroundColor: randomColor,
            borderColor: randomColor,
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
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} ARUS PICK-UP PER BULAN (KEYPOINT)`,
                },
                tooltip: {
                    callbacks: {
                        // afterLabel: function (tooltipItem) {
                        //     return `TOTAL ARUS PICK-UP: ${formatNumber(tooltipItem.raw)}`;
                        // },
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

const chartRenderArusPickUpPerKeypointBulan = (data) => {
    const chartData = {};
    let totalEntries = 0;

    const selectKeypoint = Array.from(document.querySelector('#select_keypoint').selectedOptions).map(opt => opt.value);

    const isAllSelected = selectKeypoint.includes("0");
    const filteredUP3 = isAllSelected ? [...new Set(data.map(row => row[fields.select_bulan]))] : selectKeypoint;

    data.forEach((row) => {
        const selectKeypts = row[fields.select_keypoint];
        const selectBln = row[fields.select_bulan];

        if (!isAllSelected && !filteredUP3.includes(selectBln)) {
            return;
        }

        chartData[selectKeypts] = chartData[selectKeypts] || {};
        chartData[selectKeypts][selectBln] = (chartData[selectKeypts][selectBln] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = filteredUP3;
    const chartDataSets = [];

    Object.keys(chartData).forEach((dataKey) => {
        const randomColor = chartRandomColor();
        const dataPerUP3 = chartLabels.map((up3) => chartData[dataKey][up3] || 0);
        chartDataSets.push({
            label: dataKey,
            data: dataPerUP3,
            backgroundColor: randomColor,
            borderColor: randomColor,
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
            interaction: {
                mode: 'index',
                intersect: false,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} ARUS PICK-UP PER BULAN (UP3)`,
                },
                tooltip: {
                    callbacks: {
                        // afterLabel: function (tooltipItem) {
                        //     return `TOTAL ARUS PICK-UP: ${formatNumber(tooltipItem.raw)}`;
                        // },
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

const chartRenderArusPickUpStatusTindakLanjut = (data) => {
    const chartData = {};
    let totalEntries = 0;

    // Ambil UP3 yang dipilih dari dropdown
    const selectedUP3 = Array.from(document.querySelector('#select_up3').selectedOptions).map(opt => opt.value);

    const isAllSelected = selectedUP3.includes("0");
    const filteredUP3 = isAllSelected ? [...new Set(data.map(row => row[fields.select_up3]))] : selectedUP3;

    // Menghitung data tindak lanjut per UP3
    data.forEach((row) => {
        const selectTindakLanjut = row[fields.select_tindak_lanjut];
        const selectUP3 = row[fields.select_up3];

        if (!isAllSelected && !filteredUP3.includes(selectUP3)) {
            return;
        }

        chartData[selectTindakLanjut] = chartData[selectTindakLanjut] || {};
        chartData[selectTindakLanjut][selectUP3] = (chartData[selectTindakLanjut][selectUP3] || 0) + 1;

        totalEntries += 1;
    });

    const chartLabels = filteredUP3;
    const chartDataSets = [];

    // Hitung total jumlah tindak lanjut untuk setiap UP3
    const up3TotalCounts = chartLabels.reduce((acc, up3) => {
        acc[up3] = Object.values(chartData).reduce((sum, tindakLanjutData) => sum + (tindakLanjutData[up3] || 0), 0);
        return acc;
    }, {});

    Object.keys(chartData).forEach((dataKey) => {
        const dataPerUP3 = chartLabels.map((up3) => chartData[dataKey][up3] || 0);
        chartDataSets.push({
            label: dataKey,
            data: dataPerUP3,
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
                    text: `TOTAL ${formatNumber(totalEntries)} TINDAK LANJUT ARUS PICK-UP`,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw; // Nilai untuk status tertentu

                            return `JUMLAH: ${formatNumber(value)} (${((value / up3TotalCounts[context.label]) * 100).toFixed(2)}%)`;
                        },
                        afterLabel: function () {
                            return `TOTAL TINDAK LANJUT: ${formatNumber(totalEntries)}`;
                        },
                    },
                },
                legend: {
                    position: 'bottom',
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


const renderAll = (data) => {
    chartRender(data, '.chart_arus_pickup_up3', 'bar', 'ARUS PICK-UP PER UP3', chartRenderArusPickUpPerUP3);
    chartRender(data, '.chart_arus_pickup_fasa_netral', 'pie', 'ARUS PICK-UP PER FASA NETRAL', chartRenderArusPickUpPerFasaNetral);
    chartRender(data, '.chart_arus_pickup_up3_bulan', 'line', 'ARUS PICK-UP PER BULAN (UP3)', chartRenderArusPickUpPerUP3Bulan);
    chartRender(data, '.chart_arus_pickup_keypoint_bulan', 'line', 'ARUS PICK-UP PER BULAN (KEYPOINT)', chartRenderArusPickUpPerKeypointBulan);
    chartRender(data, '.chart_arus_pickup_status_tindak_lanjut', 'bar', 'STATUS TINDAK LANJUT ARUS PICK-UP', chartRenderArusPickUpStatusTindakLanjut);
};

fetchData({
    sheetID: '1Bw_5jjSYmSWa_9RNbbPmZ05_G0XjytteTQ4xggnDlhg',
    sheetName: 'Data Pick Up',
    sheetAPI: 'AIzaSyDwiv0JN7BQeuc6XEYLBf_uTHhYZNj-65I',
    sheetRowStart: config.sheetRowStart || 'A',
    sheetRowEnd: config.sheetRowEnd || 'N',
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