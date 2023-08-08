import { dialogTitle } from "../helpers/rolls.mjs";
import { getDiceForOutput } from "../helpers/rolls.mjs";
import { getWordRiskWithFormatting } from "../helpers/rolls.mjs";
import { getMaxDieMessage } from "../helpers/rolls.mjs";
import { seekReliefChatContent } from "../helpers/rolls.mjs";
import { harmMoveMessage } from "../helpers/rolls.mjs";
import { increaseIntelByOne } from "../helpers/rolls.mjs";
import { switchExpertise } from "../helpers/rolls.mjs";
import { increaseStressByOne } from "../helpers/rolls.mjs";
import { reduceStress } from "../helpers/rolls.mjs";
import { markAnchor } from "../helpers/rolls.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AtDCActorSheet extends ActorSheet {

  constructor(...args) {
    super(...args);

    let width = 720;
    let height = 740;
    if (this.actor.type == 'nameless') {
      height = 450;
    } else if (this.actor.type == 'named') {
      height = 570;
    } else if (this.actor.type == 'supernatural') {
      height = 650;
    } else if (this.actor.type == 'safeHouse') {
      height = 610;
    }
    this.position.width = width;
    this.position.height = height;
  }

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["atdc", "sheet", "actor"],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

  /** @override */
  get template() {
    return `systems/againstthedarkconspiracy/templates/actor/actor-${this.actor.type}-sheet.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array.
    const context = super.getData();

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    // context.flags = actorData.flags;
    
    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type != "character") { // TODO fixme
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {}

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const gear = [];
    const contact = [];
    const power = [];
    const compulsion = [];
    const deterrent = [];
    const vulnerability = [];

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        gear.push(i);
      }
      // Append to contacts.
      else if (i.type === "contact") {
        contact.push(i);
      }
      // Append to powers.
      else if (i.type === "power") {
        power.push(i);
      }
      // Append to compulsions.
      else if (i.type === "compulsion") {
        compulsion.push(i);
      }
      // Append to deterrents.
      else if (i.type === "deterrent") {
        deterrent.push(i);
      }
      // Append to vulnerabilities.
      else if (i.type === "vulnerability") {
        vulnerability.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.contact = contact;
    context.power = power;
    context.compulsion = compulsion;
    context.deterrent = deterrent;
    context.vulnerability = vulnerability;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find(".inline-edit-item").blur(this._onInlineEditItem.bind(this));
    html.find(".item-edit-checked").change(this._onInlineEditItem.bind(this));

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find(".item-create").click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    html.find(".npc-type-change").change(this._onNpcTypeChange.bind(this));

    // Clickable UI.
    html.find(".clickable").click(this._onClick.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = (ev) => this._onDragStart(ev);
      html.find("li.item").each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onNpcTypeChange(e) {
    e.preventDefault();
    let choice = e.currentTarget.value;
    const element = e.currentTarget;
    const dataset = element.dataset;
    const npcType = dataset.npcType

    switch (npcType) {
      case 'nameless': {
        switch (choice) {
          case '0': 
          case '1': {
            this._setStressMax(1, 1);
            return;
          }
          case '2': 
          case '3': {
            this._setStressMax(2, 2);
            return;
          }
        }
        return;
      }
      case 'supernatural': {
        switch (choice) {
          case '0': {
            this._setStressMax(4, 5);
            return;
          }
          case '1': {
            this._setStressMax(5, 20);
            return;
          }
        }
        return;
      }
    }
  }

  _onInlineEditItem(e) {
    e.preventDefault();

    let el = e.currentTarget;
    let id = el.dataset.itemId;
    let field = el.dataset.field;
    let item = this.actor.items.get(id);

    if (el.type === "checkbox") {
      return item.update({ [field]: el.checked });
    }

    return item.update({ [field]: el.value });
  }

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data,
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, { parent: this.actor });
  }

  /**
   * Handle clickable events.
   * @param {Event} event   The originating click event
   * @private
   */
  async _onClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      switch (dataset.rollType) {
        case "toggle-stress": {
          this._onToggleStress(dataset.pos);
          return;
        }
        case "npc-stress-increase": {
          this._onNpcStressMaxIncrease();
          return;
        }
        case "npc-stress-decrease": {
          this._onNpcStressMaxDecrease();
          return;
        }
        case "toggle-intel": {
          this._onToggleIntel(dataset.pos);
          return;
        }
        case "investigate": {
          const move = 1;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "cover": {
          const move = 2;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "flee": {
          const move = 3;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "chase": {
          const move = 5;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "takeThemOut": {
          const move = 6;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "doSomethingElse": {
          const move = 4;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "harm": {
          const move = 7;
          const title = dialogTitle(move);
          const content = await this._dialogContent(move);
          this.asyncHarmDialog({ title, content, move });
          return;
        }
        case "stress": {
          this.asyncStressRoll();
          return;
        }
        case "behaveBadly": {
          this.asyncSeekReliefRoll(1);
          return;
        }
        case "indulgeVice": {
          this.asyncSeekReliefRoll(2);
          return;
        }
        case "seekGuidance": {
          this.asyncSeekReliefRoll(3);
          return;
        }
        case "seekSolace": {
          this.asyncSeekReliefRoll(4);
          return;
        }
        case "revealHistoryTogether": {
          this.asyncSeekReliefRoll(5);
          return;
        }
        default: {
          console.error("_onRoll, bad roll type.");
          return;
        }
      }
    }
  }

  _onToggleStress(pos) {
    let currentArray = this.actor.system.stress.states;
    let currentState = currentArray[pos];
    let newState = 0;

    if (currentState === false) {
      newState = true;
    } else {
      newState = false;
    }

    currentArray[pos] = newState;
    this.actor.update({ ["system.stress.states"]: currentArray });
  }

  _onNpcStressMaxIncrease() {
    let currentArray = this.actor.system.stress.states;
    let currentMax = this.actor.system.stress.max;
    currentArray.push(false);
    this.actor.update({ ["system.stress.states"]: currentArray });
    this.actor.update({ ["system.stress.max"]: ++currentMax });
  }

  _onNpcStressMaxDecrease() {
    let currentArray = this.actor.system.stress.states;
    let currentMax = this.actor.system.stress.max;
    currentArray.pop();
    this.actor.update({ ["system.stress.states"]: currentArray });
    this.actor.update({ ["system.stress.max"]: --currentMax });
  }

  _setStressMax(newStress, newMax) {
    let currentArray = this.actor.system.stress.states;
    
    // set max
    if (newMax > 0) {
      this.actor.update({ ["system.stress.max"]: newMax });
    }

    if (newStress > 0) {

      if (newStress > currentArray.length) {
        const addAmount = newStress - currentArray.length;
        for (let i = 0; i < addAmount; i++) {
          currentArray.push(false);
        }
      } else if (newStress < currentArray.length) {
        const popAmount = currentArray.length - newStress;
        for (let i = 0; i < popAmount; i++) {
          currentArray.pop();
        }
      }

      this.actor.update({ ["system.stress.states"]: currentArray });
    }
  }

  _onToggleIntel(pos) {
    let currentArray = this.actor.system.intel.states;
    let currentState = currentArray[pos];
    let newState = 0;

    if (currentState === false) {
      newState = true;
    } else {
      newState = false;
    }

    currentArray[pos] = newState;
    this.actor.update({ ["system.intel.states"]: currentArray });
  }

  // ----------------------
  // Dice rolling functions
  // ----------------------

  async asyncActionDialog({ title = "", content = "", move = 0 } = {}) {
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
                  increaseStressByOne(this.actor);
                  stressMessage = stressMoveMessage();
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
                    harmMessage = harmMoveMessage();
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
                  increaseIntelByOne(this.anchor);
                }

                // chat message setup
                const dialogData = {
                  moveName: dialogTitle(move),
                  diceOutput: diceOutput,
                  maxDieMessage: getMaxDieMessage(move, maxDie.rollVal, showStressOnSix),
                  stressMessage: stressMessage,
                  harmMessage: harmMessage,
                  showStressOnSix: true,
                  ownerId: this.actor.id
                }
                const template = 'systems/againstthedarkconspiracy/templates/msg/action-chat-content.hbs';
                const rendered_html = await renderTemplate(template, dialogData);
            
                ChatMessage.create({
                  user:game.user_id,
                  speaker: ChatMessage.getSpeaker({ actor: this.actor }),
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
        },
        { id: "ID-for-CSS" }
      ).render(true);
    });
  }

  async asyncHarmDialog({ title = "", content = "", move = 0 } = {}) {
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
                  increaseStressByOne(this.actor);
                  stressMessage = stressMoveMessage();
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

                // Check if stress button should show
                let showStressOnSix = (maxDie.rollVal >= 6 && !maxDie.isStress);

                // Check if intel should increase
                let harmShowIntel = false;
                if (maxDie.rollVal == "6") {
                  harmShowIntel = true;
                  increaseIntelByOne(this.anchor);
                }

                // chat message setup
                const dialogData = {
                  moveName: dialogTitle(move),
                  diceOutput: diceOutput,
                  maxDieMessage: getMaxDieMessage(move, maxDieModified, showStressOnSix, harmShowIntel),
                  stressMessage: stressMessage,
                  bonusValue: bonusValue
                }
                const template = 'systems/againstthedarkconspiracy/templates/msg/action-chat-content.hbs';
                const rendered_html = await renderTemplate(template, dialogData);
            
                ChatMessage.create({
                  user:game.user_id,
                  speaker: ChatMessage.getSpeaker({ actor: this.actor }),
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
        },
        { id: "ID-for-CSS" }
      ).render(true);
    });
  }

  // TODO make translatable
  async asyncStressRoll() {
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

    stressVal = this.actor.system.stress.value;

    if (stressVal != null) {
      if (maxDieModified > stressVal) {
        increaseStressByOne(this.actor);
        stressMessage = `Your ${getWordRiskWithFormatting()} is increases by one!`;
      } else {
        stressMessage = "All good, this time...";
      }

      stressValMessage = `Your Current Stress is ${getWordRiskWithFormatting()} <b>${stressVal}</b>`;
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
      user:game.user_id,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rollMode: game.settings.get("core", "rollMode"),
      content: rendered_html
    });
  }

  async asyncSeekReliefRoll(move = 0) {
    const roll = await new Roll("1d6").evaluate({ async: true });
    const diceOutput = getDiceForOutput(
      roll.result,
      CONFIG.ATDC.baseDieColor
    );
    const chatContentMessage = seekReliefChatContent(
      move,
      diceOutput,
      roll.result
    );

    const user = game.user.id;
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get("core", "rollMode");

    ChatMessage.create({
      user: user,
      speaker: speaker,
      rollMode: rollMode,
      content: chatContentMessage,
    });

    // Mark anchor
    if (move == 4) {
      markAnchor(this.actor);
    }
    
    // mark expertise
    if (move >= 1 && move <= 3) {
      if (roll.result >= 1 && roll.result <= 3) {
        switchExpertise(true, this.actor);
      }
    }

    // Stress reduction
    if (move == 4 && (this.actor.system.anchor.missing || this.actor.system.anchor.taken)) {
      // don't reduce stress
    } else {
      // reduce stress
      if (roll.result == "6") {
        reduceStress(2, this.actor);
      } else {
        reduceStress(1, this.actor);
      }      
    }
  }
}
