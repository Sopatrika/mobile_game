// INITIALISATION DES VARIABLES
const menu_level1 = document.querySelector(".menu_level1")
const canvas = document.querySelector("#level1");
const level1 = canvas.getContext("2d");

const fond = document.querySelector("#fond");
const vie = document.querySelector("#vie");
const sol = document.querySelector("#sol");

const perso1 = document.querySelector("#joueur1");
const perso2 = document.querySelector("#joueur2");
const perso3 = document.querySelector("#joueur3");

const bois = document.querySelector("#bois");

//TAILLE DU CANVAS ------------------------------
let w, h;
function taille() {
    w = window.innerWidth;
    h = window.innerHeight;

    if (w > 932 || h > 430) {
        w = 1100;
        h = 430;
    }

    menu_level1.width = w;
    menu_level1.height
    canvas.width = w;
    canvas.height = h;
}

taille()
document.addEventListener("resize", taille);

//JOUEUR ------------------------------
let personnage = {
    x: w - 100,
    y: h - 160,
    dx: 0,
    vie: 3,
    direction: 1,       // le sens ou le personnage regarde
    frameAnim: 0,       // image de l'animation
    compteurAnim: 0     // Pour ralentir le changement d'image
}

const animationMarche = [perso2, perso1, perso3, perso1]; //Animation du personnage

window.addEventListener("touchstart", (e) => {
    let touchX = e.touches[0].clientX;
    if (touchX < w / 2) {
        personnage.dx = -2; // Marche à gauche
        personnage.direction = -1; // Tourne le sprite à gauche
    } else {
        personnage.dx = 2;  // Marche à droite
        personnage.direction = 1;  // Tourne le sprite à droite
    }
});
// (Le touchend reste identique, on met juste dx à 0)

window.addEventListener("touchend", () => {
    personnage.dx = 0; // S'arrête quand on lève le doigt
});

function joueur() {
    if(personnage.x < 0) personnage.x = 0;
    else if(personnage.x > w - 50) personnage.x = w - 150;

    personnage.x += personnage.dx;
}

//BOIS ------------------------------

let nbr_bois = 0;
let bois_t = [];
function planche_bois() {
    for(let i = 1; i <= 4; i++) {
        bois_t.push({
            x: 30,
            y: h - 45,
            recup: false,
        });
    }
}
planche_bois()

//MOULIN ------------------------------

const moulin_sprite = [
    document.querySelector("#Moulin_0complete"),
    document.querySelector("#Moulin_25complete"),
    document.querySelector("#Moulin_50complete"),
    document.querySelector("#Moulin_75complete"),
    document.querySelector("#Moulin_100complete")
];
let pourcentage_moulin = 0;
let index_moulin = 0;

function moulin() {
    // On utilise === pour comparer !
    if (pourcentage_moulin === 100) {
        index_moulin = 4;
    } else if (pourcentage_moulin === 75) {
        index_moulin = 3;
    } else if (pourcentage_moulin === 50) {
        index_moulin = 2;
    } else if (pourcentage_moulin === 25) {
        index_moulin = 1;
    } else {
        index_moulin = 0;
    }
}

//FLECHES ------------------------------
let index = 0;

// Stocker les 4 sprite d'une flèche.
const flèches = [
    document.querySelector("#Arrow1"),
    document.querySelector("#Arrow2"),
    document.querySelector("#Arrow3"),
    document.querySelector("#Arrow4")
];

let arrows = [];
function creerFleche() {
    for(let i = 0; i < 10; i++) {
        arrows.push({
            x: Math.random() * w - 500, //Position sur l'axe X
            y: Math.random() * - h, //Position sur l'axe Y
            dx: 2, //Vitesse sur l'axe X
            dy: 2, //Vitesse sur l'axe Y
            indexSprite: 0, //Numéro du sprite
            compteur: 12, //FPS de l'animation du sprite
            toucher_sol: false, //Si la flèche touche le sol = true
            delai: 0 //Temps durant lequel la flèche reste au sol
        });
    }
}
creerFleche();

//PLUIE ------------------------------
let pluie = [];
function creerPluie() {
    for(let i = 0; i < 200; i++) {
        pluie.push({
            x: Math.random(100) * w - 150,
            y: Math.random() * h,
            dx: 1,
            dy: 5,
        });
    }
}

