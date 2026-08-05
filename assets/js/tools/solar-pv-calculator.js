/**
 * Solar PV System Calculator Logic
 * Handles temperature-adjusted string sizing, DC/AC ratio checks, annual yield estimation, 
 * and off-grid battery storage calculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Safe DOM Element Initialization
  const pvMode = document.getElementById('pvMode');
  const offgridSection = document.getElementById('offgridSection');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');
  const pvForm = document.getElementById('pvForm');

  // Guard Clause: Ensure core elements exist before proceeding
  if (!calcBtn || !resultBox || !pvMode) {
    console.error('Solar PV Calculator: Required DOM elements (calcBtn, resultBox, pvMode) are missing.');
    return;
  }

  // Toggle Off-Grid Inputs Visibility
  pvMode.addEventListener('change', () => {
    if (offgridSection) {
      offgridSection.style.display = pvMode.value === 'offgrid' ? 'block' : 'none';
    }
  });

  // Calculate & Reset Action Handlers (Prevent Form Reloads)
  calcBtn.addEventListener('click', (e) => {
    e.preventDefault();
    performCalculation();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetCalculator();
    });
  }

  if (pvForm) {
    pvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performCalculation();
    });
  }

  // Helper function: Safely read numeric input value
  function num(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
  }

  // Helper function: Safely write value to input field
  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value;
  }

  function performCalculation() {
    const mode = pvMode.value;

    // Read Module Inputs
    const Voc = num('voc');
    const Vmp = num('vmp');
    const Imp = num('imp');
    const Pmax = num('pmax');

    // Read Inverter Inputs
    const invRating = num('invRating');
    const dcmax = num('dcmax');
    const mpptMin = num('mpptMin');
    const mpptMax = num('mpptMax');

    // Read Environment Inputs
    const Tmin = num('tmin');
    const Tmax = num('tmax');
    const psh = num('psh');
    const lossPct = num('loss');

    // Basic Validation Checks
    if (Voc <= 0 || Vmp <= 0 || Pmax <= 0 || invRating <= 0 || dcmax <= 0) {
      showError('Please enter positive non-zero values for PV module and inverter ratings.');
      return;
    }

    if (Vmp >= Voc) {
      showError('Vmp (Max Power Voltage) must be strictly less than Voc (Open Circuit Voltage).');
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

    if (VocCold <= 0 || VmpHot <= 0) {
      showError('Temperature values resulted in invalid voltage levels. Check temperature inputs.');
      return;
    }

    // String Sizing Logic
    const maxVocModules = Math.floor(dcmax / VocCold);
    const minMpptModules = Math.ceil(mpptMin / VmpHot);
    const maxMpptModules = Math.floor(mpptMax / VmpHot);

    const upperLimit = Math.min(maxVocModules, maxMpptModules);
    const lowerLimit = minMpptModules;

    let modulesPerString = 0;
    let voltageMismatch = false;

    if (upperLimit >= lowerLimit && lowerLimit > 0) {
      modulesPerString = upperLimit;
    } else {
      modulesPerString = Math.max(1, maxVocModules);
      voltageMismatch = true;
    }

    // System Sizing
    const totalModules = Math.ceil((invRating * 1000) / Pmax);
    const strings = modulesPerString > 0 ? Math.ceil(totalModules / modulesPerString) : 0;

    const dcSize = (totalModules * Pmax) / 1000; // kW
    const dcac = invRating > 0 ? dcSize / invRating : 0;

    // Performance Ratio (PR) & Energy Yield
    const inverterEff = 0.97;
    const wiringLoss = 0.02;
    const soilingLoss = 0.03;
    const mismatchLoss = 0.02;
    const generalLossFactor = lossPct / 100;

    const PR = 1 - (generalLossFactor + (1 - inverterEff) + wiringLoss + soilingLoss + mismatchLoss);
    const PRClamped = Math.max(0.4, Math.min(0.95, isNaN(PR) ? 0.75 : PR));
    const annualEnergy = dcSize * psh * 365 * PRClamped;

    // Status Assessment
    let status = 'PASS';
    let badgeClass = 'pass';
    let statusNote = 'System configuration meets inverter electrical limits and MPPT voltage windows.';

    if (dcac > 1.5) {
      status = 'WARNING';
      badgeClass = 'warn';
      statusNote = 'High DC to AC ratio (> 1.5). Inverter may experience power clipping during peak solar irradiance.';
    }

    if (voltageMismatch || maxVocModules < minMpptModules || modulesPerString === 0 || (modulesPerString * VocCold) > dcmax) {
      status = 'FAIL';
      badgeClass = 'fail';
      statusNote = 'Voltage window mismatch. Array cold voltage exceeds DC max or hot Vmp falls outside MPPT limits.';
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

    if (formulaApplied) {
      formulaApplied.innerHTML = `
        <strong>Temperature Voltage Limits:</strong><br>
        • Cold Voc (@ ${Tmin}&deg;C) = ${Voc}V &times; [1 + 0.0028 &times; (25 - ${Tmin})] = <strong>${formatNum(VocCold)}V</strong> (Max Limit: ${dcmax}V)<br>
        • Hot Vmp (@ ${Tmax}&deg;C) = ${Vmp}V &times; [1 - 0.0035 &times; (${Tmax} - 25)] = <strong>${formatNum(VmpHot)}V</strong> (Min MPPT: ${mpptMin}V)<br>
        • Selected String Size = <strong>${modulesPerString} panels/string</strong>
      `;
    }
  }

  function showError(msg) {
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="result-error-box" style="padding:14px; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; color:#991b1b;">
          <span class="error-icon" style="font-size:1.2rem; margin-right:6px;">⚠️</span>
          <strong>Error:</strong> ${msg}
        </div>
      `;
    }
    if (formulaApplied) {
      formulaApplied.textContent = 'Calculation failed due to invalid or missing input values.';
    }
  }

  function resetResultsDisplay() {
    if (resultBox) {
      resultBox.innerHTML = `
        <div class="result-placeholder" style="text-align: center; padding: 30px; color: #64748b;">
          <span class="result-icon" style="font-size:2rem; display:block; margin-bottom:8px;">☀️</span>
          <p>Adjust parameters and click <strong>Calculate System</strong> to view detailed PV array sizing and validation.</p>
        </div>
      `;
    }
    if (formulaApplied) {
      formulaApplied.textContent = 'Validation and temperature window calculations will appear here after calculation.';
    }
  }

  function resetCalculator() {
    setVal('voc', 49.5);
    setVal('vmp', 41.2);
    setVal('imp', 10.8);
    setVal('pmax', 450);

    setVal('invRating', 10);
    setVal('dcmax', 1000);
    setVal('mpptMin', 200);
    setVal('mpptMax', 800);

    setVal('tmin', 10);
    setVal('tmax', 45);
    setVal('psh', 5.5);
    setVal('loss', 14);

    setVal('dailyLoad', 12);
    setVal('autonomy', 2);
    setVal('batteryV', 48);
    setVal('dod', 80);

    if (pvMode) pvMode.value = 'grid';
    if (offgridSection) offgridSection.style.display = 'none';

    resetResultsDisplay();
  }

  function formatNum(num, decimals = 2) {
    if (isNaN(num) || num === null || num === undefined) return '0';
    return Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    });
  }
});
