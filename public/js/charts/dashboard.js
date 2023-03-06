// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';
var ctx = document.getElementById("topDatesAreaChart");
let topDatesLineChart = new Chart(ctx);
getChart();

function date_format(date) {
    return date.split("-").reverse().slice(0, 2).join("-");
}

function getChart() {
    topDatesLineChart.destroy();
    let nowTime = new Date();
    let startTime = $('#start-time').val() || '2022-10';
    let endTime = $('#end-time').val() || nowTime.toISOString().slice(0, 10);

    fetch(`api/lessons/top-dates?start_date=${startTime}&end_date=${endTime}`)
        .then(res => res.json())
        .then(data => {
            console.log(data)
            // Area Chart Example
            
            topDatesLineChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.thisPeriod.map(ele => date_format(ele._id)),
                    datasets: [{
                        label: date_format(data.thisPeriod[0]._id) + '~' + date_format(data.thisPeriod[data.thisPeriod.length - 1]._id),
                        lineTension: 0.3,
                        backgroundColor: "rgba(78, 115, 223, 0.05)",
                        borderColor: "rgba(78, 115, 223, 1)",
                        pointRadius: 3,
                        pointBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointBorderColor: "rgba(78, 115, 223, 1)",
                        pointHoverRadius: 3,
                        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                        pointHitRadius: 10,
                        pointBorderWidth: 2,
                        data: data.thisPeriod.map(ele => ele.total)
                    },
                    {
                        label: date_format(data.lastPeriod[0]._id) + '~' + date_format(data.lastPeriod[data.lastPeriod.length - 1]._id),
                        lineTension: 0.3,
                        backgroundColor: "rgba(133,135,150,0.05)",
                        borderColor: "rgba(133,135,150, 0.5)",
                        pointRadius: 3,
                        pointBackgroundColor: "rgba(133,135,150, 0.5)",
                        pointBorderColor: "rgba(133,135,150, 0.5)",
                        pointHoverRadius: 3,
                        pointHoverBackgroundColor: "rgba(133,135,150, 1)",
                        pointHoverBorderColor: "rgba(133,135,150, 1)",
                        pointHitRadius: 10,
                        pointBorderWidth: 2,
                        data: data.lastPeriod.map(ele => ele.total)
                    }],
                },
                options: {
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            left: 10,
                            right: 25,
                            top: 25,
                            bottom: 0
                        }
                    },
                    scales: {
                        xAxes: [{
                            time: {
                                unit: 'date'
                            },
                            gridLines: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                maxTicksLimit: 7
                            }
                        }],
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                maxTicksLimit: 5,
                                padding: 10,
                                // Include a dollar sign in the ticks
                                callback: function (value, index, values) {
                                    return value + 'HS';
                                }
                            },
                            gridLines: {
                                color: "rgb(234, 236, 244)",
                                zeroLineColor: "rgb(234, 236, 244)",
                                drawBorder: false,
                                borderDash: [2],
                                zeroLineBorderDash: [2]
                            }
                        }],
                    },
                    tooltips: {
                        backgroundColor: "rgb(255,255,255)",
                        bodyFontColor: "#858796",
                        titleMarginBottom: 10,
                        titleFontColor: '#6e707e',
                        titleFontSize: 14,
                        borderColor: '#dddfeb',
                        borderWidth: 1,
                        xPadding: 15,
                        yPadding: 15,
                        displayColors: false,
                        intersect: false,
                        mode: 'index',
                        caretPadding: 10,
                        callbacks: {
                            label: function (tooltipItem, chart) {
                                console.log(tooltipItem);
                                if (tooltipItem.datasetIndex == 0) {
                                    return date_format(data.thisPeriod[tooltipItem.index]._id) + ': ' + tooltipItem.yLabel + 'HS';
                                }
                                return date_format(data.lastPeriod[tooltipItem.index]._id) + ': ' + tooltipItem.yLabel + 'HS';

                            }
                        }
                    }
                }
            });
        })
}

$('#start-time').on('change', getChart);
$('#end-time').on('change', getChart);