//Afficher tous les éléments ---------------------------------------------------------------------------
function affichage() {
    level1.clearRect(0, 0, w, h);

    // AFFICHER LE FOND -----------
    level1.drawImage(fond, 0, 0, w, h);

    //AFFICHER LE MOULIN
    moulin();
    level1.drawImage(moulin_sprite[index_moulin], w - 200, h - 230, 150, 200);

    //AFFICHER LE SOL
    level1.drawImage(sol, 0, h - 50, w, 50);

    // AFFICHER LES FLECHES --------------
    arrows.forEach(fleche => {
        fleche.x += fleche.dx;
        fleche.y += fleche.dy;

        if (fleche.x > w) {
            fleche.y = (Math.random() * -200) - 50;
            fleche.x = Math.random() * w;
        }

        //Si la flèche 
        if (fleche.y >= h - 60) {
            
            fleche.y = h - 60;
            fleche.dy = 0;
            fleche.dx = 0;

            fleche.delai++;

            if (fleche.delai >= 120) { 
                fleche.y = (Math.random() * -200) - 50;
                fleche.x = Math.random() * w;
                
                fleche.dy = 2; 
                fleche.dx = 2; 
                
                fleche.delai = 0; 
            }
        }

        level1.drawImage(flèches[fleche.indexSprite], fleche.x, fleche.y, 50, 40);


        //Animation des flèches
        fleche.compteur++;
            if (fleche.compteur >= 12) {
                fleche.indexSprite++;
                if (fleche.indexSprite >= flèches.length) {
                    fleche.indexSprite = 0; 
                }
                fleche.compteur = 0;
            }

        //Si une flèche touche le joueur
        let distance = 0;
    });

    // AFFICHER LA PLUIE --------------

    level1.fillStyle = "#100F3D";
    level1.beginPath();
    pluie.forEach(goutte => {
        if(goutte.y > h || goutte.x < 0) {
            goutte.y = -20;
            goutte.x = Math.random() * w - 150;
        }
        goutte.y += goutte.dy;
        goutte.x += goutte.dx
        level1.rect(goutte.x, goutte.y, 2, 15); 
    });
    level1.fill();

    // --- GESTION DU BOIS ---

    if (nbr_bois < bois_t.length) {
        if (bois_t[nbr_bois].recup === false) {
            level1.drawImage(bois, bois_t[nbr_bois].x, bois_t[nbr_bois].y, 70, 40); 
        }
        if (personnage.x < 50 && bois_t[nbr_bois].recup === false) {
            bois_t[nbr_bois].recup = true;
        }
        if (personnage.x > w - 150 && bois_t[nbr_bois].recup === true) {
            bois_t[nbr_bois].recup = false;
            nbr_bois++;
            pourcentage_moulin += 25; 
        }
    }
    // --- AFFICHER LE JOUEUR ---------------
    joueur();
    
    // ANIMATION DU JOUEUR
    let imageActuelle = perso1; 

    if (personnage.dx !== 0) {
        personnage.compteurAnim++;
        if (personnage.compteurAnim >= 18) { 
            personnage.frameAnim++;
            if (personnage.frameAnim >= animationMarche.length) {
                personnage.frameAnim = 0; 
            }
            personnage.compteurAnim = 0;
        }
        imageActuelle = animationMarche[personnage.frameAnim];
    } else {
        personnage.frameAnim = 0;
    }

    // DESSIN DU JOUEUR ET DU BOIS QU'IL PORTE
    level1.save();
    if (personnage.direction === -1) {
        level1.scale(-1, 1);
        level1.drawImage(imageActuelle, -personnage.x - 80, personnage.y, 80, 150);
        
        // S'il porte du bois, on le dessine dans ses bras (avec bois !)
        if (nbr_bois < bois_t.length && bois_t[nbr_bois].recup === true) {
            level1.drawImage(bois, -personnage.x - 60, personnage.y + 55, 70, 40);
        }
    } else {
        level1.drawImage(imageActuelle, personnage.x, personnage.y, 80, 150);
        
        // S'il porte du bois (vers la droite)
        if (nbr_bois < bois_t.length && bois_t[nbr_bois].recup === true) {
            level1.drawImage(bois, personnage.x + 20, personnage.y + 55, 70, 40);
        }
    }
    level1.restore();

    // AFFICHER LES COEURS ---------------
    let positionX_coeur = 10;

    for (let i = 0; i < personnage.vie; i++) {
        level1.drawImage(vie, positionX_coeur, 10, 40, 35);
        positionX_coeur += 50; 
    }

    requestAnimationFrame(affichage);
}

creerPluie();
affichage();