document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme from LocalStorage
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('themeToggle');
  themeToggleBtn?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });

  // 2. Solar PV Calculator Logic & Event Binding
  const pvForm = document.getElementById('pvForm');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');
  const calcBtn = document.getElementById('calcBtn');

  // Result DOM elements matching solar-pv-calculator.html structure
  const pvSizeResult = document.getElementById('pvSizeResult');
  const panelCountResult = document.getElementById('panelCountResult');
  const inverterResult = document.getElementById('inverterResult');
  const batteryResult = document.getElementById('batteryResult');
  const generationResult = document.getElementById('generationResult');
  const annualGenerationResult = document.getElementById('annualGenerationResult');

  const calculatePVSystem = (e) => {
    e?.preventDefault();

    // Parse inputs with explicit fallback defaults
    const dailyKWh = parseFloat(document.getElementById('dailyEnergy')?.value) || 15;
    const peakSunHours = parseFloat(document.getElementById('sunHours')?.value) || 5.5;
    const panelWattage = parseFloat(document.getElementById('panelWattage')?.value) || 640;
    
    // Performance Ratio (PR) from input, fallback to system efficiency percentage, or default 0.80
    let prInput = parseFloat(document.getElementById('performanceRatio')?.value);
    if (isNaN(prInput)) {
      const effInput = parseFloat(document.getElementById('systemEfficiency')?.value);
      prInput = !isNaN(effInput) ? effInput / 100 : 0.80;
    }
    const performanceRatio = Math.min(Math.max(prInput, 0.50), 1.00);

    const autonomyDays = parseFloat(document.getElementById('batteryAutonomy')?.value) || 1;
    const batteryVoltage = parseFloat(document.getElementById('batteryVoltage')?.value) || 48;
    const systemType = document.getElementById('systemType')?.value || 'grid';

    // Engineering Calculations
    const requiredKW = dailyKWh / (peakSunHours * performanceRatio);
    const requiredWatts = requiredKW * 1000;
    const totalPanels = Math.ceil(requiredWatts / panelWattage);
    
    // Recommended Inverter Capacity (Standard DC/AC oversizing ratio ~1.20)
    const recommendedInverterKW = (requiredKW * 1.20).toFixed(2);
    
    // Energy Generation
    const estimatedDailyGen = (requiredKW * peakSunHours * performanceRatio).toFixed(2);
    const estimatedAnnualGen = (parseFloat(estimatedDailyGen) * 365).toFixed(0);

    // Battery Bank Sizing (Ah) for Off-Grid / Hybrid systems using 80% DoD (LiFePO4 standard)
    let batteryCapacityText = 'Not Required (Grid-Tied)';
    if (systemType === 'offgrid' || systemType === 'hybrid') {
      const dod = 0.80;
      const totalWattHours = dailyKWh * 1000 * autonomyDays;
      const requiredAmpHours = totalWattHours / (batteryVoltage * dod);
      batteryCapacityText = `${Math.ceil(requiredAmpHours)} Ah @ ${batteryVoltage}V (${(totalWattHours / 1000).toFixed(1)} kWh usable)`;
    }

    // Populate Results into existing HTML elements
    if (pvSizeResult) pvSizeResult.textContent = `${requiredKW.toFixed(2)} kW (${requiredWatts.toFixed(0)} W)`;
    if (panelCountResult) panelCountResult.textContent = `${totalPanels} Panels (${panelWattage}W)`;
    if (inverterResult) inverterResult.textContent = `${recommendedInverterKW} kW`;
    if (batteryResult) batteryResult.textContent = batteryCapacityText;
    if (generationResult) generationResult.textContent = `${estimatedDailyGen} kWh / day`;
    if (annualGenerationResult) annualGenerationResult.textContent = `${Number(estimatedAnnualGen).toLocaleString()} kWh / year`;

    // Display Result Panel
    if (resultBox) {
      resultBox.style.display = 'block';
    }

    // Display Formula Breakdown
    if (formulaApplied) {
      formulaApplied.style.display = 'block';
      formulaApplied.innerHTML = `
        <strong>Engineering Calculation Methodology:</strong><br>
        • <strong>PV Array Size (kW):</strong> Daily Energy (${dailyKWh} kWh) ÷ [Peak Sun Hours (${peakSunHours}h) × Performance Ratio (${performanceRatio})] = ${requiredKW.toFixed(2)} kW<br>
        • <strong>Panel Count:</strong> ⌈ Required Array Watts (${requiredWatts.toFixed(0)}W) ÷ Panel Rating (${panelWattage}W) ⌉ = ${totalPanels} Panels<br>
        • <strong>Inverter Capacity:</strong> 1.20 × Array Size = ${recommendedInverterKW} kW<br>
        • <strong>Annual Generation:</strong> Daily Generation (${estimatedDailyGen} kWh) × 365 days = ${Number(estimatedAnnualGen).toLocaleString()} kWh
      `;
    }

    resultBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Event Binding
  if (pvForm) {
    pvForm.addEventListener('submit', calculatePVSystem);
  } else if (calcBtn) {
    calcBtn.addEventListener('click', calculatePVSystem);
  }
});
