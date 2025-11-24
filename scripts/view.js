// Functie om de achtergrondpositie van de game-container aan te passen.
// Dit zorgt voor het side-scrolling effect.
function updateBackground(marioX) {
    // Zoek de HTML container op waar de achtergrondafbeelding is gedefinieerd.
    const gameContainer = document.getElementById('gameContainer'); 
    
    if (gameContainer) {
        // PARALLAX FACTOR: Bepaalt hoe snel de achtergrond beweegt t.o.v. Mario.
        // 1.0 (of 1) is meestal goed voor een platformer waar de speler in het midden blijft staan.
        const parallaxFactor = 1.0; 
        
        // De achtergrond moet de tegengestelde richting op bewegen als Mario.
        // Als Mario's X toeneemt (naar rechts), moet de achtergrond-position-X afnemen (naar links).
        const backgroundShiftX = -marioX * parallaxFactor; 
        
        // Pas de CSS property aan op de game-container
        gameContainer.style.backgroundPositionX = `${backgroundShiftX}px`;
    }
}


// De hoofd game-loop functie, gekoppeld aan Window.model.
// Deze functie voert de physics en rendering updates uit.
Window.view = function() {
    
    // De 'this' context is Window.model (vanwege de bind onderaan)
    const model = this; 

    // Update de render counter en de timestamp
    model.renders = (model.renders + 1) % 100;
    model.lastRender = new Date().getTime();

    // Sla de X-positie van Mario op voor de achtergrondbesturing (aanname: Mario is het eerste object)
    let marioX = 0; 
    
    // Loop door alle objecten in het model.
    for (var x = 0; x < model.objects.length; ++x) {
        var thisObject = model.objects[x];
        if (!thisObject) {
            continue;
        }

        // --- 1. Snelheden berekenen (Physics) ---
        
        // Horizontale snelheid (V = V0 + A)
        if (thisObject.horizontalAcceleration) {
            thisObject.set(
                'horizontalVelocity',
                Math.min(
                    Math.max(
                        thisObject.horizontalVelocity + thisObject.horizontalAcceleration,
                        -1 * thisObject.maxHorizontalVelocity
                    ),
                    thisObject.maxHorizontalVelocity
                )
            );
        }
        
        // Verticale snelheid (V = V0 + A)
        if (thisObject.verticalAcceleration) {
            thisObject.set(
                'verticalVelocity',
                Math.min(
                    Math.max(
                        thisObject.verticalVelocity + thisObject.verticalAcceleration,
                        -1 * thisObject.maxVerticalVelocity
                    ),
                    thisObject.maxVerticalVelocity
                )
            );
        }

        // --- 2. Posities en Botsingen berekenen ---

        // Y-coördinaat (hoogte).
        if (thisObject.verticalVelocity) {
            var newY = thisObject.y + thisObject.verticalVelocity;
            
            // Controleer of het object op de grond is (Y <= 0)
            if (newY <= 0) {
                thisObject.set('falling', false);
                thisObject.set('verticalVelocity', 0);
                thisObject.set('y', 0); // Zet Y op de grond
            }
            else {
                thisObject.set('falling', true);
                thisObject.set('y', newY);

                // Botsingsdetectie: Y
                if (thisObject.collisionY) {
                    for (var y = 0; y < model.objects.length; ++y) {
                        var thatObject = model.objects[y];
                        if (
                            x === y ||
                            !thatObject ||
                            thatObject.static ||
                            !thisObject.isInside(thatObject)
                        ) {
                            continue;
                        }
                        thisObject.collisionY(thatObject);
                    }
                }
            }
        }

        // X-coördinaat (breedte).
        if (thisObject.horizontalVelocity) {
            thisObject.set('x', thisObject.x + thisObject.horizontalVelocity);

            // Botsingsdetectie: X
            if (thisObject.collisionX) {
                for (var y = 0; y < model.objects.length; ++y) {
                    var thatObject = model.objects[y];
                    if (
                        x === y ||
                        !thatObject ||
                        thatObject.static ||
                        !thisObject.isInside(thatObject)
                    ) {
                        continue;
                    }
                    thisObject.collisionX(thatObject);
                }
            }
        }
        
        // --- 3. Controllers en View Updaten ---
        
        // Roep de controller aan (input/AI logica)
        if (thisObject.controller) {
            thisObject.controller();
        }
        
        // Roep de view/renderer aan om de DOM/CSS van het object bij te werken
        thisObject.view();
        
        // Sla Mario's X-positie op (aanname: het eerste object is de speler)
        if (x === 0) { 
            marioX = thisObject.x;
        }
    }
    
    // --- 4. ACHTERGROND UPDAET (De Fix!) ---
    // Update de achtergrond op basis van de X-positie van Mario
    updateBackground(marioX);


    // --- 5. Game Loop Timer ---
    // Roep de functie opnieuw aan om een constante framerate van 60 FPS te behouden.
    setTimeout(
        Window.view,
        Math.max(0, 17 - new Date().getTime() + model.lastRender) // 17ms is ongeveer 60 FPS
    );
}.bind(window.model); // Zorgt ervoor dat 'this' binnen de functie verwijst naar Window.model
