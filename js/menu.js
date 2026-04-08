// Variables
const map_leaflet = document.querySelector("#map");
const menuDialogue = document.querySelector(".menu_dialogue");
const menu1_level1 = document.querySelector(".menu1_level1");
const menu2_level1 = document.querySelector(".menu2_level1");
const menu_defaite = document.querySelector(".menu_défaite_level1");
const menu_fin = document.querySelector(".menu_fin_level1");
const boiteDialogue = document.querySelector(".boite_dialogue");

const touche_gauche = document.querySelector(".touche_gauche");
const touche_droite = document.querySelector(".touche_droite");

const btn_menu1 = document.querySelector("#btn_menu1");
const btn_menu2 = document.querySelector("#btn_menu2");
const btn_recommencer = document.querySelector("#btn_recommencer");
const btn_fin = document.querySelector("#btn_fin"); 
const btn_suite_dialogue = document.querySelector("#btn_suite_dialogue"); 

const canvas = document.querySelector("#level1");
const level1 = canvas.getContext("2d", {willReadFrequently: true});
const imgFille = document.querySelector("#fille1");

let etapeDialogue = 1;
let alphaFille = 0;


// Initialisation
// Initialisation
window.addEventListener("load", () => {
    // On cache les menus de votre jeu
    menuDialogue.classList.add("invisible");
    menu1_level1.classList.add("invisible");
    menu2_level1.classList.add("invisible");
    menu_defaite.classList.add("invisible");
    menu_fin.classList.add("invisible");

    map = L.map('map').setView([targetLat, targetLng], 15);
        
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    L.marker([targetLat, targetLng]).addTo(map).bindPopup("Destination").openPopup();
    setTimeout(() => { map.invalidateSize(); }, 200);

    // Lancement du GPS
    demarrerGPS();

    alphaFille = 0;
    dessin_menu();
});

// 6. GESTION DU GPS (Localisation du joueur)

//vrai locate 47.74486962610825, 7.337868659995331
//locate de test 47.729464, 7.301248

const targetLat = 47.729464; 
const targetLng = 7.301248;
const rayonValidation = 10; // Distance en mètres pour valider l'arrivée

        // --- INITIALISATION DE LA CARTE ---
        const map = L.map('map').setView([targetLat, targetLng], 15);
        
        // Ajout du fond de carte OpenStreetMap
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(map);

        // Ajout du marqueur de destination (rouge pour bien le voir)
        const targetMarker = L.marker([targetLat, targetLng]).addTo(map)
            .bindPopup("Destination").openPopup();

        // Variables pour suivre l'utilisateur
        let userMarker = null;
        let watchId = null;

        // Formule mathématique pour calculer la distance entre deux coordonnées GPS
        function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; 
    const p1 = lat1 * Math.PI/180;
    const p2 = lat2 * Math.PI/180;
    const dp = (lat2-lat1) * Math.PI/180;
    const dl = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(dp/2) * Math.sin(dp/2) +
              Math.cos(p1) * Math.cos(p2) *
              Math.sin(dl/2) * Math.sin(dl/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

function declencherArrivee() {
    navigator.geolocation.clearWatch(watchId);
    document.getElementById('map-container').classList.add('hidden');
    menu1_level1.classList.remove('invisible');
    dessin_menu();
}

function onPositionUpdate(position) {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const accuracy = position.coords.accuracy; 

    // C'EST ICI QUE VOTRE POSITION EST AJOUTÉE SUR LA CARTE
    if (!userMarker) {
        userMarker = L.marker([userLat, userLng]).addTo(map).bindPopup("Vous êtes ici");
        const bounds = L.latLngBounds([ [userLat, userLng], [targetLat, targetLng] ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    } else {
        userMarker.setLatLng([userLat, userLng]);
    }

    const distance = Math.round(calculateDistance(userLat, userLng, targetLat, targetLng));
    document.getElementById('info-distance').innerText = `Distance : ${distance}m (Précision : ±${Math.round(accuracy)}m)`;

    if (distance <= rayonValidation) {
        declencherArrivee();
    }
}

function onPositionError(err) {
    console.warn(`Erreur GPS: ${err.message}`);
    if(err.code === 1) {
        document.getElementById('info-distance').innerText = "Veuillez autoriser le GPS.";
    } else {
        document.getElementById('info-distance').innerText = "Recherche de la position (allez dehors)...";
    }
}

function demarrerGPS() {
    if (navigator.geolocation) {
        const options = { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 };
        watchId = navigator.geolocation.watchPosition(onPositionUpdate, onPositionError, options);
    } else {
        alert("Géolocalisation non supportée.");
    }
}

//Fonction pour empeche la mise en veille de l'écran
let wakeLock = null;
async function ecran_allumee() {
    // On vérifie d'abord si le navigateur supporte l'API wakeLock (qui empeche la mise en veille)
    if ('wakeLock' in navigator) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            // Si le téléphone annule le lock, on le note dans la console
            wakeLock.addEventListener('release', () => {
                console.log("Wake Lock desactivé");
            });
        } catch (err) {
            console.error("Erreur :", err.name, err.message); // Affiche pourquoi ça bloque
        }
    } else {
        console.log("Ce navigateur ne supporte pas l'API Wake Lock.");
    }
}

// On relance le Wake Lock si le joueur quitte le jeu et revient
document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible') {
        await ecran_allumee();
    }
});


