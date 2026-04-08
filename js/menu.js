// Variables
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
window.addEventListener("load", () => {
    taille(); 
    menuDialogue.classList.add("invisible");
    menu1_level1.classList.remove("invisible");
    alphaFille = 0;
    dessin_menu();
});

// 6. GESTION DU GPS (Localisation du joueur)

//vrai locate 47.74486962610825, 7.337868659995331
//locate de test 47.72994167828884, 7.301749756692951

const TARGET_LAT = 47.72994167828884;
const TARGET_LON = 7.301749756692951;
const TARGET_RADIUS = 5;    // Rayon en mètres pour débloquer le jeu

const gpsStatusElement = document.querySelector("#gps-status");
const btnContinuer = document.querySelector("#btn_menu1");

// Formule mathématique pour calculer la distance entre 2 points GPS
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Rayon de la terre en mètres
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function initGPS() {

    if (!navigator.geolocation) {
        gpsStatusElement.textContent = "Le GPS n'est pas supporté par votre téléphone.";
        return;
    }

    // Suivi de la position en temps réel
    navigator.geolocation.watchPosition((position) => {
        const userLat = position.coords.latitude;
        const userLon = position.coords.longitude;

        // Calcul de la distance
        const distance = Math.round(getDistanceFromLatLonInM(userLat, userLon, TARGET_LAT, TARGET_LON));

        if (distance <= TARGET_RADIUS) {
            // Le joueur est arrivé !
            gpsStatusElement.textContent = `Position validée ! (${distance}m)`;
            gpsStatusElement.style.color = "#00FF00"; // Vert
            
            // On débloque le bouton Continuer
            btnContinuer.disabled = false;
            btnContinuer.style.opacity = 1;
            
        } else {
            // Le joueur est trop loin
            gpsStatusElement.textContent = `Rapprochez-vous ! Vous êtes à ${distance}m (max: ${TARGET_RADIUS}m)`;
            gpsStatusElement.style.color = "#FF9900"; // Orange
            
            // On bloque le bouton
            btnContinuer.disabled = true;
            btnContinuer.style.opacity = 0.5;
        }
    }, (error) => {
        console.warn('Erreur GPS:', error);
        
        let messageErreur = "Erreur GPS inconnue.";
        
        switch(error.code) {
            case error.PERMISSION_DENIED:
                messageErreur = "Accès refusé. Cliquez sur le cadenas en haut à gauche (barre d'adresse) pour autoriser le site.";
                break;
            case error.POSITION_UNAVAILABLE:
                messageErreur = "Position introuvable. Essayez d'activer le Wi-Fi ou de sortir dehors.";
                break;
            case error.TIMEOUT:
                messageErreur = "Le GPS met trop de temps à répondre (Timeout).";
                break;
        }

        gpsStatusElement.textContent = messageErreur;
        gpsStatusElement.style.color = "red";
        
    }, {
        enableHighAccuracy: false, // Demande la précision maximale
        timeout: 10000,           // Laisse 10 secondes au tel pour trouver la position
        maximumAge: 0             // Refuse les anciennes positions en cache
    });
}

// Lancer le GPS dès le chargement de la page
window.addEventListener("load", () => {
    initGPS();
});

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