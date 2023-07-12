/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AtDCActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["atdc", "sheet", "actor"],
      template: "systems/againstthedarkconspiracy/templates/actor/actor-sheet.html",
      width: 720,
      height: 720,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "main" }]
    });
  }

  /** @override */
  get template() {
    return `systems/againstthedarkconspiracy/templates/actor/actor-${this.actor.type}-sheet.html`;
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
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
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
  _prepareCharacterData(context) {
    
  }

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

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === 'gear') {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === 'contact') {
        contact.push(i);
      }
    }

    // Assign and return
    context.gear = gear;
    context.contact = contact;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    html.find('.inline-edit-item').blur(this._onInlineEditItem.bind(this));
    html.find('.item-edit-checked').change(this._onInlineEditItem.bind(this));
    // html.find('.item-edit-checked').

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Clickable UI.
    html.find('.clickable').click(this._onClick.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }
  }

  _onInlineEditItem(e) {
    e.preventDefault();

    let el = e.currentTarget;
    let id = el.dataset.itemId;
    let field = el.dataset.field;
    let item = this.actor.items.get(id);

    // console.log("field "+field);
    // console.log("el.value "+el.value);
    // console.log("el.type "+el.type);

    if (el.type === "checkbox") {
      return item.update({[field]:el.checked })
    }

    return item.update({[field]:el.value});
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
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable events.
   * @param {Event} event   The originating click event
   * @private
   */
  _onClick(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      switch (dataset.rollType) {
        case 'toggle-stress': {
          this._onToggleStress(dataset.pos);
          return;
        }
        case 'toggle-intel': {
          this._onToggleIntel(dataset.pos);
          return;
        }
        case 'investigate': {
          const move = 1;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case 'cover': {
          const move = 2;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case 'flee': {
          const move = 3;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case 'chase': {
          const move = 5;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case 'takeThemOut': {
          const move = 6;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case 'harm': {}
        case 'stress': {}

        case 'behaveBadly': {}
        case 'indulgeVice': {}
        case 'seekSolace': {}
        case 'revealHistoryTogether': {}
        case 'seekRelief': {}
        default: {
          console.error("_onRoll, bad roll type.");
          return;
        }
      }
      // if (dataset.rollType == 'item') {
      //   const itemId = element.closest('.item').dataset.itemId;
      //   const item = this.actor.items.get(itemId);
      //   if (item) return item.roll();
      // }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

  _onToggleStress(pos) {
    let currentArray = this.actor.system.stress.states;
    let currentState = currentArray[pos];
    let newState = 0;

    if(currentState === false) {
        newState = true;
    } else {
        newState = false;
    }

    currentArray[pos] = newState;
    return this.actor.update({["system.stress.states"]:currentArray});
  }

  _onToggleIntel(pos) {
    let currentArray = this.actor.system.intel.states;
    let currentState = currentArray[pos];
    let newState = 0;

    if(currentState === false) {
        newState = true;
    } else {
        newState = false;
    }

    currentArray[pos] = newState;
    return this.actor.update({["system.intel.states"]:currentArray});
  }

  // ----------------------
  // Dice rolling functions
  // ----------------------

  _dialogTitle(moveNumber) {
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
        case 4:
        default:
            return `${game.i18n.localize("ATDC.actor.actions.default.label")}`;
    }
  }

  _dialogContent(moveNumber) {
    switch (moveNumber) {
        case 1: // Investigate
            return `
                <p>
                    <b>When you want to ask a question about someone, something or somewhere, or want Control to reveal something about the situation</b>, roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="baseDie" name="baseDie" checked>
                        <label for="baseDie">Always start with <b>1d6</b></label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="expertiseDie" name="expertiseDie">
                        <label for="expertiseDie">Add another 1d6 if your <b>Expertise</b> is relevant</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="stressDie" name="stressDie">
                        <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                    </div>
                </form>
                </br>
            `;
        case 2: // Maintain Your Cover
                return `
                    <p>
                        <b>When you are at risk of exposure, say how you brazen it out, avoid detection or hide from those who suspect you, or are looking for you</b>, roll:
                    </p>
                    <form class="flexcol">
                        <div class="form-group">
                            <input type="checkbox" id="baseDie" name="baseDie" checked>
                            <label for="baseDie">Always start with <b>1d6</b></label>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" id="expertiseDie" name="expertiseDie">
                            <label for="expertiseDie">Add another 1d6 if your <b>Expertise</b> is relevant</label>
                        </div>
                        <div class="form-group">
                            <input type="checkbox" id="stressDie" name="stressDie">
                            <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                        </div>
                    </form>
                    </br>
                `;
        case 3: // Flee For Your Life
            return `
                <p>
                    <b>When you want to escape your fate by leaving the scene and Control agrees there’s a reasonable route by which you could get away</b>, roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="baseDie" name="baseDie" checked>
                        <label for="baseDie">Always start with <b>1d6</b></label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="expertiseDie" name="expertiseDie">
                        <label for="expertiseDie">
                            Add your <b>Expertise Die</b> if… 
                            <ul>
                                <li><b>it’s a foot chase</b> & you have <b>Military Fieldcraft</b>.</li>
                                <li><b>you’re blending into a crowd</b> & you have <b>Tradecraft</b>, <b>Larceny</b> or <b>Disguise</b>.</li> 
                                <li><b>If it’s a vehicle chase</b> & you have <b>Vehicles</b> <i>(only you roll)</i>.</li>
                            </ul>
                        </label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="stressDie" name="stressDie">
                        <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                    </div>
                </form>
                </br>
            `;
        case 5: // Chase Them Down
            return `
                <p>
                    <b>When they are getting away and Control agrees there’s a reasonable way for you to catch them before they escape, and their Powers don’t make it impossible</b>, roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="baseDie" name="baseDie" checked>
                        <label for="baseDie">Always start with <b>1d6</b></label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="expertiseDie" name="expertiseDie">
                        <label for="expertiseDie">
                            Add your <b>Expertise Die</b> if… 
                            <ul>
                                <li><b>it’s a foot chase</b> & you have <b>Military Fieldcraft</b>.</li>
                                <li><b>they’re blending into a crowd</b> & you have <b>Tradecraft</b>, <b>Larceny</b> or <b>Surveillance</b>.</li> 
                                <li><b>If it’s a vehicle chase</b> & you have <b>Vehicles</b> <i>(only you roll)</i>.</li>
                            </ul>
                        </label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="stressDie" name="stressDie">
                        <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                    </div>
                </form>
                </br>
            `;
        case 6: // Take Them Out
            return `
                <p>
                    <b>If you fight or shoot at a threat or they attack
                    you, say what success looks like: Hurt them; Subdue them; Avoid their attempt to hurt you; Some other narrative outcome</b>, then roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="baseDie" name="baseDie" checked>
                        <label for="baseDie">Always start with <b>1d6</b></label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="expertiseDie" name="expertiseDie">
                        <label for="expertiseDie">Add your Expertise Die if <b>Small Arms</b> or <b>Hand-toHand</b> is relevant and it isn’t cancelled.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="bonusDie" name="bonusDie">
                        <label for="bonusDie">Add the <span style="color: ${CONFIG.ATDC.bonusDieColor}"><b>Bonus Die</b></span> if your weapon is <b>heavy</b> or <b>explode</b> or you have <b>Deadly</b>.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="stressDie" name="stressDie">
                        <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                    </div>
                    </br>
                    <p><b style="font-size: 20px;color: ${CONFIG.ATDC.takeThemOutDieColor}">Take Them Out Risk Dice</b></p>
                    <div class="form-group">
                        <input type="checkbox" id="threatHarmDie" name="threatHarmDie">
                        <label for="threatHarmDie"><b>If the threat is able to do you harm</b>, add 1 Risk Die to the dice pool.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="threatSupernaturalDie" name="threatSupernaturalDie">
                        <label for="threatSupernaturalDie"><b>If they are a Supernatural</b>, add a 2nd Risk Die.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="outnumberedDie" name="outnumberedDie">
                        <label for="outnumberedDie"><b>If you are outnumbered</b>, add another Risk Die.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="weaponDie" name="weaponDie">
                        <label for="weaponDie"><b>If their weapon is heavy or explode</b>, add another Risk Die.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="SupernaturalPowersDie1" name="SupernaturalPowersDie1">
                        <input type="checkbox" id="SupernaturalPowersDie2" name="SupernaturalPowersDie2">
                        <input type="checkbox" id="SupernaturalPowersDie3" name="SupernaturalPowersDie3">
                        <input type="checkbox" id="SupernaturalPowersDie4" name="SupernaturalPowersDie4">
                        <label for="SupernaturalPowersDie1">If they have Powers, add another Risk Die per relevant Power.</label>
                    </div>
                    <p><i>Maximum number of Risk Dice added = 5.</i></p>
                </form>
                </br>
            `;
        case 4: // Do Something Else
        default:
            return `
                <p>
                    <b>When you do something that isn't covered by another move</b>, say what success looks like and roll:
                </p>
                <form class="flexcol">
                    <div class="form-group">
                        <input type="checkbox" id="baseDie" name="baseDie" checked>
                        <label for="baseDie">Always start with 1d6</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="expertiseDie" name="expertiseDie">
                        <label for="expertiseDie">Add another 1d6 if your <b>Expertise</b> is relevant.</label>
                    </div>
                    <div class="form-group">
                        <input type="checkbox" id="stressDie" name="stressDie">
                        <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                    </div>
                </form>
                </br>
            `;
    }
  }

  _getDiceForOutput(dieNumber, colorHex) {
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
        console.error(game.i18n.localize("ATDC.roll.error.getDiceForOutput"));
    }
  }

  _getMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
        case 1: { // Investigate
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `you get the minimum amount of information you need to proceed and mark <b><i>${this._getWordHeatWithFormatting()}</b></i>`;
                case "4":
                case "5":
                    return `you get the minimum needed to proceed and <b><i>Control will also answer 1 question</b></i>.`;
                case "6":
                    return `you get the minimum needed to proceed and <b><i>Control will also answer 2 questions</b></i>, also <b><i>mark ${this._getWordIntelWithFormatting()}</b></i> and <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
            }
        }
        case 2: // Maintain Your Cover
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `you’re blown! Choose to either <b><i>get caught</b></i> or <b><i>mark ${this._getWordHeatWithFormatting()}</b></i> and <b><i>flee for your life</b></i>.`;
                case "4":
                case "5":
                    return `your cover holds, or they don’t find you.`;
                case "6":
                    return `you succeed brilliantly: <b><i>agree what extra benefit you get; mark ${this._getWordIntelWithFormatting()};</b></i> and <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
            }
        case 3: // Flee For Your Life
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `you’re in trouble! Choose to either <b><i>get caught</b></i> or <b><i>agree with Control who or what gets left behind</b></i> and <b><i>mark ${this._getWordHeatWithFormatting()}</b></i> and <b><i>flee for your life</b></i>, again.`;
                case "4":
                case "5":
                    return `you get away clean unless Control chooses to spend ${this._getWordHeatWithFormatting()} to maintain the pursuit and forces you to <b><i>flee for your life</b></i>, again.`;
                case "6":
                    return `you succeed brilliantly: <b><i>agree what extra benefit you get; mark ${this._getWordIntelWithFormatting()};</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.3)</span>`;
            }
        case 5: // Chase Them Down
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `Dammit, they’re fast! Choose to either <b><i>let them get away</i></b> or <b><i>agree with Control the practical cost of staying in the race</i></b> and <b><i>mark ${this._getWordHeatWithFormatting()}</i></b> and <b><i>chase them down again</i></b>.`;
                case "4":
                case "5":
                    return `you catch them unless Control chooses to spend ${this._getWordHeatWithFormatting()} to impede you and force you to <b><i>chase them down</i></b>, again.`;
                case "6":
                    return `you succeed brilliantly: <b><i>agree what extra benefit you get; mark ${this._getWordIntelWithFormatting()};</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.5)</span>`;
            }
        case 6: // Take Them Out
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `you <b><i>fail</i></b>, or <b><i>succeed at a cost</i></b>, but always <b><i>mark ${this._getWordHeatWithFormatting()}</i></b>.`;
                case "4":
                case "5":
                    return `you succeed with no obvious complication or benefit`;
                case "6":
                    return `you succeed brilliantly: <b><i>agree what extra benefit you get; mark ${this._getWordIntelWithFormatting()};</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.6)</span>`;
            }
        case 4: // Do Something Else
        default:
            switch (maxDieNumber) {
                case "1":
                case "2":
                case "3":
                    return `you either fail or <b><i>Control may offer you success at a cost</i></b>, but always <b><i>mark ${this._getWordHeatWithFormatting()}</i></b>.`;
                case "4":
                case "5":
                    return `you succeed with no obvious complication or benefit.`;
                case "6":
                    return `you succeed brilliantly: <b><i>agree what extra benefit you get; mark ${this._getWordIntelWithFormatting()};</i></b> and <b><i>roll for  ${this._getWordRiskWithFormatting()}</i></b>.`;
                default:
                    return `<span style="color:#ff0000">ERROR(getMaxDieMessage.4)</span>`;
            }
    }
  }

  _chatContent(moveNumber, diceOutput, maxDieNumber, stressMessage, harmMessage) {
    const moveName = this._dialogTitle(moveNumber);
    return `
        <p style="font-size: 1.5em;"><b>${moveName}</b> Result:</p>
        <p>${diceOutput}</p>
        <p>${this._getMaxDieMessage(moveNumber, maxDieNumber)}</p>
        ${stressMessage}
        ${harmMessage}
    `;
  }
  
  _harmMoveMessage() {
    return `
      <hr>
      <div style="font-size: 18px">
          <b>You suffer a <i>Harmful Consequence</i>!</b>
          </br><i style="color: ${CONFIG.ATDC.takeThemOutDieColor}">Roll for Harm</i> to find out how bad it is.
      <div>
    `;
  }

  _getWordIntelWithFormatting() {
    return `<span style="color: ${CONFIG.ATDC.intelColor}">${game.i18n.localize("ATDC.actor.actions.intel.colored")}</span>`;
  }
  
  _getWordRiskWithFormatting() {
    return `<span style="color: ${CONFIG.ATDC.riskDieColor}">${game.i18n.localize("ATDC.actor.actions.risk.colored")}</span>`;
  }
  
  _getWordHeatWithFormatting() {
    return `<span style="color: ${CONFIG.ATDC.heatColor}">${game.i18n.localize("ATDC.actor.actions.heat.colored")}</span>`;
  }

  _stressMoveMessage() {
    return `
      <hr>
      <div style="font-size: 18px">
          <b>The situation causes you ${this._getWordRiskWithFormatting()}, increase your ${this._getWordRiskWithFormatting()} by one!</b>
          </br><i style="font-size: 12px">(Do not roll for ${this._getWordRiskWithFormatting()} if prompted by the move.)</i>
      <div>
    `;
  }

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
                  let hdRoll = await new Roll('1d6').evaluate({ async: true });
                  dice.push({
                      dieColor: CONFIG.ATDC.baseDieColor,
                      isStress: false,
                      isRisk: false,
                      rollVal: hdRoll.result
                  });
              }

              if (document.getElementById("expertiseDie").checked) {
                  let odRoll = await new Roll('1d6').evaluate({ async: true });
                  dice.push({
                      dieColor: CONFIG.ATDC.baseDieColor,
                      isStress: false,
                      isRisk: false,
                      rollVal: odRoll.result
                  });
              };

              if (document.getElementById("stressDie").checked) {
                  let idRoll = await new Roll('1d6').evaluate({ async: true });
                  dice.push({
                      dieColor: CONFIG.ATDC.riskDieColor,
                      isStress: true,
                      isRisk: false,
                      rollVal: idRoll.result
                  });
              };
              
              if (document.getElementById("bonusDie") != null) {
                  if (document.getElementById("bonusDie").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      dice.push({
                          dieColor: CONFIG.ATDC.bonusDieColor,
                          isStress: false,
                          isRisk: false,
                          rollVal: idRoll.result
                      });
                  }
              }


              // Take them out Die
              const threatDice = [];

              if (document.getElementById("threatHarmDie") != null) {
                  if (document.getElementById("threatHarmDie").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }
              
              if (document.getElementById("threatSupernaturalDie") != null) {
                  if (document.getElementById("threatSupernaturalDie").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("outnumberedDie") != null) {
                  if (document.getElementById("outnumberedDie").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("weaponDie") != null) {
                  if (document.getElementById("weaponDie").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("SupernaturalPowersDie1") != null) {
                  if (document.getElementById("SupernaturalPowersDie1").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("SupernaturalPowersDie2") != null) {
                  if (document.getElementById("SupernaturalPowersDie2").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("SupernaturalPowersDie3") != null) {
                  if (document.getElementById("SupernaturalPowersDie3").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              if (document.getElementById("SupernaturalPowersDie4") != null) {
                  if (document.getElementById("SupernaturalPowersDie4").checked) {
                      let idRoll = await new Roll('1d6').evaluate({ async: true });
                      threatDice.push({
                          dieColor: CONFIG.ATDC.takeThemOutDieColor,
                          isStress: false,
                          isRisk: true,
                          rollVal: idRoll.result
                      });
                  }
              }

              // -----------------

              const maxDie = dice.reduce((a, b) => (a.rollVal > b.rollVal) ? a : b);

              // Determine if the stress die won
              let isStressDie = false;
              dice.every(die => {
                  if ((die.rollVal == maxDie.rollVal) && die.isStress) {
                      isStressDie = true;
                      return false;
                  }
                  return true;
              });

              let stressMessage = "";
              if (isStressDie) {
                  stressMessage = this._stressMoveMessage();
              }

              // Build Dice list
              let diceOutput = "";
              dice.forEach(die => {
                  diceOutput = diceOutput.concat(this._getDiceForOutput(die.rollVal, die.dieColor), " ");
              });


              // threatDice
              let harmMessage = "";
              if (threatDice.length > 0) {
                  const maxThreatDie = threatDice.reduce((a, b) => (a.rollVal > b.rollVal) ? a : b);
                  
                  if (maxThreatDie.rollVal >= maxDie.rollVal) {
                      harmMessage = this._harmMoveMessage();
                  }

                  // Build Threat Dice list
                  let threatDiceOutput = "";
                  threatDice.forEach(die => {
                      threatDiceOutput = threatDiceOutput.concat(this._getDiceForOutput(die.rollVal, die.dieColor), " ");
                  });
                  
                  if (threatDiceOutput) {
                      diceOutput = 
                      `
                          ${diceOutput}</br></br><b style="font-size:1.2em">Risk Die:</b></br>${threatDiceOutput}
                      `
                  }
              }

              // Initialize chat data.
              const chatContentMessage = this._chatContent(
                move,
                diceOutput,
                maxDie.rollVal,
                stressMessage,
                harmMessage
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

}
