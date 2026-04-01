// INITIALISATION DES VARIABLES
const body = document.querySelector("body");
const canvas = document.querySelector("#level1");
const level1 = canvas.getContext("2d", {willReadFrequently: true});

const fond = document.querySelector("#fond");
const vie = document.querySelector("#vie");
const sol = document.querySelector("#sol");

const perso1 = document.querySelector("#joueur1");
const perso2 = document.querySelector("#joueur2");
const perso3 = document.querySelector("#joueur3");

const bois = document.querySelector("#bois");

const boue1 = document.querySelector("#boue1");
const boue2 = document.querySelector("#boue2");

const piece1 = document.querySelector("#piece1");

const musique_fond = new Audio("sound/Arrows_in_the_Downpour.mp3"); //Musique de fond
musique_fond.loop = true; 
musique_fond.volume = 0.5;

const damage_sound = new Audio ("sound/damage.mp3"); //Son de dommage
const build_sound = new Audio ("sound/build.mp3");

//TAILLE DU CANVAS ------------------------------
let w, h;
function taille() {
    w = window.innerWidth;
    h = window.innerHeight;

    if (w > 932 || h > 430) {
        w = 1100;
        h = 430;
    }

    body.width = w;
    body.height = w;
    canvas.width = w;
    canvas.height = h;
}

taille()
window.addEventListener("resize", taille);
//Voir si l'écran a été rotate
screen.orientation.addEventListener("change", () => {
    console.log("rotation !!")
    setTimeout(taille, 100);
});

//JOUEUR ------------------------------
let personnage = {
    x: w - 100,
    y: h - 160,
    dx: 0,
    vie: 3,
    direction: 1,       // le sens ou le personnage regarde
    frameAnim: 0,       // image de l'animation
    compteurAnim: 0,     // Pour ralentir le changement d'image
    vulnerabilite: true, //Si le joueur est touché par une flèche, il possède un petit temps d'invincibilité
    delai_invincible: 0, //Délai d'invincibilité
}
let delai_invincible;
const friction = 0.85; // coefficient de frottement
let ecrase = 0; //Si le joueur est touché par une flèche, on ajoute cette valeur à personnage.y et on soustrait la taille du sprite en y

const animationMarche = [perso2, perso1, perso3, perso1]; //Animation du personnage

//Cheat code
let cheat_code = false;
let compteur_triche = 0; // Pour compter les 3 clics
let delai_triche = 0;
//Gestion des mouvements
window.addEventListener("touchstart", (e) => {
    let touchX = e.touches[0].clientX; //longueur
    let touchY = e.touches[0].clientY; //hauteur

    // Pour pouvoir activer le chead code (il faut cliquer 3 fois tout en haut à droite)
    if (touchX > w - 100 && touchY < 100) {
        compteur_triche++;
        if (compteur_triche >= 3) {
            cheat_code = true;
            console.log("Cheat code activé !");
        }
    } else {
        compteur_triche = 0; 
    }

    // ----------- Les controle du joueur ---------
    if (touchX < w / 2) {
        personnage.dx = -2; 
        personnage.direction = -1; 
    } else {
        personnage.dx = 2;  
        personnage.direction = 1;  
    }
});

window.addEventListener("touchend", () => {
    personnage.dx = 0;
});

function joueur() {
    if(personnage.x < 0) personnage.x = 0;
    else if(personnage.x > w - 80) personnage.x = w - 80;

    let vitesse_finale = personnage.dx;

    if (personnage.vulnerabilite === false) {
        vitesse_finale = personnage.dx * 0.2; 
    }

    personnage.x += (vitesse_finale * ratio);
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
    for(let i = 0; i < 5; i++) {
        arrows.push({
            x: Math.random() * w, //Position sur l'axe X
            y: Math.random() * - h, //Position sur l'axe Y
            dx: 4, //Vitesse sur l'axe X
            dy: 4, //Vitesse sur l'axe Y
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
            x: Math.random() * (w + 50) - 50,
            y: Math.random() * h,
            dx: 1,
            dy: 5,
        });
    }
}

