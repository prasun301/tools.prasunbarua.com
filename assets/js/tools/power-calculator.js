/* ==========================================================================
   PRASUN TOOLS
   Power Calculator
   ========================================================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    /* ----------------------------------------------------------------------
       ELEMENTS
       ---------------------------------------------------------------------- */

    const typeSelect = document.getElementById("powerCalcType");
    const modeSelect = document.getElementById("powerCalcMode");

    const inputSection =
        document.getElementById("powerCalcInputSection");

    const inputsContainer =
        document.getElementById("powerCalcInputs");

    const calculateButton =
        document.getElementById("powerCalcCalculate");

    const resetButton =
        document.getElementById("powerCalcReset");

    const resultGrid =
        document.getElementById("powerCalcResultGrid");

    const resultHeader =
        document.querySelector("#powerCalcResult .results-header");

    /* ----------------------------------------------------------------------
       SAFETY CHECK
       ---------------------------------------------------------------------- */

    if (
        !typeSelect ||
        !modeSelect ||
        !inputSection ||
        !inputsContainer ||
        !calculateButton ||
        !resetButton ||
        !resultGrid
    ) {
        console.error("Power Calculator: Required elements are missing.");
        return;
    }

    /* ----------------------------------------------------------------------
       HELPERS
       ---------------------------------------------------------------------- */

    function formatNumber(value) {

        if (!Number.isFinite(value)) {
            return "—";
        }

        return Number(value).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    }


    function getValue(id) {

        const element = document.getElementById(id);

        if (!element) {
            return NaN;
        }

        return parseFloat(element.value);
    }


    function showInputSection(show) {

        inputSection.hidden = !show;
    }


    function updateResultIcon(iconName) {

        if (!resultHeader) {
            return;
        }

        const icon =
            resultHeader.querySelector(".material-symbols-outlined");

        if (icon) {
            icon.textContent = iconName;
        }
    }


    function setResult(label, value, iconName = "calculate") {

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

        updateResultIcon(iconName);
    }


    function showError(message) {

        setResult(
            "Input Required",
            message,
            "error"
        );
    }


    function validatePositive(value, fieldName) {

        if (!Number.isFinite(value) || value <= 0) {

            showError(
                `${fieldName} must be greater than zero.`
            );

            return false;
        }

        return true;
    }


    /* ----------------------------------------------------------------------
       INPUT CREATION
       ---------------------------------------------------------------------- */

    function createInput(id, label, unit, hint) {

        return `
            <div class="input-row-card">

                <div class="input-group">

                    <label for="${id}">
                        ${label}
                    </label>

                    <span class="input-hint">
                        ${hint}
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
                        aria-label="${label}"
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
                        Enter a value between 0 and 1
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
                        aria-label="Power factor"
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

        const type = typeSelect.value;
        const mode = modeSelect.value;

        inputsContainer.innerHTML = "";
        showInputSection(false);

        setResult(
            "Status",
            "Ready",
            "calculate"
        );

        if (!type || !mode) {
            return;
        }


        /* ==============================================================
           CALCULATE POWER
           ============================================================== */

        if (mode === "P") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcVoltage",
                    "Voltage",
                    "V",
                    "Enter system voltage"
                ) +

                createInput(
                    "powerCalcCurrent",
                    "Current",
                    "A",
                    "Enter load current"
                );

            if (type !== "dc") {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();
            }
        }


        /* ==============================================================
           CALCULATE VOLTAGE
           ============================================================== */

        else if (mode === "V") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcPower",
                    "Power",
                    "W",
                    "Enter active power"
                ) +

                createInput(
                    "powerCalcCurrent",
                    "Current",
                    "A",
                    "Enter load current"
                );

            if (type !== "dc") {

                inputsContainer.innerHTML +=
                    createPowerFactorInput();
            }
        }


        /* ==============================================================
           CALCULATE CURRENT
           ============================================================== */

        else if (mode === "I") {

            inputsContainer.innerHTML =
                createInput(
                    "powerCalcPower",
                    "Power",
                    "W",
                    "Enter active power"
                ) +

                createInput(
                    "powerCalcVoltage",
                    "Voltage",
                    "V",
                    "Enter system voltage"
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

    function getPowerFactor() {

        const type = typeSelect.value;

        if (type === "dc") {
            return 1;
        }

        const pf = getValue("powerCalcPF");

        if (
            !Number.isFinite(pf) ||
            pf <= 0 ||
            pf > 1
        ) {
            return null;
        }

        return pf;
    }


    /* ----------------------------------------------------------------------
       CALCULATE POWER
       ---------------------------------------------------------------------- */

    function calculatePower(type, pf) {

        const voltage =
            getValue("powerCalcVoltage");

        const current =
            getValue("powerCalcCurrent");


        if (
            !validatePositive(
                voltage,
                "Voltage"
            )
        ) {
            return;
        }


        if (
            !validatePositive(
                current,
                "Current"
            )
        ) {
            return;
        }


        let power;
        let label;


        if (type === "dc") {

            power =
                voltage * current;

            label = "DC Power";
        }


        else if (type === "1ph") {

            power =
                voltage *
                current *
                pf;

            label = "Single-Phase Power";
        }


        else if (type === "3ph") {

            power =
                Math.sqrt(3) *
                voltage *
                current *
                pf;

            label = "Three-Phase Power";
        }


        setResult(
            label,
            `${formatNumber(power)} W`,
            "bolt"
        );
    }


    /* ----------------------------------------------------------------------
       CALCULATE VOLTAGE
       ---------------------------------------------------------------------- */

    function calculateVoltage(type, pf) {

        const power =
            getValue("powerCalcPower");

        const current =
            getValue("powerCalcCurrent");


        if (
            !validatePositive(
                power,
                "Power"
            )
        ) {
            return;
        }


        if (
            !validatePositive(
                current,
                "Current"
            )
        ) {
            return;
        }


        let voltage;
        let label;


        if (type === "dc") {

            voltage =
                power / current;

            label = "Voltage";
        }


        else if (type === "1ph") {

            voltage =
                power /
                (current * pf);

            label = "Single-Phase Voltage";
        }


        else if (type === "3ph") {

            voltage =
                power /
                (
                    Math.sqrt(3) *
                    current *
                    pf
                );

            label = "Line Voltage";
        }


        setResult(
            label,
            `${formatNumber(voltage)} V`,
            "electric_bolt"
        );
    }


    /* ----------------------------------------------------------------------
       CALCULATE CURRENT
       ---------------------------------------------------------------------- */

    function calculateCurrent(type, pf) {

        const power =
            getValue("powerCalcPower");

        const voltage =
            getValue("powerCalcVoltage");


        if (
            !validatePositive(
                power,
                "Power"
            )
        ) {
            return;
        }


        if (
            !validatePositive(
                voltage,
                "Voltage"
            )
        ) {
            return;
        }


        let current;
        let label;


        if (type === "dc") {

            current =
                power / voltage;

            label = "Current";
        }


        else if (type === "1ph") {

            current =
                power /
                (voltage * pf);

            label = "Single-Phase Current";
        }


        else if (type === "3ph") {

            current =
                power /
                (
                    Math.sqrt(3) *
                    voltage *
                    pf
                );

            label = "Line Current";
        }


        setResult(
            label,
            `${formatNumber(current)} A`,
            "electric_bolt"
        );
    }


    /* ----------------------------------------------------------------------
       MAIN CALCULATION
       ---------------------------------------------------------------------- */

    function calculate() {

        const type = typeSelect.value;
        const mode = modeSelect.value;


        if (!type || !mode) {

            showError(
                "Select the system type and calculation parameter."
            );

            return;
        }


        const pf = getPowerFactor();


        if (pf === null) {

            showError(
                "Power factor must be greater than 0 and no greater than 1."
            );

            return;
        }


        if (mode === "P") {

            calculatePower(
                type,
                pf
            );

            return;
        }


        if (mode === "V") {

            calculateVoltage(
                type,
                pf
            );

            return;
        }


        if (mode === "I") {

            calculateCurrent(
                type,
                pf
            );

            return;
        }


        showError(
            "Please select a valid calculation parameter."
        );
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
       ENTER KEY SUPPORT
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
