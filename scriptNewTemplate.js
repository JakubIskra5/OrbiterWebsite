window.onload = () => {
  const transitionBox = document.getElementById("transitionBox");
  transitionBox.style.opacity = "0";
};


let scale = 1;
let isPanning = false;
let startX, startY;
let translateX = 0, translateY = 0;
const canvasBox = document.getElementById("canvasBox");

window.addEventListener("wheel", (event) => {
  event.preventDefault();

  const zoomStep = 0.1;
  const direction = event.deltaY > 0 ? -1 : 1;
  const mouseX = event.clientX - canvasBox.getBoundingClientRect().left;
  const mouseY = event.clientY - canvasBox.getBoundingClientRect().top;
  const oldScale = scale;
  scale += direction * zoomStep;
  scale = Math.min(Math.max(scale, 0.1), 5);
  translateX -= (mouseX / oldScale) * (scale - oldScale);
  translateY -= (mouseY / oldScale) * (scale - oldScale);

  updateTransform();
}, { passive: false });

window.addEventListener('mousedown', (event) => {
  if (event.button === 1) {
    isPanning = true;
    startX = event.clientX - translateX;
    startY = event.clientY - translateY;
    document.body.style.cursor = 'grabbing';
    event.preventDefault();
  }
});

window.addEventListener('mouseup', (event) => {
  if (event.button === 1) {
    isPanning = false;
    document.body.style.cursor = 'default';
  }
});

window.addEventListener('mousemove', (event) => {
  if (!isPanning) return;

  translateX = event.clientX - startX;
  translateY = event.clientY - startY;

  updateTransform();
});

const updateTransform = () => {
  canvasBox.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
  updateScaleAndPositionText();
}

const updateScaleAndPositionText = () =>{
  const scaleText = document.getElementById("scaleText");
  scaleText.innerText = `Scale: ${scale.toFixed(2)}`;

  const positionText = document.getElementById("positionText");
  positionText.innerHTML = `Position: x: ${Math.floor(((translateX * -1) / scale))} , y: ${Math.floor((translateY / scale))}`;
}

const cursorPositionText = document.getElementById("cursorPositionText");
let lastCall = 0;
window.addEventListener("mousemove", (event) => {
  const now = Date.now();
  if (now - lastCall > 40) {
    lastCall = now;

    const rect = canvasBox.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;

    cursorPositionText.innerHTML = `x: ${Math.floor((relativeX) / scale)} , y: ${Math.floor((relativeY) / scale)}`;
  }
});

let CBCount = 0;
const buttonAddCB = document.getElementById("buttonAddCelestialBody");
const CBBox = document.getElementById("celestialBodiesBox");
const allCelestialBodies = [];
let trailCtx = null;
const radioDraw = document.getElementById("radioDraw");
const radioFade = document.getElementById("radioFade");
const radioDoNothing = document.getElementById("radioDoNothing");
const radioMerge = document.getElementById("radioMerge");
const radioDestroyBoth = document.getElementById("radioDestroyBoth");
const radioDestroyLess = document.getElementById("radioDestroyLess");
const inputDisplayName = document.getElementById("inputDisplayName");
const inputDisplaySize = document.getElementById("inputDisplaySize");
const inputDisplayMass = document.getElementById("inputDisplayMass");
const inputDisplayPositionX = document.getElementById("inputDisplayPositionX");
const inputDisplayPositionY = document.getElementById("inputDisplayPositionY");
const inputDisplayVX = document.getElementById("inputDisplayVX");
const inputDisplayVY = document.getElementById("inputDisplayVY");
const radioAbove = document.getElementById("radioAbove");
const radioCenter = document.getElementById("radioCenter");
const radioBelow = document.getElementById("radioBelow");
const inputTextSize = document.getElementById("inputTextSize");

const textSizeChange = () => {
  const existingStyle = document.getElementById(`style-displayClass}`);
  if (existingStyle) existingStyle.remove();

  const correctSize = inputTextSize.value;

  const style = document.createElement('style');
  style.id= `displayClass`;
  style.innerHTML = `.displayClass {
    font-family: "Orbitron-VariableFont_wght";
    font-size: ${4 * correctSize / 100}rem;
    margin: 0;
  }`;
  document.head.appendChild(style);
}

inputTextSize.addEventListener("change", textSizeChange);

