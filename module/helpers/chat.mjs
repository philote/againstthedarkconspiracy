import { asyncHarmDialog, asyncStressRoll, dialogContent, dialogTitle } from "../helpers/rolls.mjs";

export async function addChatListeners(html) {
    html.on('click', 'button.roll-stress', rollStress);
    html.on('click', 'button.roll-harm', await rollHarm);
}

function rollStress(event) {
    let card = event.currentTarget.closest(".action");
    let owner = game.actors.get(card.dataset.ownerId);
    asyncStressRoll(owner);
}

async function rollHarm(event) {
    console.error("Click!");
    let card = event.currentTarget.closest(".action");
    let owner = game.actors.get(card.dataset.ownerId);
    const move = 7;
    const title = dialogTitle(move);
    const content = await dialogContent(move, owner);
    asyncHarmDialog({ title, content, move, owner });
}