const cardImages = document.querySelectorAll(".card-image");

// loop through every entry in the deck and delay fade in animation
for (let i = 0; i < cardImages.length; i++) {
    cardImages[i].style.animationDelay = `${i * .05}s`
}