// dessiner le fond des menus (et les adapter en fonction du responsiv)
function dessin_menu() {
    level1.drawImage(fond, 0, 0, w, h);
    level1.drawImage(sol, 0, h - 50, w, 50);
    
    if (!menuDialogue.classList.contains("invisible")) {
        level1.save();
        level1.globalAlpha = alphaFille;
        level1.drawImage(imgFille, w/2 - 150, h/2 - 100, 280, 450);
        level1.restore();
    }
}

// resize
const actualiserAffichageMenu = () => {
    setTimeout(() => {
        if (!menuDialogue.classList.contains("invisible") || !menu1_level1.classList.contains("invisible")) {
            dessin_menu();
        }
    }, 100);
};
window.addEventListener("resize", actualiserAffichageMenu);
//Si l'orientation du téléphone a changé (portrait ou paysage)
if (screen.orientation) screen.orientation.addEventListener("change", actualiserAffichageMenu);


// gestion des menus et des dialogues

// Passage du Chapitre 1 au Dialogue (avec fondu)
btn_menu1.addEventListener("click", () => {
    menu1_level1.classList.add("invisible");
    menuDialogue.classList.remove("invisible");
    boiteDialogue.style.opacity = 0;

    let startTime = null;

    function fonduApparition(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = (timestamp - startTime) / 1000; 

        if (progress < 1) {
            alphaFille = progress;
            boiteDialogue.style.opacity = progress;
            dessin_menu(); 
            requestAnimationFrame(fonduApparition); 
        } else {
            alphaFille = 1;
            boiteDialogue.style.opacity = 1;
            dessin_menu();

            document.querySelector("#texte_dialogue").textContent = "Bonjour voyageur ! Mon père a besoin de bois pour réparer le moulin avant l'hiver.";
            dialogue("#texte_dialogue");
            dialogue_son.play();
            
            setTimeout(() => { btn_suite_dialogue.style.opacity = 1; }, 4000); 
        }
    }
    requestAnimationFrame(fonduApparition);
});

// Suite et Fin du Dialogue
btn_suite_dialogue.addEventListener("click", () => {
    if (etapeDialogue === 1) {
        btn_suite_dialogue.style.opacity = 0; 
        document.querySelector("#texte_dialogue").textContent = "Aidez nous à récupérer les planches de bois afin de pouvoir nous aider.";
        dialogue("#texte_dialogue");
        
        setTimeout(() => { btn_suite_dialogue.style.opacity = 1; }, 3700);
        etapeDialogue = 2;
    } 
    else if (etapeDialogue === 2) {
        menuDialogue.classList.add("invisible");
        menu2_level1.classList.remove("invisible"); 
        alphaFille = 0; 
        dessin_menu();
    }
});

// ==========================================
// 5. FONCTIONS GLOBALES DU JEU
// ==========================================
btn_menu2.addEventListener("click", demarrer);
btn_recommencer.addEventListener("click", demarrer);
btn_fin.addEventListener("touchstart", signalVictory);

function demarrer() {
    if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    menu2_level1.classList.add("invisible");
    menu_defaite.classList.add("invisible");
    ecran_allumee();
    initialisation_jeu();
}

function animerEtJouer(e) {
    // 1. On empêche le navigateur de faire un zoom ou un scroll
    e.preventDefault(); 
    
    // 2. On s'assure de bien cibler la div
    const touche = e.currentTarget; 

    // TEST : Ouvre la console de ton navigateur (F12) pour voir si le clic marche !
    console.log("Touche cliquée !"); 

    // 3. LA MAGIE : On force l'animation à se relancer proprement
    touche.classList.remove("anime-touche");
    void touche.offsetWidth; // Astuce vitale : force le navigateur à recalculer la div
    touche.classList.add("anime-touche");
}

// On utilise "pointerdown" qui est le standard moderne et universel
touche_droite.addEventListener("pointerdown", animerEtJouer);
touche_gauche.addEventListener("pointerdown", animerEtJouer);

function fin_du_jeu() {
    musique_fond.pause(); 
    musique_fond.currentTime = 0;
    win_son.play();
    menu_fin.classList.remove("invisible");
}

function signalVictory() {
    window.parent.postMessage('GAME_COMPLETE', '*');
}