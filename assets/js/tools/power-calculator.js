'use strict';

document.addEventListener('DOMContentLoaded', () => {

    /* =========================================================
       ELEMENTS
       ========================================================= */

    const typeSelect = document.getElementById('power-type-select');
    const modeSelect = document.getElementById('power-mode-select');

    const value1Input = document.getElementById('power-value-1');
    const value2Input = document.getElementById('power-value-2');
    const pfInput = document.getElementById('power-factor');

    const value1Label = document.getElementById('power-value-1-label');
    const value1Hint = document.getElementById('power-value-1-hint');
    const value1Unit = document.getElementById('power-value-1-unit');

    const value2Label = document.getElementById('power-value-2-label');
    const value2Hint = document.getElementById('power-value-2-hint');
    const value2Unit = document.getElementById('power-value-2-unit');

    const pfRow = document.getElementById('power-factor-row');

    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');

    const resultsSection = document.getElementById('results-section');

    const resLabel1 = document.getElementById('res-label-1');
    const resVal1 = document.getElementById('res-val-1');

    const resLabel2 = document.getElementById('res-label-2');
    const resVal2 = document.getElementById('res-val-2');

    if (!calcBtn) {
        return;
    }


    /* =========================================================
       HELPERS
       ========================================================= */

    const formatNumber = (value) => {
        if (!Number.isFinite(value)) {
            return '--';
        }

        return value.toFixed(4);
    };


    const setFieldError = (input, isError) => {

        if (!input) {
            return;
        }

        if (isError) {
            input.classList.add('input-error');
        } else {
            input.classList.remove('input-error');
        }
    };


    const clearFieldErrors = () => {

        document
            .querySelectorAll('.input-error')
            .forEach((element) => {
                element.classList.remove('input-error');
            });

    };


    /* =========================================================
       INLINE NOTIFICATION
       ========================================================= */

    const showNotification = (message, isError = true) => {

        const form = calcBtn.closest('form');

        if (!form) {
            return;
        }

        const existingBanner =
            document.getElementById('power-alert-banner');

        if (existingBanner) {
            existingBanner.remove();
        }


        const banner = document.createElement('div');

        banner.id = 'power-alert-banner';

        banner.className =
            isError
                ? 'error-banner'
                : 'success-banner';


        banner.innerHTML = `
            <span
                class="material-symbols-outlined"
                aria-hidden="true"
            >
                ${isError ? 'error' : 'info'}
            </span>

            <span>${message}</span>
        `;


        form.prepend(banner);


        banner.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });


        window.setTimeout(() => {

            if (banner && banner.parentNode) {
                banner.remove();
            }

        }, 6000);

    };


    const removeNotification = () => {

        const banner =
            document.getElementById('power-alert-banner');

        if (banner) {
            banner.remove();
        }

    };


    /* =========================================================
       UPDATE FIELD LABELS
       ========================================================= */

    const updateFields = () => {

        const mode = modeSelect ? modeSelect.value : '';
        const type = typeSelect ? typeSelect.value : '';

        clearFieldErrors();
        removeNotification();


        /*
         * Hide Power Factor for DC
         */

        if (pfRow) {

            if (type === 'dc') {
                pfRow.style.display = 'none';
            } else {
                pfRow.style.display = '';
            }

        }


        /*
         * No calculation mode selected
         */

        if (!mode) {

            if (value1Label) {
                value1Label.textContent = 'First Value';
            }

            if (value1Hint) {
                value1Hint.textContent =
                    'Enter numerical magnitude';
            }

            if (value1Unit) {
                value1Unit.textContent = '';
            }

            if (value2Label) {
                value2Label.textContent = 'Second Value';
            }

            if (value2Hint) {
                value2Hint.textContent =
                    'Enter numerical magnitude';
            }

            if (value2Unit) {
                value2Unit.textContent = '';
            }

            return;
        }


        /* =====================================================
           CALCULATE POWER
           Known: Voltage + Current
           ===================================================== */

        if (mode === 'power') {

            if (value1Label) {
                value1Label.textContent = 'Voltage';
            }

            if (value1Hint) {
                value1Hint.textContent =
                    type === '3ph'
                        ? 'Enter line-to-line voltage'
                        : 'Enter system voltage';
            }

            if (value1Unit) {
                value1Unit.textContent = 'V';
            }


            if (value2Label) {
                value2Label.textContent = 'Current';
            }

            if (value2Hint) {
                value2Hint.textContent =
                    type === '3ph'
                        ? 'Enter line current'
                        : 'Enter circuit current';
            }

            if (value2Unit) {
                value2Unit.textContent = 'A';
            }

            return;
        }


        /* =====================================================
           CALCULATE VOLTAGE
           Known: Power + Current
           ===================================================== */

        if (mode === 'voltage') {

            if (value1Label) {
                value1Label.textContent = 'Power';
            }

            if (value1Hint) {
                value1Hint.textContent =
                    'Enter active power';
            }

            if (value1Unit) {
                value1Unit.textContent = 'W';
            }


            if (value2Label) {
                value2Label.textContent = 'Current';
            }

            if (value2Hint) {
                value2Hint.textContent =
                    type === '3ph'
                        ? 'Enter line current'
                        : 'Enter circuit current';
            }

            if (value2Unit) {
                value2Unit.textContent = 'A';
            }

            return;
        }


        /* =====================================================
           CALCULATE CURRENT
           Known: Power + Voltage
           ===================================================== */

        if (mode === 'current') {

            if (value1Label) {
                value1Label.textContent = 'Power';
            }

            if (value1Hint) {
                value1Hint.textContent =
                    'Enter active power';
            }

            if (value1Unit) {
                value1Unit.textContent = 'W';
            }


            if (value2Label) {
                value2Label.textContent = 'Voltage';
            }

            if (value2Hint) {
                value2Hint.textContent =
                    type === '3ph'
                        ? 'Enter line-to-line voltage'
                        : 'Enter system voltage';
            }

            if (value2Unit) {
                value2Unit.textContent = 'V';
            }

        }

    };


    /* =========================================================
       GET POWER FACTOR
       ========================================================= */

    const getPowerFactor = () => {

        const type = typeSelect.value;

        /*
         * DC has no power factor requirement.
         */

        if (type === 'dc') {
            return 1;
        }


        const pf = parseFloat(
            pfInput ? pfInput.value : ''
        );


        if (
            Number.isNaN(pf) ||
            pf <= 0 ||
            pf > 1
        ) {

            return null;

        }


        return pf;

    };


    /* =========================================================
       SET RESULT
       ========================================================= */

    const setResults = (result1, result2) => {

        if (!resultsSection) {
            return;
        }


        resLabel1.textContent = result1.label;
        resVal1.textContent = result1.value;

        resLabel2.textContent = result2.label;
        resVal2.textContent = result2.value;


        resultsSection.style.display = 'block';


        resultsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });

    };


    /* =========================================================
       CALCULATE
       ========================================================= */

    const calculate = () => {

        removeNotification();
        clearFieldErrors();


        const type =
            typeSelect ? typeSelect.value : '';

        const mode =
            modeSelect ? modeSelect.value : '';


        /* -----------------------------------------------------
           Validate system type
           ----------------------------------------------------- */

        if (!type) {

            showNotification(
                'Please select the electrical system type.'
            );

            return;

        }


        /* -----------------------------------------------------
           Validate calculation parameter
           ----------------------------------------------------- */

        if (!mode) {

            showNotification(
                'Please select what you want to calculate.'
            );

            return;

        }


        /* -----------------------------------------------------
           Read input values
           ----------------------------------------------------- */

        const value1 =
            parseFloat(
                value1Input ? value1Input.value : ''
            );

        const value2 =
            parseFloat(
                value2Input ? value2Input.value : ''
            );


        /* -----------------------------------------------------
           Validate numeric inputs
           ----------------------------------------------------- */

        const value1Invalid =
            Number.isNaN(value1) || value1 < 0;

        const value2Invalid =
            Number.isNaN(value2) || value2 < 0;


        if (value1Invalid) {
            setFieldError(value1Input, true);
        }


        if (value2Invalid) {
            setFieldError(value2Input, true);
        }


        if (value1Invalid || value2Invalid) {

            showNotification(
                'Please enter valid positive values for all required parameters.'
            );

            return;

        }


        /* -----------------------------------------------------
           Power factor
           ----------------------------------------------------- */

        const PF = getPowerFactor();


        if (PF === null) {

            setFieldError(pfInput, true);

            showNotification(
                'Power factor must be greater than 0 and no greater than 1.'
            );

            return;

        }


        setFieldError(pfInput, false);


        /* =====================================================
           POWER
           ===================================================== */

        if (mode === 'power') {

            const voltage = value1;
            const current = value2;


            if (voltage <= 0) {

                setFieldError(value1Input, true);

                showNotification(
                    'Voltage must be greater than zero.'
                );

                return;

            }


            if (current <= 0) {

                setFieldError(value2Input, true);

                showNotification(
                    'Current must be greater than zero.'
                );

                return;

            }


            let power = 0;


            if (type === 'dc') {

                /*
                 * DC:
                 * P = V × I
                 */

                power =
                    voltage * current;


                setResults(
                    {
                        label: 'DC Power',
                        value: `${formatNumber(power)} W`
                    },
                    {
                        label: 'Power',
                        value: `${formatNumber(power / 1000)} kW`
                    }
                );

                return;

            }


            if (type === '1ph') {

                /*
                 * Single Phase:
                 * P = V × I × PF
                 */

                power =
                    voltage *
                    current *
                    PF;


                setResults(
                    {
                        label: 'Active Power',
                        value: `${formatNumber(power)} W`
                    },
                    {
                        label: 'Active Power',
                        value: `${formatNumber(power / 1000)} kW`
                    }
                );

                return;

            }


            if (type === '3ph') {

                /*
                 * Three Phase:
                 * P = √3 × V × I × PF
                 */

                power =
                    Math.sqrt(3) *
                    voltage *
                    current *
                    PF;


                setResults(
                    {
                        label: 'Three-Phase Power',
                        value: `${formatNumber(power)} W`
                    },
                    {
                        label: 'Three-Phase Power',
                        value: `${formatNumber(power / 1000)} kW`
                    }
                );

                return;

            }

        }


        /* =====================================================
           VOLTAGE
           ===================================================== */

        if (mode === 'voltage') {

            const power = value1;
            const current = value2;


            if (power <= 0) {

                setFieldError(value1Input, true);

                showNotification(
                    'Power must be greater than zero.'
                );

                return;

            }


            if (current <= 0) {

                setFieldError(value2Input, true);

                showNotification(
                    'Current must be greater than zero.'
                );

                return;

            }


            let voltage = 0;


            if (type === 'dc') {

                /*
                 * DC:
                 * V = P / I
                 */

                voltage =
                    power / current;


                setResults(
                    {
                        label: 'Voltage',
                        value: `${formatNumber(voltage)} V`
                    },
                    {
                        label: 'Voltage',
                        value: `${formatNumber(voltage / 1000)} kV`
                    }
                );

                return;

            }


            if (type === '1ph') {

                /*
                 * Single Phase:
                 * V = P / (I × PF)
                 */

                voltage =
                    power /
                    (current * PF);


                setResults(
                    {
                        label: 'Voltage',
                        value: `${formatNumber(voltage)} V`
                    },
                    {
                        label: 'Power Factor',
                        value: PF.toFixed(2)
                    }
                );

                return;

            }


            if (type === '3ph') {

                /*
                 * Three Phase:
                 * V = P / (√3 × I × PF)
                 */

                voltage =
                    power /
                    (
                        Math.sqrt(3) *
                        current *
                        PF
                    );


                setResults(
                    {
                        label: 'Line Voltage',
                        value: `${formatNumber(voltage)} V`
                    },
                    {
                        label: 'Power Factor',
                        value: PF.toFixed(2)
                    }
                );

                return;

            }

        }


        /* =====================================================
           CURRENT
           ===================================================== */

        if (mode === 'current') {

            const power = value1;
            const voltage = value2;


            if (power <= 0) {

                setFieldError(value1Input, true);

                showNotification(
                    'Power must be greater than zero.'
                );

                return;

            }


            if (voltage <= 0) {

                setFieldError(value2Input, true);

                showNotification(
                    'Voltage must be greater than zero.'
                );

                return;

            }


            let current = 0;


            if (type === 'dc') {

                /*
                 * DC:
                 * I = P / V
                 */

                current =
                    power / voltage;


                setResults(
                    {
                        label: 'Current',
                        value: `${formatNumber(current)} A`
                    },
                    {
                        label: 'Current',
                        value: `${formatNumber(current / 1000)} kA`
                    }
                );

                return;

            }


            if (type === '1ph') {

                /*
                 * Single Phase:
                 * I = P / (V × PF)
                 */

                current =
                    power /
                    (voltage * PF);


                setResults(
                    {
                        label: 'Current',
                        value: `${formatNumber(current)} A`
                    },
                    {
                        label: 'Power Factor',
                        value: PF.toFixed(2)
                    }
                );

                return;

            }


            if (type === '3ph') {

                /*
                 * Three Phase:
                 * I = P / (√3 × V × PF)
                 */

                current =
                    power /
                    (
                        Math.sqrt(3) *
                        voltage *
                        PF
                    );


                setResults(
                    {
                        label: 'Line Current',
                        value: `${formatNumber(current)} A`
                    },
                    {
                        label: 'Power Factor',
                        value: PF.toFixed(2)
                    }
                );

                return;

            }

        }

    };


    /* =========================================================
       RESET
       ========================================================= */

    const resetCalculator = () => {

        removeNotification();
        clearFieldErrors();


        if (typeSelect) {
            typeSelect.value = '';
        }


        if (modeSelect) {
            modeSelect.value = '';
        }


        if (value1Input) {
            value1Input.value = '';
        }


        if (value2Input) {
            value2Input.value = '';
        }


        if (pfInput) {
            pfInput.value = '1';
        }


        if (pfRow) {
            pfRow.style.display = '';
        }


        if (resultsSection) {
            resultsSection.style.display = 'none';
        }


        updateFields();


        if (typeSelect) {
            typeSelect.focus();
        }

    };


    /* =========================================================
       EVENTS
       ========================================================= */

    if (typeSelect) {

        typeSelect.addEventListener(
            'change',
            () => {

                updateFields();

                if (resultsSection) {
                    resultsSection.style.display = 'none';
                }

            }
        );

    }


    if (modeSelect) {

        modeSelect.addEventListener(
            'change',
            () => {

                updateFields();

                if (resultsSection) {
                    resultsSection.style.display = 'none';
                }

            }
        );

    }


    calcBtn.addEventListener(
        'click',
        calculate
    );


    if (resetBtn) {

        resetBtn.addEventListener(
            'click',
            resetCalculator
        );

    }


    /* =========================================================
       ENTER KEY
       ========================================================= */

    [
        value1Input,
        value2Input,
        pfInput
    ].forEach((input) => {

        if (!input) {
            return;
        }

        input.addEventListener(
            'keydown',
            (event) => {

                if (event.key === 'Enter') {

                    event.preventDefault();

                    calculate();

                }

            }
        );

    });


    /* =========================================================
       INITIAL STATE
       ========================================================= */

    updateFields();

});
