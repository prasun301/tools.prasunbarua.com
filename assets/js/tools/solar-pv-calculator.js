document.addEventListener('DOMContentLoaded', () => {
    const dailyEnergyInput = document.getElementById('daily-energy');
    const sunHoursInput = document.getElementById('sun-hours');
    const panelWattageInput = document.getElementById('panel-wattage');
    const systemEfficiencyInput = document.getElementById('system-efficiency');
    
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');

    const resSystemSize = document.getElementById('res-system-size');
    const resPanelCount = document.getElementById('res-panel-count');
    const resDailyGen = document.getElementById('res-daily-gen');
    const resMonthlyGen = document.getElementById('res-monthly-gen');

    if (!calcBtn) return;

    calcBtn.addEventListener('click', () => {
        const dailyEnergy = parseFloat(dailyEnergyInput.value);
        const sunHours = parseFloat(sunHoursInput.value);
        const panelWattage = parseFloat(panelWattageInput.value);
        const efficiencyPercent = parseFloat(systemEfficiencyInput.value);

        if (isNaN(dailyEnergy) || dailyEnergy <= 0 ||
            isNaN(sunHours) || sunHours <= 0 ||
            isNaN(panelWattage) || panelWattage <= 0 ||
            isNaN(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100) {
            alert('Please enter valid positive numbers for all parameters. Efficiency must be between 1 and 100.');
            return;
        }

        const efficiency = efficiencyPercent / 100;

        // Engineering Calculations
        // System Size in kW = Daily Energy / (Peak Sun Hours * Efficiency)
        const systemSizeKW = dailyEnergy / (sunHours * efficiency);

        // Total Panel Count = (System Size in Watts) / Panel Wattage
        const totalWattsNeeded = systemSizeKW * 1000;
        const exactPanelCount = totalWattsNeeded / panelWattage;
        const roundedPanelCount = Math.ceil(exactPanelCount);

        // Daily Generation = System Size (kW) * Peak Sun Hours * Efficiency
        const dailyGeneration = systemSizeKW * sunHours * efficiency;

        // Monthly Generation = Daily Generation * 30 days
        const monthlyGeneration = dailyGeneration * 30;

        // Output Display Formatting
        resSystemSize.textContent = `${systemSizeKW.toFixed(2)} kW`;
        resPanelCount.textContent = `${roundedPanelCount} units (${exactPanelCount.toFixed(1)} exact)`;
        resDailyGen.textContent = `${dailyGeneration.toFixed(2)} kWh`;
        resMonthlyGen.textContent = `${monthlyGeneration.toFixed(1)} kWh`;

        resultsSection.style.display = 'block';
    });

    resetBtn.addEventListener('click', () => {
        dailyEnergyInput.value = '';
        sunHoursInput.value = '5';
        panelWattageInput.value = '400';
        systemEfficiencyInput.value = '80';
        resultsSection.style.display = 'none';
        dailyEnergyInput.focus();
    });
});
