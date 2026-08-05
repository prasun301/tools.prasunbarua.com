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

  const calculatePVSystem = (e) => {
    e?.preventDefault();

    // Parse inputs with explicit NaN checking and sensible fallbacks
    const dailyKWh = parseFloat(document.getElementById('dailyEnergy')?.value);
    const peakSunHours = parseFloat(document.getElementById('sunHours')?.value);
    const panelWattage = parseFloat(document.getElementById('panelWattage')?.value);

    const validDailyKWh = isNaN(dailyKWh) ? 15 : dailyKWh;
    const validSunHours = isNaN(peakSunHours) ? 5 : peakSunHours;
    const validPanelWattage = isNaN(panelWattage) ? 400 : panelWattage;
    const systemLossFactor = 0.80;

    // Calculations
    const requiredKW = validDailyKWh / (validSunHours * systemLossFactor);
    const requiredWatts = requiredKW * 1000;
    const totalPanels = Math.ceil(requiredWatts / validPanelWattage);
    const recommendedInverterKW = (requiredKW * 1.25).toFixed(1);
    const estimatedDailyGen = (requiredKW * validSunHours * systemLossFactor).toFixed(2);

    // Render Results
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.innerHTML = `
        <div class="result-card-inner">
          <h3>📊 System Sizing Results</h3>
          <div class="result-grid">
            <div class="result-item">
              <span class="label">Required PV System Size:</span>
              <span class="value">${requiredKW.toFixed(2)} kW (${requiredWatts.toFixed(0)} W)</span>
            </div>
            <div class="result-item">
              <span class="label">Recommended Panels (${validPanelWattage}W each):</span>
              <span class="value highlight">${totalPanels} Panels</span>
            </div>
            <div class="result-item">
              <span class="label">Inverter Capacity Recommendation:</span>
              <span class="value">${recommendedInverterKW} kW</span>
            </div>
            <div class="result-item">
              <span class="label">Estimated Daily Generation:</span>
              <span class="value">${estimatedDailyGen} kWh / day</span>
            </div>
          </div>
        </div>
      `;
    }

    if (formulaApplied) {
      formulaApplied.style.display = 'block';
      formulaApplied.innerHTML = `
        <strong>Formula Used:</strong><br>
        System Size (kW) = Daily Energy Consumption (${validDailyKWh} kWh) / (Peak Sun Hours (${validSunHours}h) × Efficiency Factor (0.80))
      `;
    }

    resultBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Clean event binding: Form submit handles both Enter key and submit clicks naturally
  if (pvForm) {
    pvForm.addEventListener('submit', calculatePVSystem);
  } else if (calcBtn) {
    calcBtn.addEventListener('click', calculatePVSystem);
  }
});
