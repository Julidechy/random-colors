// GLOBAL SELECTIONS AND VARIABLES
const colorDivs = document.querySelectorAll('.color');
const generateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHex = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const popupBox = popup.children[0];
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjust = document.querySelectorAll('.close-adjustment');
const slidersContainer = document.querySelectorAll('.sliders');
let initialColors;
//For Local Storage
let savedPalettes = [];

//Events Listeners
sliders.forEach(slider => {
    slider.addEventListener('input', hslControl);
})

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateColorUI(index);
    })
})

currentHex.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    })
})

popup.addEventListener('transitionend', () => {
    popup.classList.remove('active');
    popupBox.classList.remove('active');
})

adjustBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    })
})

closeAdjust.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    })
})

generateBtn.addEventListener('click', randomColors);

lockBtn.forEach((button, index)=>{
    button.addEventListener('click', (e) => {
        lockLayer(e, index);
    })
})

//FUNCTIONS

//Random Colors

//Color Generator
function generateHex() {
    // const letters = '1234567890ABCDEF';
    // let hash = '#';
    // for (let i = 0; i < 6; i++){
    //     hash += letters[Math.floor(Math.random() * 16)];
    // }
    // return hash;

    const hexColor = chroma.random();
    return hexColor;
}

function randomColors() {
    
    initialColors = [];

    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();
        //Keep the hex text if it is locked
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText);
            return;
        } else {
            //Add new hex texts if not locked
            initialColors.push(chroma(randomColor).hex());
        }
        //Add the random color to the bg
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        
        //Check for contrast
        checkTextContrast(randomColor, hexText);

        //Initialize Colorize
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brigthness = sliders[1];
        const sat = sliders[2];

        colorizeSliders(color, hue, brigthness, sat);
    });

    //Reset Inputs
    resetInputs();
    //Check contrast in buttons
    adjustBtn.forEach((button, index) => {
        checkTextContrast(initialColors[index], button);
        checkTextContrast(initialColors[index], lockBtn[index]);
    })


    const bgFooter = document.querySelector('.bg-footer');
    const textFooter = document.querySelector('.text-footer');
    bgFooter.style.backgroundColor = initialColors[2];
    checkTextContrast(initialColors[2], textFooter);
}

function checkTextContrast(color, text) {
    const luminance = chroma(color).luminance();
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}

