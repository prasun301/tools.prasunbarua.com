document.addEventListener('DOMContentLoaded', () => {
    const vInput = document.getElementById('voltage');
    const iInput = document.getElementById('current');
    const rInput = document.getElementById('resistance');
    const pInput = document.getElementById('power');
    const calcBtn = document.getElementById('calc-btn');
    const resetBtn = document.getElementById('reset-btn');

    calcBtn.addEventListener('click', calculateOhm);
    resetBtn.addEventListener('click', () => {
        vInput.value = '';
        iInput.value = '';
        rInput.value = '';
        pInput.value = '';
    });

    function calculateOhm() {
        let V = parseFloat(vInput.value);
        let I = parseFloat(iInput.value);
        let R = parseFloat(rInput.value);
        let P = parseFloat(pInput.value);

        // Count how many values are provided
        const filledCount = [!isNaN(V), !isNaN(I), !isNaN(R), !isNaN(P)].filter(Boolean).length;

        if (filledCount !== 2) {
            alert('Please provide exactly 2 values to calculate the remaining parameters.');
            return;
        }

        // Calculations based on combinations
        if (!isNaN(V) && !isNaN(I)) {
            R = V / I;
            P = V * I;
            rInput.value = R.toFixed(4);
            pInput.value = P.toFixed(4);
        } else if (!isNaN(V) && !isNaN(R)) {
            I = V / R;
            P = (V * V) / R;
            iInput.value = I.toFixed(4);
            pInput.value = P.toFixed(4);
        } else if (!isNaN(V) && !isNaN(P)) {
            I = P / V;
            R = (V * V) / P;
            iInput.value = I.toFixed(4);
            rInput.value = R.toFixed(4);
        } else if (!isNaN(I) && !isNaN(R)) {
            V = I * R;
            P = (I * I) * R;
            vInput.value = V.toFixed(4);
            pInput.value = P.toFixed(4);
        } else if (!isNaN(I) && !isNaN(P)) {
            V = P / I;
            R = P / (I * I);
            vInput.value = V.toFixed(4);
            rInput.value = R.toFixed(4);
        } else if (!isNaN(R) && !isNaN(P)) {
            V = Math.sqrt(P * R);
            I = Math.sqrt(P / R);
            vInput.value = V.toFixed(4);
            iInput.value = I.toFixed(4);
        }
    }
});
