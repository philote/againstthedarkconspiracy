import { asyncHarmDialog, asyncStressRoll, dialogContent, dialogTitle } from "../helpers/rolls.mjs";

export async function addChatListeners(html) {
    html.on('click', 'button.roll-stress', rollStress);
    html.on('click', 'button.roll-harm', rollHarm);
}

function rollStress(event) {
    let card = event.currentTarget.closest(".action");
    let actor = game.actors.get(card.dataset.ownerId);
    asyncStressRoll(actor);
}

async function rollHarm(event) {
    let card = event.currentTarget.closest(".action");
    let actor = game.actors.get(card.dataset.ownerId);
    const move = 7;
    const title = dialogTitle(move);
    const content = await dialogContent(move, actor);
    asyncHarmDialog({ title, content, move, actor });
}