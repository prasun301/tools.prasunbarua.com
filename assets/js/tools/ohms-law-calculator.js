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

  // Initialize UI on load
  updateInputsUI();

  // Event Listeners
  calcMode.addEventListener('change', updateInputsUI);
  calcBtn.addEventListener('click', performCalculation);
  resetBtn.addEventListener('click', resetCalculator);

  // Render dynamic form inputs based on target mode
  function updateInputsUI() {
    const mode = calcMode.value;
    dynamicInputs.innerHTML = '';
    resetResultsDisplay();

    if (mode === 'V') {
      dynamicInputs.innerHTML = `
        <div class="form-group">
          <label for="inputI">Current (I) <span class="unit-label">Amperes (A)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputI" step="any" placeholder="e.g. 2">
            <span class="unit-tag">A</span>
          </div>
        </div>
        <div class="form-group">
          <label for="inputR">Resistance (R) <span class="unit-label">Ohms (&Omega;)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputR" step="any" placeholder="e.g. 6">
            <span class="unit-tag">&Omega;</span>
          </div>
        </div>
      `;
    } else if (mode === 'I') {
      dynamicInputs.innerHTML = `
        <div class="form-group">
          <label for="inputV">Voltage (V) <span class="unit-label">Volts (V)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputV" step="any" placeholder="e.g. 12">
            <span class="unit-tag">V</span>
          </div>
        </div>
        <div class="form-group">
          <label for="inputR">Resistance (R) <span class="unit-label">Ohms (&Omega;)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputR" step="any" placeholder="e.g. 6">
            <span class="unit-tag">&Omega;</span>
          </div>
        </div>
      `;
    } else if (mode === 'R') {
      dynamicInputs.innerHTML = `
        <div class="form-group">
          <label for="inputV">Voltage (V) <span class="unit-label">Volts (V)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputV" step="any" placeholder="e.g. 12">
            <span class="unit-tag">V</span>
          </div>
        </div>
        <div class="form-group">
          <label for="inputI">Current (I) <span class="unit-label">Amperes (A)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputI" step="any" placeholder="e.g. 2">
            <span class="unit-tag">A</span>
          </div>
        </div>
      `;
    } else if (mode === 'P') {
      dynamicInputs.innerHTML = `
        <div class="form-group">
          <label for="inputV">Voltage (V) <span class="unit-label">Volts (V)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputV" step="any" placeholder="e.g. 12">
            <span class="unit-tag">V</span>
          </div>
        </div>
        <div class="form-group">
          <label for="inputI">Current (I) <span class="unit-label">Amperes (A)</span></label>
          <div class="input-with-unit">
            <input type="number" id="inputI" step="any" placeholder="e.g. 2">
            <span class="unit-tag">A</span>
          </div>
        </div>
      `;
    }

    // Add enter-key submit event to inputs
    const inputs = dynamicInputs.querySelectorAll('input');
    inputs.forEach(inp => {
      inp.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performCalculation();
      });
    });
  }

  // Calculation Logic
  function performCalculation() {
    const mode = calcMode.value;

    if (mode === 'V') {
      const iVal = parseFloat(document.getElementById('inputI')?.value);
      const rVal = parseFloat(document.getElementById('inputR')?.value);

      if (isNaN(iVal) || isNaN(rVal)) {
        showError('Please enter valid numeric values for Current and Resistance.');
        return;
      }

      const vRes = iVal * rVal;
      const pRes = vRes * iVal;

      renderSuccessResult([
        { label: 'Voltage (V)', value: `${formatNum(vRes)} Volts (V)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      formulaApplied.innerHTML = `
        <strong>V = I &times; R</strong><br>
        V = ${iVal} A &times; ${rVal} &Omega; = <strong>${formatNum(vRes)} V</strong><br>
        P = V &times; I = ${formatNum(vRes)} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong>
      `;
    } 
    else if (mode === 'I') {
      const vVal = parseFloat(document.getElementById('inputV')?.value);
      const rVal = parseFloat(document.getElementById('inputR')?.value);

      if (isNaN(vVal) || isNaN(rVal)) {
        showError('Please enter valid numeric values for Voltage and Resistance.');
        return;
      }
      if (rVal === 0) {
        showError('Resistance cannot be zero (Division by zero error).');
        return;
      }

      const iRes = vVal / rVal;
      const pRes = vVal * iRes;

      renderSuccessResult([
        { label: 'Current (I)', value: `${formatNum(iRes)} Amperes (A)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      formulaApplied.innerHTML = `
        <strong>I = V / R</strong><br>
        I = ${vVal} V / ${rVal} &Omega; = <strong>${formatNum(iRes)} A</strong><br>
        P = V &times; I = ${vVal} V &times; ${formatNum(iRes)} A = <strong>${formatNum(pRes)} W</strong>
      `;
    } 
    else if (mode === 'R') {
      const vVal = parseFloat(document.getElementById('inputV')?.value);
      const iVal = parseFloat(document.getElementById('inputI')?.value);

      if (isNaN(vVal) || isNaN(iVal)) {
        showError('Please enter valid numeric values for Voltage and Current.');
        return;
      }
      if (iVal === 0) {
        showError('Current cannot be zero (Division by zero error).');
        return;
      }

      const rRes = vVal / iVal;
      const pRes = vVal * iVal;

      renderSuccessResult([
        { label: 'Resistance (R)', value: `${formatNum(rRes)} Ohms (&Omega;)`, main: true },
        { label: 'Associated Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: false }
      ]);

      formulaApplied.innerHTML = `
        <strong>R = V / I</strong><br>
        R = ${vVal} V / ${iVal} A = <strong>${formatNum(rRes)} &Omega;</strong><br>
        P = V &times; I = ${vVal} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong>
      `;
    } 
    else if (mode === 'P') {
      const vVal = parseFloat(document.getElementById('inputV')?.value);
      const iVal = parseFloat(document.getElementById('inputI')?.value);

      if (isNaN(vVal) || isNaN(iVal)) {
        showError('Please enter valid numeric values for Voltage and Current.');
        return;
      }

      const pRes = vVal * iVal;
      const rRes = iVal !== 0 ? vVal / iVal : 0;

      renderSuccessResult([
        { label: 'Power (P)', value: `${formatNum(pRes)} Watts (W)`, main: true },
        { label: 'Associated Resistance (R)', value: `${formatNum(rRes)} Ohms (&Omega;)`, main: false }
      ]);

      formulaApplied.innerHTML = `
        <strong>P = V &times; I</strong><br>
        P = ${vVal} V &times; ${iVal} A = <strong>${formatNum(pRes)} W</strong><br>
        R = V / I = ${vVal} V / ${iVal} A = <strong>${formatNum(rRes)} &Omega;</strong>
      `;
    }
  }

  // Render calculation results card
  function renderSuccessResult(items) {
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

  // Render error message card
  function showError(msg) {
    resultBox.innerHTML = `
      <div class="result-error-box">
        <span class="error-icon">⚠️</span>
        <p>${msg}</p>
      </div>
    `;
    formulaApplied.textContent = 'Calculation failed due to invalid or missing inputs.';
  }

  function resetResultsDisplay() {
    resultBox.innerHTML = `
      <div class="result-placeholder">
        <span class="result-icon">⚡</span>
        <p>Select a mode, fill in the values, and click <strong>Calculate</strong>.</p>
      </div>
    `;
    formulaApplied.textContent = 'Formula breakdown will appear here after calculation.';
  }

  function resetCalculator() {
    const inputs = dynamicInputs.querySelectorAll('input');
    inputs.forEach(i => i.value = '');
    resetResultsDisplay();
  }

  function formatNum(num) {
    if (isNaN(num)) return '0';
    // Format to max 4 decimal places without trailing zeros
    return Math.round((num + Number.EPSILON) * 10000) / 10000;
  }
});
