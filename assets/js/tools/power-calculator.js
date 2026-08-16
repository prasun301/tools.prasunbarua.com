'use strict';

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const systemTypeSelect = document.getElementById('system-type');
    const calcTargetSelect = document.getElementById('calc-target');
    const pfTargetOption = document.getElementById('pf-target-opt');

    // Input Rows
    const rowVoltage = document.getElementById('row-voltage');
    const rowCurrent = document.getElementById('row-current');
    const rowPower = document.getElementById('row-power');
    const rowPf = document.getElementById('row-pf');

    // Input Fields
    const valVoltage = document.getElementById('val-voltage');
    const valCurrent = document.getElementById('val-current');
    const valPower = document.getElementById('val-power');
    const valPf = document.getElementById('val-pf');

    // Buttons & Results
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');

    const resLabel1 = document.getElementById('res-label-1');
    const resVal1 = document.getElementById('res-val-1');
    const resLabel2 = document.getElementById('res-label-2');
    const resVal2 = document.getElementById('res-val-2');

    if (!calcBtn) return; // Safety check if element doesn't exist

    // Helper to highlight invalid input fields professionally
    const setFieldError = (inputEl, isError) => {
        if (!inputEl) return;
        if (isError) {
            inputEl.classList.add('input-error');
        } else {
            inputEl.classList.remove('input-error');
        }
    };

    // Helper to show inline warning banner instead of blocking alert popup
    const showNotification = (message, isError = true) => {
        let existingBanner = document.getElementById('power-alert-banner');
        if (!existingBanner) {
            existingBanner = document.createElement('div');
            existingBanner.id = 'power-alert-banner';
            existingBanner.className = isError ? 'error-banner' : 'success-banner';
            const form = calcBtn.closest('form') || calcBtn.parentElement;
            form.prepend(existingBanner);
            existingBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        existingBanner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${isError ? 'error' : 'info'}</span> ${message}`;
        setTimeout(() => existingBanner?.remove(), 6000);
    };

    // Helper to clear active error styles and banners
    const clearErrors = () => {
        [valVoltage, valCurrent, valPower, valPf].forEach(input => {
            if (input) setFieldError(input, false);
        });
        const existingBanner = document.getElementById('power-alert-banner');
        if (existingBanner) existingBanner.remove();
    };

    // Format output values nicely with auto-scaling units
    const formatUnit = (value, baseUnit) => {
        if (isNaN(value) || !isFinite(value)) return '--';
        const absVal = Math.abs(value);
        if (absVal >= 1e6) {
            return `${(value / 1e6).toFixed(4)} M${baseUnit}`;
        } else if (absVal >= 1e3) {
            return `${(value / 1e3).toFixed(4)} k${baseUnit}`;
        } else {
            return `${value.toFixed(4)} ${baseUnit}`;
        }
    };

    // Toggle form field visibility depending on current selections
    const updateFormVisibility = () => {
        const system = systemTypeSelect.value;
        const target = calcTargetSelect.value;
        const isAc = system !== 'dc';

        // Toggle PF option in "Calculate For" dropdown
        if (pfTargetOption) {
            pfTargetOption.style.display = isAc ? 'block' : 'none';
            if (!isAc && target === 'pf') {
                calcTargetSelect.value = 'power';
            }
        }

        const activeTarget = calcTargetSelect.value;

        // Show/Hide relevant rows based on target parameter
        if (rowPower) rowPower.style.display = activeTarget === 'power' ? 'none' : 'grid';
        if (rowVoltage) rowVoltage.style.display = activeTarget === 'voltage' ? 'none' : 'grid';
        if (rowCurrent) rowCurrent.style.display = activeTarget === 'current' ? 'none' : 'grid';
        if (rowPf) rowPf.style.display = (isAc && activeTarget !== 'pf') ? 'grid' : 'none';

        clearErrors();
        if (resultsSection) resultsSection.style.display = 'none';
    };

    // Main Calculate Handler
    calcBtn.addEventListener('click', () => {
        clearErrors();

        const system = systemTypeSelect.value;
        const target = calcTargetSelect.value;
        const sqrt3 = Math.sqrt(3);

        const V = parseFloat(valVoltage.value);
        const I = parseFloat(valCurrent.value);
        const P = parseFloat(valPower.value);
        const PF = system === 'dc' ? 1.0 : parseFloat(valPf.value);

        // Validate required fields based on selected target
        let requiredInputs = [];
        if (target === 'power') {
            requiredInputs = [valVoltage, valCurrent];
            if (system !== 'dc') requiredInputs.push(valPf);
        } else if (target === 'voltage') {
            requiredInputs = [valPower, valCurrent];
            if (system !== 'dc') requiredInputs.push(valPf);
        } else if (target === 'current') {
            requiredInputs = [valPower, valVoltage];
            if (system !== 'dc') requiredInputs.push(valPf);
        } else if (target === 'pf') {
            requiredInputs = [valPower, valVoltage, valCurrent];
        }

        let hasInvalidInput = false;
        requiredInputs.forEach(input => {
            const num = parseFloat(input.value);
            if (isNaN(num)) {
                setFieldError(input, true);
                hasInvalidInput = true;
            }
        });

        if (hasInvalidInput) {
            showNotification('Please enter valid numeric values for all required fields.');
            return;
        }

        // Additional domain validation for Power Factor
        if (system !== 'dc' && target !== 'pf' && (PF < 0 || PF > 1)) {
            setFieldError(valPf, true);
            showNotification('Power Factor (PF) must be between 0 and 1.');
            return;
        }

        let calculatedP, calculatedV, calculatedI, calculatedPF, apparentS;

        try {
            if (system === 'dc') {
                switch (target) {
                    case 'power':
                        calculatedP = V * I;
                        apparentS = calculatedP;
                        break;
                    case 'voltage':
                        if (I === 0) throw new Error('Division by zero');
                        calculatedV = P / I;
                        apparentS = P;
                        break;
                    case 'current':
                        if (V === 0) throw new Error('Division by zero');
                        calculatedI = P / V;
                        apparentS = P;
                        break;
                }
            } else if (system === '1phase') {
                switch (target) {
                    case 'power':
                        calculatedP = V * I * PF;
                        apparentS = V * I;
                        break;
                    case 'voltage':
                        if (I * PF === 0) throw new Error('Division by zero');
                        calculatedV = P / (I * PF);
                        apparentS = calculatedV * I;
                        break;
                    case 'current':
                        if (V * PF === 0) throw new Error('Division by zero');
                        calculatedI = P / (V * PF);
                        apparentS = V * calculatedI;
                        break;
                    case 'pf':
                        if (V * I === 0) throw new Error('Division by zero');
                        calculatedPF = P / (V * I);
                        if (calculatedPF > 1) {
                            throw new Error('Calculated PF exceeds 1. Check your values.');
                        }
                        apparentS = V * I;
                        break;
                }
            } else if (system === '3phase') {
                switch (target) {
                    case 'power':
                        calculatedP = sqrt3 * V * I * PF;
                        apparentS = sqrt3 * V * I;
                        break;
                    case 'voltage':
                        if (sqrt3 * I * PF === 0) throw new Error('Division by zero');
                        calculatedV = P / (sqrt3 * I * PF);
                        apparentS = sqrt3 * calculatedV * I;
                        break;
                    case 'current':
                        if (sqrt3 * V * PF === 0) throw new Error('Division by zero');
                        calculatedI = P / (sqrt3 * V * PF);
                        apparentS = sqrt3 * V * calculatedI;
                        break;
                    case 'pf':
                        if (sqrt3 * V * I === 0) throw new Error('Division by zero');
                        calculatedPF = P / (sqrt3 * V * I);
                        if (calculatedPF > 1) {
                            throw new Error('Calculated PF exceeds 1. Check your values.');
                        }
                        apparentS = sqrt3 * V * I;
                        break;
                }
            }

            // Render Output Section
            switch (target) {
                case 'power':
                    resLabel1.textContent = 'Active Real Power (P)';
                    resVal1.textContent = formatUnit(calculatedP, 'W');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                    break;
                case 'voltage':
                    resLabel1.textContent = 'Calculated Voltage (V)';
                    resVal1.textContent = formatUnit(calculatedV, 'V');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                    break;
                case 'current':
                    resLabel1.textContent = 'Calculated Current (I)';
                    resVal1.textContent = formatUnit(calculatedI, 'A');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                    break;
                case 'pf':
                    resLabel1.textContent = 'Power Factor (PF)';
                    resVal1.textContent = calculatedPF.toFixed(4);
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = formatUnit(apparentS, 'VA');
                    break;
            }

            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            showNotification(err.message || 'Invalid calculation parameters (check for division by zero or invalid ranges).');
        }
    });

    // Reset Button Click Event
    resetBtn.addEventListener('click', () => {
        valVoltage.value = '';
        valCurrent.value = '';
        valPower.value = '';
        if (valPf) valPf.value = '';

        if (resultsSection) resultsSection.style.display = 'none';

        clearErrors();
        updateFormVisibility();

        // Focus first available input field
        const firstVisibleInput = [valVoltage, valCurrent, valPower].find(el => el && el.parentElement.style.display !== 'none');
        if (firstVisibleInput) firstVisibleInput.focus();
    });

    // Event Listeners for Configuration Dropdowns
    systemTypeSelect.addEventListener('change', updateFormVisibility);
    calcTargetSelect.addEventListener('change', updateFormVisibility);

    // Initial Setup
    updateFormVisibility();
});
