const spreadsheetId = '1EyZ0U4_lsD5Xi3IBmNkz2Rgo4LV4OoWC3Ldw2E2GrBM';
const sheetName = 'Database';
const apiKey = 'AIzaSyDwiv0JN7BQeuc6XEYLBf_uTHhYZNj-65I';
const initialRangeStart = config.initialRangeStart || 1;
const rowsPerFetch = config.rowsPerFetch || 100;

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

const formatNumber = (number) => {
    return new Intl.NumberFormat().format(number);
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
        if (chartInstances[chartElementId]) {
            chartInstances[chartElementId].destroy();
        }

        chartInstances[chartElementId] = new Chart(ctx, {
            type: chartType,
            data: chartData.data,
            options: {
                ...chartData.options,
                plugins: {
                    ...chartData.options.plugins,
                    legend: {
                        ...chartData.options.plugins?.legend,
                        labels: {
                            font: {
                                family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                                size: 14, // Ukuran font
                                weight: 'normal', // Ketebalan font
                                barHeight: 1.2, // Tinggi baris font
                            }
                        }
                    }
                },
                scales: {
                    ...chartData.options.scales,
                    x: {
                        ...chartData.options.scales?.x,
                        ticks: {
                            font: {
                                family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                                size: 12, // Ukuran font untuk sumbu X
                            }
                        }
                    },
                    y: {
                        ...chartData.options.scales?.y,
                        ticks: {
                            font: {
                                family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                                size: 12, // Ukuran font untuk sumbu Y
                            }
                        }
                    }
                },
                title: {
                    ...chartData.options.title,
                    display: true,
                    text: title,
                    font: {
                        family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                        size: 16, // Ukuran font untuk judul
                        weight: 'bold', // Ketebalan font untuk judul
                    }
                }
            }
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
        return dataA[fields.select_cuaca].localeCompare(dataB[fields.select_cuaca]);
    });
};

const tableRender = (data) => {
    const headers = ["NO", "TAHUN", "BULAN", "TGL", "UP3", "ULP", "PENYULANG/KEYPOINT", "ZONA", "KELOMPOK GANGGUAN", "CUACA", "DURASI (Menit)", "JENIS GANGGUAN", "ENS (kWh)"];
    const tableHTML = tableDataSort(data).map(row => `<tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder">${row.map(cell => `<td class="px-6 py-4">${cell}</td>`).join('')}</tr>`).join('');

    const tableData = document.getElementById('data-visualization');
    if (tableData) {
        tableData.innerHTML = `<div class="relative overflow-x-auto shadow-md sm:rounded-lg"><table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta"><thead class="bg-colorMeta/10 text-xs uppercase"><tr>${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}</tr></thead><tbody>${tableHTML}</tbody></table></div>`;
    }
};

