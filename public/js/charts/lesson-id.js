// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var ratingCtx = document.getElementById("ratingChart");
var typeCtx = document.getElementById("typeChart");

fetch('/api/lessons/date-data?date=' + ratingCtx.dataset.date)
    .then(res => res.json())
    .then(data => {
        var ratingChart = new Chart(ratingCtx, {
            type: 'doughnut',
            data: {
                labels: ["Tốt", "Khá", "Trung bình", "Yếu", "Chưa đánh giá"],
                datasets: [{
                    data: data.rating,
                    backgroundColor: ['#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#f8f9fc'],
                    //  hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                    backgroundColor: "rgb(255,255,255)",
                    bodyFontColor: "#858796",
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    xPadding: 5,
                    yPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                },
                cutoutPercentage: 70,
            },
        });
        var typeChart = new Chart(typeCtx, {
            type: 'doughnut',
            data: {
                labels: ["Lý thuyết", "Bài tập", "Chưa rõ"],
                datasets: [{
                    data: data.type,
                    backgroundColor: ['#4e73df', '#858796', '#f8f9fc'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }],
            },
            options: {
                maintainAspectRatio: false,
                tooltips: {
                    backgroundColor: "rgb(255,255,255)",
                    bodyFontColor: "#858796",
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    xPadding: 5,
                    yPadding: 5,
                    displayColors: false,
                    caretPadding: 5,
                },
                cutoutPercentage: 70,
            },
        });
    })