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

    if (!calcBtn || !resultsSection) {
        console.error('Power Calculator Error: Missing calcBtn or resultsSection in HTML.');
        return;
    }

    const setFieldError = (inputEl, isError) => {
        if (!inputEl) return;
        inputEl.classList.toggle('input-error', isError);
    };

    const showNotification = (message, isError = true) => {
        let existingBanner = document.getElementById('power-alert-banner');
        if (!existingBanner) {
            existingBanner = document.createElement('div');
            existingBanner.id = 'power-alert-banner';
            existingBanner.className = isError ? 'error-banner' : 'success-banner';
            const container = calcBtn.closest('form') || calcBtn.parentElement;
            container.prepend(existingBanner);
            existingBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        existingBanner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${isError ? 'error' : 'info'}</span> ${message}`;
        setTimeout(() => existingBanner?.remove(), 6000);
    };

    const clearErrors = () => {
        [valVoltage, valCurrent, valPower, valPf].forEach(input => setFieldError(input, false));
        const existingBanner = document.getElementById('power-alert-banner');
        if (existingBanner) existingBanner.remove();
    };

    const formatUnit = (value, baseUnit) => {
        if (isNaN(value) || !isFinite(value)) return '--';
        const absVal = Math.abs(value);
        if (absVal >= 1e6) return `${(value / 1e6).toFixed(4)} M${baseUnit}`;
        if (absVal >= 1e3) return `${(value / 1e3).toFixed(4)} k${baseUnit}`;
        return `${value.toFixed(4)} ${baseUnit}`;
    };

    const updateFormVisibility = () => {
        if (!systemTypeSelect || !calcTargetSelect) return;

        const system = systemTypeSelect.value;
        const target = calcTargetSelect.value;
        const isAc = system !== 'dc';

        if (pfTargetOption) {
            pfTargetOption.style.display = isAc ? 'block' : 'none';
            if (!isAc && target === 'pf') calcTargetSelect.value = 'power';
        }

        const activeTarget = calcTargetSelect.value;

        if (rowPower) rowPower.style.display = activeTarget === 'power' ? 'none' : 'grid';
        if (rowVoltage) rowVoltage.style.display = activeTarget === 'voltage' ? 'none' : 'grid';
        if (rowCurrent) rowCurrent.style.display = activeTarget === 'current' ? 'none' : 'grid';
        if (rowPf) rowPf.style.display = (isAc && activeTarget !== 'pf') ? 'grid' : 'none';

        clearErrors();
        resultsSection.style.display = 'none';
    };

    // Calculate Action
    calcBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevents page reload if button is inside a form
        clearErrors();

        const system = systemTypeSelect?.value || 'dc';
        const target = calcTargetSelect?.value || 'power';
        const sqrt3 = Math.sqrt(3);

        const V = parseFloat(valVoltage?.value);
        const I = parseFloat(valCurrent?.value);
        const P = parseFloat(valPower?.value);
        const PF = system === 'dc' ? 1.0 : parseFloat(valPf?.value);

        let requiredInputs = [];
        if (target === 'power') requiredInputs = [valVoltage, valCurrent, ...(system !== 'dc' ? [valPf] : [])];
        else if (target === 'voltage') requiredInputs = [valPower, valCurrent, ...(system !== 'dc' ? [valPf] : [])];
        else if (target === 'current') requiredInputs = [valPower, valVoltage, ...(system !== 'dc' ? [valPf] : [])];
        else if (target === 'pf') requiredInputs = [valPower, valVoltage, valCurrent];

        let hasInvalidInput = false;
        requiredInputs.forEach(input => {
            if (!input || isNaN(parseFloat(input.value))) {
                setFieldError(input, true);
                hasInvalidInput = true;
            }
        });

        if (hasInvalidInput) {
            showNotification('Please fill in all required fields with valid numeric values.');
            return;
        }

        if (system !== 'dc' && target !== 'pf' && (PF < 0 || PF > 1)) {
            setFieldError(valPf, true);
            showNotification('Power Factor must be between 0 and 1.');
            return;
        }

        let calculatedP, calculatedV, calculatedI, calculatedPF, apparentS;

        try {
            if (system === 'dc') {
                if (target === 'power') { calculatedP = V * I; apparentS = calculatedP; }
                else if (target === 'voltage') { if (I === 0) throw new Error('Division by zero'); calculatedV = P / I; apparentS = P; }
                else if (target === 'current') { if (V === 0) throw new Error('Division by zero'); calculatedI = P / V; apparentS = P; }
            } else if (system === '1phase') {
                if (target === 'power') { calculatedP = V * I * PF; apparentS = V * I; }
                else if (target === 'voltage') { if (I * PF === 0) throw new Error('Division by zero'); calculatedV = P / (I * PF); apparentS = calculatedV * I; }
                else if (target === 'current') { if (V * PF === 0) throw new Error('Division by zero'); calculatedI = P / (V * PF); apparentS = V * calculatedI; }
                else if (target === 'pf') { if (V * I === 0) throw new Error('Division by zero'); calculatedPF = P / (V * I); apparentS = V * I; }
            } else if (system === '3phase') {
                if (target === 'power') { calculatedP = sqrt3 * V * I * PF; apparentS = sqrt3 * V * I; }
                else if (target === 'voltage') { if (sqrt3 * I * PF === 0) throw new Error('Division by zero'); calculatedV = P / (sqrt3 * I * PF); apparentS = sqrt3 * calculatedV * I; }
                else if (target === 'current') { if (sqrt3 * V * PF === 0) throw new Error('Division by zero'); calculatedI = P / (sqrt3 * V * PF); apparentS = sqrt3 * V * calculatedI; }
                else if (target === 'pf') { if (sqrt3 * V * I === 0) throw new Error('Division by zero'); calculatedPF = P / (sqrt3 * V * I); apparentS = sqrt3 * V * I; }
            }

            if (resLabel1 && resVal1 && resLabel2 && resVal2) {
                if (target === 'power') {
                    resLabel1.textContent = 'Active Real Power (P)';
                    resVal1.textContent = formatUnit(calculatedP, 'W');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                } else if (target === 'voltage') {
                    resLabel1.textContent = 'Calculated Voltage (V)';
                    resVal1.textContent = formatUnit(calculatedV, 'V');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                } else if (target === 'current') {
                    resLabel1.textContent = 'Calculated Current (I)';
                    resVal1.textContent = formatUnit(calculatedI, 'A');
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = system === 'dc' ? formatUnit(apparentS, 'W') : formatUnit(apparentS, 'VA');
                } else if (target === 'pf') {
                    resLabel1.textContent = 'Power Factor (PF)';
                    resVal1.textContent = calculatedPF.toFixed(4);
                    resLabel2.textContent = 'Apparent Power (S)';
                    resVal2.textContent = formatUnit(apparentS, 'VA');
                }
            }

            resultsSection.style.display = 'block';
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } catch (err) {
            showNotification(err.message || 'Invalid calculation parameters.');
        }
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (valVoltage) valVoltage.value = '';
            if (valCurrent) valCurrent.value = '';
            if (valPower) valPower.value = '';
            if (valPf) valPf.value = '';
            resultsSection.style.display = 'none';
            clearErrors();
            updateFormVisibility();
        });
    }

    if (systemTypeSelect) systemTypeSelect.addEventListener('change', updateFormVisibility);
    if (calcTargetSelect) calcTargetSelect.addEventListener('change', updateFormVisibility);

    updateFormVisibility();
});