const tableRenderRanking = (data) => {
    const headers = ["NO", "UP3", "ULP", "PENYULANG", "JUMLAH", "KETERANGAN"];

    // Hitung jumlah penyebutan berdasarkan kombinasi UP3, ULP, dan Penyulang
    const up3Details = data.reduce((acc, row) => {
        const up3 = row[fields.select_up3];
        const ulp = row[fields.select_ulp];
        const penyulang = row[fields.select_penyulang];

        // Membuat key kombinasi unik berdasarkan UP3, ULP, dan Penyulang
        const key = `${up3}-${ulp}-${penyulang}`;

        // Menambahkan data jika kombinasi belum ada
        if (!acc[key]) {
            acc[key] = { count: 0, up3, ulp, penyulang };
        }

        // Menambah jumlah setiap kali ditemukan kombinasi yang sama
        acc[key].count += 1;
        return acc;
    }, {});

    // Format data untuk tabel ranking
    const rankingData = Object.values(up3Details).map((details, index) => {
        let keterangan = "";
        let keteranganClass = "";
        const { count, up3, ulp, penyulang } = details;

        if (count === 0) {
            keterangan = "EMAS";
            keteranganClass = "bg-yellow-500 text-white dark:bg-yellow-200"; // Emas
        }
        else if (count >= 1 && count <= 3) {
            keterangan = "HIJAU";
            keteranganClass = "bg-green-500 text-white dark:bg-green-200"; // Hijau
        }
        else if (count >= 4 && count <= 6) {
            keterangan = "SAKIT";
            keteranganClass = "bg-red-500 text-white dark:bg-red-200"; // Merah
        }
        else if (count >= 7) {
            keterangan = "KRONIS";
            keteranganClass = "bg-black text-white"; // Hitam
        }

        return {
            no: index + 1,
            up3,
            ulp,
            penyulang,
            jumlah: count,  // Jumlah berdasarkan kombinasi UP3, ULP, Penyulang
            keterangan,
            keteranganClass,  // Class warna untuk keterangan
        };
    });

    // Urutkan data berdasarkan 'jumlah' (count) dari yang rendah ke tinggi
    rankingData.sort((a, b) => b.jumlah - a.jumlah);

    // Render tabel
    const tableHTML = rankingData.map((row, index) => `
        <tr class="whitespace-nowrap border-b text-center border-colorBorder dark:border-colorDarkBorder">
            <td class="px-2 py-1">${index + 1}</td>
            <td class="px-2 py-1">${row.up3}</td>
            <td class="px-2 py-1">${row.ulp}</td>
            <td class="px-2 py-1">${row.penyulang}</td>
            <td class="px-2 py-1">${row.jumlah}</td>
            <td class="px-2 py-1 ${row.keteranganClass}">${row.keterangan}</td>
        </tr>
    `).join('');

    const tableData = document.getElementById('tableRanking');
    if (tableData) {
        tableData.innerHTML = `
            <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table class="w-full text-sm text-colorMeta dark:text-colorDarkMeta">
                    <thead class="bg-colorMeta/10 text-xs uppercase">
                        <tr>
                            ${headers.map(header => `<th scope="col" class="px-6 py-3">${header}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        ${tableHTML}
                    </tbody>
                </table>
            </div>
        `;
    }
};






const chartRenderJenisGangguanULP = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach(row => {
        const ulp = row[fields.select_ulp];
        const jenisGangguan = row[fields.select_jenis_gangguan];
        chartData[ulp] = chartData[ulp] || {};
        chartData[ulp][jenisGangguan] = (chartData[ulp][jenisGangguan] || 0) + 1;
        totalEntries += 1;
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
        label: 'JUMLAH',
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
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} JENIS GANGGUAN (ULP)`
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            const ulp = tooltipItem.label;
                            return `JUMLAH: ${formatNumber(totalPerULP[ulp])}`;
                        }
                    }
                },
            },
            scales: {
                x: { beginAtZero: true },
                y: { beginAtZero: true }
            },
        },
    };
};

const chartRenderJenisGangguanUP3 = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach(row => {
        const up3 = row[fields.select_up3];
        const jenisGangguan = row[fields.select_jenis_gangguan];
        chartData[up3] = chartData[up3] || {};
        chartData[up3][jenisGangguan] = (chartData[up3][jenisGangguan] || 0) + 1;
        totalEntries += 1; // Increment total count
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
        label: 'JUMLAH',
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
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} JENIS GANGGUAN (UP3)` // Include total entries in title
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            const up3 = tooltipItem.label;
                            return `JUMLAH: ${formatNumber(totalPerUP3[up3])}`;
                        }
                    }
                },
            }
        },
    };
};

const chartRenderPenyebabGangguan = (data) => {
    const chartData = {};
    let totalEntries = 0;

    data.forEach(row => {
        const penyebabGangguan = row[fields.select_kelompok_gangguan];
        chartData[penyebabGangguan] = (chartData[penyebabGangguan] || 0) + 1;
        totalEntries += 1; // Increment total count
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
                title: {
                    display: true,
                    text: `TOTAL ${formatNumber(totalEntries)} PENYEBAB GANGGUAN` // Include total entries in title
                },
                tooltip: {
                    callbacks: {
                        afterLabel: function (tooltipItem) {
                            return `JUMLAH: ${formatNumber(total)}`;
                        },
                    }
                },
                legend: {
                    position: 'bottom', // Legend at the bottom
                    labels: {
                        boxWidth: 20,
                        padding: 10,
                    }
                },
            },
        },
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

            tableRenderRanking(filteredData);
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        document.querySelector('.loaders').classList.add('hidden');
        document.documentElement.classList.remove('overflow-hidden');
    }
};

const adjustCanvasHeight = () => {
    const canvas = document.querySelectorAll(['.chart_jenis_gangguan_ulp', '.chart_jenis_gangguan_up3', '.chart_penyebab_gangguan', '.chart_ens']);
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

    tableRenderRanking(filteredData);

    document.querySelector('.loaders').classList.add('hidden');
    document.documentElement.classList.remove('overflow-hidden');
}));

// window.addEventListener('resize', adjustCanvasHeight);
fetchData(initialRangeStart);
