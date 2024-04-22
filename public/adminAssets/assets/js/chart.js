// $(function() {
//   /* ChartJS
//    * -------
//    * Data and config for chartjs
//    */
//   'use strict';
//   var paymentMethod = {
//     labels: ["2013", "2014", "20148347", "2015", "2016", "2017"],
//     datasets: [{
//       label: '# of Votes',
//       data: [4, 1, 3, 5, 2, 3],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.2)',
//         'rgba(54, 162, 235, 0.2)',
//         'rgba(255, 206, 86, 0.2)',
//         'rgba(75, 192, 192, 0.2)',
//         'rgba(153, 102, 255, 0.2)',
//         'rgba(255, 159, 64, 0.2)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//       borderWidth: 1,
//       fill: false
//     }]
//   };


//   //sales report
//   var salesReport = {
//     labels: ["2013", "2014", "20148347", "2015", "2016", "2017"],
//     datasets: [{
//       label: '# of Votes',
//       data: [20, 19, 20, 20, 20, 3],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.2)',
//         'rgba(54, 162, 235, 0.2)',
//         'rgba(255, 206, 86, 0.2)',
//         'rgba(75, 192, 192, 0.2)',
//         'rgba(153, 102, 255, 0.2)',
//         'rgba(255, 159, 64, 0.2)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//       borderWidth: 1,
//       fill: false
//     }]
//   };

//   var options = {
//     scales: {
//       yAxes: [{
//         ticks: {
//           beginAtZero: true
//         },
//         gridLines: {
//           color: "rgba(204, 204, 204,0.1)"
//         }
//       }],
//       xAxes: [{
//         gridLines: {
//           color: "rgba(204, 204, 204,0.1)"
//         }
//       }]
//     },
//     legend: {
//       display: false
//     },
//     elements: {
//       point: {
//         radius: 0
//       }
//     }
//   };

  
//   var top3Categories = {
//     datasets: [{
//       data: [90, 5, 5],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.5)',
//         'rgba(54, 162, 235, 0.5)',
//         'rgba(255, 206, 86, 0.5)',
//         'rgba(75, 192, 192, 0.5)',
//         'rgba(153, 102, 255, 0.5)',
//         'rgba(255, 159, 64, 0.5)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//     }],

//     // These labels appear in the legend and in the tooltips when hovering different arcs
//     labels: [
//       'Pink',
//       'Blue',
//       'Yellow',
//     ]
//   };
//   var top3Products = {
//     datasets: [{
//       data: [10, 80, 10],
//       backgroundColor: [
//         'rgba(255, 99, 132, 0.5)',
//         'rgba(54, 162, 235, 0.5)',
//         'rgba(255, 206, 86, 0.5)',
//         'rgba(75, 192, 192, 0.5)',
//         'rgba(153, 102, 255, 0.5)',
//         'rgba(255, 159, 64, 0.5)'
//       ],
//       borderColor: [
//         'rgba(255,99,132,1)',
//         'rgba(54, 162, 235, 1)',
//         'rgba(255, 206, 86, 1)',
//         'rgba(75, 192, 192, 1)',
//         'rgba(153, 102, 255, 1)',
//         'rgba(255, 159, 64, 1)'
//       ],
//     }],

//     // These labels appear in the legend and in the tooltips when hovering different arcs
//     labels: [
//       'Pink',
//       'Blue',
//       'Yellow',
//     ]
//   };
//   var doughnutPieOptions = {
//     responsive: true,
//     animation: {
//       animateScale: true,
//       animateRotate: true
//     }
//   };
 


//   // Get context with jQuery - using jQuery's .get() method.
//   if ($("#barChart").length) {
//     var barChartCanvas = $("#barChart").get(0).getContext("2d");
//     // This will get the first returned node in the jQuery collection.
//     var barChart = new Chart(barChartCanvas, {
//       type: 'bar',
//       data: paymentMethod,
//       options: options
//     });
//   }

//   if ($("#lineChart").length) {
//     var lineChartCanvas = $("#lineChart").get(0).getContext("2d");
//     var lineChart = new Chart(lineChartCanvas, {
//       type: 'line',
//       data: salesReport,
//       options: options
//     });
//   }




//   if ($("#doughnutChart").length) {
//     var doughnutChartCanvas = $("#doughnutChart").get(0).getContext("2d");
//     var doughnutChart = new Chart(doughnutChartCanvas, {
//       type: 'doughnut',
//       data: top3Categories,
//       options: doughnutPieOptions
//     });
//   }

//   if ($("#pieChart").length) {
//     var pieChartCanvas = $("#pieChart").get(0).getContext("2d");
//     var pieChart = new Chart(pieChartCanvas, {
//       type: 'pie',
//       data: top3Products,
//       options: doughnutPieOptions
//     });
//   }


// });