function dialogue(selecteur) {
    document.querySelectorAll(selecteur).forEach(div => {
        let output = "";
        
        div.innerText.split("").forEach(lettre => {
            output += `<span class="lettre">${lettre}</span>`;
        });
        
        div.innerHTML = output;
        div.addEventListener("click", afficherTxt);
        afficherTxt.call(div);
    });
}

function afficherTxt() {
    [...this.children].forEach((lettre, index) => {
        setTimeout(() => { 
            lettre.classList.add("visible"); 
        }, 50 * index); // 50ms entre chaque lettre
    });
}
