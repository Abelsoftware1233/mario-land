/**
 * event-listeners.js
 * Behandelt alle invoergebeurtenissen (toetsenbord, muis en touchscreen)
 * en roept de bijbehorende acties aan via window.reducer.
 */

// --- Toetsenbord Codes ---
var CTRL = 17;
var DOWN = 40;
var LEFT = 37;
var RIGHT = 39;
var SPACE = 32;
var UP = 38;

// --- Touchscreen Mapping ---
// Mapt de HTML-ID's van de knoppen naar de reducer acties.
const TOUCH_ACTION_MAP = {
    // [ID]: [Actie bij indrukken (Loop/Scroll Start)], [Actie bij loslaten (Stop)]
    'left': ['DECREASE_SCROLL_X', 'WALK_LEFT', 'BRAKE_LEFT'], 
    'right': ['INCREASE_SCROLL_X', 'WALK_RIGHT', 'BRAKE_RIGHT'],
    'x-jump': ['JUMP', null], // X/Jump is de Spring-knop
    // We kunnen de Z/Run knop mappen aan de CTRL actie, die fireballs schiet
    'z-run': ['SHOOT_FIREBALL', null] 
};

// --- Algemene Touch Handler Functie ---

/**
 * Verwerkt de invoer van touchscreen knoppen of muisklikken op de knoppen.
 */
function handleTouchInput(event, isPressed) {
    const buttonId = event.currentTarget.id;
    const actions = TOUCH_ACTION_MAP[buttonId];

    if (!actions) return;
    
    // Voorkom standaard browseracties (scrollen, zoomen)
    event.preventDefault(); 
    
    if (isPressed) {
        // Indrukken: Stuur de loop- en scroll-acties
        // Bijvoorbeeld: DECREASE_SCROLL_X en WALK_LEFT
        if (actions[0]) window.reducer(actions[0]); 
        if (actions[1] && actions[1] !== 'SHOOT_FIREBALL') window.reducer(actions[1]); 
        // SHOOT_FIREBALL is meestal eenmalig, dus sturen we alleen op indrukken
    } else {
        // Loslaten: Stuur de stop-acties
        // Bijvoorbeeld: BRAKE_LEFT
        if (actions[2]) window.reducer(actions[2]);
    }
}

// --- Setup Functie ---

/**
 * Initialiseert alle event listeners (toetsenbord, muis en touch).
 */
function setupEventListeners() {
    // 1. Muis Klik Listener (ADD_TUBE) - Ongewijzigd
    window.addEventListener('click', function(event) {
        window.reducer('ADD_TUBE', {
            x: event.clientX,
            y: event.clientY
        });
    });

    // 2. Toetsenbord Listeners (keydown) - Ongewijzigd
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case LEFT:
                window.reducer('DECREASE_SCROLL_X');
                window.reducer('WALK_LEFT');
                break;
            case RIGHT:
                window.reducer('INCREASE_SCROLL_X');
                window.reducer('WALK_RIGHT');
                break;
            case SPACE:
                window.reducer('JUMP');
                break;
            default:
                if (event.keyCode >= 48 || event.keyCode === 17) {
                    window.reducer('LOG', 'Unbound key: ' + event.keyCode);
                }
        }
    });

    // 3. Toetsenbord Listeners (keyup)
    window.addEventListener('keyup', function(event) {
        switch (event.keyCode) {
            case CTRL:
                window.reducer('SHOOT_FIREBALL'); // Schiet de fireball bij loslaten van CTRL (Desktop)
                break;
            case LEFT:
                window.reducer('BRAKE_LEFT');
                break;
            case RIGHT:
                window.reducer('BRAKE_RIGHT');
                break;
        }
    });

    // 4. Touchscreen Listeners
    // Selecteer alle knoppen met de class 'control-button'
    const controlButtons = document.querySelectorAll('.control-button');

    controlButtons.forEach(button => {
        // Touch events (mobiel/tablet)
        button.addEventListener('touchstart', (e) => handleTouchInput(e, true));
        button.addEventListener('touchend', (e) => handleTouchInput(e, false));
        button.addEventListener('touchcancel', (e) => handleTouchInput(e, false));
        
        // Muis events (desktop testen)
        button.addEventListener('mousedown', (e) => handleTouchInput(e, true));
        button.addEventListener('mouseup', (e) => handleTouchInput(e, false));
        button.addEventListener('mouseleave', (e) => {
            if (e.buttons === 1 && (button.id === 'left' || button.id === 'right')) {
                 handleTouchInput(e, false);
            }
        });
    });

    // 5. Window Resize Listener - Ongewijzigd
    window.addEventListener('resize', function() {
        window.reducer('RESIZE_WINDOW');
    });
}

// Zorg ervoor dat deze functie globaal beschikbaar is voor aanroeping in index.js
// window.setupEventListeners = setupEventListeners; 
