/* ==========================================================================
   PRASUN ENGINEERING TECHNOLOGY
   Power Calculator
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ----------------------------------------------------------------------
       ELEMENTS
    ---------------------------------------------------------------------- */

    const typeSelect =
        document.getElementById("powerCalcType");

    const modeSelect =
        document.getElementById("powerCalcMode");

    const inputSection =
        document.getElementById("powerCalcInputSection");

    const inputsContainer =
        document.getElementById("powerCalcInputs");

    const calculateButton =
        document.getElementById("powerCalcCalculate");

    const resetButton =
        document.getElementById("powerCalcReset");

    const resultValue =
        document.getElementById("powerCalcResultValue");

    const resultGrid =
        document.getElementById("powerCalcResultGrid");


    /* ----------------------------------------------------------------------
       HELPERS
    ---------------------------------------------------------------------- */

    function formatNumber(value) {
        return Number(value).toFixed(4);
    }


    function getElementValue(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return NaN;
        }

        return parseFloat(element.value);

    }


    function showInputSection(show) {

        inputSection.hidden = !show;

    }


    function setResult(
        label,
        value,
        icon = "check_circle"
    ) {

        resultGrid.innerHTML = `
            <div class="result-item">

                <span class="result-label">
                    ${label}
                </span>

                <span class="result-value">
                    ${value}
                </span>

            </div>
        `;

        const header =
            document.querySelector(
                "#powerCalcResult .results-header"
            );

        if (header) {

            header.querySelector(
                ".material-symbols-outlined"
            ).textContent = icon;

        }

    }


    function showError(message) {

        setResult(
            "Input Required",
            message,
            "error"
        );

    }


    /* ----------------------------------------------------------------------
       INPUT CREATION
    ---------------------------------------------------------------------- */

    function createInput(
        id,
        label,
        unit
    ) {

        return `
            <div class="input-row-card">

                <div class="input-group">

                    <label for="${id}">
                        ${label}
                    </label>

                    <span class="input-hint">
                        Enter a valid value
                    </span>

                </div>

                <div class="input-field-wrapper">

                    <input
                        type="number"
                        id="${id}"
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
        `;

    }


    function createPowerFactorInput() {

        return `
            <div class="input-row-card">

                <div class="input-group">

                    <label for="powerCalcPF">
                        Power Factor
                    </label>

                    <span class="input-hint">
                        Enter a value from 0 to 1
                    </span>

                </div>

                <div class="input-field-wrapper">

                    <input
                        type="number"
                        id="powerCalcPF"
                        step="0.01"
                        min="0.01"
                        max="1"
                        value="1"
                        inputmode="decimal"
                        autocomplete="off"
                    >

                    <span class="input-unit">
                        cosφ
                    </span>

                </div>

            </div>
        `;

    }


    /* ----------------------------------------------------------------------
       UPDATE INPUTS
    ---------------------------------------------------------------------- */

    function updateInputs() {

        const type =
            typeSelect.value;

        const mode =
            modeSelect.value;

        inputsContainer.innerHTML = "";

        showInputSection(false);

        if (!type || !mode) {
            return;
        }


        /* ==============================================================
           POWER
        ============================================================== */

        if (mode === "P") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcVoltage",
                    "Voltage",
                    "V"
                ) +

                createInput(
                    "powerCalcCurrent",
                    "Current",
                    "A"
                );

            if (type !== "dc") {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }

        }


        /* ==============================================================
           VOLTAGE
        ============================================================== */

        else if (mode === "V") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcPower",
                    "Power",
                    "W"
                ) +

                createInput(
                    "powerCalcCurrent",
                    "Current",
                    "A"
                );

            if (type !== "dc") {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }

        }


        /* ==============================================================
           CURRENT
        ============================================================== */

        else if (mode === "I") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcPower",
                    "Power",
                    "W"
                ) +

                createInput(
                    "powerCalcVoltage",
                    "Voltage",
                    "V"
                );

            if (type !== "dc") {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();

            }

        }


        showInputSection(true);

        const firstInput =
            inputsContainer.querySelector("input");

        if (firstInput) {
            firstInput.focus();
        }

    }


    /* ----------------------------------------------------------------------
       POWER FACTOR
    ---------------------------------------------------------------------- */

    function getPowerFactor(type) {

        if (type === "dc") {
            return 1;
        }

        const pf =
            getElementValue("powerCalcPF");

        if (
            Number.isNaN(pf) ||
            pf <= 0 ||
            pf > 1
        ) {

            return null;

        }

        return pf;

    }


    /* ----------------------------------------------------------------------
       VALIDATION
    ---------------------------------------------------------------------- */

    function validateValue(
        value,
        fieldName
    ) {

        if (
            Number.isNaN(value) ||
            value < 0
        ) {

            showError(
                `Enter a valid ${fieldName}.`
            );

            return false;

        }

        return true;

    }


    /* ----------------------------------------------------------------------
       CALCULATE
    ---------------------------------------------------------------------- */

    function calculate() {

        const type =
            typeSelect.value;

        const mode =
            modeSelect.value;


        if (!type || !mode) {

            showError(
                "Select the system type and calculation parameter."
            );

            return;

        }


        const PF =
            getPowerFactor(type);


        if (PF === null) {

            showError(
                "Power factor must be greater than 0 and no greater than 1."
            );

            return;

        }


        /* ==============================================================
           POWER
        ============================================================== */

        if (mode === "P") {

            const V =
                getElementValue(
                    "powerCalcVoltage"
                );

            const I =
                getElementValue(
                    "powerCalcCurrent"
                );


            if (!validateValue(V, "voltage")) {
                return;
            }

            if (!validateValue(I, "current")) {
                return;
            }


            let power;


            if (type === "dc") {

                power =
                    V * I;

                setResult(
                    "DC Power",
                    `${formatNumber(power)} W`,
                    "bolt"
                );

                return;

            }


            if (type === "1ph") {

                power =
                    V * I * PF;

                setResult(
                    "Single Phase Power",
                    `${formatNumber(power)} W`,
                    "bolt"
                );

                return;

            }


            if (type === "3ph") {

                power =
                    Math.sqrt(3) *
                    V *
                    I *
                    PF;

                setResult(
                    "Three Phase Power",
                    `${formatNumber(power)} W`,
                    "bolt"
                );

                return;

            }

        }


        /* ==============================================================
           VOLTAGE
        ============================================================== */

        if (mode === "V") {

            const P =
                getElementValue(
                    "powerCalcPower"
                );

            const I =
                getElementValue(
                    "powerCalcCurrent"
                );


            if (!validateValue(P, "power")) {
                return;
            }


            if (
                Number.isNaN(I) ||
                I <= 0
            ) {

                showError(
                    "Current must be greater than zero."
                );

                return;

            }


            let voltage;


            if (type === "dc") {

                voltage =
                    P / I;

                setResult(
                    "Voltage",
                    `${formatNumber(voltage)} V`,
                    "electric_bolt"
                );

                return;

            }


            if (type === "1ph") {

                voltage =
                    P /
                    (I * PF);

                setResult(
                    "Single Phase Voltage",
                    `${formatNumber(voltage)} V`,
                    "electric_bolt"
                );

                return;

            }


            if (type === "3ph") {

                voltage =
                    P /
                    (
                        Math.sqrt(3) *
                        I *
                        PF
                    );

                setResult(
                    "Line Voltage",
                    `${formatNumber(voltage)} V`,
                    "electric_bolt"
                );

                return;

            }

        }


        /* ==============================================================
           CURRENT
        ============================================================== */

        if (mode === "I") {

            const P =
                getElementValue(
                    "powerCalcPower"
                );

            const V =
                getElementValue(
                    "powerCalcVoltage"
                );


            if (!validateValue(P, "power")) {
                return;
            }


            if (
                Number.isNaN(V) ||
                V <= 0
            ) {

                showError(
                    "Voltage must be greater than zero."
                );

                return;

            }


            let current;


            if (type === "dc") {

                current =
                    P / V;

                setResult(
                    "Current",
                    `${formatNumber(current)} A`,
                    "electric_bolt"
                );

                return;

            }


            if (type === "1ph") {

                current =
                    P /
                    (V * PF);

                setResult(
                    "Single Phase Current",
                    `${formatNumber(current)} A`,
                    "electric_bolt"
                );

                return;

            }


            if (type === "3ph") {

                current =
                    P /
                    (
                        Math.sqrt(3) *
                        V *
                        PF
                    );

                setResult(
                    "Line Current",
                    `${formatNumber(current)} A`,
                    "electric_bolt"
                );

                return;

            }

        }

    }


    /* ----------------------------------------------------------------------
       RESET
    ---------------------------------------------------------------------- */

    function resetCalculator() {

        typeSelect.value = "";

        modeSelect.value = "";

        inputsContainer.innerHTML = "";

        showInputSection(false);

        setResult(
            "Status",
            "Ready",
            "calculate"
        );

    }


    /* ----------------------------------------------------------------------
       EVENTS
    ---------------------------------------------------------------------- */

    typeSelect.addEventListener(
        "change",
        () => {

            modeSelect.value = "";

            inputsContainer.innerHTML = "";

            showInputSection(false);

            setResult(
                "Status",
                "Ready",
                "calculate"
            );

        }
    );


    modeSelect.addEventListener(
        "change",
        updateInputs
    );


    calculateButton.addEventListener(
        "click",
        calculate
    );


    resetButton.addEventListener(
        "click",
        resetCalculator
    );


    /* ----------------------------------------------------------------------
       ENTER KEY
    ---------------------------------------------------------------------- */

    inputsContainer.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Enter") {

                event.preventDefault();

                calculate();

            }

        }
    );

});

