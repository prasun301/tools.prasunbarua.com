/**
 * Solar PV System Calculator
 * Path: assets/js/solar-pv-calculator.js
 * 
 * Updates: Improved string-sizing algorithm, standardized temperature coefficient math,
 * better error handling, and robust input validation.
 */
document.addEventListener('DOMContentLoaded', () => {
  const pvMode = document.getElementById('pvMode');
  const offgridSection = document.getElementById('offgridSection');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pvForm = document.getElementById('pvForm');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');

  // Verify core UI nodes exist
  if (!calcBtn || !resultBox || !pvMode) {
    console.error("Solar PV Calculator: Required UI containers missing from DOM.");
    return;
  }

  // Toggle Off-Grid Inputs
  pvMode.addEventListener('change', () => {
    if (offgridSection) {
      offgridSection.style.display = pvMode.value === "offgrid" ? "block" : "none";
    }
  });

  // Calculate Action (Button Click)
  calcBtn.addEventListener('click', (e) => {
    e.preventDefault();
    performCalculation();
  });

  // Calculate Action (Form Submit/Enter Key)
  if (pvForm) {
    pvForm.addEventListener('submit', (e) => {
      e.preventDefault();
      performCalculation();
    });
  }

  // Reset Action
  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      resetDefaults();
    });
  }

  // Helper to get numeric values safely
  function getNum(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = parseFloat(el.value);
    return isNaN(val) ? 0 : val;
  }

  function performCalculation() {
    const mode = pvMode.value;

    // Module Parameters
    const Voc = getNum('voc');
    const Vmp = getNum('vmp');
    const Imp = getNum('imp');
    const Pmax = getNum('pmax');

    // Inverter Parameters
    const invRating = getNum('invRating');
    const dcmax = getNum('dcmax');
    const mpptMin = getNum('mpptMin');
    const mpptMax = getNum('mpptMax');
    const mpptCount = getNum('mpptCount') || 1;
    const stringsPerMppt = getNum('stringsPerMppt') || 1;

    // Environment Parameters
    const Tmin = getNum('tmin');
    const Tmax = getNum('tmax');
    const psh = getNum('psh');
    const lossPct = getNum('loss');

    // Basic Validation
    if (Voc <= 0 || Vmp <= 0 || Pmax <= 0 || invRating <= 0) {
      return showError("Please enter valid positive values for all PV Module and Inverter specs.");
    }
    if (Vmp >= Voc) {
      return showError("Maximum Power Voltage (Vmp) must be less than Open Circuit Voltage (Voc).");
    }
    if (mpptMin >= mpptMax) {
      return showError("Inverter MPPT Minimum voltage must be lower than Maximum voltage.");
    }

    // Standardized Temperature Corrections
    // Assuming typical Poly/Mono coefficients: Voc = -0.28%/°C, Vmp = -0.35%/°C
    const TEMP_COEFF_VOC = -0.0028; 
    const TEMP_COEFF_VMP = -0.0035;
    
    // Rule of thumb: Cell temp sits ~25°C to 30°C above ambient under peak irradiance
    const CELL_TEMP_MARGIN = 25; 
    const cellHotTemp = Tmax + CELL_TEMP_MARGIN; 
    
    // Formula: V_T = V_STC * (1 + Coeff * (T - 25))
    const VocColdModule = Voc * (1 + TEMP_COEFF_VOC * (Tmin - 25));
    const VmpColdModule = Vmp * (1 + TEMP_COEFF_VMP * (Tmin - 25));
    const VmpHotModule  = Vmp * (1 + TEMP_COEFF_VMP * (cellHotTemp - 25));

    // Target Sizing (1.2 DC/AC Target Ratio is standard industry practice)
    const targetDcPower = invRating * 1.20;
    const targetModules = (targetDcPower * 1000) / Pmax;

    // String Voltage Constraints
    const maxModulesByVoc = Math.floor(dcmax / VocColdModule);
    const minModulesByMppt = Math.ceil(mpptMin / VmpHotModule);
    const maxModulesByMppt = Math.floor(mpptMax / VmpColdModule);

    const minStringLength = minModulesByMppt;
    const maxStringLength = Math.min(maxModulesByVoc, maxModulesByMppt);

    if (minStringLength > maxStringLength) {
      return showError(`No valid string layout possible. Minimum required length (${minStringLength}) exceeds maximum safe length (${maxStringLength}). Check inverter voltage window vs module voltage.`);
    }

    // Find Best String Configuration (Smart Loop)
    const maxStrings = mpptCount * stringsPerMppt;
    let bestDesign = null;
    let minDiff = Infinity;

    for (let strings = 1; strings <= maxStrings; strings++) {
      // Find the ideal string length to hit our DC/AC ratio target
      const idealLength = targetModules / strings;
      
      // Test both flooring and ceiling the ideal length to find the closest match
      const options = [Math.floor(idealLength), Math.ceil(idealLength)];

      for (const len of options) {
        if (len >= minStringLength && len <= maxStringLength) {
          const actualMods = len * strings;
          const diff = Math.abs(actualMods - targetModules);
          
          // Save configuration if it's the closest one to our target DC power so far
          if (diff < minDiff) {
            minDiff = diff;
            bestDesign = { strings, modulesPerString: len, actualModules: actualMods };
          }
        }
      }
    }

    if (!bestDesign) {
      return showError(`Could not fit strings into inverter limits. To achieve ~1.2 DC/AC ratio, the module count falls outside the inverter's input bounds. Try an inverter with a wider MPPT range or a different module power class.`);
    }

    const { strings, modulesPerString, actualModules } = bestDesign;

    // Recalculate Performance Metrics based on the chosen design
    const dcSize = (actualModules * Pmax) / 1000;
    const dcac = dcSize / invRating;
    const stringVocCold = VocColdModule * modulesPerString;
    const stringVmpHot = VmpHotModule * modulesPerString;

    // Status Checks & Warnings
    let status = "PASS";
    let badgeClass = "pass"; // Assumes you have CSS .badge.pass { background: #dcfce7; color: #166534; }
    let statusNote = "PV string operating parameters are optimal.";

    if (stringVocCold > dcmax) {
      status = "FAIL";
      badgeClass = "fail"; // Assumes CSS .badge.fail { background: #fee2e2; color: #991b1b; }
      statusNote = "Cold string Voc exceeds Maximum DC Input Voltage! Will damage inverter.";
    } else if (stringVmpHot < mpptMin) {
      status = "FAIL";
      badgeClass = "fail";
      statusNote = "Hot string Vmp drops below Inverter Minimum MPPT Voltage! System will shut down in heat.";
    } else if (dcac > 1.40) {
      status = "WARNING";
      badgeClass = "warn"; // Assumes CSS .badge.warn { background: #fef9c3; color: #854d0e; }
      statusNote = "DC/AC ratio exceeds 1.40. Expect significant power clipping during peak solar hours.";
    }

    // Yield Estimates
    const pr = Math.max(0.40, Math.min(0.95, (100 - lossPct) / 100)); // Constrain PR between 40% and 95%
    const annualYield = dcSize * psh * 365 * pr;
    const dailyYield = annualYield / 365;

    // Off-Grid Battery Calculation (Optional Block)
    let batteryHtml = "";
    if (mode === "offgrid") {
      const load = getNum('dailyLoad');
      const autonomy = getNum('autonomy');
      const batteryV = getNum('batteryV');
      const dod = getNum('dod') / 100;

      if (load > 0 && autonomy > 0 && batteryV > 0 && dod > 0) {
        // Required storage logic incorporates 15% safety margin, 93% Inverter eff, 92% Batt eff
        const requiredStorage = (load * autonomy * 1.15) / (dod * 0.93 * 0.92);
        const batteryAh = (requiredStorage * 1000) / batteryV;

        batteryHtml = `
          <div class="pv-result-card">
            <span class="pv-card-title">Off-Grid Battery System</span>
            <div class="pv-metric-row"><span>Required Storage:</span><strong>${requiredStorage.toFixed(2)} kWh</strong></div>
            <div class="pv-metric-row"><span>Bank Capacity:</span><strong>${Math.round(batteryAh).toLocaleString()} Ah @ ${batteryV}V</strong></div>
            <div class="pv-metric-row"><span>Autonomy Limit:</span><strong>${autonomy} Days</strong></div>
          </div>
        `;
      }
    }

    // Render Output Cards
    resultBox.innerHTML = `
      <div class="pv-results-grid">
        <div class="pv-result-card">
          <span class="pv-card-title">Array Architecture</span>
          <div class="pv-metric-row"><span>Array Capacity:</span><strong>${dcSize.toFixed(2)} kWp</strong></div>
          <div class="pv-metric-row"><span>Total Modules:</span><strong>${actualModules} Units</strong></div>
          <div class="pv-metric-row"><span>Modules / String:</span><strong>${modulesPerString}</strong></div>
          <div class="pv-metric-row"><span>Parallel Strings:</span><strong>${strings}</strong></div>
          <div class="pv-metric-row"><span>DC/AC Ratio:</span><strong>${dcac.toFixed(2)}</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">Voltage Validation</span>
          <div class="pv-metric-row"><span>Cold Voc / String:</span><strong>${stringVocCold.toFixed(1)} V</strong></div>
          <div class="pv-metric-row"><span>Hot Vmp / String:</span><strong>${stringVmpHot.toFixed(1)} V</strong></div>
          <div class="pv-metric-row"><span>Inverter Max DC:</span><strong>${dcmax} V</strong></div>
          <div class="pv-metric-row"><span>MPPT Limits:</span><strong>${mpptMin} - ${mpptMax} V</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">Yield Estimates</span>
          <div class="pv-metric-row"><span>Annual Yield:</span><strong>${Math.round(annualYield).toLocaleString()} kWh</strong></div>
          <div class="pv-metric-row"><span>Daily Average:</span><strong>${dailyYield.toFixed(1)} kWh</strong></div>
          <div class="pv-metric-row"><span>Performance Ratio:</span><strong>${(pr * 100).toFixed(1)}%</strong></div>
        </div>

        <div class="pv-result-card">
          <span class="pv-card-title">System Status</span>
          <div style="margin: 6px 0;"><span class="badge ${badgeClass}">${status}</span></div>
          <p style="font-size:0.82rem; margin:0; color:#475569;">${statusNote}</p>
        </div>

        ${batteryHtml}
      </div>
    `;

    // Render Calculation Detail Breakdown
    if (formulaApplied) {
      formulaApplied.innerHTML = `
        <strong>Cold Weather Extremes (Tmin: ${Tmin}°C):</strong> String Voc = ${stringVocCold.toFixed(1)}V (Limit: ${dcmax}V)<br>
        <strong>Hot Weather Extremes (Cell Tmax: ${cellHotTemp}°C):</strong> String Vmp = ${stringVmpHot.toFixed(1)}V (MPPT Min: ${mpptMin}V)<br>
        <strong>Array Config:</strong> ${strings} String(s) &times; ${modulesPerString} Modules (${Pmax}W) = ${dcSize.toFixed(2)} kWp
      `;
    }
  }

  // Error Rendering Function
  function showError(msg) {
    resultBox.innerHTML = `
      <div class="result-error-box warning-box" style="margin-top: 1rem;">
        <span class="error-icon">⚠️</span>
        <p style="display:inline; margin-left: 8px;"><strong>Validation Error:</strong> ${msg}</p>
      </div>
    `;
    if (formulaApplied) formulaApplied.textContent = "Calculation stopped due to input validation error.";
  }

  // Reset Default Values
  function resetDefaults() {
    document.getElementById('voc').value = 49.5;
    document.getElementById('vmp').value = 41.2;
    document.getElementById('imp').value = 10.8;
    document.getElementById('pmax').value = 450;
    document.getElementById('invRating').value = 10;
    document.getElementById('dcmax').value = 1000;
    document.getElementById('mpptMin').value = 200;
    document.getElementById('mpptMax').value = 800;
    document.getElementById('mpptCount').value = 2;
    document.getElementById('stringsPerMppt').value = 2;
    document.getElementById('tmin').value = 10;
    document.getElementById('tmax').value = 45;
    document.getElementById('psh').value = 5.5;
    document.getElementById('loss').value = 14;
    document.getElementById('dailyLoad').value = 12;
    document.getElementById('autonomy').value = 2;
    document.getElementById('batteryV').value = 48;
    document.getElementById('dod').value = 80;
    
    pvMode.value = "grid";

    if (offgridSection) offgridSection.style.display = "none";
    
    resultBox.innerHTML = `
      <div class="result-placeholder" style="text-align:center; padding:30px; color:var(--text-muted,#64748b);">
        <p>Adjust parameters and click <strong>Calculate System</strong> to display results.</p>
      </div>
    `;
    
    if (formulaApplied) formulaApplied.textContent = "Calculations will appear here after clicking Calculate.";
  }
});
