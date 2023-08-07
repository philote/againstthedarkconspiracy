export function addChatListeners(html) {
    html.on('click', 'button.roll-stress', rollStress);
}

function rollStress(event) {
    let card = event.currentTarget.closest(".action");
    let owner = game.actors.get(card.dataset.ownerId);
    console.error("owner: "+owner.id);
}