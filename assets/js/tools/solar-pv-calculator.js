/**
 * Solar PV System Calculator Logic v2.0
 * Corrected string voltage validation,
 * temperature-adjusted sizing,
 * DC/AC ratio,
 * energy yield,
 * and battery calculations.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==============================
  // DOM ELEMENT INITIALIZATION
  // ==============================

  const pvMode = document.getElementById('pvMode');
  const offgridSection = document.getElementById('offgridSection');
  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');
  const pvForm = document.getElementById('pvForm');


  if (!calcBtn || !resultBox || !pvMode) {
    console.error(
      'Solar PV Calculator: Required DOM elements missing.'
    );
    return;
  }


  // ==============================
  // MODE SWITCH
  // ==============================

  pvMode.addEventListener('change', () => {

    if (offgridSection) {

      offgridSection.style.display =
        pvMode.value === 'offgrid'
          ? 'block'
          : 'none';

    }

  });



  // ==============================
  // BUTTON EVENTS
  // ==============================

  calcBtn.addEventListener('click', (e)=>{

    e.preventDefault();
    performCalculation();

  });


  if(resetBtn){

    resetBtn.addEventListener('click',(e)=>{

      e.preventDefault();
      resetCalculator();

    });

  }


  if(pvForm){

    pvForm.addEventListener('submit',(e)=>{

      e.preventDefault();
      performCalculation();

    });

  }



  // ==============================
  // INPUT HELPERS
  // ==============================


  function num(id){

    const el=document.getElementById(id);

    if(!el) return 0;

    const value=parseFloat(el.value);

    return isNaN(value) ? 0 : value;

  }



  function setVal(id,value){

    const el=document.getElementById(id);

    if(el){
      el.value=value;
    }

  }



  // ==============================
  // MAIN CALCULATION
  // ==============================

function performCalculation() {

    const mode = pvMode.value;

    // ------------------------------
    // MODULE PARAMETERS
    // ------------------------------
    const Voc = num('voc');
    const Vmp = num('vmp');
    const Imp = num('imp');
    const Pmax = num('pmax');

    // ------------------------------
    // INVERTER PARAMETERS
    // ------------------------------
    const invRating = num('invRating');
    const dcmax = num('dcmax');
    const mpptMin = num('mpptMin');
    const mpptMax = num('mpptMax');

    // ------------------------------
    // ENVIRONMENT
    // ------------------------------
    const Tmin = num('tmin');
    const Tmax = num('tmax');
    const psh = num('psh');
    const lossPct = num('loss');

    // ------------------------------
    // BASIC VALIDATION
    // ------------------------------
    if (Voc <= 0 || Vmp <= 0 || Pmax <= 0 || invRating <= 0 || dcmax <= 0) {
      showError('Please enter valid PV module and inverter values.');
      return;
    }
    if (Vmp >= Voc) {
      showError('Vmp must be lower than Voc.');
      return;
    }
    if (mpptMin >= mpptMax) {
      showError('MPPT minimum must be lower than MPPT maximum.');
      return;
    }

    // ==============================
    // TEMPERATURE CORRECTION
    // ==============================
    /*
      Voc temperature coefficient: approx +0.28% / °C below 25°C
      Vmp temperature coefficient: approx -0.35% / °C above 25°C
      *Professional fix: Calculate Cell Temp for Hot Vmp (+25C above ambient)*
    */
    const TmaxCell = Tmax + 25; // Estimated module operating temperature

    const VocColdModule = Voc * (1 + 0.0028 * (25 - Tmin));
    const VmpHotModule = Vmp * (1 - 0.0035 * (TmaxCell - 25));

    if (VocColdModule <= 0 || VmpHotModule <= 0) {
      showError('Temperature calculation produced invalid voltage.');
      return;
    }

    // =====================================================
    // PROFESSIONAL STRING SIZING ALGORITHM
    // =====================================================

    // Total modules required (Base 1:1 sizing)
    const totalModules = Math.ceil((invRating * 1000) / Pmax);

    // *CRITICAL FIX: Define dcSize and dcac*
    const dcSize = (totalModules * Pmax) / 1000;
    const dcac = dcSize / invRating;

    // Voltage limits
    const maxVocModules = Math.floor(dcmax / VocColdModule);
    const minMpptModules = Math.ceil(mpptMin / VmpHotModule);
    const maxMpptModules = Math.floor(mpptMax / VmpHotModule);

    // Final allowable range
    const upperLimit = Math.min(maxVocModules, maxMpptModules);
    const lowerLimit = minMpptModules;

    let modulesPerString = 0;
    let strings = 0;
    let voltageMismatch = false;
    let bestRemainder = Number.MAX_SAFE_INTEGER;

    // Search every possible string size
    for (let m = lowerLimit; m <= upperLimit; m++) {
      const s = Math.ceil(totalModules / m);
      const remainder = totalModules % s;
      const smallestString = Math.floor(totalModules / s);

      if (smallestString < lowerLimit) continue;

      if (remainder < bestRemainder) {
        bestRemainder = remainder;
        modulesPerString = m;
        strings = s;
      }
    }

    if (modulesPerString === 0) {
      voltageMismatch = true;
      modulesPerString = lowerLimit;
      strings = Math.ceil(totalModules / modulesPerString);
    }

    const stringVocCold = VocColdModule * modulesPerString;
    const stringVmpHot = VmpHotModule * modulesPerString;

    // ==============================
    // ENERGY YIELD CALCULATION
    // ==============================
    const inverterEff = 0.97;
    const wiringLoss = 0.02;
    const soilingLoss = 0.03;
    const mismatchLoss = 0.02;
    const generalLossFactor = lossPct / 100;

    // *Professional fix: Multiplicative loss calculation for accuracy*
    const PR = (1 - generalLossFactor) * inverterEff * (1 - wiringLoss) * (1 - soilingLoss) * (1 - mismatchLoss);
    const PRClamped = Math.max(0.40, Math.min(0.95, isNaN(PR) ? 0.75 : PR));

    const annualEnergy = dcSize * psh * 365 * PRClamped;
    const dailyEnergy = annualEnergy / 365;

    // ==============================
    // VALIDATION STATUS
    // ==============================
    let status = 'PASS';
    let badgeClass = 'pass';
    let statusNote = 'System configuration meets inverter electrical limits and MPPT voltage window.';

    if (dcac > 1.5) {
      status = 'WARNING';
      badgeClass = 'warn';
      statusNote = 'High DC/AC ratio. Possible inverter clipping during high irradiance.';
    }

    if (voltageMismatch || modulesPerString === 0 || stringVocCold > dcmax || stringVmpHot < mpptMin || stringVmpHot > mpptMax) {
      status = 'FAIL';
      badgeClass = 'fail';
      statusNote = 'String voltage is outside inverter DC voltage or MPPT operating range.';
    }

    let temperatureWarning = '';
    if (Tmin < -50 || Tmax > 80) {
      temperatureWarning = `
      <div class="warning-box">
      ⚠ Extreme temperature values detected.
      Please verify environmental design conditions.
      </div>
      `;
    }

    // ==============================
    // OFF GRID BATTERY CALCULATION
    // ==============================
    let batteryCardHtml = '';
    if (mode === 'offgrid') {
      const load = num('dailyLoad');
      const days = num('autonomy');
      const Vbat = num('batteryV');
      const dod = num('dod') / 100;

      if (load > 0 && days > 0 && Vbat > 0 && dod > 0) {
        const invEff = 0.93;
        const battEff = 0.92;
        const safetyFactor = 1.15;
        const netUsableKwh = load * days;
        
        const grossRequiredKwh = (netUsableKwh * safetyFactor) / (dod * invEff * battEff);
        const batteryAh = (grossRequiredKwh * 1000) / Vbat;

        batteryCardHtml = `
        <div class="pv-result-card">
          <span class="pv-card-title">Off-Grid Battery Storage</span>
          <div class="pv-metric-row"><span>Daily Load:</span><strong>${formatNum(load)} kWh/day</strong></div>
          <div class="pv-metric-row"><span>Autonomy:</span><strong>${days} Days</strong></div>
          <div class="pv-metric-row"><span>Required Storage:</span><strong>${formatNum(grossRequiredKwh)} kWh</strong></div>
          <div class="pv-metric-row highlight-row"><span>Battery Capacity:</span><strong>${formatNum(batteryAh, 0)} Ah @ ${Vbat}V</strong></div>
        </div>
        `;
      }
    }


    
    // ==============================
    // RENDER RESULTS
    // ==============================


    resultBox.innerHTML = `

    <div class="pv-results-grid">


      <!-- PV ARRAY SIZING -->

      <div class="pv-result-card">

      <span class="pv-card-title">
      PV Array Sizing
      </span>


      <div class="pv-metric-row">
      <span>Total Array Rating:</span>
      <strong>${formatNum(dcSize)} kW</strong>
      </div>


      <div class="pv-metric-row">
      <span>Total Panels Required:</span>
      <strong>${totalModules} Modules</strong>
      </div>


      <div class="pv-metric-row">
      <span>Modules per String:</span>
      <strong>${modulesPerString} Modules</strong>
      </div>


      <div class="pv-metric-row">
      <span>Parallel Strings:</span>
      <strong>${strings} Strings</strong>
      </div>


      <div class="pv-metric-row">
      <span>DC/AC Ratio:</span>
      <strong>${formatNum(dcac)}</strong>
      </div>


      </div>




      <!-- VOLTAGE VALIDATION -->

      <div class="pv-result-card">

      <span class="pv-card-title">
      Voltage Window Validation
      </span>



      <div class="pv-metric-row">
      <span>Cold Voc / Module:</span>
      <strong>${formatNum(VocColdModule)} V</strong>
      </div>



      <div class="pv-metric-row">
      <span>Cold Voc / String:</span>
      <strong>${formatNum(stringVocCold)} V</strong>
      </div>



      <div class="pv-metric-row">
      <span>Hot Vmp / Module:</span>
      <strong>${formatNum(VmpHotModule)} V</strong>
      </div>



      <div class="pv-metric-row">
      <span>Hot Vmp / String:</span>
      <strong>${formatNum(stringVmpHot)} V</strong>
      </div>



      <div class="pv-metric-row">
      <span>Inverter DC Max:</span>
      <strong>${dcmax} V</strong>
      </div>



      <div class="pv-metric-row">
      <span>MPPT Range:</span>
      <strong>
      ${mpptMin}V - ${mpptMax}V
      </strong>
      </div>


      </div>





      <!-- ENERGY YIELD -->

      <div class="pv-result-card">

      <span class="pv-card-title">
      Energy Yield
      </span>



      <div class="pv-metric-row">
      <span>Annual Generation:</span>
      <strong>
      ${formatNum(annualEnergy,0)}
      kWh/year
      </strong>
      </div>



      <div class="pv-metric-row">
      <span>Daily Average:</span>
      <strong>
      ${formatNum(dailyEnergy)}
      kWh/day
      </strong>
      </div>



      <div class="pv-metric-row">
      <span>Performance Ratio:</span>
      <strong>
      ${formatNum(PRClamped*100,1)}%
      </strong>
      </div>


      </div>





      <!-- STATUS -->

      <div class="pv-result-card">

      <span class="pv-card-title">
      Validation Status
      </span>


      <div class="status-badge-wrapper">

      <span class="badge ${badgeClass}">
      ${status}
      </span>

      </div>


      <p class="status-note-text">
      ${statusNote}
      </p>


      ${temperatureWarning}


      </div>



      ${batteryCardHtml}


    </div>

    `;





    // ==============================
    // FORMULA DISPLAY
    // ==============================


    if(formulaApplied){


      formulaApplied.innerHTML = `


      <strong>
      Temperature Adjusted Voltage Calculation
      </strong>
      <br><br>


      Cold Voc per Module:
      <br>

      ${Voc} × [1 + 0.0028 × (25 - ${Tmin})]

      =
      <strong>
      ${formatNum(VocColdModule)}V
      </strong>


      <br><br>



      Cold Voc String:

      <br>

      ${formatNum(VocColdModule)}
      ×
      ${modulesPerString}

      =
      <strong>
      ${formatNum(stringVocCold)}V
      </strong>



      <br><br>



      Hot Vmp per Module:

      <br>

      ${Vmp}
      ×
      [1 - 0.0035 × (${Tmax}-25)]

      =
      <strong>
      ${formatNum(VmpHotModule)}V
      </strong>



      <br><br>



      Hot Vmp String:

      <br>

      ${formatNum(VmpHotModule)}
      ×
      ${modulesPerString}

      =
      <strong>
      ${formatNum(stringVmpHot)}V
      </strong>


      `;


    }



  }




  // ==============================
  // ERROR DISPLAY
  // ==============================


  function showError(msg){


    if(resultBox){


      resultBox.innerHTML = `

      <div class="result-error-box">

      ⚠️
      <strong>Error:</strong>
      ${msg}

      </div>

      `;


    }



    if(formulaApplied){

      formulaApplied.textContent =
      'Calculation failed. Please check input values.';

    }


  }





  // ==============================
  // RESET FUNCTION
  // ==============================


  function resetResultsDisplay(){


    if(resultBox){

      resultBox.innerHTML = `

      <div class="result-placeholder">

      ☀️

      <p>
      Adjust parameters and click
      <strong>
      Calculate System
      </strong>
      </p>

      </div>

      `;

    }



    if(formulaApplied){

      formulaApplied.textContent =
      'Validation calculations will appear here.';

    }


  }





  function resetCalculator(){



    setVal('voc',49.5);

    setVal('vmp',41.2);

    setVal('imp',10.8);

    setVal('pmax',450);



    setVal('invRating',10);

    setVal('dcmax',1000);

    setVal('mpptMin',200);

    setVal('mpptMax',800);



    setVal('tmin',10);

    setVal('tmax',45);

    setVal('psh',5.5);

    setVal('loss',14);



    setVal('dailyLoad',12);

    setVal('autonomy',2);

    setVal('batteryV',48);

    setVal('dod',80);



    if(pvMode){

      pvMode.value='grid';

    }



    if(offgridSection){

      offgridSection.style.display='none';

    }


    resetResultsDisplay();


  }





  // ==============================
  // NUMBER FORMATTER
  // ==============================


  function formatNum(value, decimals=2){


    if(
      isNaN(value) ||
      value===null ||
      value===undefined
    ){

      return '0';

    }


    return Number(value)
      .toLocaleString(
        'en-US',
        {
          minimumFractionDigits:0,
          maximumFractionDigits:decimals
        }
      );


  }



});
