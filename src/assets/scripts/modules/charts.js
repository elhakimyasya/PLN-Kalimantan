const chartInstances = {};

export const chartRender = (data, chartElementSelector, chartType, chartTitle, chartFunction) => {
    const element = document.querySelector(chartElementSelector);
    if (element) {
        const context = element.getContext('2d');

        const chartData = chartFunction(data);

        if (chartData) {
            if (chartInstances[chartElementSelector]) {
                chartInstances[chartElementSelector].destroy();
            }

            chartInstances[chartElementSelector] = new Chart(context, {
                type: chartType,
                data: chartData.data,
                options: {
                    ...chartData.options,
                    plugins: {
                        ...chartData.options.plugins,
                        title: {
                            ...chartData.options.plugins?.title,
                            font: {
                                family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                            }
                        },
                        legend: {
                            ...chartData.options.plugins?.legend,
                            labels: {
                                font: {
                                    family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
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
                                }
                            }
                        },
                        y: {
                            ...chartData.options.scales?.y,
                            ticks: {
                                font: {
                                    family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                                }
                            }
                        }
                    },
                    title: {
                        ...chartData.options.title,
                        display: true,
                        text: chartTitle,
                        font: {
                            family: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
                        }
                    }
                }
            });
        } else {
            document.querySelector(chartElementSelector).classList.add('hidden');
        }
    }
};

export const chartRandomColor = () => {
    const materialColors = [
        "#F44336", "#E91E63", "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4", "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107", "#FF9800", "#FF5722", "#795548", "#9E9E9E", "#607D8B", "#D32F2F", "#1976D2", "#388E3C", "#0288D1", "#8E24AA", "#7B1FA2", "#0288D1", "#5C6BC0", "#FF5722", "#673AB7", "#FF7043", "#2196F3", "#673AB7", "#0097A7", "#4CAF50", "#388E3C", "#FF9800", "#8BC34A", "#F57C00", "#FF3D00", "#795548", "#78909C", "#536DFE", "#FF4081", "#18FFFF", "#00C853", "#FFAB00", "#8D6E63", "#9E9E9E", "#607D8B", "#00E5FF", "#FF5722", "#00B8D4", "#E64A19", "#FBC02D", "#29B6F6", "#7E57C2"
    ];

    return materialColors[Math.floor(Math.random() * materialColors.length)];
};