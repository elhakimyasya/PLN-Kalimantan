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

    // Hitung total jumlah tindak lanjut untuk setiap UP3
    const up3TotalCounts = chartLabels.reduce((acc, up3) => {
        acc[up3] = Object.values(chartData).reduce((sum, tindakLanjutData) => sum + (tindakLanjutData[up3] || 0), 0);
        return acc;
    }, {});

    Object.keys(chartData).forEach((dataKey) => {
        const dataPerUP3 = chartLabels.map((up3) => chartData[dataKey][up3] || 0);
        chartDataSets.push({
            label: dataKey || 'undefined',
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
            interaction: {
                mode: 'index',
                intersect: true,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} ARUS PICK-UP PER UP3`,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const percentage = ((value / up3TotalCounts[context.label]) * 100).toFixed(2);

                            return `${context.dataset.label}: ${formatNumber(value)} (${percentage}%)`;
                        },
                        // afterLabel: function (context) {
                        //     return `JUMLAH: ${formatNumber(up3TotalCounts[context.label])}`;
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
            indexAxis: 'y',
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
                intersect: true,
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
            interaction: {
                mode: 'index',
                intersect: true,
            },
            stacked: false,
            plugins: {
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} TINDAK LANJUT ARUS PICK-UP`,
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            const percentage = ((value / up3TotalCounts[context.label]) * 100).toFixed(2);

                            return `${context.dataset.label}: ${formatNumber(value)} (${percentage}%)`;
                        },
                        // afterLabel: function (context) {
                        //     return `JUMLAH: ${formatNumber(up3TotalCounts[context.label])}`;
                        // },
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

const tableRenderArusPickUpKeypointBulan = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "KEYPOINT", "JUMLAH"];

        const dataDetail = data.reduce((acc, row) => {
            const selectKeyPoint = row[fields.select_keypoint];

            if (!acc[selectKeyPoint]) {
                acc[selectKeyPoint] = {
                    count: 0, selectKeyPoint,
                };
            }

            acc[selectKeyPoint].count += 1;

            return acc;
        }, {});

        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { count, selectKeyPoint } = details;

            return {
                no: index + 1,
                selectKeyPoint,
                jumlah: count,
            };
        });

        rankingData.sort((dataA, dataB) => dataB.jumlah - dataA.jumlah);
        const totalJumlah = rankingData.reduce((total, row) => total + row.jumlah, 0);

        const tableRows = rankingData.map((row, index) => `<tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder"><td class="px-2 py-1.5">${index + 1}</td><td class="px-2 py-1.5 text-start">${row.selectKeyPoint}</td><td class="px-2 py-1.5">${formatNumber(row.jumlah)}</td></tr>`
        ).join('');

        const totalRow = `<tr class="whitespace-nowrap border-t text-center border-colorBorder dark:border-colorDarkBorder"><td colspan="2" class="px-2 py-1.5 font-bold">TOTAL</td><td class="px-2 py-1.5 font-bold">${formatNumber(totalJumlah)}</td></tr>`;

        element.innerHTML = `<div class="relative overflow-x-auto shadow-md sm:rounded-lg"><table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta"><thead class="bg-colorMeta/10 text-xs uppercase"><tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr></thead><tbody>${tableRows}${totalRow}</tbody></table></div>`;
    }
};

