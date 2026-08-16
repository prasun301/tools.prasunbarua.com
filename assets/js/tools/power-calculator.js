'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       ELEMENTS & INITIAL SAFETY CHECK
    ========================================================== */
    const typeSelect = document.getElementById('powerCalcType');
    const modeSelect = document.getElementById('powerCalcMode');
    const inputSection = document.getElementById('powerCalcInputSection');
    const inputsContainer = document.getElementById('powerCalcInputs');
    const calcBtn = document.getElementById('powerCalcCalculate');
    const resetBtn = document.getElementById('powerCalcReset');
    const resultsSection = document.getElementById('powerCalcResult');
    const resultGrid = document.getElementById('powerCalcResultGrid');
    const resultHeader = document.querySelector('#powerCalcResult .results-header h3');
    const resultIcon = document.querySelector('#powerCalcResult .results-header .material-symbols-outlined');
    const form = document.getElementById('power-calculator-form');

    if (
        !typeSelect ||
        !modeSelect ||
        !inputSection ||
        !inputsContainer ||
        !calcBtn ||
        !resetBtn ||
        !resultsSection ||
        !resultGrid
    ) {
        return;
    }

    let notificationTimer = null;

    /* =========================================================
       FORM SUBMIT PREVENTION
    ========================================================== */
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            calculate();
        });
    }

    /* =========================================================
       HELPERS
    ========================================================== */
    function formatNumber(value) {
        if (!Number.isFinite(value)) return '--';

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
        }).format(value);
    }

    function setInputError(input, hasError) {
        if (!input) return;
        input.classList.toggle('input-error', hasError);
        input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    }

    function clearInputErrors() {
        inputsContainer.querySelectorAll('.input-error').forEach(input => {
            input.classList.remove('input-error');
            input.setAttribute('aria-invalid', 'false');
        });
    }

    function showInputSection(show) {
        inputSection.hidden = !show;
        inputSection.style.display = show ? 'block' : 'none';
    }

    function hideResults() {
        resultsSection.hidden = true;
        resultsSection.style.display = 'none';
    }

    function showResultsSection() {
        resultsSection.hidden = false;
        resultsSection.style.display = 'block';
    }

    /* =========================================================
       NOTIFICATIONS
    ========================================================== */
    function showNotification(message, type = 'error') {
        if (notificationTimer) {
            clearTimeout(notificationTimer);
        }

        const existing = document.getElementById('power-calc-alert-banner');
        if (existing) {
            existing.remove();
        }

        const banner = document.createElement('div');
        banner.id = 'power-calc-alert-banner';
        banner.className = type === 'error' ? 'error-banner' : 'success-banner';
        banner.setAttribute('role', 'alert');
        banner.setAttribute('aria-live', 'polite');

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = type === 'error' ? 'error' : 'check_circle';

        const text = document.createElement('span');
        text.textContent = message;

        banner.appendChild(icon);
        banner.appendChild(text);

        if (form) {
            form.prepend(banner);
        } else {
            inputSection.prepend(banner);
        }

        notificationTimer = setTimeout(() => {
            if (banner.parentNode) {
                banner.remove();
            }
        }, 6000);
    }

    /* =========================================================
       RESULTS DISPLAY
    ========================================================== */
    function showResults(results, icon = 'check_circle') {
        resultGrid.innerHTML = '';

        Object.entries(results).forEach(([label, value]) => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const resultLabel = document.createElement('span');
            resultLabel.className = 'result-label';
            resultLabel.textContent = label;

            const resultValue = document.createElement('span');
            resultValue.className = 'result-value';
            resultValue.textContent = value;

            item.appendChild(resultLabel);
            item.appendChild(resultValue);
            resultGrid.appendChild(item);
        });

        if (resultIcon) resultIcon.textContent = icon;
        if (resultHeader) resultHeader.textContent = 'Calculated Results';

        showResultsSection();

        resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }

    function showReadyState() {
        resultGrid.innerHTML = `
            <div class="result-item">
                <span class="result-label">Status</span>
                <span class="result-value">Ready</span>
            </div>
        `;

        if (resultIcon) resultIcon.textContent = 'calculate';
        if (resultHeader) resultHeader.textContent = 'Calculator Status';

        hideResults();
    }

    /* =========================================================
       INPUT CREATION
    ========================================================== */
    function createInput(id, label, hint, unit) {
        return `
            <div class="input-row-card">
                <div class="select-group">
                    <label for="${id}">${label}</label>
                    <span class="input-hint">${hint}</span>
                </div>
                <div class="input-group">
                    <div class="input-field-wrapper">
                        <input
                            type="number"
                            id="${id}"
                            name="${id}"
                            placeholder="0.00"
                            step="any"
                            min="0"
                            inputmode="decimal"
                            autocomplete="off"
                            aria-invalid="false"
                        >
                        <span class="input-unit">${unit}</span>
                    </div>
                </div>
            </div>
        `;
    }

    function createPowerFactorInput() {
        return `
            <div class="input-row-card">
                <div class="select-group">
                    <label for="powerCalcPF">Power Factor</label>
                    <span class="input-hint">Value between 0.01 and 1.00</span>
                </div>
                <div class="input-group">
                    <div class="input-field-wrapper">
                        <input
                            type="number"
                            id="powerCalcPF"
                            name="powerCalcPF"
                            placeholder="1.00"
                            value="1"
                            step="0.01"
                            min="0.01"
                            max="1"
                            inputmode="decimal"
                            autocomplete="off"
                            aria-invalid="false"
                        >
                        <span class="input-unit">cos φ</span>
                    </div>
                </div>
            </div>
        `;
    }

    function bindLiveValidation() {
        inputsContainer.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => setInputError(input, false));
        });
    }

    /* =========================================================
       UPDATE INPUTS DOM
    ========================================================== */
    function updateInputs() {
        const type = typeSelect.value;
        const mode = modeSelect.value;

        inputsContainer.innerHTML = '';
        clearInputErrors();
        hideResults();
        showInputSection(false);

        if (!type || !mode) return;

        if (mode === 'P') {
            inputsContainer.innerHTML =
                createInput('powerCalcVoltage', 'Voltage', 'Enter the system voltage', 'V') +
                createInput('powerCalcCurrent', 'Current', 'Enter the electrical current', 'A');

            if (type !== 'dc') {
                inputsContainer.innerHTML += createPowerFactorInput();
            }
        } else if (mode === 'V') {
            inputsContainer.innerHTML =
                createInput('powerCalcPower', 'Power', 'Enter active power', 'W') +
                createInput('powerCalcCurrent', 'Current', 'Enter electrical current', 'A');

            if (type !== 'dc') {
                inputsContainer.innerHTML += createPowerFactorInput();
            }
        } else if (mode === 'I') {
            inputsContainer.innerHTML =
                createInput('powerCalcPower', 'Power', 'Enter active power', 'W') +
                createInput('powerCalcVoltage', 'Voltage', 'Enter system voltage', 'V');

            if (type !== 'dc') {
                inputsContainer.innerHTML += createPowerFactorInput();
            }
        }

        showInputSection(true);
        bindLiveValidation();

        const firstInput = inputsContainer.querySelector('input');
        if (firstInput) firstInput.focus();
    }

    /* =========================================================
       VALIDATION
    ========================================================== */
    function getPowerFactor(type) {
        if (type === 'dc') return 1;

        const pfInput = document.getElementById('powerCalcPF');
        const pf = parseFloat(pfInput?.value);
        const invalid = !Number.isFinite(pf) || pf <= 0 || pf > 1;

        setInputError(pfInput, invalid);

        return invalid ? null : pf;
    }

    function validatePositive(inputId, fieldName) {
        const input = document.getElementById(inputId);
        const value = parseFloat(input?.value);
        const invalid = !Number.isFinite(value) || value <= 0;

        setInputError(input, invalid);

        if (invalid) {
            showNotification(`${fieldName} must be a number greater than zero.`);
            if (input) input.focus();
            return null;
        }

        return value;
    }

    /* =========================================================
       CALCULATION LOGIC
    ========================================================== */
    function calculatePower(type, V, I, pf) {
        if (type === 'dc') {
            const P = V * I;
            return { 'Active Power (P)': `${formatNumber(P)} W` };
        }

        const multiplier = type === '3ph' ? Math.sqrt(3) : 1;
        const P = multiplier * V * I * pf;
        const S = multiplier * V * I;
        const Q = Math.sqrt(Math.max(0, S * S - P * P));

        return {
            'Active Power (P)': `${formatNumber(P)} W`,
            'Apparent Power (S)': `${formatNumber(S)} VA`,
            'Reactive Power (Q)': `${formatNumber(Q)} VAR`
        };
    }

    function calculateVoltage(type, P, I, pf) {
        if (type === 'dc') {
            return { 'Voltage (V)': `${formatNumber(P / I)} V` };
        }

        const multiplier = type === '3ph' ? Math.sqrt(3) : 1;
        const V = P / (multiplier * I * pf);
        const S = multiplier * V * I;

        return {
            [type === '3ph' ? 'Line Voltage (V)' : 'Voltage (V)']: `${formatNumber(V)} V`,
            'Apparent Power (S)': `${formatNumber(S)} VA`
        };
    }

    function calculateCurrent(type, P, V, pf) {
        if (type === 'dc') {
            return { 'Current (I)': `${formatNumber(P / V)} A` };
        }

        const multiplier = type === '3ph' ? Math.sqrt(3) : 1;
        const I = P / (multiplier * V * pf);
        const S = multiplier * V * I;

        return {
            [type === '3ph' ? 'Line Current (I)' : 'Current (I)']: `${formatNumber(I)} A`,
            'Apparent Power (S)': `${formatNumber(S)} VA`
        };
    }

    function calculate() {
        clearInputErrors();

        const type = typeSelect.value;
        const mode = modeSelect.value;

        if (!type || !mode) {
            showNotification('Please select both system type and parameter to calculate.');
            return;
        }

        const pf = getPowerFactor(type);
        if (pf === null) {
            showNotification('Power factor must be between 0.01 and 1.00.');
            const pfInput = document.getElementById('powerCalcPF');
            if (pfInput) pfInput.focus();
            return;
        }

        let results = null;

        if (mode === 'P') {
            const V = validatePositive('powerCalcVoltage', 'Voltage');
            if (V === null) return;
            const I = validatePositive('powerCalcCurrent', 'Current');
            if (I === null) return;

            results = calculatePower(type, V, I, pf);
        } else if (mode === 'V') {
            const P = validatePositive('powerCalcPower', 'Power');
            if (P === null) return;
            const I = validatePositive('powerCalcCurrent', 'Current');
            if (I === null) return;

            results = calculateVoltage(type, P, I, pf);
        } else if (mode === 'I') {
            const P = validatePositive('powerCalcPower', 'Power');
            if (P === null) return;
            const V = validatePositive('powerCalcVoltage', 'Voltage');
            if (V === null) return;

            results = calculateCurrent(type, P, V, pf);
        }

        if (results) {
            showResults(results);
        }
    }

    function resetCalculator() {
        typeSelect.value = '';
        modeSelect.value = '';
        inputsContainer.innerHTML = '';

        showInputSection(false);
        clearInputErrors();

        const banner = document.getElementById('power-calc-alert-banner');
        if (banner) banner.remove();

        showReadyState();
        typeSelect.focus();
    }

    /* =========================================================
       EVENT BINDINGS
    ========================================================== */
    typeSelect.addEventListener('change', () => {
        modeSelect.value = '';
        inputsContainer.innerHTML = '';
        showInputSection(false);
        hideResults();
        clearInputErrors();
    });

    modeSelect.addEventListener('change', updateInputs);
    calcBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', resetCalculator);

    inputsContainer.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            calculate();
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            const banner = document.getElementById('power-calc-alert-banner');
            if (banner) banner.remove();
        }
    });

    showReadyState();
});