const setDisplayForClass = (className, visible) => {
  const existingStyle = document.getElementById(`style-${className}`);
  if (existingStyle) existingStyle.remove();

  const style = document.createElement('style');
  style.id = `style-${className}`;
  style.innerHTML = `
    .${className} {
      display: ${visible ? "block" : "none"};
    }
  `;
  document.head.appendChild(style);
}

inputDisplayName.addEventListener("click", () => {
  setDisplayForClass("displayName", inputDisplayName.checked);});

inputDisplaySize.addEventListener("click", () => {
  setDisplayForClass("displaySize", inputDisplaySize.checked);});

inputDisplayMass.addEventListener("click", () => {
  setDisplayForClass("displayMass", inputDisplayMass.checked);});

inputDisplayPositionX.addEventListener("click", () => {
  setDisplayForClass("displayX", inputDisplayPositionX.checked);});

inputDisplayPositionY.addEventListener("click", () => {
  setDisplayForClass("displayY", inputDisplayPositionY.checked);});

inputDisplayVX.addEventListener("click", () => {
  setDisplayForClass("displayVX", inputDisplayVX.checked);});

inputDisplayVY.addEventListener("click", () => {
  setDisplayForClass("displayVY", inputDisplayVY.checked);});

let trailCanvasBoxX = 4000;
let trailCanvasBoxY = 4000;

const updateCB = () => {
  canvasBox.innerHTML = `<canvas id="trailCanvasBox" width="${trailCanvasBoxX}px" height="${trailCanvasBoxY}px" style="opacity: 0.3;"></canvas>`;
  const trailCanvasBox = document.getElementById("trailCanvasBox");
  trailCtx = trailCanvasBox.getContext("2d");
  CBBox.innerHTML = "";

  allCelestialBodies.forEach(cb => {
    const cbElementHTML = `
      <div id="CB${cb.id}" style="
        position: absolute;
        height: ${cb.size}px;
        width: ${cb.size}px;
        background-color: ${cb.color};
        top: ${cb.positionY}px;
        left: ${cb.positionX}px;
        transform: translate(-50%, -50%);
        overflow: visible;
        border-radius: 100%;
      ">
        <div id="display${cb.id}" style="
        color: white;
        position: absolute;
        top: ${cb.size}px;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        ">
          <p class="displayClass displayName">${cb.name}</p>
          <p class="displayClass displaySize">Size: ${cb.size}</p>
          <p class="displayClass displayMass">Mass: ${cb.mass}</p>
          <p class="displayClass displayX">x: ${cb.positionX}</p>
          <p class="displayClass displayY">y: ${cb.positionY}</p>
          <p class="displayClass displayVX">vx: ${cb.vx}</p>
          <p class="displayClass displayVY">vy: ${cb.vy}</p>
        </div>
      </div>
    `;
  canvasBox.insertAdjacentHTML('beforeend', cbElementHTML);

  cb.el = document.getElementById(`CB${cb.id}`);

  const updateDisplayPosition = () => {
    const displayDiv = document.getElementById(`display${cb.id}`);
    displayDiv.style.top = `${radioBelow.checked ? cb.size : radioCenter.checked ? cb.size / 2 : cb.size * -0.3}px`;
  }

  radioAbove.addEventListener("change", updateDisplayPosition);
  radioCenter.addEventListener("change", updateDisplayPosition);
  radioBelow.addEventListener("change", updateDisplayPosition);

  CBBox.innerHTML += `
    <section id="BoxCB${cb.id}">
      <div id="textCB${cb.id}">
        <p class="textCBClass">${cb.name}</p>
      </div>
      <div id="valuesCB${cb.id}">
        <div class="CBflex">
          <p>Size: </p><input type="number" value="${cb.size}" id="CBInputSize${cb.id}">
          <p>Mass: </p><input type="number" value="${cb.mass}" id="CBInputMass${cb.id}">
          <p>Color: </p><input type="color" value="${cb.color}" id="CBInputColor${cb.id}">
        </div>
        <div class="CBflex">
          <p>Initial Position: </p><p>x: </p><input type="number" value="${cb.initialX}" id="CBInputPositionX${cb.id}">
          <p>y: </p><input type="number" value="${cb.initialY}" id="CBInputPositionY${cb.id}">
        </div>
        <div class="CBflex">
          <p>Initial Velocity: </p><p>vx: </p><input type="number" value="${cb.initialVx}" id="CBInputVelocityX${cb.id}">
          <p>vy: </p><input type="number" value="${cb.initialVy}" id="CBInputVelocityY${cb.id}">
        </div>
        <div class="CBflexButtons">
          <button id="buttonCBdelete${cb.id}">Delete</button>
          <button id="buttonCBcopy${cb.id}">Copy</button>
          <button id="buttonCB${cb.id}">Apply</button>
        </div>
      </div>
      <div class="CBLine"></div>
    </section>
  `;
  });

  attachButtonListeners();
};

