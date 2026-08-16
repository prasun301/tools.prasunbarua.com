'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       ELEMENTS
       ========================================================= */

    const typeSelect = document.getElementById('powerCalcType');
    const modeSelect = document.getElementById('powerCalcMode');

    const inputSection = document.getElementById('powerCalcInputSection');
    const inputsContainer = document.getElementById('powerCalcInputs');

    const calcBtn = document.getElementById('powerCalcCalculate');
    const resetBtn = document.getElementById('powerCalcReset');

    const resultsSection = document.getElementById('powerCalcResult');
    const resultGrid = document.getElementById('powerCalcResultGrid');
    const resultHeader = document.querySelector(
        '#powerCalcResult .results-header h3'
    );

    if (!typeSelect || !modeSelect || !calcBtn || !resetBtn) {
        return;
    }


    /* =========================================================
       HELPERS
       ========================================================= */

    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return '--';
        }

        return Number(value).toFixed(4);
    }


    function getValue(id) {

        const element = document.getElementById(id);

        if (!element) {
            return NaN;
        }

        return parseFloat(element.value);
    }


    function setInputError(input, error) {

        if (!input) {
            return;
        }

        input.classList.toggle('input-error', error);
    }


    function clearInputErrors() {

        document
            .querySelectorAll('#powerCalcInputs .input-error')
            .forEach(input => {
                input.classList.remove('input-error');
            });
    }


    function showInputSection(show) {

        inputSection.style.display = show ? 'block' : 'none';

    }


    /* =========================================================
       NOTIFICATION
       ========================================================= */

    function showNotification(message, type = 'error') {

        const existing =
            document.getElementById('power-calc-alert-banner');

        if (existing) {
            existing.remove();
        }

        const banner = document.createElement('div');

        banner.id = 'power-calc-alert-banner';

        banner.className =
            type === 'error'
                ? 'error-banner'
                : 'success-banner';

        banner.innerHTML = `
            <span class="material-symbols-outlined" aria-hidden="true">
                ${type === 'error' ? 'error' : 'info'}
            </span>
            <span>${message}</span>
        `;

        const form =
            document.getElementById('powerCalcForm');

        if (form) {
            form.prepend(banner);
        }

        setTimeout(() => {

            if (banner.parentNode) {
                banner.remove();
            }

        }, 6000);
    }


    /* =========================================================
       RESULTS
       ========================================================= */

    function showResults(results, icon = 'check_circle') {

        resultGrid.innerHTML = '';

        const entries = Object.entries(results);

        entries.forEach(([label, value]) => {

            const item = document.createElement('div');

            item.className = 'result-item';

            item.innerHTML = `
                <span class="result-label">
                    ${label}
                </span>

                <span class="result-value">
                    ${value}
                </span>
            `;

            resultGrid.appendChild(item);

        });


        const iconElement =
            document.querySelector(
                '#powerCalcResult .results-header .material-symbols-outlined'
            );

        if (iconElement) {
            iconElement.textContent = icon;
        }


        if (resultHeader) {
            resultHeader.textContent = 'Calculated Results';
        }


        resultsSection.style.display = 'block';

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

        const iconElement =
            document.querySelector(
                '#powerCalcResult .results-header .material-symbols-outlined'
            );

        if (iconElement) {
            iconElement.textContent = 'calculate';
        }

        if (resultHeader) {
            resultHeader.textContent = 'Calculator Status';
        }

        resultsSection.style.display = 'none';
    }


    /* =========================================================
       INPUT CREATION
       ========================================================= */

    function createInput(
        id,
        label,
        hint,
        unit
    ) {

        return `
            <div class="input-row-card">

                <div class="select-group">
                    <label for="${id}">
                        ${label}
                    </label>

                    <span class="input-hint">
                        ${hint}
                    </span>
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
                        >

                        <span class="input-unit">
                            ${unit}
                        </span>

                    </div>

                </div>

            </div>
        `;
    }


    function createPowerFactorInput() {

        return `
            <div class="input-row-card">

                <div class="select-group">
                    <label for="powerCalcPF">
                        Power Factor
                    </label>

                    <span class="input-hint">
                        Enter a value between 0 and 1
                    </span>
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
                        >

                        <span class="input-unit">
                            cosφ
                        </span>

                    </div>

                </div>

            </div>
        `;
    }


    /* =========================================================
       UPDATE INPUTS
       ========================================================= */

    function updateInputs() {

        const type = typeSelect.value;
        const mode = modeSelect.value;

        inputsContainer.innerHTML = '';

        clearInputErrors();

        showInputSection(false);

        if (!type || !mode) {
            return;
        }


        /* -----------------------------------------------------
           CALCULATE POWER
           ----------------------------------------------------- */

        if (mode === 'P') {

            inputsContainer.innerHTML =

                createInput(
                    'powerCalcVoltage',
                    'Voltage',
                    'Enter the system voltage',
                    'V'
                ) +

                createInput(
                    'powerCalcCurrent',
                    'Current',
                    'Enter the electrical current',
                    'A'
                );


            if (type !== 'dc') {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }
        }


        /* -----------------------------------------------------
           CALCULATE VOLTAGE
           ----------------------------------------------------- */

        else if (mode === 'V') {

            inputsContainer.innerHTML =

                createInput(
                    'powerCalcPower',
                    'Power',
                    'Enter the electrical power',
                    'W'
                ) +

                createInput(
                    'powerCalcCurrent',
                    'Current',
                    'Enter the electrical current',
                    'A'
                );


            if (type !== 'dc') {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }
        }


        /* -----------------------------------------------------
           CALCULATE CURRENT
           ----------------------------------------------------- */

        else if (mode === 'I') {

            inputsContainer.innerHTML =

                createInput(
                    'powerCalcPower',
                    'Power',
                    'Enter the electrical power',
                    'W'
                ) +

                createInput(
                    'powerCalcVoltage',
                    'Voltage',
                    'Enter the system voltage',
                    'V'
                );


            if (type !== 'dc') {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }
        }


        showInputSection(true);


        const firstInput =
            inputsContainer.querySelector('input');

        if (firstInput) {
            firstInput.focus();
        }
    }


    /* =========================================================
       POWER FACTOR
       ========================================================= */

    function getPowerFactor(type) {

        if (type === 'dc') {
            return 1;
        }

        const pfInput =
            document.getElementById('powerCalcPF');

        const pf =
            parseFloat(pfInput?.value);

        if (
            Number.isNaN(pf) ||
            pf <= 0 ||
            pf > 1
        ) {

            setInputError(pfInput, true);

            return null;
        }

        setInputError(pfInput, false);

        return pf;
    }


    /* =========================================================
       VALIDATION
       ========================================================= */

    function validatePositive(
        inputId,
        fieldName,
        allowZero = false
    ) {

        const input =
            document.getElementById(inputId);

        const value =
            parseFloat(input?.value);


        const invalid =
            Number.isNaN(value) ||
            (allowZero ? value < 0 : value <= 0);


        setInputError(input, invalid);


        if (invalid) {

            showNotification(
                allowZero
                    ? `Please enter a valid ${fieldName}.`
                    : `${fieldName} must be greater than zero.`
            );

            return null;
        }

        return value;
    }


    /* =========================================================
       CALCULATE
       ========================================================= */

    function calculate() {

        clearInputErrors();

        const type = typeSelect.value;
        const mode = modeSelect.value;


        if (!type || !mode) {

            showNotification(
                'Please select the system type and calculation parameter.'
            );

            return;
        }


        const pf =
            getPowerFactor(type);


        if (pf === null) {

            showNotification(
                'Power factor must be greater than 0 and no greater than 1.'
            );

            return;
        }


        /* -----------------------------------------------------
           POWER
           ----------------------------------------------------- */

        if (mode === 'P') {

            const V =
                validatePositive(
                    'powerCalcVoltage',
                    'Voltage'
                );

            if (V === null) {
                return;
            }


            const I =
                validatePositive(
                    'powerCalcCurrent',
                    'Current'
                );

            if (I === null) {
                return;
            }


            let power;


            if (type === 'dc') {

                power = V * I;

                showResults({
                    'DC Power': `${formatNumber(power)} W`
                });

                return;
            }


            if (type === '1ph') {

                power = V * I * pf;

                showResults({
                    'Single Phase Power':
                        `${formatNumber(power)} W`
                });

                return;
            }


            if (type === '3ph') {

                power =
                    Math.sqrt(3) *
                    V *
                    I *
                    pf;

                showResults({
                    'Three Phase Power':
                        `${formatNumber(power)} W`
                });

                return;
            }
        }


        /* -----------------------------------------------------
           VOLTAGE
           ----------------------------------------------------- */

        if (mode === 'V') {

            const P =
                validatePositive(
                    'powerCalcPower',
                    'Power'
                );

            if (P === null) {
                return;
            }


            const I =
                validatePositive(
                    'powerCalcCurrent',
                    'Current'
                );

            if (I === null) {
                return;
            }


            let voltage;


            if (type === 'dc') {

                voltage = P / I;

                showResults({
                    'Voltage':
                        `${formatNumber(voltage)} V`
                });

                return;
            }


            if (type === '1ph') {

                voltage =
                    P /
                    (I * pf);

                showResults({
                    'Single Phase Voltage':
                        `${formatNumber(voltage)} V`
                });

                return;
            }


            if (type === '3ph') {

                voltage =
                    P /
                    (
                        Math.sqrt(3) *
                        I *
                        pf
                    );

                showResults({
                    'Line Voltage':
                        `${formatNumber(voltage)} V`
                });

                return;
            }
        }


        /* -----------------------------------------------------
           CURRENT
           ----------------------------------------------------- */

        if (mode === 'I') {

            const P =
                validatePositive(
                    'powerCalcPower',
                    'Power'
                );

            if (P === null) {
                return;
            }


            const V =
                validatePositive(
                    'powerCalcVoltage',
                    'Voltage'
                );

            if (V === null) {
                return;
            }


            let current;


            if (type === 'dc') {

                current = P / V;

                showResults({
                    'Current':
                        `${formatNumber(current)} A`
                });

                return;
            }


            if (type === '1ph') {

                current =
                    P /
                    (V * pf);

                showResults({
                    'Single Phase Current':
                        `${formatNumber(current)} A`
                });

                return;
            }


            if (type === '3ph') {

                current =
                    P /
                    (
                        Math.sqrt(3) *
                        V *
                        pf
                    );

                showResults({
                    'Line Current':
                        `${formatNumber(current)} A`
                });

                return;
            }
        }
    }


    /* =========================================================
       RESET
       ========================================================= */

    function resetCalculator() {

        typeSelect.value = '';
        modeSelect.value = '';

        inputsContainer.innerHTML = '';

        showInputSection(false);

        clearInputErrors();

        const banner =
            document.getElementById(
                'power-calc-alert-banner'
            );

        if (banner) {
            banner.remove();
        }

        resultsSection.style.display = 'none';

        resultGrid.innerHTML = '';

        if (resultHeader) {
            resultHeader.textContent =
                'Calculated Results';
        }

        const iconElement =
            document.querySelector(
                '#powerCalcResult .results-header .material-symbols-outlined'
            );

        if (iconElement) {
            iconElement.textContent = 'check_circle';
        }

        typeSelect.focus();
    }


    /* =========================================================
       EVENTS
       ========================================================= */

    typeSelect.addEventListener(
        'change',
        () => {

            modeSelect.value = '';

            inputsContainer.innerHTML = '';

            showInputSection(false);

            resultsSection.style.display = 'none';

            clearInputErrors();

        }
    );


    modeSelect.addEventListener(
        'change',
        updateInputs
    );


    calcBtn.addEventListener(
        'click',
        calculate
    );


    resetBtn.addEventListener(
        'click',
        resetCalculator
    );


    /* =========================================================
       ENTER KEY
       ========================================================= */

    inputsContainer.addEventListener(
        'keydown',
        event => {

            if (event.key === 'Enter') {

                event.preventDefault();

                calculate();

            }

        }
    );

});
