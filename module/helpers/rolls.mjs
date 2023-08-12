// ----------------------
// Dice rolling functions
// ----------------------

export async function asyncActionDialog({ title = "", content = "", move = 0, actor } = {}) {
  return await new Promise(async (resolve) => {
    new Dialog(
      {
        title: title,
        content: content,
        buttons: {
          button1: {
            icon: '<i class="fa-solid fa-dice"></i>',
            label: game.i18n.localize("ATDC.actor.actions.label"),
            callback: async (html) => {
              const dice = [];

              if (document.getElementById("baseDie").checked) {
                let hdRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.ATDC.baseDieColor,
                  isStress: false,
                  isRisk: false,
                  rollVal: hdRoll.result,
                });
              }

              if (document.getElementById("expertiseDie").checked) {
                let odRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.ATDC.baseDieColor,
                  isStress: false,
                  isRisk: false,
                  rollVal: odRoll.result,
                });
              }

              if (document.getElementById("stressDie").checked) {
                let idRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.ATDC.riskDieColor,
                  isStress: true,
                  isRisk: false,
                  rollVal: idRoll.result,
                });
              }

              if (document.getElementById("bonusDie") != null) {
                if (document.getElementById("bonusDie").checked) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  dice.push({
                    dieColor: CONFIG.ATDC.bonusDieColor,
                    isStress: false,
                    isRisk: false,
                    rollVal: idRoll.result,
                  });
                }
              }

              // Take them out Die
              const threatDice = [];

              if (document.getElementById("threatHarmDie") != null) {
                if (document.getElementById("threatHarmDie").checked) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("threatSupernaturalDie") != null) {
                if (
                  document.getElementById("threatSupernaturalDie").checked
                ) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("outnumberedDie") != null) {
                if (document.getElementById("outnumberedDie").checked) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("weaponDie") != null) {
                if (document.getElementById("weaponDie").checked) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("SupernaturalPowersDie1") != null) {
                if (
                  document.getElementById("SupernaturalPowersDie1").checked
                ) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("SupernaturalPowersDie2") != null) {
                if (
                  document.getElementById("SupernaturalPowersDie2").checked
                ) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("SupernaturalPowersDie3") != null) {
                if (
                  document.getElementById("SupernaturalPowersDie3").checked
                ) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              if (document.getElementById("SupernaturalPowersDie4") != null) {
                if (
                  document.getElementById("SupernaturalPowersDie4").checked
                ) {
                  let idRoll = await new Roll("1d6").evaluate({
                    async: true,
                  });
                  threatDice.push({
                    dieColor: CONFIG.ATDC.takeThemOutDieColor,
                    isStress: false,
                    isRisk: true,
                    rollVal: idRoll.result,
                  });
                }
              }

              // -----------------

              const maxDie = dice.reduce((a, b) =>
                a.rollVal > b.rollVal ? a : b
              );

              // Determine if the stress die won
              let isStressDie = false;
              dice.every((die) => {
                if (die.rollVal == maxDie.rollVal && die.isStress) {
                  isStressDie = true;
                  return false;
                }
                return true;
              });

              let stressMessage = "";
              if (isStressDie) {
                increaseStressByOne(actor);
                stressMessage = await stressMoveMessage();
              }

              // Build Dice list
              let diceOutput = "";
              dice.forEach((die) => {
                diceOutput = diceOutput.concat(
                  getDiceForOutput(die.rollVal, die.dieColor),
                  " "
                );
              });

              // threatDice
              let harmMessage = "";
              if (threatDice.length > 0) {
                const maxThreatDie = threatDice.reduce((a, b) =>
                  a.rollVal > b.rollVal ? a : b
                );

                if (maxThreatDie.rollVal >= maxDie.rollVal) {
                  harmMessage = await harmMoveMessage(actor);
                }

                // Build Threat Dice list
                let threatDiceOutput = "";
                threatDice.forEach((die) => {
                  threatDiceOutput = threatDiceOutput.concat(
                    getDiceForOutput(die.rollVal, die.dieColor),
                    " "
                  );
                });

                if (threatDiceOutput) {
                  diceOutput = `${diceOutput}</br></br><b style="font-size:1.2em">${game.i18n.localize("ATDC.dialog.action.risk.label")}</b></br>${threatDiceOutput}`;
                }
              }

              // Check if intel should increase & if stress button should show
              let showStressOnSix = false;
              if (maxDie.rollVal == "6") {
                if (!maxDie.isStress) {
                  showStressOnSix = true;
                }
                increaseIntelByOne(actor);
              }

              // chat message setup
              const dialogData = {
                moveName: dialogTitle(move),
                diceOutput: diceOutput,
                maxDieMessage: getMaxDieMessage(move, maxDie.rollVal),
                stressMessage: stressMessage,
                harmMessage: harmMessage,
                showStressOnSix: showStressOnSix,
                stressOnSixMessage: game.i18n.format("ATDC.dialog.stress.onSixMessage", {formattedStress: getWordRiskWithFormatting()}),
                ownerId: actor.id
              }
              const template = 'systems/againstthedarkconspiracy/templates/msg/action-chat-content.hbs';
              const rendered_html = await renderTemplate(template, dialogData);
          
              ChatMessage.create({
                user: game.user_id,
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                rollMode: game.settings.get("core", "rollMode"),
                content: rendered_html
              });

              if ((move >= 1 && move <= 6)) {
                if (maxDie.rollVal >= 1 && maxDie.rollVal <= 3) {
                  createHeatChatMessage();
                }
              }

              // ----
              resolve(null);
            },
          },
        },
        close: () => {
          resolve(null);
        },
      }
    ).render(true);
  });
}