const attachButtonListeners = () => {
  allCelestialBodies.forEach(cb => {
    const button = document.getElementById(`buttonCB${cb.id}`);
    const CBInputSize = document.getElementById(`CBInputSize${cb.id}`);
    const CBInputMass = document.getElementById(`CBInputMass${cb.id}`);
    const CBInputColor = document.getElementById(`CBInputColor${cb.id}`);
    const CBInputPositionX = document.getElementById(`CBInputPositionX${cb.id}`);
    const CBInputPositionY = document.getElementById(`CBInputPositionY${cb.id}`);
    const CBInputVelocityX = document.getElementById(`CBInputVelocityX${cb.id}`);
    const CBInputVelocityY = document.getElementById(`CBInputVelocityY${cb.id}`);

    button.addEventListener('click', () => {
      const newSize = parseInt(CBInputSize.value);
      const newMass = parseInt(CBInputMass.value);
      const newColor = CBInputColor.value;
      const newPositionX = parseInt(CBInputPositionX.value);
      const newPositionY = parseInt(CBInputPositionY.value);
      const newVelocityX = parseFloat(parseFloat(CBInputVelocityX.value).toFixed(2));
      const newVelocityY = parseFloat(parseFloat(CBInputVelocityY.value).toFixed(2));

      cb.size = newSize;
      cb.mass = newMass
      cb.color = newColor;
      cb.initialX = newPositionX;
      cb.initialY = newPositionY;
      cb.initialVx = newVelocityX;
      cb.initialVy = newVelocityY;

      updateCB();
      resetAndStart()
    });

    const buttonDelete = document.getElementById(`buttonCBdelete${cb.id}`);
      
    buttonDelete.addEventListener('click', () => {
      const index = allCelestialBodies.findIndex(obj => obj.id === cb.id);
      allCelestialBodies.splice(index, 1);
      updateCB();
        
    });

    const buttonCopy = document.getElementById(`buttonCBcopy${cb.id}`);

    buttonCopy.addEventListener("click", () => {
      CBCount++;
      const copy = {
        ...cb,
        id: ++CBCount,
        name: cb.name + " Copy",
        el: null,
        initialX: cb.initialX,
        initialY: cb.initialY,
        initialVx: cb.initialVx,
        initialVy: cb.initialVy,
        positionX: cb.positionX,
        positionY: cb.positionY
      };

      allCelestialBodies.push(copy);
      updateCB();
    })
  });
};

const checkRandomColor = document.getElementById("checkRandomColor");

const createCB = () => {
  CBCount += 1;

  const inputName = document.getElementById("inputName").value.trim();
  const inputSize = parseInt(document.getElementById("inputSize").value);
  const inputColor = document.getElementById("inputColor").value.trim();
  const inputPositionX = parseInt(document.getElementById("inputPositionX").value);
  const inputPositionY = parseInt(document.getElementById("inputPositionY").value);
  const inputMass = parseInt(document.getElementById("inputMass").value);
  const inputVelocityVX = parseFloat(parseFloat(document.getElementById("inputVelocityVX").value).toFixed(2));
  const inputVelocityVY = parseFloat(parseFloat(document.getElementById("inputVelocityVY").value).toFixed(2));

  const randomSize = Math.floor(Math.random() * (300 - 50 + 1)) + 50;
  const randomPositionX = Math.floor(Math.random() * 4000);
  const randomPositionY = Math.floor(Math.random() * 4000);
  const randomMass = Math.floor(Math.random() * (100 - 10 + 1) + 10);
  const randomColor = () =>{
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;}
  const tempName = inputName || `Celestial Body ${CBCount}`;
  const tempSize = isNaN(inputSize) ? randomSize : inputSize;
  const tempColor = checkRandomColor.checked ? randomColor() : inputColor;
  const tempPositionX = isNaN(inputPositionX) ? randomPositionX : inputPositionX;
  const tempPositionY = isNaN(inputPositionY) ? randomPositionY : inputPositionY;
  const tempMass = isNaN(inputMass) ? randomMass : inputMass;
  const tempVelocityVX = isNaN(inputVelocityVX) ? 0 : inputVelocityVX;
  const tempVelocityVY = isNaN(inputVelocityVY) ? 0 : inputVelocityVY;

  allCelestialBodies.push({
    id: CBCount,
    name: tempName,
    size: tempSize,
    color: tempColor,
    positionX: tempPositionX,
    positionY: tempPositionY,
    mass: tempMass,
    vx: tempVelocityVX,
    vy: tempVelocityVY,
    el: null,
    initialX: tempPositionX,
    initialY: tempPositionY,
    initialVx: tempVelocityVX,
    initialVy: tempVelocityVY
  });

  updateCB();
};

