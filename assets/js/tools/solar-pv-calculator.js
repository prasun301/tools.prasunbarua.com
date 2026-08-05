document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme from LocalStorage (Fixes dark mode fallback)
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('themeToggle');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });
  }

  // 2. Solar PV Calculator Logic & Event Binding
  const pvForm = document.getElementById('pvForm');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');
  const calcBtn = document.getElementById('calcBtn');

  // Bind form submit if form exists
  if (pvForm) {
    pvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      calculatePVSystem();
    });
  }

  // Always bind button click (works inside or outside form)
  if (calcBtn) {
    calcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      calculatePVSystem();
    });
  }

  function calculatePVSystem() {
    // Retrieve input values safely
    const dailyKWh = parseFloat(document.getElementById('dailyEnergy')?.value) || 15;
    const peakSunHours = parseFloat(document.getElementById('sunHours')?.value) || 5;
    const panelWattage = parseFloat(document.getElementById('panelWattage')?.value) || 400;
    const systemLossFactor = 0.80; // Standard 20% system losses account

    // Calculations
    const requiredKW = dailyKWh / (peakSunHours * systemLossFactor);
    const requiredWatts = requiredKW * 1000;
    const totalPanels = Math.ceil(requiredWatts / panelWattage);
    const recommendedInverterKW = (requiredKW * 1.25).toFixed(1); // 25% safety overhead
    const estimatedDailyGen = (requiredKW * peakSunHours * systemLossFactor).toFixed(2);

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
              <span class="label">Recommended Panels (${panelWattage}W each):</span>
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
        System Size (kW) = Daily Energy Consumption (${dailyKWh} kWh) / (Peak Sun Hours (${peakSunHours}h) × Efficiency Factor (0.80))
      `;
    }

    // Smooth scroll down to results
    resultBox?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});
