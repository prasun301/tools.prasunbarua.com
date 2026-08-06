document.addEventListener('DOMContentLoaded', () => {
    const p1Select = document.getElementById('param1-select');
    const p1Value = document.getElementById('param1-value');
    const p2Select = document.getElementById('param2-select');
    const p2Value = document.getElementById('param2-value');
    
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');

    const resLabel1 = document.getElementById('res-label-1');
    const resVal1 = document.getElementById('res-val-1');
    const resLabel2 = document.getElementById('res-label-2');
    const resVal2 = document.getElementById('res-val-2');

    if (!calcBtn) return; // Safety check if element doesn't exist

    // Calculate Button Click Event
    calcBtn.addEventListener('click', () => {
        const type1 = p1Select.value;
        const type2 = p2Select.value;
        const val1 = parseFloat(p1Value.value);
        const val2 = parseFloat(p2Value.value);

        if (type1 === type2) {
            alert('Please select two different parameters.');
            return;
        }

        if (isNaN(val1) || isNaN(val2)) {
            alert('Please enter valid numeric values for both known parameters.');
            return;
        }

        let V = null, I = null, R = null, P = null;

        if (type1 === 'voltage') V = val1;
        if (type1 === 'current') I = val1;
        if (type1 === 'resistance') R = val1;
        if (type1 === 'power') P = val1;

        if (type2 === 'voltage') V = val2;
        if (type2 === 'current') I = val2;
        if (type2 === 'resistance') R = val2;
        if (type2 === 'power') P = val2;

        let results = {};

        try {
            if (V !== null && I !== null) {
                if (I === 0) throw new Error("Division by zero");
                R = V / I;
                P = V * I;
                results = { Resistance: `${R.toFixed(4)} Ω`, Power: `${P.toFixed(4)} W` };
            } else if (V !== null && R !== null) {
                if (R === 0) throw new Error("Division by zero");
                I = V / R;
                P = (V * V) / R;
                results = { Current: `${I.toFixed(4)} A`, Power: `${P.toFixed(4)} W` };
            } else if (V !== null && P !== null) {
                if (V === 0) throw new Error("Division by zero");
                I = P / V;
                R = (V * V) / P;
                results = { Current: `${I.toFixed(4)} A`, Resistance: `${R.toFixed(4)} Ω` };
            } else if (I !== null && R !== null) {
                V = I * R;
                P = (I * I) * R;
                results = { Voltage: `${V.toFixed(4)} V`, Power: `${P.toFixed(4)} W` };
            } else if (I !== null && P !== null) {
                if (I === 0) throw new Error("Division by zero");
                V = P / I;
                R = P / (I * I);
                results = { Voltage: `${V.toFixed(4)} V`, Resistance: `${R.toFixed(4)} Ω` };
            } else if (R !== null && P !== null) {
                if (P < 0 || R <= 0) throw new Error("Invalid range");
                V = Math.sqrt(P * R);
                I = Math.sqrt(P / R);
                results = { Voltage: `${V.toFixed(4)} V`, Current: `${I.toFixed(4)} A` };
            }

            const keys = Object.keys(results);
            if (keys.length > 0) {
                resLabel1.textContent = keys[0];
                resVal1.textContent = results[keys[0]];
                resLabel2.textContent = keys[1];
                resVal2.textContent = results[keys[1]];
                resultsSection.style.display = 'block';
            }
        } catch (err) {
            alert('Invalid calculation parameters (check for division by zero or negative values).');
        }
    });

    // Reset Button Click Event
    resetBtn.addEventListener('click', () => {
        p1Value.value = '';
        p2Value.value = '';
        resultsSection.style.display = 'none';
        p1Value.focus();
    });
});
