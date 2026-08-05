/* ==================================================
   Tools.PrasunBarua
   Main Application JavaScript
   Version 2.0

   PART 1:
   Data System
   Initialization
   Theme Engine
   Mobile Navigation
================================================== */



// ==========================================
// CENTRAL TOOL DATABASE
// ==========================================


const TOOLS_DATA = [

{
    id:"ohms-law-calculator",

    title:"Ohm's Law Calculator",

    icon:"⚡",

    category:"Electrical Tools",

    categorySlug:"electrical",

    description:
    "Calculate voltage, current, resistance, and electrical power instantly.",


    keywords:[
        "ohm",
        "voltage",
        "current",
        "resistance",
        "power",
        "amp",
        "volt",
        "watt",
        "electrical"
    ],


    url:
    "./tools/ohms-law-calculator.html"

},



{
    id:"solar-pv-calculator",

    title:"Solar PV Calculator",

    icon:"☀️",

    category:"Solar PV Tools",

    categorySlug:"solar",

    description:
    "Estimate solar PV capacity, modules, inverter size, and energy production.",


    keywords:[
        "solar",
        "pv",
        "panel",
        "energy",
        "battery",
        "inverter",
        "renewable",
        "kw",
        "kwh",
        "sun"
    ],


    url:
    "./tools/solar-pv-calculator.html"

}

];






// ==========================================
// APPLICATION START
// ==========================================


function initApp(){


    initThemeSystem();


    initMobileMenu();


    initToolRenderer();


    initCategoryFilter();


    initGoogleSearch();


    initNavigationBehavior();



}







// ==========================================
// THEME SYSTEM
// ==========================================


function initThemeSystem(){


const themeButton =
document.getElementById("themeToggle");



const savedTheme =
localStorage.getItem("theme");



const systemTheme =
window.matchMedia(
"(prefers-color-scheme: dark)"
).matches
?
"dark"
:
"light";



const activeTheme =
savedTheme || systemTheme;



applyTheme(activeTheme);





if(themeButton){


themeButton.addEventListener(
"click",
()=>{


const current =
document.documentElement
.getAttribute("data-theme");



const newTheme =
current === "dark"
?
"light"
:
"dark";



applyTheme(newTheme);



localStorage.setItem(
"theme",
newTheme
);



});


}




// Follow system changes
window
.matchMedia("(prefers-color-scheme: dark)")
.addEventListener(
"change",
(event)=>{


if(!localStorage.getItem("theme")){


applyTheme(
event.matches
?
"dark"
:
"light"
);


}


});


}






function applyTheme(theme){



document.documentElement
.setAttribute(
"data-theme",
theme
);



const lightIcon =
document.querySelector(
".theme-icon-light"
);



const darkIcon =
document.querySelector(
".theme-icon-dark"
);





if(lightIcon && darkIcon){


lightIcon.style.display =
theme==="dark"
?
"none"
:
"inline";



darkIcon.style.display =
theme==="dark"
?
"inline"
:
"none";


}



}









// ==========================================
// MOBILE MENU SYSTEM
// ==========================================


function initMobileMenu(){



const menuButton =
document.getElementById(
"mobileMenuBtn"
);



const navigation =
document.getElementById(
"navMenu"
);



if(!menuButton || !navigation)
return;





menuButton.addEventListener(
"click",
()=>{


navigation.classList.toggle(
"active"
);


menuButton.classList.toggle(
"active"
);


});






// Close menu after link click


navigation
.querySelectorAll("a")
.forEach(link=>{


link.addEventListener(
"click",
()=>{


navigation.classList.remove(
"active"
);



menuButton.classList.remove(
"active"
);



});


});







// Click outside close


document.addEventListener(
"click",
(event)=>{


if(

!navigation.contains(event.target)

&&

!menuButton.contains(event.target)

){


navigation.classList.remove(
"active"
);



menuButton.classList.remove(
"active"
);


}



});



}
/* ==================================================
   PART 2:
   Tool Renderer
   Category Filter
   Search System
================================================== */






// ==========================================
// TOOL GRID RENDERER
// ==========================================


function initToolRenderer(){


renderTools(TOOLS_DATA);


}






function renderTools(toolList){



const toolsGrid =
document.getElementById(
"toolsGrid"
);



const noResults =
document.getElementById(
"noResultsState"
);



if(!toolsGrid)
return;




toolsGrid.innerHTML="";





if(toolList.length===0){


if(noResults)
noResults.hidden=false;


return;


}



if(noResults)
noResults.hidden=true;







toolList.forEach(tool=>{



const card =
document.createElement("a");



card.className =
"tool-card";



card.href =
tool.url;





card.innerHTML = `


<div class="tool-card-header">


<span class="tool-icon">

${tool.icon}

</span>



<span class="tool-category-tag">

${tool.category}

</span>



</div>




<h3>

${tool.title}

</h3>




<p>

${tool.description}

</p>




<span class="tool-card-cta">

Launch Tool →

</span>



`;




toolsGrid.appendChild(card);



});



}









// ==========================================
// CATEGORY FILTER SYSTEM
// ==========================================


