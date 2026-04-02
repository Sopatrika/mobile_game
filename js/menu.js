const menuDialogue = document.querySelector(".menu_dialogue");
const menu1_level1 = document.querySelector(".menu1_level1");
const menu2_level1 = document.querySelector(".menu2_level1");
const menu_defaite = document.querySelector(".menu_défaite_level1");
const menu_fin = document.querySelector(".menu_fin_level1");

const touche_gauche = document.querySelector(".touche_gauche");
const touche_droite = document.querySelector(".touche_droite");

const btn_menu1 = document.querySelector("#btn_menu1");
const btn_menu2 = document.querySelector("#btn_menu2");
const btn_recommencer = document.querySelector("#btn_recommencer");
const btn_fin = document.querySelector(".btn_fin"); 

// Bouton du dialogue
const btn_suite_dialogue = document.querySelector("#btn_suite_dialogue"); 

const canvas = document.querySelector("#level1");
const level1 = canvas.getContext("2d", {willReadFrequently: true});
const imgFille = document.querySelector("#fille1");

let etapeDialogue = 1; // Permet de savoir à quelle phrase on en est

// ==========================================
// 2. INITIALISATION (CHARGEMENT DE LA PAGE)
// ==========================================
window.addEventListener("load", () => {
    taille(); 
    level1.drawImage(fond, 0, 0, w, h);
    level1.drawImage(sol, 0, h - 50, w, 50);
    level1.drawImage(imgFille, w/2 - 150, h/2 - 100, 280, 450);

    document.querySelector("#texte_dialogue").textContent = "Bonjour voyageur ! Mon père a besoin de bois pour réparer le moulin avant l'hiver."
    dialogue("#texte_dialogue");
    
    // 3. Faire apparaître le bouton après 5 sec
    setTimeout(() => {
        btn_suite_dialogue.style.opacity = 1;
    }, 5000); 
});

// ==========================================
// 3. GESTION DU DIALOGUE D'INTRODUCTION
// ==========================================
btn_suite_dialogue.addEventListener("click", () => {
    
    // Si on est à la première phrase -> on passe à la deuxième
    if (etapeDialogue === 1) {
        btn_suite_dialogue.style.opacity = 0; // On recache le bouton
        
        document.querySelector("#texte_dialogue").textContent = "Aidez nous à récupérer les planches de bois afin de pouvoir nous aider."
        dialogue("#texte_dialogue");
        
        setTimeout(() => {
            btn_suite_dialogue.style.opacity = 1;
        }, 3700);
        
        etapeDialogue = 2;
    } 
    else if (etapeDialogue === 2) {
        menuDialogue.classList.add("invisible");
        menu1_level1.classList.remove("invisible");
        level1.drawImage(fond, 0, 0, w, h);
        level1.drawImage(sol, 0, h - 50, w, 50);
    }
});

// ==========================================
// 4. GESTION DES MENUS
// ==========================================
btn_menu1.addEventListener("click", () => {
    menu1_level1.classList.add("invisible");
    menu2_level1.classList.remove("invisible");
});

btn_menu2.addEventListener("click", demarrer);

btn_recommencer.addEventListener("click", () => {
    location.reload();
});

btn_fin.addEventListener("touchstart", signalVictory);


// 5. FONCTIONS DU JEU (Lancement, Tuto, Fin)
function demarrer() {
    // Essaie de lancer le plein écran de façon sécurisée
    if(document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
    }
    menu2_level1.classList.add("invisible");
    menu_defaite.classList.add("invisible");
    
    creerPluie();
    affichage();
    setInterval(boue, 5000);
    musique_fond.play();
}

function animerEtJouer(e) {
    const touche = this;
    touche.classList.add("anime-touche");
    setTimeout(() => {
        touche.classList.remove("anime-touche");
    }, 300);
}

touche_droite.addEventListener("touchstart", animerEtJouer);
touche_gauche.addEventListener("touchstart", animerEtJouer);

function fin_du_jeu() {
    musique_fond.pause(); 
    musique_fond.currentTime = 0;
    menu_fin.classList.remove("invisible");
}

function signalVictory() {
    window.parent.postMessage('GAME_COMPLETE', '*');
}