const modalAddCelestionBodiesPopUp = () => {
  document.getElementById("modalAddCelestialBodyBox").style.display = "flex";
  document.getElementById("modalBehind").style.display = "flex";
}

const buttonModalClose = document.getElementById("buttonModalClose");

buttonModalClose.addEventListener("click", () => {
  document.getElementById("modalAddCelestialBodyBox").style.display = "none";
  document.getElementById("modalBehind").style.display = "none";
})

const buttonModalAdd = document.getElementById("buttonModalAdd");

buttonModalAdd.addEventListener("click", () => {
  createCB();
  document.getElementById("modalAddCelestialBodyBox").style.display = "none";
  document.getElementById("modalBehind").style.display = "none";

  resetAndStart();
})

buttonAddCB.addEventListener("click", modalAddCelestionBodiesPopUp);

const buttonAdjustCanvasSize = document.getElementById("buttonAdjustCanvasSize");

buttonAdjustCanvasSize.addEventListener("click", () => {
  const adjustCanvasSizeX = document.getElementById("adjustCanvasSizeX");
  const adjustCanvasSizeY = document.getElementById("adjustCanvasSizeY");

  const newCanvasSizeX = adjustCanvasSizeX.value > 15000 ? 15000 : adjustCanvasSizeX.value;
  const newCanvasSizeY = adjustCanvasSizeY.value > 15000 ? 15000 : adjustCanvasSizeY.value;

  canvasBox.style.width = `${newCanvasSizeX}px`;
  canvasBox.style.height = `${newCanvasSizeY}px`;
  trailCanvasBoxX = newCanvasSizeX;
  trailCanvasBoxY = newCanvasSizeY;
  adjustCanvasSizeX.value = newCanvasSizeX;
  adjustCanvasSizeY.value = newCanvasSizeY;

  updateCB();
});

const drawPath = (x, y, color, size) => {
  trailCtx.fillStyle = color;
  trailCtx.beginPath();
  trailCtx.arc(x, y, size, 0, Math.PI * 8);
  trailCtx.fill();
}

let G = 1000;
let softening = 100;
let isRunning = false;
let animationId = null;
const drawSizeBox = document.getElementById("drawSizeBox");
const fadeSpeedBox = document.getElementById("fadeSpeedBox");
const buttonDrawSize = document.getElementById("buttonDrawSize");
const buttonFadeSpeed = document.getElementById("buttonFadeSpeed");
let drawSize = 12;
let fadeSpeed = 100;

buttonDrawSize.addEventListener("click", () => {
  drawSize = document.getElementById("inputDrawSize").value;
})

buttonFadeSpeed.addEventListener("click", () => {
  fadeSpeed = document.getElementById("inputFadeSpeed").value;
})

radioDraw.addEventListener("click", () => {
  drawSizeBox.style.display = "flex";
  fadeSpeedBox.style.display = "none";
  trailCtx.clearRect(0, 0, trailCanvasBox.width, trailCanvasBox.height);
});

radioFade.addEventListener("click", () => {
  drawSizeBox.style.display = "none";
  fadeSpeedBox.style.display = "flex";
  trailCtx.clearRect(0, 0, trailCanvasBox.width, trailCanvasBox.height);
})