const tableRenderStatusTindakLanjutDetail = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "UP3", "ULP", "SECTION", "KALI MUNCUL ARUS PICK-UP", "TINDAK LANJUT PICK-UP", "PERSENTASE"];
        const colors = {
            hijau: "bg-green-500 text-white dark:bg-green-200",
            kuning: "bg-yellow-500 text-white dark:bg-yellow-200",
            merah: "bg-red-500 text-white dark:bg-red-200",
        };

        const getPersentase = (persentase) => {
            if (persentase === 100) return colors.hijau;
            if (persentase >= 80 && persentase < 100) return colors.kuning;
            return colors.merah;
        };

        const dataDetail = data.reduce((acc, row) => {
            const selectUP3 = row[fields.select_up3];
            const selectULP = row[fields.select_ulp];
            const selectSection = row[fields.select_section];
            const tindakLanjut = row[fields.select_tindak_lanjut]?.toUpperCase() === "SUDAH";

            const keys = `${selectUP3}-${selectULP}-${selectSection}`;
            if (!acc[keys]) {
                acc[keys] = {
                    count: 0,
                    tindakLanjutCount: 0,
                    selectUP3,
                    selectULP,
                    selectSection,
                };
            }

            acc[keys].count += 1;
            if (tindakLanjut) acc[keys].tindakLanjutCount += 1;

            return acc;
        }, {});

        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { count, tindakLanjutCount, selectUP3, selectULP, selectSection } = details;
            const persentase = ((tindakLanjutCount / count) * 100).toFixed(2);
            const persentaseClass = getPersentase(parseFloat(persentase));

            return {
                no: index + 1,
                selectUP3,
                selectULP,
                selectSection,
                jumlah: count,
                tindakLanjutCount,
                persentase,
                persentaseClass,
            };
        });

        rankingData.sort((dataA, dataB) => parseFloat(dataB.jumlah) - parseFloat(dataA.jumlah));

        const tableRows = rankingData.map((row, index) => `
            <tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder">
                <td class="px-2 py-1.5">${index + 1}</td>
                <td class="px-2 py-1.5 text-start">${row.selectUP3}</td>
                <td class="px-2 py-1.5 text-start">${row.selectULP}</td>
                <td class="px-2 py-1.5">${row.selectSection}</td>
                <td class="px-2 py-1.5">${formatNumber(row.jumlah)}</td>
                <td class="px-2 py-1.5">${formatNumber(row.tindakLanjutCount)}</td>
                <td class="px-2 py-1.5 ${row.persentaseClass}">${row.persentase}%</td>
            </tr>
        `).join('');

        element.innerHTML = `
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta">
                    <thead class="bg-colorMeta/10 text-xs uppercase">
                        <tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }
};

const tableRenderStatusTindakLanjutULP = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "UP3", "ULP", "SUDAH", "BELUM", "PERSENTASE"];
        const colors = {
            hijau: "bg-green-500 text-white dark:bg-green-200",
            kuning: "bg-yellow-500 text-white dark:bg-yellow-200",
            merah: "bg-red-500 text-white dark:bg-red-200",
        };

        const getPersentase = (persentase) => {
            if (persentase === 100) return colors.hijau;
            if (persentase >= 80 && persentase < 100) return colors.kuning;
            return colors.merah;
        };

        const dataDetail = data.reduce((acc, row) => {
            const selectUP3 = row[fields.select_up3];
            const selectULP = row[fields.select_ulp];
            const tindakLanjutSudah = row[fields.select_tindak_lanjut]?.toUpperCase() === "SUDAH";
            const tindakLanjutBelum = row[fields.select_tindak_lanjut]?.toUpperCase() === "BELUM";

            const keys = `${selectULP}`;
            if (!acc[keys]) {
                acc[keys] = {
                    selectUP3,
                    selectULP,
                    tindakLanjutSudahCount: 0,
                    tindakLanjutBelumCount: 0,
                    count: 0,
                };
            }

            acc[keys].count += 1;
            if (tindakLanjutSudah) acc[keys].tindakLanjutSudahCount += 1;
            if (tindakLanjutBelum) acc[keys].tindakLanjutBelumCount += 1;

            return acc;
        }, {});

        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { selectUP3, selectULP, tindakLanjutSudahCount, tindakLanjutBelumCount, count } = details;

            // Menghitung persentase
            const percentage = count > 0 ? ((tindakLanjutSudahCount / count) * 100).toFixed(2) : "0.00";
            const persentaseClass = getPersentase(parseFloat(percentage));

            return {
                no: index + 1,
                selectUP3,
                selectULP,
                tindakLanjutSudahCount,
                tindakLanjutBelumCount,
                jumlah: count,
                persentase: `${percentage}%`,
                persentaseClass,
            };
        });

        // Sort rankingData jika diperlukan (contoh: berdasarkan jumlah atau persentase)
        // rankingData.sort((dataA, dataB) => parseFloat(dataB.persentase) - parseFloat(dataA.persentase));

        rankingData.sort((dataA, dataB) => dataA.selectUP3.localeCompare(dataB.selectUP3));

        const tableRows = rankingData.map((row, index) => `
            <tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder">
                <td class="px-2 py-1.5">${index + 1}</td>
                <td class="px-2 py-1.5 text-start">${row.selectUP3}</td>
                <td class="px-2 py-1.5 text-start">${row.selectULP}</td>
                <td class="px-2 py-1.5">${formatNumber(row.tindakLanjutSudahCount)}</td>
                <td class="px-2 py-1.5">${formatNumber(row.tindakLanjutBelumCount)}</td>
                <td class="px-2 py-1.5">${row.persentase}</td>
            </tr>
        `).join('');

        element.innerHTML = `
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta">
                    <thead class="bg-colorMeta/10 text-xs uppercase">
                        <tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }
};