//BOUE ----------------------------------
let boues = [];
function boue() {
    boues.push({
            x: Math.random() * w - 150,
            y: h - 30,
            taille: 1,
            delai: 0
        });
}

//Gérer les collisions entre le joueur et une flèche --------------
function collision_fleche(fleche) {
    // hitbox du joueur
    let joueurBox = {
        x: personnage.x + 20, 
        y: personnage.y + 30, 
        w: 40,                
        h: 120                
    };

    // hitbox du la flèche
    let flecheBox = {
        x: fleche.x + 10,
        y: fleche.y + 10,
        w: 30, 
        h: 20  
    };

    //test de collision
    if (joueurBox.x < flecheBox.x + flecheBox.w &&
        joueurBox.x + joueurBox.w > flecheBox.x &&
        joueurBox.y < flecheBox.y + flecheBox.h &&
        joueurBox.h + joueurBox.y > flecheBox.y) 
    { 
        // Si la flèche touche
        if (fleche.toucher_sol === false && personnage.vulnerabilite === true) {
            damage_sound.play();
            personnage.vie--;
            personnage.vulnerabilite = false; // Le joueur devient invincible
            console.log("Touché ! Il reste " + personnage.vie + " vies.");
            ecrase = 10;

            // la flèche est tp tout en haut
            fleche.x = Math.random() * w;
            fleche.y = (Math.random() * -200) - 50;
            fleche.dx = 4; 
            fleche.dy = 4; 
            fleche.delai = 0; 
        }
    }
}

let dernierTemps = performance.now();
let ratio = 1;

//Animation de la pièce du chronorouage
let animation_rouage = 0;
let direction_rouage = 1;

