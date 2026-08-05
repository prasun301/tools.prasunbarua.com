/**
 * Solar PV System Calculator Logic v3.0
 *
 * Professional PV Design Engine
 *
 * Improvements:
 * - Balanced string configuration
 * - String voltage validation
 * - Temperature corrected Voc/Vmp
 * - DC/AC ratio optimization
 * - MPPT validation support
 */

document.addEventListener('DOMContentLoaded', () => {


  // =====================================================
  // DOM ELEMENTS
  // =====================================================

  const pvMode = document.getElementById('pvMode');
  const offgridSection = document.getElementById('offgridSection');

  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');

  const pvForm = document.getElementById('pvForm');

  const resultBox = document.getElementById('resultBox');
  const formulaApplied = document.getElementById('formulaApplied');


  if (!calcBtn || !resultBox || !pvMode) {

    console.error(
      "Solar PV Calculator: Missing required elements."
    );

    return;

  }



  // =====================================================
  // MODE CONTROL
  // =====================================================


  pvMode.addEventListener(
    'change',
    ()=>{

      if(offgridSection){

        offgridSection.style.display =
          pvMode.value === "offgrid"
          ? "block"
          : "none";

      }

    }
  );




  // =====================================================
  // BUTTON EVENTS
  // =====================================================


  calcBtn.addEventListener(
    'click',
    e=>{

      e.preventDefault();

      performCalculation();

    }
  );



  if(pvForm){

    pvForm.addEventListener(
      'submit',
      e=>{

        e.preventDefault();

        performCalculation();

      }
    );

  }



  if(resetBtn){

    resetBtn.addEventListener(
      'click',
      e=>{

        e.preventDefault();

        resetCalculator();

      }
    );

  }




  // =====================================================
  // INPUT FUNCTIONS
  // =====================================================


  function num(id){

    const el=document.getElementById(id);

    if(!el)
      return 0;


    const value=parseFloat(el.value);


    return isNaN(value)
      ? 0
      : value;

  }




  function setVal(id,value){

    const el=document.getElementById(id);

    if(el)
      el.value=value;

  }




  // =====================================================
  // MAIN CALCULATION
  // =====================================================


  function performCalculation(){



    const mode=pvMode.value;



    // -----------------------------------------------------
    // MODULE DATA
    // -----------------------------------------------------

    const Voc=num('voc');

    const Vmp=num('vmp');

    const Imp=num('imp');

    const Pmax=num('pmax');



    // -----------------------------------------------------
    // INVERTER DATA
    // -----------------------------------------------------

    const invRating=num('invRating');

    const dcmax=num('dcmax');

    const mpptMin=num('mpptMin');

    const mpptMax=num('mpptMax');


    // New optional inverter inputs
    const mpptCount=num('mpptCount') || 1;

    const stringsPerMppt=num('stringsPerMppt') || 1;



    // -----------------------------------------------------
    // ENVIRONMENT
    // -----------------------------------------------------

    const Tmin=num('tmin');

    const Tmax=num('tmax');

    const psh=num('psh');

    const lossPct=num('loss');



    // -----------------------------------------------------
    // BASIC CHECK
    // -----------------------------------------------------

    if(
      Voc<=0 ||
      Vmp<=0 ||
      Pmax<=0 ||
      invRating<=0
    ){

      showError(
        "Please enter valid PV module and inverter values."
      );

      return;

    }



    if(Vmp>=Voc){

      showError(
        "Vmp must be lower than Voc."
      );

      return;

    }




    // =====================================================
    // TEMPERATURE CORRECTION
    // =====================================================


    /*
       Voc coefficient:
       +0.28% / °C

       Vmp coefficient:
       -0.35% / °C

       Hot module temperature:
       Ambient + 25°C
    */


    const cellHotTemp =
      Tmax + 25;



    const VocColdModule =
      Voc *
      (
        1 +
        0.0028 *
        (25-Tmin)
      );



    const VmpHotModule =
      Vmp *
      (
        1 -
        0.0035 *
        (cellHotTemp-25)
      );




    // =====================================================
    // PV ARRAY TARGET SIZE
    // =====================================================


    /*
      Recommended DC/AC ratio:
      1.20

      Example:
      10kW inverter
      12kWp PV array
    */


    const targetDcAc =
      1.20;



    const targetDcPower =
      invRating *
      targetDcAc;



    const totalModules =
      Math.ceil(
        (targetDcPower*1000)
        /
        Pmax
      );



    const dcSize =
      (
        totalModules*
        Pmax
      )
      /
      1000;



    const dcac =
      dcSize/
      invRating;




    // =====================================================
    // MODULE STRING LIMITS
    // =====================================================


    const maxModulesByVoc =
      Math.floor(
        dcmax/
        VocColdModule
      );



    const minModulesByMppt =
      Math.ceil(
        mpptMin/
        VmpHotModule
      );



    const maxModulesByMppt =
      Math.floor(
        mpptMax/
        VmpHotModule
      );



    const minStringLength =
      minModulesByMppt;



    const maxStringLength =
      Math.min(
        maxModulesByVoc,
        maxModulesByMppt
      );



    if(
      minStringLength >
      maxStringLength
    ){

      showError(
        "No valid string configuration exists for this inverter."
      );

      return;

    }




    // =====================================================
    // BALANCED STRING SEARCH
    // =====================================================


    const maxStrings =
      mpptCount *
      stringsPerMppt;



    let bestDesign=null;



    for(
      let strings=1;
      strings<=maxStrings;
      strings++
    ){


      const modulesPerString =
        Math.ceil(
          totalModules/
          strings
        );



      if(
        modulesPerString <
        minStringLength
      )
        continue;



      if(
        modulesPerString >
        maxStringLength
      )
        continue;



      const actualModules =
        modulesPerString*
        strings;



      const extraModules =
        actualModules -
        totalModules;



      /*
        Prefer:
        - lowest extra modules
        - more balanced design
      */


      if(
        !bestDesign ||
        extraModules <
        bestDesign.extraModules
      ){


        bestDesign={

          strings:strings,

          modulesPerString:
          modulesPerString,

          actualModules:
          actualModules,

          extraModules:
          extraModules

        };


      }


    }



    if(!bestDesign){


      showError(
        "Unable to create valid PV strings. Increase module count or select a different inverter."
      );


      return;

    }



    const strings =
      bestDesign.strings;



    const modulesPerString =
      bestDesign.modulesPerString;



    const actualModules =
      bestDesign.actualModules;



    const extraModules =
      bestDesign.extraModules;



        // =====================================================
    // STRING VOLTAGE CALCULATIONS
    // =====================================================


    const stringVocCold =
      VocColdModule *
      modulesPerString;



    const stringVmpHot =
      VmpHotModule *
      modulesPerString;



    // =====================================================
    // STRING VALIDATION
    // =====================================================


    let voltageStatus =
      "PASS";


    let voltageMessage =
      "PV string voltage is within inverter operating limits.";



    if(
      stringVocCold >
      dcmax
    ){

      voltageStatus="FAIL";

      voltageMessage =
      "Cold string Voc exceeds inverter maximum DC voltage.";

    }



    if(
      stringVmpHot <
      mpptMin
    ){

      voltageStatus="FAIL";

      voltageMessage =
      "Hot string Vmp is below MPPT minimum voltage.";

    }



    if(
      stringVmpHot >
      mpptMax
    ){

      voltageStatus="FAIL";

      voltageMessage =
      "Hot string Vmp exceeds MPPT maximum voltage.";

    }




    // =====================================================
    // MPPT STRING LIMIT VALIDATION
    // =====================================================


    let mpptWarning="";


    if(
      strings >
      maxStrings
    ){

      voltageStatus="FAIL";


      mpptWarning =
      `
      <div class="warning-box">
      ⚠ Number of strings exceeds inverter MPPT input capability.
      </div>
      `;


    }




    // =====================================================
    // ENERGY YIELD CALCULATION
    // =====================================================


    /*
      Performance Ratio Calculation

      User Loss:
      inverter efficiency
      wiring loss
      soiling loss
      mismatch loss

    */


    const inverterEfficiency =
      0.97;


    const wiringLoss =
      0.02;


    const soilingLoss =
      0.03;


    const mismatchLoss =
      0.02;



    const userLoss =
      lossPct/100;



    const PR =
      (
        1-userLoss
      )
      *
      inverterEfficiency
      *
      (1-wiringLoss)
      *
      (1-soilingLoss)
      *
      (1-mismatchLoss);



    const performanceRatio =
      Math.max(
        0.40,
        Math.min(
          0.95,
          PR
        )
      );



    const annualEnergy =
      dcSize *
      psh *
      365 *
      performanceRatio;



    const dailyEnergy =
      annualEnergy/
      365;




    // =====================================================
    // SYSTEM STATUS
    // =====================================================


    let status =
      voltageStatus;


    let badgeClass =
      "pass";


    let statusNote =
      voltageMessage;



    if(status==="FAIL"){

      badgeClass="fail";

    }



    else if(
      dcac>1.45
    ){

      status="WARNING";

      badgeClass="warn";

      statusNote =
      "High DC/AC ratio. Possible inverter clipping.";

    }



    else if(
      extraModules>0
    ){

      status="WARNING";

      badgeClass="warn";

      statusNote =
      "Additional modules added to achieve balanced string configuration.";

    }





    // =====================================================
    // TEMPERATURE WARNING
    // =====================================================


    let temperatureWarning="";


    if(
      Tmin < -20 ||
      Tmax > 55
    ){

      temperatureWarning=
      `
      <div class="warning-box">

      ⚠ Extreme temperature design condition detected.

      Verify local environmental data.

      </div>
      `;

    }





    // =====================================================
    // OFF-GRID BATTERY CALCULATION
    // =====================================================


    let batteryCardHtml="";


    if(
      mode==="offgrid"
    ){


      const load =
      num('dailyLoad');


      const autonomy =
      num('autonomy');


      const batteryVoltage =
      num('batteryV');


      const dod =
      num('dod')/100;



      if(
        load>0 &&
        autonomy>0 &&
        batteryVoltage>0 &&
        dod>0
      ){



        const inverterEff =
        0.93;


        const batteryEff =
        0.92;


        const safetyFactor =
        1.15;



        const requiredStorage =

        (
          load *
          autonomy *
          safetyFactor
        )
        /
        (
          dod *
          inverterEff *
          batteryEff
        );



        const batteryAh =

        (
          requiredStorage*
          1000
        )
        /
        batteryVoltage;



        batteryCardHtml=

        `

        <div class="pv-result-card">

        <span class="pv-card-title">
        Battery Storage
        </span>


        <div class="pv-metric-row">
        <span>Daily Load:</span>
        <strong>
        ${formatNum(load)}
        kWh/day
        </strong>
        </div>


        <div class="pv-metric-row">
        <span>Autonomy:</span>
        <strong>
        ${autonomy}
        Days
        </strong>
        </div>


        <div class="pv-metric-row">
        <span>Storage Required:</span>
        <strong>
        ${formatNum(requiredStorage)}
        kWh
        </strong>
        </div>


        <div class="pv-metric-row highlight-row">

        <span>
        Battery Capacity:
        </span>

        <strong>

        ${formatNum(batteryAh,0)}
        Ah @
        ${batteryVoltage}V

        </strong>

        </div>


        </div>

        `;


      }

    }





    // =====================================================
    // RESULT DISPLAY
    // =====================================================


    resultBox.innerHTML =


    `

    <div class="pv-results-grid">


    <!-- ARRAY SIZE -->

    <div class="pv-result-card">


    <span class="pv-card-title">
    PV Array Sizing
    </span>



    <div class="pv-metric-row">
    <span>
    DC Array Size:
    </span>

    <strong>
    ${formatNum(dcSize)}
    kW
    </strong>

    </div>



    <div class="pv-metric-row">
    <span>
    Total Modules:
    </span>

    <strong>
    ${actualModules}
    Modules
    </strong>

    </div>



    <div class="pv-metric-row">
    <span>
    Modules/String:
    </span>

    <strong>
    ${modulesPerString}
    Modules
    </strong>

    </div>




    <div class="pv-metric-row">
    <span>
    Parallel Strings:
    </span>

    <strong>
    ${strings}
    Strings
    </strong>

    </div>




    <div class="pv-metric-row">
    <span>
    DC/AC Ratio:
    </span>

    <strong>
    ${formatNum(dcac)}
    </strong>

    </div>


    </div>





    <!-- VOLTAGE -->


    <div class="pv-result-card">


    <span class="pv-card-title">
    Voltage Window Validation
    </span>




    <div class="pv-metric-row">
    <span>
    Cold Voc/String:
    </span>

    <strong>
    ${formatNum(stringVocCold)}
    V
    </strong>

    </div>



    <div class="pv-metric-row">
    <span>
    Hot Vmp/String:
    </span>

    <strong>
    ${formatNum(stringVmpHot)}
    V
    </strong>

    </div>




    <div class="pv-metric-row">
    <span>
    DC Maximum:
    </span>

    <strong>
    ${dcmax}
    V
    </strong>

    </div>



    <div class="pv-metric-row">
    <span>
    MPPT Window:
    </span>

    <strong>
    ${mpptMin}
    -
    ${mpptMax}
    V
    </strong>

    </div>


    </div>




    <!-- ENERGY -->


    <div class="pv-result-card">


    <span class="pv-card-title">
    Energy Yield
    </span>




    <div class="pv-metric-row">

    <span>
    Annual Generation:
    </span>

    <strong>
    ${formatNum(annualEnergy,0)}
    kWh/year
    </strong>

    </div>




    <div class="pv-metric-row">

    <span>
    Daily Average:
    </span>

    <strong>
    ${formatNum(dailyEnergy)}
    kWh/day
    </strong>

    </div>




    <div class="pv-metric-row">

    <span>
    Performance Ratio:
    </span>

    <strong>
    ${formatNum(performanceRatio*100,1)}
    %
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


    ${mpptWarning}


    </div>




    ${batteryCardHtml}



    </div>


    `;



    
    // =====================================================
    // FORMULA DISPLAY
    // =====================================================


    if(formulaApplied){


      formulaApplied.innerHTML =


      `

      <strong>
      Temperature Adjusted String Voltage Calculation
      </strong>


      <br><br>



      <strong>
      Cold Voc Calculation
      </strong>


      <br>


      Module Voc:

      ${Voc} V


      ×


      [1 + 0.0028 × (25 - ${Tmin})]


      <br>


      =

      <strong>
      ${formatNum(VocColdModule)} V/module
      </strong>



      <br><br>



      String Cold Voc:


      <br>


      ${formatNum(VocColdModule)}

      ×

      ${modulesPerString}

      modules


      <br>


      =

      <strong>
      ${formatNum(stringVocCold)} V/string
      </strong>




      <br><br><br>




      <strong>
      Hot Vmp Calculation
      </strong>


      <br>


      Module Vmp:


      ${Vmp} V


      ×


      [1 - 0.0035 × (${Tmax}+25-25)]


      <br>


      =


      <strong>
      ${formatNum(VmpHotModule)} V/module
      </strong>




      <br><br>



      String Hot Vmp:


      <br>


      ${formatNum(VmpHotModule)}


      ×


      ${modulesPerString}


      modules


      <br>


      =


      <strong>
      ${formatNum(stringVmpHot)} V/string
      </strong>




      <br><br><br>



      <strong>
      Array Configuration
      </strong>


      <br>


      ${strings}

      strings ×


      ${modulesPerString}

      modules/string



      <br>


      Total Installed Modules:


      <strong>
      ${actualModules}
      </strong>



      `;


    }



  }




  // =====================================================
  // ERROR DISPLAY
  // =====================================================


  function showError(message){


    if(resultBox){


      resultBox.innerHTML =


      `

      <div class="result-error-box">

      ⚠️

      <strong>
      Calculation Error:
      </strong>


      ${message}


      </div>

      `;


    }



    if(formulaApplied){


      formulaApplied.textContent =

      "Calculation failed. Please check input parameters.";

    }


  }





  // =====================================================
  // RESET FUNCTION
  // =====================================================


  function resetCalculator(){



    // PV MODULE DEFAULTS

    setVal(
      'voc',
      49.5
    );


    setVal(
      'vmp',
      41.2
    );


    setVal(
      'imp',
      10.8
    );


    setVal(
      'pmax',
      450
    );




    // INVERTER DEFAULTS


    setVal(
      'invRating',
      10
    );


    setVal(
      'dcmax',
      1000
    );


    setVal(
      'mpptMin',
      200
    );


    setVal(
      'mpptMax',
      800
    );



    // NEW OPTIONAL INPUTS


    setVal(
      'mpptCount',
      2
    );


    setVal(
      'stringsPerMppt',
      2
    );




    // ENVIRONMENT


    setVal(
      'tmin',
      10
    );


    setVal(
      'tmax',
      45
    );


    setVal(
      'psh',
      5.5
    );


    setVal(
      'loss',
      14
    );




    // BATTERY DEFAULTS


    setVal(
      'dailyLoad',
      12
    );


    setVal(
      'autonomy',
      2
    );


    setVal(
      'batteryV',
      48
    );


    setVal(
      'dod',
      80
    );




    if(pvMode){

      pvMode.value="grid";

    }



    if(offgridSection){

      offgridSection.style.display="none";

    }



    resetResultsDisplay();



  }





  // =====================================================
  // RESET RESULT AREA
  // =====================================================


  function resetResultsDisplay(){


    if(resultBox){


      resultBox.innerHTML =


      `

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

      "Validation calculations will appear here.";

    }


  }





  // =====================================================
  // NUMBER FORMATTER
  // =====================================================


  function formatNum(
    value,
    decimals=2
  ){


    if(
      isNaN(value) ||
      value===null ||
      value===undefined
    ){

      return "0";

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
