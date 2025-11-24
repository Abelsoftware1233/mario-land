// scripts/index.js

// Het Preload Object: Zorgt ervoor dat alle afbeeldingen in de 'items' array geladen worden.
var preload = {
  callback: function() {},
  init: function(items, callback) {
    this.callback = callback;
    this.total = items.length;
    
    // Alleen starten als er items zijn om te laden
    if (this.total === 0) {
        this.callback();
        return;
    }
    
    for (var x = 0; x < this.total; ++x) {
      var img = document.createElement('img');
      // Zorgt ervoor dat 'this' in onLoad correct verwijst naar het preload object
      img.addEventListener('load', this.onLoad.bind(this, img)); 
      
      // Laad de afbeelding
      img.setAttribute('src', items[x]);
      
      // Zorgt ervoor dat de afbeelding in de DOM bestaat maar niet zichtbaar is
      img.style.setProperty('height', '1px');
      img.style.setProperty('width', '1px');
      img.style.setProperty('position', 'absolute'); // Zorgt ervoor dat het de layout niet beïnvloedt
      document.body.appendChild(img);
    }
  },
  loaded: 0,
  onLoad: function(img) {
    // Verwijder de tijdelijke afbeelding zodra deze geladen is
    document.body.removeChild(img);
    this.loaded++;
    
    // Controleer of alles geladen is
    if (this.loaded === this.total) {
      this.callback();
    }
  },
  total: 0
};


// De game start na de DOM content en het laden van de afbeeldingen.
document.addEventListener('DOMContentLoaded', () => {
    
    // De lijst met alle afbeeldingen die vooraf geladen moeten worden.
    const imageList = [
		'images/background.png',
        'images/fireball.gif',
		'images/galoomba.gif',
        'images/mario.gif',
        'images/tube.gif'
    ];
    
    // Start het preload-proces. De functie hieronder wordt uitgevoerd na het laden.
    preload.init(
        imageList,
        function() {
            // --- ACTIES NA HET SUCCESVOL LADEN VAN ALLE AFBEELDINGEN ---
            
            const loadingText = document.getElementById('loadingText');
            const gameContainer = document.getElementById('gameContainer');
            
            // 1. Verberg het 'Loading...' scherm
            if (loadingText) {
                loadingText.classList.add('hidden');
                // Optioneel: document.body.removeChild(loadingText); als je zeker wilt zijn
            }
            
            // 2. Toon de game container (door 'hidden' class te verwijderen)
            if (gameContainer) {
                gameContainer.classList.remove('hidden');
            }
            
            // 3. (Optioneel, maar goed idee): Zorg dat het model de juiste grootte heeft
            // Dit is afhankelijk van hoe window.reducer('RESIZE_WINDOW') werkt in jouw project.
            if (window.reducer) {
                // window.reducer('RESIZE_WINDOW'); // Gebruik dit als je deze functionaliteit nodig hebt
            }

            // 4. Start de hoofd game-loop
            if (window.view) {
                window.view();
            } else {
                console.error("Window.view is niet gedefinieerd. Game kan niet starten.");
            }
            
            // 5. Start de timer om nieuwe Galoombas te genereren (zoals in je code)
            setInterval(
                function() {
                    if (window.reducer) {
                        window.reducer('ADD_GALOOMBA');
                    }
                },
                2500
            );
        }
    );
});
