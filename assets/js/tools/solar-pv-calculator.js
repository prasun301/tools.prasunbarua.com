'use strict';

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

    // Toggle Off-Grid Options Visibility with smooth state handling
    const handleSystemModeChange = () => {
        if (systemModeSelect.value === 'off-grid') {
            offgridOptions.style.display = 'flex';
        } else {
            offgridOptions.style.display = 'none';
        }
    };

    systemModeSelect.addEventListener('change', handleSystemModeChange);
    handleSystemModeChange(); // Initial check on load

    // Helper to highlight invalid input fields professionally
    const setFieldError = (inputEl, isError) => {
        if (isError) {
            inputEl.classList.add('input-error');
        } else {
            inputEl.classList.remove('input-error');
        }
    };

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

        // Apply field-level validation styling
        setFieldError(dailyEnergyInput, isNaN(dailyEnergy) || dailyEnergy <= 0);
        setFieldError(sunHoursInput, isNaN(sunHours) || sunHours <= 0);
        setFieldError(panelWattageInput, isNaN(panelWattage) || panelWattage <= 0);
        setFieldError(panelVocInput, isNaN(panelVoc) || panelVoc <= 0);
        setFieldError(panelVmpInput, isNaN(panelVmp) || panelVmp <= 0);
        setFieldError(vocTempCoeffInput, isNaN(vocCoeff));
        setFieldError(minTempInput, isNaN(minTemp));
        setFieldError(maxTempInput, isNaN(maxTemp));
        setFieldError(inverterMaxVInput, isNaN(inverterMaxV) || inverterMaxV <= 0);
        setFieldError(systemEfficiencyInput, isNaN(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100);

        if (
            isNaN(dailyEnergy) || dailyEnergy <= 0 ||
            isNaN(sunHours) || sunHours <= 0 ||
            isNaN(panelWattage) || panelWattage <= 0 ||
            isNaN(panelVoc) || panelVoc <= 0 ||
            isNaN(panelVmp) || panelVmp <= 0 ||
            isNaN(minTemp) || isNaN(maxTemp) ||
            isNaN(inverterMaxV) || inverterMaxV <= 0 ||
            isNaN(efficiencyPercent) || efficiencyPercent <= 0 || efficiencyPercent > 100
        ) {
            // Display professional inline validation banner instead of blocking alert popup
            let existingBanner = document.getElementById('calc-error-banner');
            if (!existingBanner) {
                existingBanner = document.createElement('div');
                existingBanner.id = 'calc-error-banner';
                existingBanner.className = 'error-banner';
                existingBanner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">error</span> Please review highlighted fields and enter valid engineering parameters.`;
                calcBtn.closest('form').prepend(existingBanner);
                existingBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                setTimeout(() => existingBanner.remove(), 6000);
            }
            return;
        }

        // Remove error banner if inputs are valid
        const existingBanner = document.getElementById('calc-error-banner');
        if (existingBanner) existingBanner.remove();

        const efficiency = efficiencyPercent / 100;

        // 1. Array Sizing (kWp)
        const systemSizeKW = dailyEnergy / (sunHours * efficiency);
        const totalWattsNeeded = systemSizeKW * 1000;
        const exactPanelCount = totalWattsNeeded / panelWattage;
        const roundedPanelCount = Math.ceil(exactPanelCount);

        // 2. Inverter Recommendation (sized at 100% of array kWp)
        const recommendedInverterKW = systemSizeKW;

        // 3. Daily Energy Generation
        const dailyGeneration = systemSizeKW * sunHours * efficiency;

        // 4. Temperature-Corrected Voc (Cold Morning Extreme per NEC 690.7)
        const tempDiffCold = minTemp - 25;
        const correctionFactorVoc = 1 + ((vocCoeff / 100) * tempDiffCold);
        const coldVocPerPanel = panelVoc * correctionFactorVoc;

        const maxPanelsPerString = Math.floor(inverterMaxV / coldVocPerPanel);
        const totalColdVocString = maxPanelsPerString * coldVocPerPanel;

        // 5. Hot Weather Vmp (Cell temperature typically ambient + 30°C mounting adder)
        const cellTempHot = maxTemp + 30;
        const tempDiffHot = cellTempHot - 25;
        const vmpCoeff = vocCoeff - 0.05; 
        const hotVmpPerPanel = panelVmp * (1 + ((vmpCoeff / 100) * tempDiffHot));

        // 6. Battery Autonomy (If Off-Grid)
        if (mode === 'off-grid') {
            const autonomyDays = parseFloat(autonomyDaysInput.value) || 2;
            const dod = (parseFloat(batteryDodInput.value) || 80) / 100;
            const batteryStorageKWh = (dailyEnergy * autonomyDays) / dod;
            batteryResultBox.style.display = 'flex';
            resBatteryBank.textContent = `${batteryStorageKWh.toFixed(1)} kWh`;
        } else {
            batteryResultBox.style.display = 'none';
        }

        // 7. MPPT & Compliance Check
        let mpptStatusClass = 'badge-success';
        let mpptStatusText = '';
        if (totalColdVocString > inverterMaxV) {
            mpptStatusClass = 'badge-danger';
            mpptStatusText = `Warning: Cold Voc (${totalColdVocString.toFixed(0)}V) exceeds inverter limit (${inverterMaxV}V)! Reduce string length.`;
        } else {
            mpptStatusClass = 'badge-success';
            mpptStatusText = `Safe: Max String (${maxPanelsPerString} panels) = ${totalColdVocString.toFixed(0)}V Voc (Limit: ${inverterMaxV}V)`;
        }

        // Output Display Formatting
        resSystemSize.textContent = `${systemSizeKW.toFixed(2)} kWp`;
        resPanelCount.textContent = `${roundedPanelCount} units (${exactPanelCount.toFixed(1)} exact)`;
        resInverterSize.textContent = `${recommendedInverterKW.toFixed(2)} kW AC`;
        resDailyGen.textContent = `${dailyGeneration.toFixed(2)} kWh`;
        resColdVoc.textContent = `${coldVocPerPanel.toFixed(2)} V/panel (${totalColdVocString.toFixed(1)}V string)`;
        resHotVmp.textContent = `${hotVmpPerPanel.toFixed(2)} V/panel`;
        
        resMpptStatus.className = `result-value status-badge ${mpptStatusClass}`;
        resMpptStatus.textContent = mpptStatusText;

        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

        // Clear error states
        document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
        const banner = document.getElementById('calc-error-banner');
        if (banner) banner.remove();

        dailyEnergyInput.focus();
    });
});