const updatePositions = () => {
  if (!isRunning) return;
  const trailAppearance = () => {
    if (radioDraw.checked){   
      trailCtx.fillStyle = 'rgba(0, 0, 0, 0)';
    }
    else if (radioFade.checked){
      trailCtx.globalCompositeOperation = 'destination-out';
      trailCtx.fillStyle = `rgba(0, 0, 0, ${fadeSpeed * 0.001})`;
      trailCtx.fillRect(0, 0, trailCanvasBox.width, trailCanvasBox.height);
      trailCtx.globalCompositeOperation = 'source-over';
    };
  };

  trailAppearance();
  
  let forces = allCelestialBodies.map(() => ({ fx: 0, fy: 0 }));

  for (let i = 0; i < allCelestialBodies.length; i++) {
    for (let j = 0; j < allCelestialBodies.length; j++) {
      if (i === j) continue;

      let bi = allCelestialBodies[i];
      let bj = allCelestialBodies[j];

      let dx = bj.positionX - bi.positionX;
      let dy = bj.positionY - bi.positionY;
      
      let distSq = dx * dx + dy * dy + softening * softening;
      let dist = Math.sqrt(distSq);

      let force = (G * bi.mass * bj.mass) / distSq;
      let fx = (force * dx) / dist;
      let fy = (force * dy) / dist;

      forces[i].fx += fx;
      forces[i].fy += fy;
    }
  }

  for (let i = 0; i < allCelestialBodies.length; i++) {
    let ball = allCelestialBodies[i];
    let f = forces[i];

    let ax = f.fx / ball.mass;
    let ay = f.fy / ball.mass;

    ball.vx += ax;
    ball.vy += ay;

    ball.positionX += ball.vx;
    ball.positionY += ball.vy;

    const collisions = [];

    for (let i = 0; i < allCelestialBodies.length; i++) {
      for (let j = i + 1; j < allCelestialBodies.length; j++) {
        const a = allCelestialBodies[i];
        const b = allCelestialBodies[j];

        const dx = b.positionX - a.positionX;
        const dy = b.positionY - a.positionY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < (a.size / 2 + b.size / 2)) {
          collisions.push([i, j]);
        }
      }
    }

    for (const [i, j] of collisions) {
    const a = allCelestialBodies[i];
    const b = allCelestialBodies[j];

    if (radioDoNothing.checked) continue;

    if (radioMerge.checked) {
      const totalMass = a.mass + b.mass;
      const newVx = (a.vx * a.mass + b.vx * b.mass) / totalMass;
      const newVy = (a.vy * a.mass + b.vy * b.mass) / totalMass;

      if (a.mass >= b.mass) {
        a.mass = totalMass;
        a.vx = newVx;
        a.vy = newVy;
        allCelestialBodies.splice(j, 1);
      } else {
        b.mass = totalMass;
        b.vx = newVx;
        b.vy = newVy;
        allCelestialBodies.splice(i, 1);
      }
    } else if (radioDestroyBoth.checked) {
      if (i > j) {
        allCelestialBodies.splice(i, 1);
        allCelestialBodies.splice(j, 1);
      } else {
        allCelestialBodies.splice(j, 1);
        allCelestialBodies.splice(i, 1);
      }
    } else if (radioDestroyLess.checked) {
      if (a.mass > b.mass) {
        allCelestialBodies.splice(j, 1);
      } else if (b.mass > a.mass) {
        allCelestialBodies.splice(i, 1);
      } else {
        if (i > j) {
          allCelestialBodies.splice(i, 1);
          allCelestialBodies.splice(j, 1);
        } else {
          allCelestialBodies.splice(j, 1);
          allCelestialBodies.splice(i, 1);
        }
      }
    }

    updateCB();
    break;
  }

    ball.el.style.left = `${ball.positionX}px`;
    ball.el.style.top = `${ball.positionY}px`;

    const displayElement = document.getElementById(`display${ball.id}`);
    if (displayElement) { 
        displayElement.innerHTML = `
            <p class="displayClass displayName">${ball.name}</p>
            <p class="displayClass displaySize">Size: ${ball.size}</p>
            <p class="displayClass displayMass">Mass: ${ball.mass}</p>
            <p class="displayClass displayX">x: ${ball.positionX.toFixed(0)}</p>
            <p class="displayClass displayY">y: ${ball.positionY.toFixed(0)}</p>
            <p class="displayClass displayVX">vx: ${ball.vx.toFixed(2)}</p>
            <p class="displayClass displayVY">vy: ${ball.vy.toFixed(2)}</p>`;
    }

    if (radioDraw.checked){
      drawPath(ball.positionX, ball.positionY, ball.color, drawSize);
    } else if (radioFade.checked){
        drawPath(ball.positionX, ball.positionY, ball.color, ball.size / 2);     
    }
  }

  animationId = requestAnimationFrame(updatePositions);
};

