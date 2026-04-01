const menu1_level1 = document.querySelector(".menu1_level1");
const menu2_level1 = document.querySelector(".menu2_level1");
const menu_defaite = document.querySelector(".menu_défaite_level1");
const menu_fin = document.querySelector(".menu_fin_level1");

const touche_gauche = document.querySelector(".touche_gauche");
const touche_droite = document.querySelector(".touche_droite");

const btn_menu1 = document.querySelector("#btn_menu1");
const btn_menu2 = document.querySelector("#btn_menu2");

const btn_recommencer = document.querySelector("#btn_recommencer");

btn_menu1.addEventListener("click", e=> {
    menu1_level1.classList.add("invisible");
    menu2_level1.classList.remove("invisible");
})

let clicsTuto = 0;

function animerEtJouer(e) {
    const touche = this;
    touche.classList.add("anime-touche");
    setTimeout(() => {
        touche.classList.remove("anime-touche");
    }, 300);
}

touche_droite.addEventListener("touchstart", animerEtJouer);
touche_gauche.addEventListener("touchstart", animerEtJouer);

btn_menu2.addEventListener("click", demarrer);
// btn_recommencer.addEventListener("click", demarrer);

function demarrer() {
    menu2_level1.classList.add("invisible");
    menu_defaite.classList.add("invisible");
    creerPluie();
    affichage();
    setInterval(boue, 5000);
}

btn_recommencer.addEventListener("click", e=>{
    location.reload();
})

function fin_du_jeu() {
    menu_fin.classList.remove("invisible");
}

//DANS LE MENU

document.addEventListener("DOMContentLoaded", e=>{
    level1.drawImage(fond, 0, 0, w, h);
    level1.drawImage(sol, 0, h - 50, w, 50);
})