function colorizeSliders(color, hue, brigthness, sat) {
    //Scale Sat
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    const scaleSat = chroma.scale([noSat, color, fullSat]);

    sat.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;

    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBright = chroma.scale(['black', midBright, 'white']);

    brigthness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)},${scaleBright(0.5)}, ${scaleBright(1)})`;

    //Scale hue
    hue.style.backgroundImage= `linear-gradient(to right, rgb(204,75,75), rgb(204, 204, 75), rgb(75,204,75), rgb(75,204,204), rgb(75, 75, 204), rgb(204, 75, 204), rgb(204, 75, 75))`
}

function hslControl(e) {
    const index = e.target.getAttribute("data-hue") || e.target.getAttribute("data-bright") || e.target.getAttribute("data-sat");
    
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"');
    const hue = sliders[0];
    const brightness = sliders[1];
    const sat = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set('hsl.h', hue.value)
        .set('hsl.l', brightness.value)
        .set('hsl.s', sat.value);
    
    colorDivs[index].style.backgroundColor = color;

    //Colorize slider inputs
    colorizeSliders(color, hue, brightness, sat);
}

function updateColorUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor);
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');

    textHex.innerText = color.hex();

    checkTextContrast(color, textHex);
    
    for (icon of icons) {
        checkTextContrast(color, icon);
    }

}

function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');

    sliders.forEach(slider => {
        if (slider.name === "hue"){
            const hueColor = initialColors[slider.getAttribute("data-hue")];
            const hueValue = chroma(hueColor).hsl()[0];
            slider.value = Math.floor(hueValue)
        }
        if (slider.name === "brightness"){
            const brightColor = initialColors[slider.getAttribute("data-bright")];
            const brightValue = chroma(brightColor).hsl()[2];
            slider.value = Math.floor(brightValue * 100) / 100;
        }
        if (slider.name === "saturation"){
            const satColor = initialColors[slider.getAttribute("data-sat")];
            const satValue = chroma(satColor).hsl()[1];
            slider.value = Math.floor(satValue * 100) / 100;
        }
    })
}

//Copy
function copyToClipboard(hex) {
    const el = document.createElement('textarea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    //popup animation
    popup.classList.add('active');
    popupBox.classList.add('active');

}

function openAdjustmentPanel(index) {
    slidersContainer[index].classList.toggle('active');
}
function closeAdjustmentPanel(index) {
    slidersContainer[index].classList.remove('active');
}

function lockLayer(e, index) {
    const lockSVG = e.target.children[0];
    const activeBg = colorDivs[index];

    activeBg.classList.toggle('locked');

    if (activeBg.classList.contains('locked')) {
        lockSVG.classList.remove('fa-lock-open');
        lockSVG.classList.add('fa-lock');
        adjustBtn[index].classList.add('pointer-events-none');
    } else {
        lockSVG.classList.add('fa-lock-open');
        adjustBtn[index].classList.remove('pointer-events-none');
    }
}

//Save Palette
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');

const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');

//EventListeners
saveBtn.addEventListener('click', openSavePalette);
closeSave.addEventListener('click', closeSavePalette);
submitSave.addEventListener('click', savePalette);

libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary);

function openSavePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closeSavePalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}
function savePalette(e) {
    saveContainer.classList.remove('active');
    saveContainer.children[0].classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHex.forEach(hex => {
        colors.push(hex.innerText);
    })

    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
    if (paletteObjects) {
        paletteNr = paletteObjects.length;
    } else {
        paletteNr = savedPalettes.length;
    }

    const paletteObj = { name, colors, nr: paletteNr };
    savedPalettes.push(paletteObj);

    //Save to Local Storage
    saveToLocal(paletteObj);
    const libraryTitle = document.querySelector('.library-title');
    libraryTitle.innerText = "Selecciona la paleta"
    saveInput.value = '';

    //Generate Palette for Library
    const palette = document.createElement('div');
    palette.classList.add('custom-palette', 'flex', 'justify-evenly', 'items-center', 'w-full', 'p-2');
    const title = document.createElement('h4');
    title.classList.add('text-gray-800', 'font-bold', 'text-left', 'flex-1');
    title.innerText = paletteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview','flex');
    paletteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        smallDiv.classList.add('w-6', 'h-10');
        preview.appendChild(smallDiv);
    })

    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add(paletteObj.nr);
    paletteBtn.classList.add('pick-palette-btn', 'bg-blue-900', 'text-white', 'text-xs', 'py-3', 'px-1', 'font-semibold');
    paletteBtn.innerText = 'Seleccionar';

    //Attach event to Btn
    paletteBtn.addEventListener('click', (e) => {
        closeLibrary();
        const paletteIndex = e.target.classList[0];
        initialColors = [];
        savedPalettes[paletteIndex].colors.forEach((color, index)=>{
            initialColors.push(color);
            colorDivs[index].style.backgroundColor= color;
            const text = colorDivs[index].children[0];
            checkTextContrast(color, text);
            updateColorUI(index);
        })
        resetInputs();
    })

    //Append to library
    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);

    libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'));
    }
    localPalettes.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active');
}

function closeLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.remove('active');
    popup.classList.remove('active');
}

function getLocal() {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = [];
    } else {
        const paletteObjects = JSON.parse(localStorage.getItem('palettes'));
        savedPalettes = [...paletteObjects];
        const libraryTitle = document.querySelector('.library-title');
        libraryTitle.innerText = "Selecciona la paleta"
        paletteObjects.forEach(paletteObj => {
            //Generate Palette for Library
            const palette = document.createElement('div');
            palette.classList.add('custom-palette', 'flex', 'justify-evenly', 'items-center', 'w-full', 'p-2');
            const title = document.createElement('h4');
            title.classList.add('text-gray-800', 'font-bold', 'text-left', 'flex-1');
            title.innerText = paletteObj.name;
            const preview = document.createElement('div');
            preview.classList.add('small-preview', 'flex');
            paletteObj.colors.forEach(smallColor => {
                const smallDiv = document.createElement('div');
                smallDiv.style.backgroundColor = smallColor;
                smallDiv.classList.add('w-6', 'h-10');
                preview.appendChild(smallDiv);
            })

            const paletteBtn = document.createElement('button');
            paletteBtn.classList.add(paletteObj.nr);
            paletteBtn.classList.add('pick-palette-btn', 'bg-blue-900', 'text-white', 'text-xs', 'py-3', 'px-1', 'font-semibold');
            paletteBtn.innerText = 'Seleccionar';

            //Attach event to Btn
            paletteBtn.addEventListener('click', (e) => {
                closeLibrary();
                const paletteIndex = e.target.classList[0];
                initialColors = [];
                paletteObjects[paletteIndex].colors.forEach((color, index) => {
                    initialColors.push(color);
                    colorDivs[index].style.backgroundColor = color;
                    const text = colorDivs[index].children[0];
                    checkTextContrast(color, text);
                    updateColorUI(index);
                })
                resetInputs();
            })

            //Append to library
            palette.appendChild(title);
            palette.appendChild(preview);
            palette.appendChild(paletteBtn);

            libraryContainer.children[0].appendChild(palette);
        })
    }
}

const resetBtn = document.querySelector('.reset-library');

resetBtn.addEventListener('click', () => {
    closeLibrary();
    const palettes = document.querySelectorAll('.custom-palette');
    palettes.forEach(palette => {
        palette.remove();
    })
    savedPalettes = [];
    paletteObjects = [];
    localStorage.clear();
    const libraryTitle = document.querySelector('.library-title');
    libraryTitle.innerText = "La biblioteca está vacía"
})

getLocal();
randomColors();