//Afficher tous les éléments ---------------------------------------------------------------------------
function affichage(tempsActuel) {
    // Fonctionnement du cheat code
    if (cheat_code === true) {
        fin_du_jeu();
        return;
    }

    if (!tempsActuel) tempsActuel = performance.now(); 
    let deltaTime = tempsActuel - dernierTemps;
    dernierTemps = tempsActuel;
    ratio = deltaTime / 16.66;
    if (ratio > 3) ratio = 3;

    level1.clearRect(0, 0, w, h);

    // AFFICHER LE FOND -----------
    level1.drawImage(fond, 0, 0, w, h);

    //AFFICHER LE MOULIN
    moulin();
    level1.drawImage(moulin_sprite[index_moulin], w - 200, h - 230, 150, 200);

    //AFFICHER LE SOL
    level1.drawImage(sol, 0, h - 50, w, 50);

    //AFFICHER LA BOUE ----------

    let modificateur_vitesse = 1.0; 
    boues.forEach(boue => {
        if (boue.taille === 1) {
            level1.drawImage(boue1, boue.x, boue.y, 40, 15); //Afficher une petite flaque
        } else {
            level1.drawImage(boue2, boue.x - 20, boue.y - 5, 80, 30); //Afficher une grosse flaque
        }
        boue.delai++;
        
        //Après un certain délai, la boue devient plus grande et peu ralentir le joueur.
        if (boue.delai === 180 && boue.taille === 1) { 
            boue.taille = 2;
        }

        // Si le joueur passe au dessus d'une grosse flaque
        if (boue.taille === 2) {
            //Si le personnage est dans la hitbox de la flaque de boue
            if (personnage.x + 40 > boue.x && personnage.x + 40 < boue.x + 100) {
                modificateur_vitesse = 0.1;
            }
        }
    });

    if (personnage.dx !== 0) {
        personnage.x += (personnage.dx * modificateur_vitesse * ratio);
    }

    // AFFICHER LES FLECHES --------------
    arrows.forEach(fleche => {
        fleche.x += (fleche.dx * ratio);
        fleche.y += (fleche.dy * ratio);

        if (fleche.x > w) {
            fleche.y = (Math.random() * -200) - 50;
            fleche.x = Math.random() * w;
        }

        //Si la flèche touche le sol
        if (fleche.y >= h - 60) {
            
            fleche.y = h - 60;
            fleche.dy = 0;
            fleche.dx = 0;

            fleche.toucher_sol = true;

            fleche.delai += ratio;

            if (fleche.delai >= 120) { 
                fleche.y = (Math.random() * -200) - 50;
                fleche.x = Math.random() * w;
                
                fleche.dy = 4; 
                fleche.dx = 4; 
                
                fleche.delai = 0; 
                fleche.toucher_sol = false;
            }
        }

        level1.drawImage(flèches[fleche.indexSprite], fleche.x, fleche.y, 50, 40);


        //Animation des flèches
        fleche.compteur += ratio;
            if (fleche.compteur >= 12) {
                fleche.indexSprite++;
                if (fleche.indexSprite >= flèches.length) {
                    fleche.indexSprite = 0; 
                }
                fleche.compteur = 0;
            }

        collision_fleche(fleche); //Cette fonction gère les collisions avec le joueur.
    });

    // AFFICHER LA PLUIE --------------

    level1.fillStyle = "#100F3D";
    level1.beginPath();
    pluie.forEach(goutte => {
        if(goutte.y > h || goutte.x < 0) {
            goutte.y = -20;
            goutte.x = Math.random() * (w + 50) - 50;
        }
        goutte.y += (goutte.dy * ratio);
        goutte.x += (goutte.dx * ratio);
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
        if (personnage.x > w - 200 && bois_t[nbr_bois].recup === true) {
            build_sound.play();
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

    // gestion de l'invincibilité (qui dure quelque temps après que le joueur ait été touché par une flèche)
    if (personnage.vulnerabilite === false) {
        personnage.delai_invincible++;
        
        if (personnage.delai_invincible >= 100) { 
            personnage.vulnerabilite = true;
            ecrase = 0;
            personnage.delai_invincible = 0;
        }
    }
    // DESSIN DU JOUEUR ET DU BOIS QU'IL PORTE
    level1.save();
    //Si le joueur a été touché par une flèche, son sprite devient un peu rouge lorsqu'il est invincible
    if (personnage.vulnerabilite === false) level1.filter = "sepia(100%) saturate(1000%) hue-rotate(-50deg)";
    else level1.filter = "none";

    if (personnage.direction === -1) {
        level1.scale(-1, 1);
        level1.drawImage(imageActuelle, -personnage.x - 80, personnage.y + ecrase, 80, 150 - ecrase);
        level1.filter = "none";
        // Si il regarde vers la gauche
        if (nbr_bois < bois_t.length && bois_t[nbr_bois].recup === true) {
            level1.drawImage(bois, -personnage.x - 60, personnage.y + 55 + ecrase, 70, 40);
        }
    } else {
        level1.drawImage(imageActuelle, personnage.x, personnage.y + ecrase, 80, 150 - ecrase);
        level1.filter = "none";
        // Si il regarde vers la droite
        if (nbr_bois < bois_t.length && bois_t[nbr_bois].recup === true) {
            level1.drawImage(bois, personnage.x + 20, personnage.y + 55 + ecrase, 70, 40);
        }
    }
    level1.restore();
    level1.filter = "none";

    // AFFICHER LES COEURS ---------------
    let positionX_coeur = 10;

    for (let i = 0; i < personnage.vie; i++) {
        level1.drawImage(vie, positionX_coeur, 10, 40, 35);
        positionX_coeur += 50; 
    }

    // Si le joueur a encore de la vie
    if (personnage.vie > 0) {
        // Si le joueur a ramené les 4 planches de bois, la pièce du chronorouage apparait
        if (index_moulin === 4) {
            //Ici c'est animation du rouage qui va de haut en bas
            animation_rouage += (direction_rouage * ratio);
            if (animation_rouage >= 20) {
                direction_rouage = -1;
            } 
            else if (animation_rouage <= -20) {
                direction_rouage = 1;
            }
            level1.drawImage(piece1, 30, (h - 130) + animation_rouage, 55, 80);
            if (personnage.x <= 30) {
                fin_du_jeu();
                return;
            }
        }
        // Sinon la boucle continue
        requestAnimationFrame(affichage);
        
    } else {
        menu_defaite.classList.remove("invisible"); // Le joueur n'a plus de vie
        navigator.vibrate(200);
        musique_fond.pause(); 
        musique_fond.currentTime = 0;
    }
}