export async function asyncHarmDialog({ title = "", content = "", move = 0, actor } = {}) {
  return await new Promise(async (resolve) => {
    new Dialog(
      {
        title: title,
        content: content,
        buttons: {
          button1: {
            icon: '<i class="fa-solid fa-dice"></i>',
            label: game.i18n.localize("ATDC.actor.actions.label"),
            callback: async (html) => {
              const dice = [];

              if (document.getElementById("baseDie").checked) {
                let hdRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.ATDC.baseDieColor,
                  isStress: false,
                  rollVal: hdRoll.result,
                });
              }

              if (document.getElementById("stressDie").checked) {
                let idRoll = await new Roll("1d6").evaluate({ async: true });
                dice.push({
                  dieColor: CONFIG.ATDC.riskDieColor,
                  isStress: true,
                  rollVal: idRoll.result,
                });
              }

              // bonuses
              const radios = document.getElementsByName("rollBonus");
              let bonusValue = 0;
              for (var i = 0, length = radios.length; i < length; i++) {
                if (radios[i].checked) {
                  bonusValue = parseInt(radios[i].value);
                  break;
                }
              }

              // -----------------

              let diceOutput = "";

              const maxDieValue = dice.reduce((a, b) =>
                a.rollVal > b.rollVal ? a : b
              ).rollVal;
              const setOfMaxDice = dice.filter((obj) => {
                return obj.rollVal === maxDieValue;
              });

              // Stress
              let stressMessage = "";
              var stressDieR = setOfMaxDice.find((obj) => {
                return obj.isStress === true;
              });

              let maxDie = null;
              if (stressDieR) {
                increaseStressByOne(actor);
                stressMessage = await stressMoveMessage();
                maxDie = stressDieR;
              } else {
                maxDie = setOfMaxDice[0];
              }

              const maxDieModified = parseInt(maxDie.rollVal) + bonusValue;

              dice.forEach((die) => {
                diceOutput = diceOutput.concat(
                  getDiceForOutput(die.rollVal, die.dieColor),
                  " "
                );
              });

              // Check if intel should increase & if stress button should show
              let showStressOnSix = false;
              let harmShowIntel = false;
              if (maxDie.rollVal == "6") {
                if (!maxDie.isStress) {
                  showStressOnSix = true;
                }
                harmShowIntel = true;
                increaseIntelByOne(actor);
              }

              // chat message setup
              const dialogData = {
                moveName: dialogTitle(move),
                diceOutput: diceOutput,
                maxDieMessage: getMaxDieMessage(move, maxDieModified, harmShowIntel),
                maxDieNumber: maxDieModified,
                stressMessage: stressMessage,
                showStressOnSix: showStressOnSix,
                stressOnSixMessage: game.i18n.format("ATDC.dialog.stress.onSixMessage", {formattedStress: getWordRiskWithFormatting()}),
                bonusValue: bonusValue,
                ownerId: actor.id
              }
              const template = 'systems/againstthedarkconspiracy/templates/msg/harm-chat-content.hbs';
              const rendered_html = await renderTemplate(template, dialogData);
          
              ChatMessage.create({
                user: game.user_id,
                speaker: ChatMessage.getSpeaker({ actor: actor }),
                rollMode: game.settings.get("core", "rollMode"),
                content: rendered_html
              });

              // ----
              resolve(null);
            },
          },
        },
        close: () => {
          resolve(null);
        },
      }
    ).render(true);
  });
}

