/**
 * Ohm's Law Interactive Calculator
 * Client-side dynamic multi-variable calculations
 */

document.addEventListener('DOMContentLoaded', () => {
  const vInput = document.getElementById('voltage');
  const iInput = document.getElementById('current');
  const rInput = document.getElementById('resistance');
  const pInput = document.getElementById('power');

  const resV = document.getElementById('resVoltage');
  const resI = document.getElementById('resCurrent');
  const resR = document.getElementById('resResistance');
  const resP = document.getElementById('resPower');

  const formulaApplied = document.getElementById('formulaApplied');
  const resetBtn = document.getElementById('resetBtn');

  const inputs = [vInput, iInput, rInput, pInput];

  inputs.forEach(input => {
    input.addEventListener('input', calculateOhmsLaw);
  });

  resetBtn.addEventListener('click', () => {
    inputs.forEach(input => {
      input.value = '';
      input.classList.remove('calculated-field');
    });
    resetDisplay();
  });

  function calculateOhmsLaw() {
    let v = parseFloat(vInput.value);
    let i = parseFloat(iInput.value);
    let r = parseFloat(rInput.value);
    let p = parseFloat(pInput.value);

    // Count non-empty inputs
    const filled = inputs.filter(inp => inp.value !== '' && !isNaN(parseFloat(inp.value)));

    if (filled.length < 2) {
      resetDisplay();
      return;
    }

    // Reset highlighting classes
    inputs.forEach(inp => inp.classList.remove('calculated-field'));

    let formulaText = "";

    // Case 1: Known V and I
    if (!isNaN(v) && !isNaN(i) && vInput.value !== '' && iInput.value !== '') {
      r = v / i;
      p = v * i;
      rInput.value = formatNum(r);
      pInput.value = formatNum(p);
      rInput.classList.add('calculated-field');
      pInput.classList.add('calculated-field');
      formulaText = `Resistance: R = V / I (${v} / ${i} = ${formatNum(r)} Ω)<br>Power: P = V × I (${v} × ${i} = ${formatNum(p)} W)`;
    }
    // Case 2: Known V and R
    else if (!isNaN(v) && !isNaN(r) && vInput.value !== '' && rInput.value !== '') {
      i = v / r;
      p = (v * v) / r;
      iInput.value = formatNum(i);
      pInput.value = formatNum(p);
      iInput.classList.add('calculated-field');
      pInput.classList.add('calculated-field');
      formulaText = `Current: I = V / R (${v} / ${r} = ${formatNum(i)} A)<br>Power: P = V² / R (${v}² / ${r} = ${formatNum(p)} W)`;
    }
    // Case 3: Known I and R
    else if (!isNaN(i) && !isNaN(r) && iInput.value !== '' && rInput.value !== '') {
      v = i * r;
      p = i * i * r;
      vInput.value = formatNum(v);
      pInput.value = formatNum(p);
      vInput.classList.add('calculated-field');
      pInput.classList.add('calculated-field');
      formulaText = `Voltage: V = I × R (${i} × ${r} = ${formatNum(v)} V)<br>Power: P = I² × R (${i}² × ${r} = ${formatNum(p)} W)`;
    }
    // Case 4: Known P and V
    else if (!isNaN(p) && !isNaN(v) && pInput.value !== '' && vInput.value !== '') {
      i = p / v;
      r = (v * v) / p;
      iInput.value = formatNum(i);
      rInput.value = formatNum(r);
      iInput.classList.add('calculated-field');
      rInput.classList.add('calculated-field');
      formulaText = `Current: I = P / V (${p} / ${v} = ${formatNum(i)} A)<br>Resistance: R = V² / P (${v}² / ${p} = ${formatNum(r)} Ω)`;
    }
    // Case 5: Known P and I
    else if (!isNaN(p) && !isNaN(i) && pInput.value !== '' && iInput.value !== '') {
      v = p / i;
      r = p / (i * i);
      vInput.value = formatNum(v);
      rInput.value = formatNum(r);
      vInput.classList.add('calculated-field');
      rInput.classList.add('calculated-field');
      formulaText = `Voltage: V = P / I (${p} / ${i} = ${formatNum(v)} V)<br>Resistance: R = P / I² (${p} / ${i}² = ${formatNum(r)} Ω)`;
    }
    // Case 6: Known P and R
    else if (!isNaN(p) && !isNaN(r) && pInput.value !== '' && rInput.value !== '') {
      v = Math.sqrt(p * r);
      i = Math.sqrt(p / r);
      vInput.value = formatNum(v);
      iInput.value = formatNum(i);
      vInput.classList.add('calculated-field');
      iInput.classList.add('calculated-field');
      formulaText = `Voltage: V = √(P × R) (√(${p} × ${r}) = ${formatNum(v)} V)<br>Current: I = √(P / R) (√(${p} / ${r}) = ${formatNum(i)} A)`;
    }

    // Update Result Panel
    resV.textContent = `${formatNum(v)} V`;
    resI.textContent = `${formatNum(i)} A`;
    resR.textContent = `${formatNum(r)} Ω`;
    resP.textContent = `${formatNum(p)} W`;
    formulaApplied.innerHTML = formulaText;
  }

  function resetDisplay() {
    resV.textContent = '-- V';
    resI.textContent = '-- A';
    resR.textContent = '-- Ω';
    resP.textContent = '-- W';
    formulaApplied.textContent = 'Fill in any two fields above to see the calculation steps.';
  }

  function formatNum(num) {
    if (isNaN(num)) return '--';
    return Number(num.toFixed(4)).toString();
  }
});
