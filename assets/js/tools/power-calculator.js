'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const systemTypeSelect = document.getElementById('system-type');
    const calcModeSelect = document.getElementById('calc-mode');
    const dynamicInputsContainer = document.getElementById('dynamic-inputs-container');
    
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');

    const resLabel1 = document.getElementById('res-label-1');
    const resVal1 = document.getElementById('res-val-1');
    const resLabel2 = document.getElementById('res-label-2');
    const resVal2 = document.getElementById('res-val-2');
    const resCard2 = document.getElementById('res-card-2');

    if (!calcBtn) return;

    // Helper: Highlight invalid inputs
    const setFieldError = (inputEl, isError) => {
        if (!inputEl) return;
        if (isError) {
            inputEl.classList.add('input-error');
        } else {
            inputEl.classList.remove('input-error');
        }
    };

    // Helper: Show notification banner matching Ohm's law format
    const showNotification = (message, isError = true) => {
        let existingBanner = document.getElementById('power-alert-banner');
        if (!existingBanner) {
            existingBanner = document.createElement('div');
            existingBanner.id = 'power-alert-banner';
            existingBanner.className = isError ? 'error-banner' : 'success-banner';
            calcBtn.closest('form').prepend(existingBanner);
            existingBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        existingBanner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${isError ? 'error' : 'info'}</span> ${message}`;
        setTimeout(() => existingBanner.remove(), 6000);
    };

    // Render Dynamic Input Fields based on System & Calculation Mode
    const renderInputs = () => {
        const sys = systemTypeSelect.value;
        const mode = calcModeSelect.value;
        let html = '';

        if (mode !== 'voltage') {
            html += `
                <div class="input-row-card">
                    <div class="select-group">
                        <label for="param-voltage">Voltage (V)</label>
                        <span class="input-hint">Volts (V)</span>
                    </div>
                    <div class="input-group">
                        <input type="number" id="param-voltage" step="any" placeholder="e.g. 230" class="input-field">
                    </div>
                </div>`;
        }

        if (mode !== 'current') {
            html += `
                <div class="input-row-card">
                    <div class="select-group">
                        <label for="param-current">Current (I)</label>
                        <span class="input-hint">Amperes (A)</span>
                    </div>
                    <div class="input-group">
                        <input type="number" id="param-current" step="any" placeholder="e.g. 10" class="input-field">
                    </div>
                </div>`;
        }

        if (mode !== 'power') {
            html += `
                <div class="input-row-card">
                    <div class="select-group">
                        <label for="param-power">Power (P)</label>
                        <span class="input-hint">Watts (W)</span>
                    </div>
                    <div class="input-group">
                        <input type="number" id="param-power" step="any" placeholder="e.g. 2300" class="input-field">
                    </div>
                </div>`;
        }

        if (sys !== 'dc') {
            html += `
                <div class="input-row-card">
                    <div class="select-group">
                        <label for="param-pf">Power Factor (cos φ)</label>
                        <span class="input-hint">Value between 0.1 and 1.0</span>
                    </div>
                    <div class="input-group">
                        <input type="number" id="param-pf" step="0.01" value="0.8" min="0.1" max="1.0" class="input-field">
                    </div>
                </div>`;
        }

        dynamicInputsContainer.innerHTML = html;
        if (resultsSection) resultsSection.style.display = 'none';
    };

    systemTypeSelect.addEventListener('change', renderInputs);
    calcModeSelect.addEventListener('change', renderInputs);
    renderInputs(); // Initial render

    // Calculate Handler
    calcBtn.addEventListener('click', () => {
        const sys = systemTypeSelect.value;
        const mode = calcModeSelect.value;

        const banner = document.getElementById('power-alert-banner');
        if (banner) banner.remove();

        const vInput = document.getElementById('param-voltage');
        const iInput = document.getElementById('param-current');
        const pInput = document.getElementById('param-power');
        const pfInput = document.getElementById('param-pf');

        [vInput, iInput, pInput, pfInput].forEach(el => setFieldError(el, false));

        const V = vInput ? parseFloat(vInput.value) : null;
        const I = iInput ? parseFloat(iInput.value) : null;
        const P = pInput ? parseFloat(pInput.value) : null;
        const PF = pfInput ? parseFloat(pfInput.value) : 1.0;

        // Validation Checks
        let hasError = false;

        if (vInput && (isNaN(V) || V <= 0)) { setFieldError(vInput, true); hasError = true; }
        if (iInput && (isNaN(I) || I <= 0)) { setFieldError(iInput, true); hasError = true; }
        if (pInput && (isNaN(P) || P <= 0)) { setFieldError(pInput, true); hasError = true; }
        if (sys !== 'dc' && (isNaN(PF) || PF <= 0 || PF > 1)) { setFieldError(pfInput, true); hasError = true; }

        if (hasError) {
            showNotification('Please enter valid positive numbers for all required parameters.');
            return;
        }

        try {
            const multiplier = sys === '3ph' ? Math.sqrt(3) : 1.0;
            const effectivePF = sys === 'dc' ? 1.0 : PF;

            if (mode === 'power') {
                const calculatedP = V * I * multiplier * effectivePF;
                const apparentPower = V * I * multiplier;

                resLabel1.textContent = 'Active Power (P)';
                resVal1.textContent = `${calculatedP.toFixed(2)} W (${(calculatedP / 1000).toFixed(3)} kW)`;

                if (sys !== 'dc') {
                    resCard2.style.display = 'block';
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = `${apparentPower.toFixed(2)} VA (${(apparentPower / 1000).toFixed(3)} kVA)`;
                } else {
                    resCard2.style.display = 'none';
                }

            } else if (mode === 'voltage') {
                const calculatedV = P / (I * multiplier * effectivePF);

                resLabel1.textContent = 'Voltage (V)';
                resVal1.textContent = `${calculatedV.toFixed(2)} V`;
                resCard2.style.display = 'none';

            } else if (mode === 'current') {
                const calculatedI = P / (V * multiplier * effectivePF);

                resLabel1.textContent = 'Current (I)';
                resVal1.textContent = `${calculatedI.toFixed(2)} A`;
                resCard2.style.display = 'none';
            }

            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        } catch (err) {
            showNotification('Error performing calculation. Check input values.');
        }
    });

    // Reset Handler
    resetBtn.addEventListener('click', () => {
        renderInputs();
        const banner = document.getElementById('power-alert-banner');
        if (banner) banner.remove();
    });
});