export async function asyncStressRoll(actor) {
  const dice = [];
  let hdRoll = await new Roll("1d6").evaluate({ async: true });
  dice.push({
    dieColor: CONFIG.ATDC.riskDieColor,
    isStress: false,
    rollVal: hdRoll.result,
  });

  let diceOutput = "";

  const maxDieValue = dice.reduce((a, b) => a.rollVal > b.rollVal ? a : b).rollVal;
  const setOfMaxDice = dice.filter((obj) => {
    return obj.rollVal === maxDieValue;
  });

  let maxDie = setOfMaxDice[0];

  const maxDieModified = parseInt(maxDie.rollVal);

  let stressVal = null;
  let stressMessage = "";
  let stressValMessage = "";

  stressVal = actor.system.stress.value;

  if (stressVal != null) {
    if (maxDieModified > stressVal) {
      increaseStressByOne(actor);
      stressMessage = game.i18n.format("ATDC.dialog.stress.message.increase", {formattedStress: getWordRiskWithFormatting()});
    } else {
      stressMessage = game.i18n.localize("ATDC.dialog.stress.message.good");
    }
    
    stressValMessage = game.i18n.format("ATDC.dialog.stress.message.currentStress", {formattedStress: getWordRiskWithFormatting(), stressVal: stressVal});
  }

  dice.forEach((die) => {
    diceOutput = diceOutput.concat(
      getDiceForOutput(die.rollVal, die.dieColor),
      " "
    );
  });

  const dialogData = {
    diceOutput: diceOutput,
    stressMessage: stressMessage,
    stressValMessage: stressValMessage
  }
  const template = 'systems/againstthedarkconspiracy/templates/msg/stress-chat-content.hbs';
  const rendered_html = await renderTemplate(template, dialogData);

  ChatMessage.create({
    user: game.user_id,
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    rollMode: game.settings.get("core", "rollMode"),
    content: rendered_html
  });
}

export async function asyncSeekReliefRoll(move = 0, actor) {
  const roll = await new Roll("1d6").evaluate({ async: true });
  const diceOutput = getDiceForOutput(
    roll.result,
    CONFIG.ATDC.baseDieColor
  );
  const chatContentMessage = await seekReliefChatContent(
    move,
    diceOutput,
    roll.result
  );

  const user = game.user.id;
  const speaker = ChatMessage.getSpeaker({ actor: actor });
  const rollMode = game.settings.get("core", "rollMode");

  ChatMessage.create({
    user: user,
    speaker: speaker,
    rollMode: rollMode,
    content: chatContentMessage,
  });

  // Mark anchor
  if (move == 4) {
    markAnchor(actor);
  }
  
  // mark expertise
  if (move >= 1 && move <= 3) {
    if (roll.result >= 1 && roll.result <= 3) {
      switchExpertise(true, actor);
    }
  }

  // mark heat
  if (move >= 2 && move <= 3) {
    if (roll.result >= 4 && roll.result <= 6) {
      createHeatChatMessage();
    }
  }

  // Stress reduction
  if (move == 4 && (actor.system.anchor.missing || actor.system.anchor.taken)) {
    // don't reduce stress
  } else {
    // reduce stress
    if (roll.result == "6") {
      reduceStress(2, actor);
    } else {
      reduceStress(1, actor);
    }      
  }

    /*
    buttons for seek relief from the horror moves

    --- behave badly
    4-6
    if operator they roll stress
    if npc mark heat


    --- reveal history
    1-3
    either 
    mark expertise
    or
    mark anchor

    4-6
    then either
    roll stress
    or
    makr anchor
    */
}

export function dialogTitle(moveNumber) {
  switch (moveNumber) {
    case 1:
      return `${game.i18n.localize("ATDC.actor.actions.investigate.label")}`;
    case 2:
      return `${game.i18n.localize("ATDC.actor.actions.cover.label")}`;
    case 3:
      return `${game.i18n.localize("ATDC.actor.actions.flee.label")}`;
    case 5:
      return `${game.i18n.localize("ATDC.actor.actions.chase.label")}`;
    case 6:
      return `${game.i18n.localize("ATDC.actor.actions.takeThemOut.label")}`;
    case 7:
      return `${game.i18n.localize("ATDC.actor.actions.harm.label")}`;
    case 4:
      return `${game.i18n.localize("ATDC.actor.actions.doSomethingElse.label")}`;
    default:
      console.error("Error: case not matched in _dialogTitle");
      return `error`;
  }
}

