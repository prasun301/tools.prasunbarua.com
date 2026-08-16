'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       ELEMENTS
    ========================================================== */

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

    const resultIcon = document.querySelector(
        '#powerCalcResult .results-header .material-symbols-outlined'
    );

    const form = document.getElementById('power-calculator-form');


    /* =========================================================
       INITIAL SAFETY CHECK
    ========================================================== */

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


    /* =========================================================
       CONSTANTS
    ========================================================== */

    const CALCULATION_MODES = {
        P: 'Power',
        V: 'Voltage',
        I: 'Current'
    };

    const SYSTEM_TYPES = {
        dc: 'DC',
        '1ph': 'Single-Phase AC',
        '3ph': 'Three-Phase AC'
    };


    /* =========================================================
       HELPERS
    ========================================================== */

    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return '--';
        }

        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 4
        }).format(value);
    }


    function getValue(id) {

        const input = document.getElementById(id);

        if (!input) {
            return NaN;
        }

        return parseFloat(input.value);
    }


    function setInputError(input, hasError) {

        if (!input) {
            return;
        }

        input.classList.toggle('input-error', hasError);

        input.setAttribute(
            'aria-invalid',
            hasError ? 'true' : 'false'
        );
    }


    function clearInputErrors() {

        inputsContainer
            .querySelectorAll('.input-error')
            .forEach(input => {

                input.classList.remove('input-error');
                input.setAttribute('aria-invalid', 'false');

            });
    }


    function showInputSection(show) {

        inputSection.hidden = !show;

        inputSection.style.display =
            show ? 'block' : 'none';
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
       NOTIFICATION
    ========================================================== */

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

        const icon = document.createElement('span');

        icon.className =
            'material-symbols-outlined';

        icon.setAttribute('aria-hidden', 'true');

        icon.textContent =
            type === 'error'
                ? 'error'
                : 'check_circle';

        const text = document.createElement('span');

        text.textContent = message;

        banner.appendChild(icon);
        banner.appendChild(text);

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
    ========================================================== */

    function showResults(results, icon = 'check_circle') {

        resultGrid.innerHTML = '';

        Object.entries(results).forEach(([label, value]) => {

            const item = document.createElement('div');

            item.className = 'result-item';

            const resultLabel =
                document.createElement('span');

            resultLabel.className =
                'result-label';

            resultLabel.textContent = label;

            const resultValue =
                document.createElement('span');

            resultValue.className =
                'result-value';

            resultValue.textContent = value;

            item.appendChild(resultLabel);
            item.appendChild(resultValue);

            resultGrid.appendChild(item);
        });


        if (resultIcon) {
            resultIcon.textContent = icon;
        }


        if (resultHeader) {
            resultHeader.textContent =
                'Calculated Results';
        }


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

        if (resultIcon) {
            resultIcon.textContent = 'calculate';
        }

        if (resultHeader) {
            resultHeader.textContent =
                'Calculator Status';
        }

        hideResults();
    }


    /* =========================================================
       INPUT CREATION
    ========================================================== */

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
                            aria-invalid="false"
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
                        Enter a value from 0.01 to 1.00
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
                            aria-invalid="false"
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
    ========================================================== */

    function updateInputs() {

        const type = typeSelect.value;
        const mode = modeSelect.value;

        inputsContainer.innerHTML = '';

        clearInputErrors();

        hideResults();

        showInputSection(false);


        if (!type || !mode) {
            return;
        }


        /* -----------------------------------------------------
           CALCULATE POWER
        ------------------------------------------------------ */

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
        ------------------------------------------------------ */

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
        ------------------------------------------------------ */

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
    ========================================================== */

    function getPowerFactor(type) {

        if (type === 'dc') {
            return 1;
        }

        const pfInput =
            document.getElementById('powerCalcPF');

        const pf =
            parseFloat(pfInput?.value);


        const invalid =
            !Number.isFinite(pf) ||
            pf <= 0 ||
            pf > 1;


        setInputError(
            pfInput,
            invalid
        );


        if (invalid) {
            return null;
        }

        return pf;
    }


    /* =========================================================
       POSITIVE VALUE VALIDATION
    ========================================================== */

    function validatePositive(
        inputId,
        fieldName
    ) {

        const input =
            document.getElementById(inputId);

        const value =
            parseFloat(input?.value);


        const invalid =
            !Number.isFinite(value) ||
            value <= 0;


        setInputError(
            input,
            invalid
        );


        if (invalid) {

            showNotification(
                `${fieldName} must be greater than zero.`
            );

            if (input) {
                input.focus();
            }

            return null;
        }

        return value;
    }


    /* =========================================================
       CALCULATE POWER
    ========================================================== */

    function calculatePower(type, V, I, pf) {

        if (type === 'dc') {

            return {
                'DC Power':
                    `${formatNumber(V * I)} W`
            };
        }


        if (type === '1ph') {

            return {
                'Single-Phase Power':
                    `${formatNumber(V * I * pf)} W`
            };
        }


        if (type === '3ph') {

            return {
                'Three-Phase Power':
                    `${formatNumber(
                        Math.sqrt(3) * V * I * pf
                    )} W`
            };
        }


        return null;
    }


    /* =========================================================
       CALCULATE VOLTAGE
    ========================================================== */

    function calculateVoltage(type, P, I, pf) {

        if (type === 'dc') {

            return {
                'Voltage':
                    `${formatNumber(P / I)} V`
            };
        }


        if (type === '1ph') {

            return {
                'Single-Phase Voltage':
                    `${formatNumber(
                        P / (I * pf)
                    )} V`
            };
        }


        if (type === '3ph') {

            return {
                'Line Voltage':
                    `${formatNumber(
                        P /
                        (
                            Math.sqrt(3) *
                            I *
                            pf
                        )
                    )} V`
            };
        }


        return null;
    }


    /* =========================================================
       CALCULATE CURRENT
    ========================================================== */

    function calculateCurrent(type, P, V, pf) {

        if (type === 'dc') {

            return {
                'Current':
                    `${formatNumber(P / V)} A`
            };
        }


        if (type === '1ph') {

            return {
                'Single-Phase Current':
                    `${formatNumber(
                        P / (V * pf)
                    )} A`
            };
        }


        if (type === '3ph') {

            return {
                'Line Current':
                    `${formatNumber(
                        P /
                        (
                            Math.sqrt(3) *
                            V *
                            pf
                        )
                    )} A`
            };
        }


        return null;
    }


    /* =========================================================
       CALCULATE
    ========================================================== */

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

            const pfInput =
                document.getElementById('powerCalcPF');

            if (pfInput) {
                pfInput.focus();
            }

            return;
        }


        /* -----------------------------------------------------
           POWER
        ------------------------------------------------------ */

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


            const results =
                calculatePower(
                    type,
                    V,
                    I,
                    pf
                );


            if (results) {
                showResults(results);
            }

            return;
        }


        /* -----------------------------------------------------
           VOLTAGE
        ------------------------------------------------------ */

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


            const results =
                calculateVoltage(
                    type,
                    P,
                    I,
                    pf
                );


            if (results) {
                showResults(results);
            }

            return;
        }


        /* -----------------------------------------------------
           CURRENT
        ------------------------------------------------------ */

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


            const results =
                calculateCurrent(
                    type,
                    P,
                    V,
                    pf
                );


            if (results) {
                showResults(results);
            }
        }
    }


    /* =========================================================
       RESET
    ========================================================== */

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

        showReadyState();

        typeSelect.focus();
    }


    /* =========================================================
       EVENTS
    ========================================================== */

    typeSelect.addEventListener(
        'change',
        () => {

            modeSelect.value = '';

            inputsContainer.innerHTML = '';

            showInputSection(false);

            hideResults();

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
    ========================================================== */

    inputsContainer.addEventListener(
        'keydown',
        event => {

            if (
                event.key === 'Enter' &&
                !event.shiftKey
            ) {

                event.preventDefault();

                calculate();
            }
        }
    );


    /* =========================================================
       ESCAPE KEY
    ========================================================== */

    document.addEventListener(
        'keydown',
        event => {

            if (event.key !== 'Escape') {
                return;
            }

            const banner =
                document.getElementById(
                    'power-calc-alert-banner'
                );

            if (banner) {
                banner.remove();
            }
        }
    );


    /* =========================================================
       INITIAL STATE
    ========================================================== */

    showReadyState();

});
