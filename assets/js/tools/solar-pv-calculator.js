document.addEventListener('DOMContentLoaded', () => {
    const systemModeSelect = document.getElementById('system-mode');
    const dailyEnergyInput = document.getElementById('daily-energy');
    const sunHoursInput = document.getElementById('sun-hours');
    const autonomyDaysInput = document.getElementById('autonomy-days');
    const batteryDodInput = document.getElementById('battery-dod');
    
    const panelWattageInput = document.getElementById('panel-wattage');
    const panelVocInput = document.getElementById('panel-voc');
    const panelVmpInput = document.getElementById('panel-vmp');
    const vocTempCoeffInput = document.getElementById('voc-temp-coeff');
    
    const minTempInput = document.getElementById('min-temp');
    const maxTempInput = document.getElementById('max-temp');
    const inverterMaxVInput = document.getElementById('inverter-max-v');
    const systemEfficiencyInput = document.getElementById('system-efficiency');
    
    const offgridOptions = document.getElementById('offgrid-options');
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');
    const batteryResultBox = document.getElementById('battery-result-box');

    const resSystemSize = document.getElementById('res-system-size');
    const resPanelCount = document.getElementById('res-panel-count');
    const resInverterSize = document.getElementById('res-inverter-size');
    const resDailyGen = document.getElementById('res-daily-gen');
    const resColdVoc = document.getElementById('res-cold-voc');
    const resHotVmp = document.getElementById('res-hot-vmp');
    const resBatteryBank = document.getElementById('res-battery-bank');
    const resMpptStatus = document.getElementById('res-mppt-status');

    if (!calcBtn) return;

    // Toggle Off-Grid Options Visibility
    systemModeSelect.addEventListener('change', () => {
        if (systemModeSelect.value === 'off-grid') {
            offgridOptions.style.display = 'flex';
        } else {
            offgridOptions.style.display = 'none';
        }
    });

    calcBtn.addEventListener('click', () => {
        const mode = systemModeSelect.value;
        const dailyEnergy = parseFloat(dailyEnergyInput.value);
        const sunHours = parseFloat(sunHoursInput.value);
        const panelWattage = parseFloat(panelWattageInput.value);
        const panelVoc = parseFloat(panelVocInput.value);
        const panelVmp = parseFloat(panelVmpInput.value);
        const vocCoeff = parseFloat(vocTempCoeffInput.value); // e.g. -0.29 %/°C
        const minTemp = parseFloat(minTempInput.value);
        const maxTemp = parseFloat(maxTempInput.value);
        const inverterMaxV = parseFloat(inverterMaxVInput.value);
        const efficiencyPercent = parseFloat(systemEfficiencyInput.value);

        if (isNaN(dailyEnergy) || dailyEnergy <= 0 ||
            isNaN(sunHours) || sunHours <= 0 ||
            isNaN(panelWattage) || panelWattage <= 0 ||
            isNaN(panelVoc) || panelVoc <= 0 ||
            isNaN(panelVmp) || panelVmp <= 0 ||
            isNaN(minTemp) || isNaN(maxTemp) ||
            isNaN(inverterMaxV) || inverterMaxV <= 0 ||
            isNaN(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100) {
            alert('Please check all input values and enter valid engineering parameters.');
            return;
        }

        const efficiency = efficiencyPercent / 100;

        // 1. Array Sizing (kWp)
        const systemSizeKW = dailyEnergy / (sunHours * efficiency);
        const totalWattsNeeded = systemSizeKW * 1000;
        const exactPanelCount = totalWattsNeeded / panelWattage;
        const roundedPanelCount = Math.ceil(exactPanelCount);

        // 2. Inverter Recommendation (typically sized at 80% to 100% of array kWp)
        const recommendedInverterKW = systemSizeKW;

        // 3. Daily & Monthly Generation
        const dailyGeneration = systemSizeKW * sunHours * efficiency;

        // 4. Temperature-Corrected Voc (Cold Morning Extreme per NEC 690.7)
        // Formula: Voc_cold = Voc * [1 + (Coeff / 100) * (T_min - 25)]
        const tempDiffCold = minTemp - 25;
        const correctionFactorVoc = 1 + ((vocCoeff / 100) * tempDiffCold);
        const coldVocPerPanel = panelVoc * correctionFactorVoc;

        // Assuming a standard string size based on max inverter voltage constraint or recommended panel count
        // Let's compute max panels per string allowed under inverter max voltage limit
        const maxPanelsPerString = Math.floor(inverterMaxV / coldVocPerPanel);
        const totalColdVocString = maxPanelsPerString * coldVocPerPanel;

        // 5. Hot Weather Vmp (Cell temperature typically ambient + 30°C mounting adder)
        const cellTempHot = maxTemp + 30;
        const tempDiffHot = cellTempHot - 25;
        // Assuming Vmp temp coefficient is similar or approximated around vocCoeff - 0.05%
        const vmpCoeff = vocCoeff - 0.05; 
        const hotVmpPerPanel = panelVmp * (1 + ((vmpCoeff / 100) * tempDiffHot));
        const totalHotVmpString = maxPanelsPerString * hotVmpPerPanel;

        // 6. Battery Autonomy (If Off-Grid)
        let batteryStorageKWh = 0;
        if (mode === 'off-grid') {
            const autonomyDays = parseFloat(autonomyDaysInput.value) || 2;
            const dod = (parseFloat(batteryDodInput.value) || 80) / 100;
            batteryStorageKWh = (dailyEnergy * autonomyDays) / dod;
            batteryResultBox.style.display = 'flex';
            resBatteryBank.textContent = `${batteryStorageKWh.toFixed(1)} kWh`;
        } else {
            batteryResultBox.style.display = 'none';
        }

        // 7. MPPT & Compliance Check
        let mpptStatusText = "Pass: Optimal String Voltage Window";
        if (totalColdVocString > inverterMaxV) {
            mpptStatusText = `Warning: Cold Voc (${totalColdVocString.toFixed(0)}V) exceeds inverter limit (${inverterMaxV}V)! Reduce string length.`;
        } else {
            mpptStatusText = `Safe: Max String (${maxPanelsPerString} panels) = ${totalColdVocString.toFixed(0)}V Voc (Limit: ${inverterMaxV}V)`;
        }

        // Output Display Formatting
        resSystemSize.textContent = `${systemSizeKW.toFixed(2)} kWp`;
        resPanelCount.textContent = `${roundedPanelCount} units (${exactPanelCount.toFixed(1)} exact)`;
        resInverterSize.textContent = `${recommendedInverterKW.toFixed(2)} kW AC`;
        resDailyGen.textContent = `${dailyGeneration.toFixed(2)} kWh`;
        resColdVoc.textContent = `${coldVocPerPanel.toFixed(2)} V/panel (${totalColdVocString.toFixed(1)}V string)`;
        resHotVmp.textContent = `${hotVmpPerPanel.toFixed(2)} V/panel`;
        resMpptStatus.textContent = mpptStatusText;

        resultsSection.style.display = 'block';
    });

    resetBtn.addEventListener('click', () => {
        systemModeSelect.value = 'grid-tied';
        offgridOptions.style.display = 'none';
        dailyEnergyInput.value = '15';
        sunHoursInput.value = '5.0';
        autonomyDaysInput.value = '2';
        batteryDodInput.value = '80';
        panelWattageInput.value = '400';
        panelVocInput.value = '48.5';
        panelVmpInput.value = '40.2';
        vocTempCoeffInput.value = '-0.29';
        minTempInput.value = '-5';
        maxTempInput.value = '45';
        inverterMaxVInput.value = '600';
        systemEfficiencyInput.value = '80';
        resultsSection.style.display = 'none';
        dailyEnergyInput.focus();
    });
});