export async function dialogContent(moveNumber, actor) {
    const dialogData = {
      riskDieColor: CONFIG.ATDC.riskDieColor,
      bonusDieColor: CONFIG.ATDC.bonusDieColor,
      takeThemOutDieColor: CONFIG.ATDC.takeThemOutDieColor,
      expertiseUsed: actor.system.expertise.expertiseUsed
    }
    switch (moveNumber) {
      case 1: // Investigate
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/investigate.hbs', dialogData);
      case 2: // Maintain Your Cover
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/maintain-cover.hbs', dialogData);
      case 3: // Flee For Your Life
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/flee.hbs', dialogData);
      case 5: // Chase Them Down
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/chase.hbs', dialogData);
      case 6: // Take Them Out
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/take-them-out.hbs', dialogData);
      case 7: // harm
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/harm.hbs', dialogData);
      case 4: // Do Something Else
      default:
        return await renderTemplate('systems/againstthedarkconspiracy/templates/dialog/do-something-else.hbs', dialogData);
    }
}

export function seekReliefDialogTitle(moveNumber) {
    switch (moveNumber) {
      case 1:
        return `${game.i18n.localize("ATDC.actor.seekRelief.behaveBadly.label")}`;
      case 2:
        return `${game.i18n.localize("ATDC.actor.seekRelief.vice.label")}`;
      case 3:
        return `${game.i18n.localize("ATDC.actor.seekRelief.seekGuidance.label")}`;
      case 4:
        return `${game.i18n.localize("ATDC.actor.seekRelief.seekSolaceRelationship.label")}`;
      case 5:
        return `${game.i18n.localize("ATDC.actor.seekRelief.revealHistory.label")}`;
      default:
        console.error("Error: case not matched in _seekReliefDialogTitle");
        return `error`;
    }
}

export function getDiceForOutput(dieNumber, colorHex) {
    switch (dieNumber) {
      case "1":
        return `<i class="fas fa-dice-one" style="color:${colorHex}; font-size: 2em;"></i>`;
      case "2":
        return `<i class="fas fa-dice-two" style="color:${colorHex}; font-size: 2em;"></i>`;
      case "3":
        return `<i class="fas fa-dice-three" style="color:${colorHex}; font-size: 2em;"></i>`;
      case "4":
        return `<i class="fas fa-dice-four" style="color:${colorHex}; font-size: 2em;"></i>`;
      case "5":
        return `<i class="fas fa-dice-five" style="color:${colorHex}; font-size: 2em;"></i>`;
      case "6":
        return `<i class="fas fa-dice-six" style="color:${colorHex}; font-size: 2em;"></i>`;
      default:
        console.error("Error: case not matched in _getDiceForOutput");
        return `error`;
    }
}