function initCategoryFilter(){



const categoryButtons =
document.querySelectorAll(
".category-card"
);



const badge =
document.getElementById(
"activeFilterBadge"
);



const resetButton =
document.getElementById(
"resetFilterBtn"
);




if(!categoryButtons.length)
return;






function filterCategory(
category,
button
){





categoryButtons.forEach(
item=>
item.classList.remove(
"active"
)
);




if(button)
button.classList.add(
"active"
);







let filteredTools;



if(category==="all"){



filteredTools =
TOOLS_DATA;



if(badge)
badge.textContent =
"Showing All Tools";



}

else{



filteredTools =
TOOLS_DATA.filter(
tool=>
tool.categorySlug===category
);




if(badge && button){



const name =
button.querySelector("h3")
.textContent;



badge.textContent =
`Showing: ${name}`;


}



}






renderTools(
filteredTools
);



}




categoryButtons.forEach(
button=>{



button.addEventListener(
"click",
()=>{


filterCategory(

button.dataset.category,

button

);



});



});







if(resetButton){


resetButton.addEventListener(
"click",
()=>{


const allButton =
document.querySelector(
'.category-card[data-category="all"]'
);



filterCategory(
"all",
allButton
);



});



}



}









// ==========================================
// GOOGLE STYLE SEARCH SYSTEM
// ==========================================


function initGoogleSearch(){



const searchInput =
document.getElementById(
"toolSearch"
);



const clearButton =
document.getElementById(
"clearSearch"
);



const dropdown =
document.getElementById(
"searchResults"
);





if(!searchInput)
return;








function searchTools(query){



const keyword =
query
.toLowerCase()
.trim();






if(!keyword)
return TOOLS_DATA;





return TOOLS_DATA.filter(
tool=>



tool.title
.toLowerCase()
.includes(keyword)



||

tool.description
.toLowerCase()
.includes(keyword)



||

tool.category
.toLowerCase()
.includes(keyword)



||

tool.keywords.some(
word=>
word
.toLowerCase()
.includes(keyword)
)



);



}









searchInput.addEventListener(
"input",
()=>{


const query =
searchInput.value;





if(clearButton){


clearButton.hidden =
query.length===0;


}





const results =
searchTools(query);





if(query.length>0){


showSearchDropdown(
results,
dropdown
);



renderTools(
results
);



}
else{


hideDropdown(
dropdown
);



renderTools(
TOOLS_DATA
);



}



});








// Clear button


if(clearButton){



clearButton.addEventListener(
"click",
()=>{



searchInput.value="";



clearButton.hidden=true;



hideDropdown(
dropdown
);



renderTools(
TOOLS_DATA
);



searchInput.focus();



});



}






// ESC close


searchInput.addEventListener(
"keydown",
(event)=>{


if(event.key==="Escape"){


hideDropdown(
dropdown
);



}


});





// Click outside


document.addEventListener(
"click",
(event)=>{


if(
!searchInput.contains(event.target)
&&
!dropdown.contains(event.target)

){


hideDropdown(
dropdown
);


}



});



}








function showSearchDropdown(
results,
dropdown
){



if(!dropdown)
return;





if(results.length===0){



dropdown.hidden=true;


return;


}






dropdown.innerHTML =
results
.map(tool=>`


<a
href="${tool.url}"
class="search-dropdown-item">


<span>

${tool.icon}

</span>


<div>


<strong>

${tool.title}

</strong>



<p>

${tool.category}

</p>


</div>


</a>


`)
.join("");





dropdown.hidden=false;



}








function hideDropdown(dropdown){



if(dropdown)
dropdown.hidden=true;



}
/* ==================================================
   PART 3:
   Navigation
   Scroll Effects
   Application Start
================================================== */






// ==========================================
// NAVIGATION BEHAVIOR
// ==========================================


function initNavigationBehavior(){



const sections =
document.querySelectorAll(
"main section[id]"
);



const navLinks =
document.querySelectorAll(
".nav-link"
);





if(!sections.length || !navLinks.length)
return;







const observer =
new IntersectionObserver(
(entries)=>{


entries.forEach(
entry=>{


if(entry.isIntersecting){



const currentId =
entry.target.id;





navLinks.forEach(
link=>{


link.classList.remove(
"active"
);



if(
link.getAttribute("href")
===
`#${currentId}`
){


link.classList.add(
"active"
);


}



});



}



});


},


{
threshold:0.45

}

);






sections.forEach(
section=>
observer.observe(section)

);



}








// ==========================================
// SMOOTH SCROLL OFFSET
// ==========================================


function initSmoothScroll(){



document
.querySelectorAll(
'a[href^="#"]'
)
.forEach(
link=>{


link.addEventListener(
"click",
function(event){



const targetId =
this
.getAttribute("href");




if(
targetId==="#"
)
return;





const target =
document.querySelector(
targetId
);





if(target){



event.preventDefault();



const headerHeight =
document
.querySelector(".header")
?.offsetHeight || 0;





window.scrollTo({

top:
target.offsetTop -
headerHeight,

behavior:"smooth"

});



}



});



});



}








// ==========================================
// GLOBAL ERROR PROTECTION
// ==========================================


window.addEventListener(
"error",
(event)=>{


console.warn(

"Tools.PrasunBarua script error:",

event.message

);


});








// ==========================================
// START APPLICATION
// ==========================================


if(
document.readyState==="loading"
){



document.addEventListener(
"DOMContentLoaded",
()=>{


try{


initApp();


initSmoothScroll();



}

catch(error){


console.error(
"Application initialization failed:",
error
);



}



});



}

else{


try{


initApp();


initSmoothScroll();



}

catch(error){


console.error(
"Application initialization failed:",
error
);



}


}
