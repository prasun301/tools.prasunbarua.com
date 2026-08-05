/**
 * Ohm's Law Calculator Logic
 * Handles dynamic UI mode switching, calculate button trigger, validation & error output
 */

document.addEventListener('DOMContentLoaded', () => {
  const calcMode = document.getElementById('calcMode');
  const dynamicInputs = document.getElementById('dynamicInputs');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');

  // Guard clause if essential container elements are missing
  if (!calcMode || !dynamicInputs) return;

  // State object to retain input values when users switch modes
  let inputState = { V: '', I: '', R: '' };

  // Initialize UI on load
  updateInputsUI();

  // Event Listeners
  calcMode.addEventListener('change', updateInputsUI);
  if (calcBtn) calcBtn.addEventListener('click', performCalculation);
  if (resetBtn) resetBtn.addEventListener('click', resetCalculator);

  // Save current input values before wiping the DOM during a mode change
  function saveInputState() {
    const inputV = document.getElementById('inputV');
    const inputI = document.getElementById('inputI');
    const inputR = document.getElementById('inputR');
    
    if (inputV) inputState.V = inputV.value;
    if (inputI) inputState.I = inputI.value;
    if (inputR) inputState.R = inputR.value;
  }

  // Render dynamic form inputs based on target mode
  function updateInputsUI() {
    saveInputState(); // Save data before re-rendering
    const mode = calcMode.value;
    
    dynamicInputs.innerHTML = '';
    resetResultsDisplay();

    // Reusable Input HTML blocks
    const inputTemplates = {
      V: `
        <div class="form-group">
          <label for="inputV">Voltage (V) <span class="unit-label">Volts (V)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputV" step="any" placeholder="e.g. 12" value="${inputState.V}">
            <span class="unit-tag">V</span>
          </div>
        </div>
      `,
      I: `
        <div class="form-group">
          <label for="inputI">Current (I) <span class="unit-label">Amperes (A)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputI" step="any" placeholder="e.g. 2" value="${inputState.I}">
            <span class="unit-tag">A</span>
          </div>
        </div>
      `,
      R: `
        <div class="form-group">
          <label for="inputR">Resistance (R) <span class="unit-label">Ohms (&Omega;)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputR" step="any" placeholder="e.g. 6" value="${inputState.R}">
            <span class="unit-tag">&Omega;</span>
          </div>
        </div>
      `
    };

    // Inject appropriate inputs for the selected mode
    if (mode === 'V') {
      dynamicInputs.innerHTML = inputTemplates.I + inputTemplates.R;
    } else if (mode === 'I') {
      dynamicInputs.innerHTML = inputTemplates.V + inputTemplates.R;
    } else if (mode === 'R' || mode === 'P') {
      dynamicInputs.innerHTML = inputTemplates.V + inputTemplates.I;
    }

    // Add enter-key submit event to the new inputs
    const inputs = dynamicInputs.querySelectorAll('input');
    inputs.forEach(inp => {
      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          performCalculation(e);
        }
      });
    });
  }

  // Calculation Logic
  function performCalculation(e) {
    if (e) e.preventDefault();
    const mode = calcMode.value;

    // Safely parse values
    const vVal = parseFloat(document.getElementById('inputV')?.value);
    const iVal = parseFloat(document.getElementById('inputI')?.value);
    const rVal = parseFloat(document.getElementById('inputR')?.value);

    // ==========================================
    // Mode: Calculate Voltage (V)
    // ==========================================
    if (mode === 'V') {
      if (isNaN(iVal) || isNaN(rVal)) {
        return showError('Please enter valid numeric values for Current and Resistance.');
      }

      const vRes = iVal * rVal;
      const pRes = vRes * iVal;

      renderSuccessResult([
        { label: 'Voltage (V)', value: `${formatNum(vRes)} Volts (V)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      if (formulaApplied) {
        formulaApplied.innerHTML = `
          <strong>V = I &times; R</strong><br>
          V = ${iVal} A &times; ${rVal} &Omega; = <strong>${formatNum(vRes)} V</strong><br>
          P = V &times; I = ${formatNum(vRes)} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong>
        `;
      }
    } 
    
    // ==========================================
    // Mode: Calculate Current (I)
    // ==========================================
    else if (mode === 'I') {
      if (isNaN(vVal) || isNaN(rVal)) {
        return showError('Please enter valid numeric values for Voltage and Resistance.');
      }
      if (rVal === 0) {
        return showError('Resistance cannot be zero (Division by zero error).');
      }

      const iRes = vVal / rVal;
      const pRes = vVal * iRes;

      renderSuccessResult([
        { label: 'Current (I)', value: `${formatNum(iRes)} Amperes (A)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      if (formulaApplied) {
        formulaApplied.innerHTML = `
          <strong>I = V / R</strong><br>
          I = ${vVal} V / ${rVal} &Omega; = <strong>${formatNum(iRes)} A</strong><br>
          P = V &times; I = ${vVal} V &times; ${formatNum(iRes)} A = <strong>${formatNum(pRes)} W</strong>
        `;
      }
    } 
    
    // ==========================================
    // Mode: Calculate Resistance (R)
    // ==========================================
    else if (mode === 'R') {
      if (isNaN(vVal) || isNaN(iVal)) {
        return showError('Please enter valid numeric values for Voltage and Current.');
      }
      if (iVal === 0) {
        return showError('Current cannot be zero (Division by zero error).');
      }

      const rRes = vVal / iVal;
      const pRes = vVal * iVal;

      renderSuccessResult([
        { label: 'Resistance (R)', value: `${formatNum(rRes)} Ohms (&Omega;)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      if (formulaApplied) {
        formulaApplied.innerHTML = `
          <strong>R = V / I</strong><br>
          R = ${vVal} V / ${iVal} A = <strong>${formatNum(rRes)} &Omega;</strong><br>
          P = V &times; I = ${vVal} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong>
        `;
      }
    } 
    
    // ==========================================
    // Mode: Calculate Power (P)
    // ==========================================
    else if (mode === 'P') {
      if (isNaN(vVal) || isNaN(iVal)) {
        return showError('Please enter valid numeric values for Voltage and Current.');
      }

      const pRes = vVal * iVal;
      const rRes = iVal !== 0 ? vVal / iVal : Infinity;

      renderSuccessResult([
        { label: 'Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: true },
        { label: 'Associated Resistance (R)', value: `${iVal === 0 ? 'Infinity' : formatNum(rRes)} Ohms (&Omega;)`, main: false }
      ]);

      if (formulaApplied) {
        formulaApplied.innerHTML = `
          <strong>P = V &times; I</strong><br>
          P = ${vVal} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong><br>
          R = V / I = ${vVal} V / ${iVal} A = <strong>${iVal === 0 ? '&infin;' : formatNum(rRes)} &Omega;</strong>
        `;
      }
    }
  }

  // Render calculation results card
  function renderSuccessResult(items) {
    if (!resultBox) return;
    let html = `<div class="result-card-inner">`;
    items.forEach(item => {
      html += `
        <div class="result-row ${item.main ? 'primary-result' : ''}">
          <span class="result-label">${item.label}</span>
          <span class="result-val">${item.value}</span>
        </div>
      `;
    });
    html += `</div>`;
    resultBox.innerHTML = html;
  }

  // Render error message using global CSS warning classes
  function showError(msg) {
    if (!resultBox) return;
    resultBox.innerHTML = `
      <div class="result-error-box warning-box">
        <span class="error-icon">⚠️</span>
        <p style="display:inline; margin-left: 8px;">${msg}</p>
      </div>
    `;
    if (formulaApplied) {
      formulaApplied.textContent = 'Calculation failed due to invalid or missing inputs.';
    }
  }

  function resetResultsDisplay() {
    if (!resultBox) return;
    resultBox.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">⚡</span>
        <p>Select a mode, fill in the values, and click <strong>Calculate</strong>.</p>
      </div>
    `;
    if (formulaApplied) {
      formulaApplied.textContent = 'Formula breakdown will appear here after calculation.';
    }
  }

  function resetCalculator() {
    inputState = { V: '', I: '', R: '' };
    const inputs = dynamicInputs.querySelectorAll('input');
    inputs.forEach(i => i.value = '');
    resetResultsDisplay();
  }

  // Helper function to handle decimal formatting cleanly
  function formatNum(num) {
    if (!isFinite(num)) return num.toString();
    return parseFloat(num.toFixed(4)).toString();
  }
});