export function getMaxDieMessage(moveNumber, maxDieNumber, harmShowIntel) {
    switch (moveNumber) {
      case 1: {
        // Investigate
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.investigate.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.investigate.45");
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.investigate.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
        }
      }
      case 2: // Maintain Your Cover
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.cover.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.cover.45");
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.cover.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
        }
      case 3: // Flee For Your Life
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.flee.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.flee.45", {formattedHeat: getWordHeatWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.flee.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.3)</span>`;
        }
      case 5: // Chase Them Down
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.chase.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.chase.45", {formattedHeat: getWordHeatWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.chase.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.5)</span>`;
        }
      case 6: // Take Them Out
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.45");
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.6)</span>`;
        }
      case 7: // Harm
        switch (maxDieNumber) {
          case 0:
          case 1:
          case 2:
          case 3:
            return game.i18n.format("ATDC.dialog.maxDieMessage.harm.0123", {formattedStress: getWordRiskWithFormatting()});
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 9:
            let message = game.i18n.format("ATDC.dialog.maxDieMessage.harm.456789Part1");
            if (harmShowIntel) {
              message += game.i18n.format("ATDC.dialog.maxDieMessage.harm.456789Part2", {formattedIntel: getWordIntelWithFormatting()});
            }
            return message;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage) hit default</span>`;
        }
      case 4: // Do Something Else
      default:
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.123", {formattedHeat: getWordHeatWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.45");
          case "6":
            return game.i18n.format("ATDC.dialog.maxDieMessage.takeThemOut.6", {formattedIntel: getWordIntelWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.4)</span>`;
        }
    }
}

export function seekReliefMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
      case 1: { // Behave Badly
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.behaveBadly.123", {formattedStress: getWordRiskWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.behaveBadly.45", {formattedStress: getWordRiskWithFormatting(), formattedHeat: getWordHeatWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.behaveBadly.6", {formattedStress: getWordRiskWithFormatting(), formattedHeat: getWordHeatWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
        }
      }
      case 2: // Indulge a Vice
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.vice.123", {formattedStress: getWordRiskWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.vice.45", {formattedHeat: getWordHeatWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.vice.6", {formattedHeat: getWordHeatWithFormatting(), formattedStress: getWordRiskWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
        }
      case 3: // Look for Guidance
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.guidance.123", {formattedStress: getWordRiskWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.guidance.45", {formattedHeat: getWordHeatWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.guidance.6", {formattedHeat: getWordHeatWithFormatting(), formattedStress: getWordRiskWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.3)</span>`;
        }
      case 4: // Seek solace in a relationship
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.seekSolace.12345", {formattedAnchor: getWordAnchorWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.seekSolace.6", {formattedAnchor: getWordAnchorWithFormatting(), formattedStress: getWordRiskWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.4)</span>`;
        }
      case 5: // Reveal some of your history together
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.revealHistory.123", {formattedStress: getWordRiskWithFormatting(), formattedAnchor: getWordAnchorWithFormatting()});
          case "4":
          case "5":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.revealHistory.45", {formattedHeat: getWordHeatWithFormatting(), formattedStress: getWordRiskWithFormatting(), formattedAnchor: getWordAnchorWithFormatting()});
          case "6":
            return game.i18n.format("ATDC.dialog.reliefMaxDieMessage.revealHistory.6", {formattedStress: getWordRiskWithFormatting(), formattedAnchor: getWordAnchorWithFormatting()});
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.5)</span>`;
        }
      default:
        return `<span style="color:#ff0000">ERROR(getMaxDieMessage.default)</span>`;
    }
}

export async function seekReliefChatContent(moveNumber, diceOutput, maxDieNumber) {
  const dialogData = {
    moveName: seekReliefDialogTitle(moveNumber),
    diceOutput: diceOutput,
    maxDieMessage: seekReliefMaxDieMessage(moveNumber, maxDieNumber)
  }
  const template = 'systems/againstthedarkconspiracy/templates/msg/seekRelief-chat-content.hbs';
  return await renderTemplate(template, dialogData);
}

export async function harmMoveMessage(actor) {
  const dialogData = {
    takeThemOutDieColor: CONFIG.ATDC.takeThemOutDieColor,
    ownerId: actor.id
  }
  const template = 'systems/againstthedarkconspiracy/templates/msg/harm-chat-roll-msg.hbs';
  return await renderTemplate(template, dialogData);
}

export async function stressMoveMessage() {
  const stressMoveMessage = game.i18n.format("ATDC.stress.stressMoveMessage", {formattedStress: getWordRiskWithFormatting()})
  const dialogData = {
    stressMoveMessage: stressMoveMessage
  }
  const template = 'systems/againstthedarkconspiracy/templates/msg/stress-chat-roll-msg.hbs';
  return await renderTemplate(template, dialogData);
}

/*
    special word functions
*/

export function getWordIntelWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.intelColor}">${game.i18n.localize(
        "ATDC.actor.actions.intel.colored"
    )}</b>`;
}

export function getWordRiskWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.riskDieColor}">${game.i18n.localize(
        "ATDC.actor.actions.risk.colored"
    )}</b>`;
}

export function getWordHeatWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.heatColor}">${game.i18n.localize(
        "ATDC.actor.actions.heat.colored"
    )}</b>`;
}

export function getWordAnchorWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.anchorColor}">${game.i18n.localize(
        "ATDC.actor.actions.anchor.colored"
    )}</b>`;
}

// Helper functions for data manipulation

export function switchExpertise(toggle, actor) {
    actor.system.expertise.expertiseUsed = toggle;
    actor.update({ "system.expertise.expertiseUsed": toggle });
}

export function increaseStressByOne(actor) {
    let newStress = duplicate(actor.system.stress.value);

    if (newStress < 6) {
      let currentArray = actor.system.stress.states;
      const firstPos = currentArray.indexOf(false);
      if (firstPos != -1) {
        currentArray[firstPos] = true;
        actor.update({ ["system.stress.states"]: currentArray });
      }
    }

    // update Stress
    ++newStress;
    actor.system.stress.value = newStress;
    actor.update({ "system.stress.value": newStress });
}

