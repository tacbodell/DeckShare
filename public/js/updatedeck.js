const submitButton = document.getElementById('submitButton');
const deckIdForm = document.getElementById('deckIdForm');
const cardStringForm = document.getElementById('cardStringForm');

submitButton.addEventListener('click', _ => {
    const deckId = deckIdForm.value
    const cardString = cardStringForm.value
    fetch('/deck', {
        method: 'put',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({
            id: deckId,
            cardString: cardString
        }),
    })
        .then(res => {
            if (res.ok) return res.json()
        })
        .then(response => {
            console.log(response);
            window.location.href = `/viewdeck/${deckId}`;
        })
})