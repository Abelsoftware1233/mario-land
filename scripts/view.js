// Functie om de achtergrondpositie van de game-container aan te passen.
// Dit creëert het side-scrolling effect.
function updateBackground(marioX) {
    // Haal de game-container op via zijn ID
    const gameContainer = document.getElementById('gameContainer'); 
    
    if (gameContainer) {
        // PARALLAX FACTOR: 1.0 = beweegt even snel als Mario
        const parallaxFactor = 1.0; 
        
        // Bereken de verschuiving: negatief zodat de achtergrond naar links schuift als Mario naar rechts gaat.
        const backgroundShiftX = -marioX * parallaxFactor; 
        
        // Pas de CSS property aan op de game-container
        gameContainer.style.backgroundPositionX = `${backgroundShiftX}px`;
    }
}


// De hoofd game-loop functie.
Window.view = function() {
    
    const model = this; 

    model.renders = (model.renders + 1) % 100;
    model.lastRender = new Date().getTime();

    // Initieer Mario's X-positie
    let marioX = 0; 
    
    // Loop door alle objecten
    for (var x = 0; x < model.objects.length; ++x) {
        var thisObject = model.objects[x];
        if (!thisObject) {
            continue;
        }

        // --- 1. Snelheden berekenen ---
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
        // Y-coördinaat.
        if (thisObject.verticalVelocity) {
            var newY = thisObject.y + thisObject.verticalVelocity;
            if (newY <= 0) {
                thisObject.set('falling', false);
                thisObject.set('verticalVelocity', 0);
                thisObject.set('y', 0);
            }
            else {
                thisObject.set('falling', true);
                thisObject.set('y', newY);

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

        // X-coördinaat.
        if (thisObject.horizontalVelocity) {
            thisObject.set('x', thisObject.x + thisObject.horizontalVelocity);

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
        if (thisObject.controller) {
            thisObject.controller();
        }
        thisObject.view();
        
        // Sla Mario's X-positie op (aanname: het eerste object is de speler)
        if (x === 0) { 
            marioX = thisObject.x;
        }
    }
    
    // --- 4. ACHTERGROND UPDAET ---
    updateBackground(marioX);


    // --- 5. Game Loop Timer ---
    setTimeout(
        Window.view,
        Math.max(0, 17 - new Date().getTime() + model.lastRender)
    );
}.bind(window.model);