export function reduceStress(amount = 1, actor) {
    let newStress = duplicate(actor.system.stress.value);

    if (newStress > 0) {
      let currentArray = actor.system.stress.states;
      for (let i = 0; i < amount; i++) {
        const firstPos = currentArray.lastIndexOf(true);
        if (firstPos != -1) {
          currentArray[firstPos] = false;
          actor.update({ ["system.stress.states"]: currentArray });
        }
      }
    }

    // update Stress
    newStress = newStress - amount;
    actor.system.stress.value = newStress;
    actor.update({ "system.stress.value": newStress });
}

export function increaseIntelByOne(actor) {
    let newIntel = duplicate(actor.system.intel.value);

    if (newIntel < 6) {
      let currentArray = actor.system.intel.states;
      const isFalse = (element) => element === false;
      const firstPos = currentArray.findIndex(isFalse);
      currentArray[firstPos] = true;
      return actor.update({ ["system.intel.states"]: currentArray });
    }

    // update Intel
    ++newIntel;
    actor.system.intel.value = newIntel;
    actor.update({ "system.intel.value": newIntel });
}

export function markAnchor(actor) {
  let anchorName = actor.system.anchor.name;
  if (anchorName.length <= 0) {
    anchorName = game.i18n.localize("ATDC.dialog.anchor.default.name")
  };
  let target = actor.system.anchor.target;
  let missing = actor.system.anchor.missing;
  let taken = actor.system.anchor.taken;
  let message = "";
  if (!target) {
    target = true;
    actor.update({ "system.anchor.target": target });
    message = game.i18n.format("ATDC.dialog.anchor.target.message", {
      anchorName: anchorName
    })
  } else if (!missing) {
    missing = true;
    actor.update({ "system.anchor.missing": missing });
    message = game.i18n.format("ATDC.dialog.anchor.missing.message", {
      anchorName: anchorName
    })
  } else if (!taken) {
    taken = true;
    actor.update({ "system.anchor.taken": taken });
    message = game.i18n.format("ATDC.dialog.anchor.taken.message", {
      anchorName: anchorName
    })
  } else {
    message = game.i18n.format("ATDC.dialog.anchor.default.message", {
      anchorName: anchorName
    })
  }
  _createAnchorChatMessage(message);
}

function _createAnchorChatMessage(message) {
  ChatMessage.create({
    content: message,
    whisper: ChatMessage.getWhisperRecipients("GM")
  })
}

// Heat

export async function createHeatChatMessage() {
  const oldHeat = game.settings.get("againstthedarkconspiracy", "currentHeat");
  const newHeat = oldHeat + 1;

  const increaseMessage = game.i18n.format("ATDC.chat.heatIncrease.increaseMessage", {
    name: getWordHeatWithFormatting(),
    oldHeat: oldHeat,
    newHeat: newHeat
  });

  const dialogData = {
      increaseMessage: increaseMessage,
      conspiracyThreatLevel: getConspiracyThreatLevel(newHeat),
      threatColor: getConspiracyThreatLevelColor(newHeat),
  };

  const template = 'systems/againstthedarkconspiracy/templates/msg/heat-increased-chat-msg.hbs';
  const rendered_html = await renderTemplate(template, dialogData);

  ChatMessage.create({
      content: rendered_html,
      flags: { againstthedarkconspiracy: { data: {
        css: "chat-message-heat",
        heatUpdate: true,
        heat: newHeat
      } } }
  });                 
}

export function getConspiracyThreatLevelColor(heat) {
  if (heat >= 1 && heat <= 4) {
      return "suspicious";
  } else if (heat >= 5 && heat <= 7) {
      return "alarmed";
  } else if (heat >= 8 && heat <= 9) {
      return "capture";
  } else if (heat > 9) {
      return "attack";
  } else {
      return "";
  }
}

export function getConspiracyThreatLevel(heat) {
  if (heat >= 1 && heat <= 4) {
    return game.i18n.localize("ATDC.dialog.heat.suspicious.title");
  } else if (heat >= 5 && heat <= 7) {
    return game.i18n.localize("ATDC.dialog.heat.alarmed.title");
  } else if (heat >= 8 && heat <= 9) {
    return game.i18n.localize("ATDC.dialog.heat.capture.title");
  } else if (heat > 9) {
    return game.i18n.localize("ATDC.dialog.heat.attack.title");
  } else {
    return "";
  }
}