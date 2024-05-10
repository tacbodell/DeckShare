const cardImages = document.querySelectorAll(".card-image");
const editButton = document.getElementById("editButton");
const deleteButton = document.getElementById("deleteButton");

// loop through every entry in the deck and delay fade in animation
for (let i = 0; i < cardImages.length; i++) {
    cardImages[i].style.animationDelay = `${i * .05}s`
}

//handle delete requests
deleteButton.addEventListener('click', () => {
    const deckId = document.getElementById("deckName").dataset.id;
    console.log(deckId)
    fetch('/deck', {
        method: 'delete',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            id: deckId,
        }),
    })
        .then(res => {
            if (res.ok) return res.json();
        })
        .then(response => {
            if (response === 'No object to delete found'){
                console.log('No object to delete');
            } else {
                window.location.href = '/';
            }
        })
})