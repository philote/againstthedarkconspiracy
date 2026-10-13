import { asyncHarmDialog, asyncStressRoll, dialogContent, dialogTitle } from "../helpers/rolls.mjs";

export function addChatListeners(html) {
    html.querySelectorAll('button.roll-stress').forEach((button) => button.addEventListener('click', rollStress));
    html.querySelectorAll('button.roll-harm').forEach((button) => button.addEventListener('click', rollHarm));
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