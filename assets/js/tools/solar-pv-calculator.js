/**
 * Solar PV System Calculator Logic
 * Handles temperature-adjusted string sizing, DC/AC ratio checks, annual yield estimation, 
 * and off-grid battery storage calculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  const pvMode = document.getElementById('pvMode');
  const offgridSection = document.getElementById('offgridSection');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');

  // Toggle Off-Grid Inputs Visibility
  pvMode.addEventListener('change', () => {
    if (pvMode.value === 'offgrid') {
      offgridSection.style.display = 'block';
    } else {
      offgridSection.style.display = 'none';
    }
  });

  calcBtn.addEventListener('click', performCalculation);
  resetBtn.addEventListener('click', resetCalculator);

  // Helper function to safely read numeric input
  function num(id) {
    const val = parseFloat(document.getElementById(id)?.value);
    return isNaN(val) ? 0 : val;
  }

  function performCalculation() {
    const mode = pvMode.value;

    // Inputs
    const Voc = num('voc');
    const Vmp = num('vmp');
    const Imp = num('imp');
    const Pmax = num('pmax');

    const invRating = num('invRating');
    const dcmax = num('dcmax');
    const mpptMin = num('mpptMin');
    const mpptMax = num('mpptMax');

    const Tmin = num('tmin');
    const Tmax = num('tmax');
    const psh = num('psh');
    const lossPct = num('loss');

    // Basic Validations
    if (Voc <= 0 || Vmp <= 0 || Pmax <= 0 || invRating <= 0 || dcmax <= 0) {
      showError('Please enter positive non-zero values for PV module and inverter ratings.');
      return;
    }

    if (Vmp >= Voc) {
      showError('Vmp (Max Power Voltage) must be less than Voc (Open Circuit Voltage).');
      return;
    }

    if (mpptMin >= mpptMax) {
      showError('MPPT Minimum voltage must be strictly less than MPPT Maximum voltage.');
      return;
    }

    // Temperature Correction Calculations
    // Voc rises in cold temperatures (+0.28%/°C factor relative to 25°C STC)
    const VocCold = Voc * (1 + 0.0028 * (25 - Tmin));
    // Vmp drops in warm temperatures (-0.35%/°C factor relative to 25°C STC)
    const VmpHot = Vmp * (1 - 0.0035 * (Tmax - 25));

    // String Limits
    const maxVocModules = Math.floor(dcmax / VocCold);
    const minMpptModules = Math.ceil(mpptMin / VmpHot);
    const maxMpptModules = Math.floor(mpptMax / VmpHot);

    let modulesPerString = Math.max(minMpptModules, Math.min(maxVocModules, maxMpptModules));
    if (isNaN(modulesPerString) || !isFinite(modulesPerString) || modulesPerString < 0) {
      modulesPerString = 0;
    }

    // System Sizing
    const totalModules = Math.ceil((invRating * 1000) / Pmax);
    const strings = modulesPerString > 0 ? Math.ceil(totalModules / modulesPerString) : 0;

    const dcSize = (totalModules * Pmax) / 1000; // kW
    const dcac = invRating > 0 ? dcSize / invRating : 0;

    // Performance Ratio (PR) Calculation
    const inverterEff = 0.97;
    const wiringLoss = 0.02;
    const soilingLoss = 0.03;
    const mismatchLoss = 0.02;
    const generalLossFactor = lossPct / 100;

    const PR = 1 - (generalLossFactor + (1 - inverterEff) + wiringLoss + soilingLoss + mismatchLoss);
    const PRClamped = Math.max(0.4, Math.min(0.95, PR));
    const annualEnergy = dcSize * psh * 365 * PRClamped;

    // System Status Assessment
    let status = 'PASS';
    let badgeClass = 'pass';
    let statusNote = 'System configuration meets inverter electrical limits and MPPT voltage windows.';

    if (dcac > 1.5) {
      status = 'WARNING';
      badgeClass = 'warn';
      statusNote = 'High DC to AC ratio (> 1.5). Inverter may experience power clipping during peak solar irradiance.';
    }

    if (maxVocModules < minMpptModules || modulesPerString === 0 || VocCold > dcmax) {
      status = 'FAIL';
      badgeClass = 'fail';
      statusNote = 'Voltage window mismatch. Array cold voltage exceeds DC max or hot Vmp falls below MPPT minimum limit.';
    }

    // Optional Off-Grid Battery Sizing
    let batteryCardHtml = '';
    if (mode === 'offgrid') {
      const load = num('dailyLoad');
      const days = num('autonomy');
      const Vbat = num('batteryV');
      const dod = num('dod') / 100;

      if (load > 0 && days > 0 && Vbat > 0 && dod > 0) {
        const invEff = 0.93;
        const battEff = 0.92;
        const safetyFactor = 1.15;

        const netUsableKwh = load * days;
        const grossRequiredKwh = (netUsableKwh * safetyFactor) / (dod * invEff * battEff);
        const batteryAh = (grossRequiredKwh * 1000) / Vbat;

        batteryCardHtml = `
          <div class="pv-result-card">
            <span class="pv-card-title">Off-Grid Battery Storage</span>
            <div class="pv-metric-row"><span>Net Daily Demand:</span> <strong>${formatNum(load)} kWh/day</strong></div>
            <div class="pv-metric-row"><span>Target Autonomy:</span> <strong>${days} Days (${formatNum(netUsableKwh)} kWh)</strong></div>
            <div class="pv-metric-row"><span>Gross Storage Required:</span> <strong>${formatNum(grossRequiredKwh)} kWh</strong></div>
            <div class="pv-metric-row highlight-row"><span>Required Battery Capacity:</span> <strong>${formatNum(batteryAh, 0)} Ah @ ${Vbat}V</strong></div>
          </div>
        `;
      }
    }

    // Render Results Output
    resultBox.innerHTML = `
      <div class="pv-results-grid">
        <div class="pv-result-card">
          <span class="pv-card-title">PV Array Sizing</span>
          <div class="pv-metric-row"><span>Total Array Rating:</span> <strong>${formatNum(dcSize)} kW</strong></div>
          <div class="pv-metric-row"><span>Total Panels Required:</span> <strong>${totalModules} Modules</strong></div>
          <div class="pv-metric-row"><span>Modules per String:</span> <strong>${modulesPerString} Panels</strong></div>
          <div class="pv-metric-row"><span>Parallel Strings:</span> <strong>${strings} Strings</strong></div>
          <div class="pv-metric-row"><span>DC to AC Oversizing:</span> <strong>${formatNum(dcac)}</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">Electrical Voltage Limits</span>
          <div class="pv-metric-row"><span>Cold Voc (@ ${Tmin}&deg;C):</span> <strong>${formatNum(VocCold)} V</strong></div>
          <div class="pv-metric-row"><span>Hot Vmp (@ ${Tmax}&deg;C):</span> <strong>${formatNum(VmpHot)} V</strong></div>
          <div class="pv-metric-row"><span>Inverter DC Max:</span> <strong>${dcmax} V</strong></div>
          <div class="pv-metric-row"><span>MPPT Voltage Window:</span> <strong>${mpptMin} V &ndash; ${mpptMax} V</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">Energy Yield & Efficiency</span>
          <div class="pv-metric-row"><span>Est. Annual Generation:</span> <strong>${formatNum(annualEnergy, 0)} kWh/year</strong></div>
          <div class="pv-metric-row"><span>Est. Daily Generation:</span> <strong>${formatNum(annualEnergy / 365)} kWh/day</strong></div>
          <div class="pv-metric-row"><span>Performance Ratio (PR):</span> <strong>${formatNum(PRClamped * 100, 1)}%</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">System Status</span>
          <div class="status-badge-wrapper">
            <span class="badge ${badgeClass}">${status}</span>
          </div>
          <p class="status-note-text">${statusNote}</p>
        </div>

        ${batteryCardHtml}
      </div>
    `;

    // Formula helper breakdown
    formulaApplied.innerHTML = `
      <strong>Temperature Voltage Limits:</strong><br>
      • Cold Voc (@ ${Tmin}&deg;C) = ${Voc}V &times; [1 + 0.0028 &times; (25 - ${Tmin})] = <strong>${formatNum(VocCold)}V</strong> (Max Limit: ${dcmax}V)<br>
      • Hot Vmp (@ ${Tmax}&deg;C) = ${Vmp}V &times; [1 - 0.0035 &times; (${Tmax} - 25)] = <strong>${formatNum(VmpHot)}V</strong> (Min MPPT: ${mpptMin}V)<br>
      • Selected String Size = <strong>${modulesPerString} panels/string</strong>
    `;
  }

  function showError(msg) {
    resultBox.innerHTML = `
      <div class="result-error-box">
        <span class="error-icon">⚠️</span>
        <p>${msg}</p>
      </div>
    `;
    formulaApplied.textContent = 'Calculation failed due to invalid or missing input values.';
  }

  function resetResultsDisplay() {
    resultBox.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">☀️</span>
        <p>Adjust parameters and click <strong>Calculate System</strong> to view detailed PV array sizing and validation.</p>
      </div>
    `;
    formulaApplied.textContent = 'Validation and temperature window calculations will appear here after calculation.';
  }

  function resetCalculator() {
    document.getElementById('voc').value = 49.5;
    document.getElementById('vmp').value = 41.2;
    document.getElementById('imp').value = 10.8;
    document.getElementById('pmax').value = 450;

    document.getElementById('invRating').value = 10;
    document.getElementById('dcmax').value = 1000;
    document.getElementById('mpptMin').value = 200;
    document.getElementById('mpptMax').value = 800;

    document.getElementById('tmin').value = 10;
    document.getElementById('tmax').value = 45;
    document.getElementById('psh').value = 5.5;
    document.getElementById('loss').value = 14;

    document.getElementById('dailyLoad').value = 12;
    document.getElementById('autonomy').value = 2;
    document.getElementById('batteryV').value = 48;
    document.getElementById('dod').value = 80;

    pvMode.value = 'grid';
    offgridSection.style.display = 'none';

    resetResultsDisplay();
  }

  function formatNum(num, decimals = 2) {
    if (isNaN(num)) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }
});
