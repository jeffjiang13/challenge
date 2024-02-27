const apiUrl = 'https://app.astroport.fi/api/trpc/charts.prices?input=';
const queryPayload = {
  json: {
    tokens: [
      "ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9",
      "untrn"
    ],
    chainId: "neutron-1",
    dateRange: "D7"
  }
};

const urlEncodedPayload = encodeURIComponent(JSON.stringify(queryPayload));
const fullUrl = apiUrl + urlEncodedPayload;

fetch(fullUrl)
  .then(response => response.json())
  .then(data => {
    console.log("Received data:", data); // Add this to see the structure
    // Assume `data` needs to be processed differently
    const processedData = processData(data); // Adjust this function
    createChart(processedData);
  })
  .catch(error => console.error("Fetching error:", error));


  function processData(data) {
    // Assuming the 'series' array structure from the fetched data
    const seriesData = data.result.data.json['ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9'].series;

    // Use ISO strings or timestamps for the x-axis (time scale)
    const labels = seriesData.map(point => new Date(point.time * 1000).toISOString());
    const values = seriesData.map(point => point.value);

    const averagePrice = values.reduce((acc, value) => acc + value, 0) / values.length;
    const maxPrice = Math.max(...values);
    const minPrice = Math.min(...values);

    return {
        labels,
        datasets: [{
            label: 'Price',
            data: values.map((value, index) => ({ x: labels[index], y: value })),
            fill: false,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
        }],
        averagePrice,
        maxPrice,
        minPrice,
    };
}


function createChart({ labels, datasets, averagePrice, maxPrice, minPrice }) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    const priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true, // Ensures the y-axis starts at 0
                    title: {
                        display: true,
                        text: 'Price'
                    }
                },
                x: {
                    type: 'time', // If your labels are dates, this helps in formatting
                    time: {
                        unit: 'day', // Adjust according to your data (day, month, etc.)
                        tooltipFormat: 'll', // Formatting for tooltip
                    },
                    title: {
                        display: true,
                        text: 'Date'
                    },
                    ticks: {
                        source: 'labels', // Ensures ticks correspond to your labels
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Set to true if you want to display legend
                },
                title: {
                    display: true,
                    text: `Avg: ${averagePrice.toFixed(2)}, Max: ${maxPrice.toFixed(2)}, Min: ${minPrice.toFixed(2)}` // Ensure toFixed is used for formatting
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';

                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}
