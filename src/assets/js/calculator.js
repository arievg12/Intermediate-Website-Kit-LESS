document.addEventListener('DOMContentLoaded', () => {
    // Define your package and add-on data
    const packageData = {
        'micro-business': {
            label: 'Micro Business',
            subscription: { upfront: 0, monthly: 99 },
            lumpSum: { upfront: 1499, monthly: 25 } // Assuming lump sum also has a monthly component
        },
        'small-business': {
            label: 'Small Business',
            subscription: { upfront: 0, monthly: 149 },
            lumpSum: { upfront: 1999, monthly: 25 }
        }
    };

    const addOnData = {
        'addonGoogleMyBusiness': { monthly: 25, label: 'Google My Business Management' },
        'addonLogoCreation': { upfront: 150, label: 'Logo Creation' },
        'addonGoogleAnalytics': { monthly: 25, label: 'Google Analytics Setup' }
    };

    // Get references to package radio buttons
    const packageRadios = document.querySelectorAll('input[name="package"]');
    
    // Get references to add-on checkboxes
    const addonGoogleMyBusiness = document.getElementById('addonGoogleMyBusiness');
    const addonLogoCreation = document.getElementById('addonLogoCreation');
    const addonGoogleAnalytics = document.getElementById('addonGoogleAnalytics');

    const costTableBody = document.querySelector('#costTable tbody');
    const ctx = document.getElementById('costChart').getContext('2d');

    // Initialize Chart.js chart
    let costChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [], // Months will go here
            datasets: [
                {
                    label: 'Subscription Plan Total',
                    data: [], // Costs will go here
                    borderColor: 'rgb(54, 162, 235)', // Blue line
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'Lump Sum Plan Total',
                    data: [], // Costs will go here
                    borderColor: 'rgb(255, 99, 132)', // Red line
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Months'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cost ($)'
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });

    // Function to calculate and update costs
    const calculateCosts = () => {
        // 1. Determine selected package
        let selectedPackageKey = '';
        for (const radio of packageRadios) {
            if (radio.checked) {
                selectedPackageKey = radio.value;
                break;
            }
        }
        const currentPackage = packageData[selectedPackageKey];

        // Get base package costs
        const baseSubUpfront = currentPackage.subscription.upfront;
        const baseSubMonthly = currentPackage.subscription.monthly;
        const baseLumpUpfront = currentPackage.lumpSum.upfront;
        const baseLumpMonthly = currentPackage.lumpSum.monthly;

        const maxMonths = 36; // Max months to display
        const months = [];
        const subCosts = [];
        const lumpCosts = [];

        // Clear existing table rows
        costTableBody.innerHTML = '';

        for (let month = 0; month <= maxMonths; month++) {
            months.push(month);

            let currentSubCost = baseSubUpfront + (baseSubMonthly * month);
            let currentLumpCost = baseLumpUpfront + (baseLumpMonthly * month); 

            // 2. Add Add-on costs if selected
            if (addonGoogleMyBusiness.checked) {
                currentSubCost += (addOnData.addonGoogleMyBusiness.monthly * month*0); //subscription included google my business, no added cost.
                currentLumpCost += (addOnData.addonGoogleMyBusiness.monthly * month);
            }
            if (addonLogoCreation.checked) {
                // Logo creation is once-off, so it adds to upfront cost for both
                currentSubCost += addOnData.addonLogoCreation.upfront;
                currentLumpCost += addOnData.addonLogoCreation.upfront;
            }
            if (addonGoogleAnalytics.checked) {
                currentSubCost += (addOnData.addonGoogleAnalytics.monthly * month*0); //subscription included google analytics, no added cost.
                currentLumpCost += (addOnData.addonGoogleAnalytics.monthly * month);
            }
            
            subCosts.push(currentSubCost);
            lumpCosts.push(currentLumpCost);

            // Populate table row
            const row = costTableBody.insertRow();
            const cellMonth = row.insertCell(0);
            const cellSubCost = row.insertCell(1);
            const cellLumpCost = row.insertCell(2);

            cellMonth.textContent = month;
            // Format to currency for display
            cellSubCost.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(currentSubCost);
            cellLumpCost.textContent = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(currentLumpCost);
        }

        // Update chart data
        costChart.data.labels = months;
        costChart.data.datasets[0].data = subCosts;
        costChart.data.datasets[1].data = lumpCosts;
        costChart.update();
    };

    // Add event listeners to all package radio buttons
    for (const radio of packageRadios) {
        radio.addEventListener('change', calculateCosts);
    }
    
    // Add event listeners to all add-on checkboxes
    addonGoogleMyBusiness.addEventListener('change', calculateCosts);
    addonLogoCreation.addEventListener('change', calculateCosts);
    addonGoogleAnalytics.addEventListener('change', calculateCosts);

    // Initial calculation on page load
    calculateCosts();
});