const tableRenderStatusTindakLanjutULP1 = (data, elementSelector) => {
    const element = document.querySelector(elementSelector);
    if (element) {
        const headers = ["NO", "ULP", "SUDAH", "BELUM", "PERSENTASE"];
        const colors = {
            hijau: "bg-green-500 text-white dark:bg-green-200",
            kuning: "bg-yellow-500 text-white dark:bg-yellow-200",
            merah: "bg-red-500 text-white dark:bg-red-200",
        };

        const getPersentase = (persentase) => {
            if (persentase === 100) return colors.hijau;
            if (persentase >= 80 && persentase < 100) return colors.kuning;
            return colors.merah;
        };

        const dataDetail = data.reduce((acc, row) => {
            const selectUP3 = row[fields.select_up3];
            const selectULP = row[fields.select_ulp];
            const tindakLanjutSudah = row[fields.select_tindak_lanjut]?.toUpperCase() === "SUDAH";
            const tindakLanjutBelum = row[fields.select_tindak_lanjut]?.toUpperCase() === "BELUM";

            const keys = `${selectUP3}-${selectULP}`;
            if (!acc[keys]) {
                acc[keys] = {
                    selectUP3,
                    selectULP,
                    tindakLanjutSudahCount: 0,
                    tindakLanjutBelumCount: 0,
                    count: 0,
                };
            }

            acc[keys].count += 1;
            if (tindakLanjutSudah) acc[keys].tindakLanjutSudahCount += 1;
            if (tindakLanjutBelum) acc[keys].tindakLanjutBelumCount += 1;

            return acc;
        }, {});

        // Buat daftar ranking untuk setiap UP3 dan ULP
        const rankingData = Object.values(dataDetail).map((details, index) => {
            const { selectUP3, selectULP, tindakLanjutSudahCount, tindakLanjutBelumCount, count } = details;

            // Menghitung persentase
            const percentage = count > 0 ? ((tindakLanjutSudahCount / count) * 100).toFixed(2) : "0.00";
            const persentaseClass = getPersentase(parseFloat(percentage));

            return {
                selectUP3,
                selectULP,
                tindakLanjutSudahCount,
                tindakLanjutBelumCount,
                jumlah: count,
                persentase: `${percentage}%`,
                persentaseClass,
            };
        });

        // Urutkan UP3 sesuai urutan yang diinginkan
        const urutanUP3 = ["PONTIANAK", "MEMPAWAH", "SINGKAWANG", "SANGGAU", "KETAPANG"];

        // Mengelompokkan berdasarkan UP3 dan urutkan sesuai urutan
        const groupedData = rankingData.reduce((acc, row) => {
            if (!acc[row.selectUP3]) {
                acc[row.selectUP3] = [];
            }
            acc[row.selectUP3].push(row);
            return acc;
        }, {});

        const tableRows = urutanUP3.map((selectUP3) => {
            const rows = groupedData[selectUP3] || [];
            let totalSudah = 0;
            let totalBelum = 0;
            let totalCount = 0;

            const rowsHTML = rows.map((row, subIndex) => {
                totalSudah += row.tindakLanjutSudahCount;
                totalBelum += row.tindakLanjutBelumCount;
                totalCount += row.jumlah;

                return `
                    <tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder">
                        <td class="px-2 py-1.5">${subIndex + 1}</td>
                        <td class="px-2 py-1.5 text-start">${row.selectULP}</td>
                        <td class="px-2 py-1.5">${formatNumber(row.tindakLanjutSudahCount)}</td>
                        <td class="px-2 py-1.5">${formatNumber(row.tindakLanjutBelumCount)}</td>
                        <td class="px-2 py-1.5 ${row.persentaseClass}">${row.persentase}</td>
                    </tr>
                `;
            }).join('');

            const totalPersentase = totalCount > 0 ? ((totalSudah / totalCount) * 100).toFixed(2) : "0.00";
            const persentaseClass = getPersentase(parseFloat(totalPersentase));

            return `
                ${rowsHTML}
                <tr class="font-semibold text-colorBackground dark:text-colorBackground bg-colorText dark:bg-colorDarkText">
                    <td colspan="2" class="text-center pl-6 py-1.5">${selectUP3}</td>
                    <td class="px-2 py-1.5 text-center">${formatNumber(totalSudah)}</td>
                    <td class="px-2 py-1.5 text-center">${formatNumber(totalBelum)}</td>
                    <td class="px-2 py-1.5 text-center ${persentaseClass}">${totalPersentase}%</td>
                </tr>
            `;
        }).join('');

        element.innerHTML = `
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta">
                    <thead class="bg-colorMeta/10 text-xs uppercase">
                        <tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </div>
        `;
    }
};



const renderAll = (data) => {
    chartRender(data, '.chart_arus_pickup_up3', 'bar', 'ARUS PICK-UP PER UP3', chartRenderArusPickUpPerUP3);
    chartRender(data, '.chart_arus_pickup_fasa_netral', 'pie', 'ARUS PICK-UP PER FASA NETRAL', chartRenderArusPickUpPerFasaNetral);
    chartRender(data, '.chart_arus_pickup_up3_bulan', 'bar', 'ARUS PICK-UP PER BULAN (UP3)', chartRenderArusPickUpPerUP3Bulan);
    // chartRender(data, '.chart_arus_pickup_keypoint_bulan', 'line', 'ARUS PICK-UP PER BULAN (KEYPOINT)', chartRenderArusPickUpPerKeypointBulan);
    chartRender(data, '.chart_arus_pickup_status_tindak_lanjut', 'bar', 'STATUS TINDAK LANJUT ARUS PICK-UP', chartRenderArusPickUpStatusTindakLanjut);

    tableRenderArusPickUpKeypointBulan(data, '.table_arus_pickup_keypoint_bulan');
    tableRenderStatusTindakLanjutDetail(data, '.table_tindak_lanjut_detail');
    // tableRenderStatusTindakLanjutULP(data, '.table_tindak_lanjut_ulp');
    tableRenderStatusTindakLanjutULP1(data, '.table_tindak_lanjut_ulp1');
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