const startButton = document.getElementById("startButton");
const playButton = document.getElementById("playButton");
const ImgPlayButton = document.getElementById("ImgPlayButton");

playButton.addEventListener("click", () => {
  if (!isRunning){
    if (animationId) cancelAnimationFrame(animationId);
    animationId = null;
    isRunning = true;
    ImgPlayButton.src = "img/pauseButton.svg";
    updatePositions();
  } else {
    isRunning = false;
    ImgPlayButton.src = "img/playButton.svg";
  }
});

const resetAndStart = () => {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  };
  allCelestialBodies.forEach(cb => {
    cb.positionX = cb.initialX;
    cb.positionY = cb.initialY;
    cb.vx = cb.initialVx;
    cb.vy = cb.initialVy;

    cb.el.style.left = `${cb.positionX}px`;
    cb.el.style.top = `${cb.positionY}px`;
  });

  trailCtx.clearRect(0, 0, trailCanvasBox.width, trailCanvasBox.height);
  updatePositions();
};

startButton.addEventListener("click", resetAndStart);

const toHide = document.getElementById("toHide");
const hideTopButton = document.getElementById("hideTopButton");
const arrowButtonIMG = document.getElementById("arrowButtonIMG");
let topHidden = false;

hideTopButton.addEventListener("click", () => {
  const isTallScreen = window.matchMedia('(max-height: 940px)').matches;
  const isShortScreen = window.matchMedia('(max-height: 890px)').matches;

  if (!topHidden) {
    toHide.style.display = "none";
    arrowButtonIMG.src = "img/arrowDownSVG.svg";
    CBBox.style.height = "calc(100vh - 138px)";
    topHidden = true;
  }
  else {
    toHide.style.display = "block";
    arrowButtonIMG.src = "img/arrowUpSVG.svg";
    topHidden = false;

    if (isShortScreen) {
      CBBox.style.height = "calc(100vh - 406px)";
    } else if (isTallScreen) {
      CBBox.style.height = "calc(100vh - 470px)";
    } else {
      CBBox.style.height = "calc(100vh - 506px)";
    }
  }
});

const page1Button = document.getElementById("page1Button");
const page2Button = document.getElementById("page2Button");
const page3Button = document.getElementById("page3Button");
const toHidePage1 = document.getElementById("toHidePage1");
const addCelestialBodyBox = document.getElementById("addCelestialBodyBox");
const secondPage = document.getElementById("secondPage");
const thirdPage = document.getElementById("thirdPage");

page3Button.addEventListener("click", () =>{
  toHidePage1.style.display = "none";
  addCelestialBodyBox.style.display = "none";
  CBBox.style.display = "none";
  secondPage.style.display= "none";
  thirdPage.style.display = "block";
})

page2Button.addEventListener("click", () => {
  toHidePage1.style.display = "none";
  addCelestialBodyBox.style.display = "none";
  CBBox.style.display = "none";
  secondPage.style.display= "block";
  thirdPage.style.display = "none";
})

page1Button.addEventListener("click", () => {
  toHidePage1.style.display = "block";
  addCelestialBodyBox.style.display = "flex";
  CBBox.style.display = "block"
  secondPage.style.display= "none";
  thirdPage.style.display = "none";
})

const inputTrailVis = document.getElementById("inputTrailVis");

inputTrailVis.addEventListener("input", () =>{
  trailCanvasBox.style.opacity = `${inputTrailVis.value / 100}`;
});

const buttonGStrength = document.getElementById("buttonGStrength");
const buttonForceSoftening = document.getElementById("buttonForceSoftening")

buttonGStrength.addEventListener("click", () =>{
  G = document.getElementById("inputGStrength").value;
})

buttonForceSoftening.addEventListener("click", () =>{
  softening = document.getElementById("inputForceSoftening").value;
})

