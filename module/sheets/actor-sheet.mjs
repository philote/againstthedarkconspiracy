/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AtDCActorSheet extends ActorSheet {
  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["atdc", "sheet", "actor"],
      template:
        "systems/againstthedarkconspiracy/templates/actor/actor-sheet.html",
      width: 720,
      height: 730,
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
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == "npc") {
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

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to gear.
      if (i.type === "gear") {
        gear.push(i);
      }
      // Append to features.
      else if (i.type === "contact") {
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
  _onClick(event) {
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
        case "toggle-intel": {
          this._onToggleIntel(dataset.pos);
          return;
        }
        case "investigate": {
          const move = 1;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "cover": {
          const move = 2;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "flee": {
          const move = 3;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "chase": {
          const move = 5;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "takeThemOut": {
          const move = 6;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "doSomethingElse": {
          const move = 4;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
          this.asyncActionDialog({ title, content, move });
          return;
        }
        case "harm": {
          const move = 7;
          const title = this._dialogTitle(move);
          const content = this._dialogContent(move);
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
    return this.actor.update({ ["system.stress.states"]: currentArray });
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
    return this.actor.update({ ["system.intel.states"]: currentArray });
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
      case 7:
        return `${game.i18n.localize("ATDC.actor.actions.harm.label")}`;
      case 4:
        return `${game.i18n.localize("ATDC.actor.actions.doSomethingElse.label")}`;
      default:
        console.error("Error: case not matched in _dialogTitle");
        return `error`;
    }
  }

  _seekReliefDialogTitle(moveNumber) {
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
      case 7: // harm
        return `
            <p>
                <b>If any Risk Die rolls equal to or greater than your highest roll</b>, you suffer a Harmful Consequence:
            </p>
            <form class="flexcol">
                <div class="form-group">
                    <input type="checkbox" id="baseDie" name="baseDie" checked>
                    <label for="baseDie">Roll 1d6 to find out how bad it is.</label>
                </div>
                <div class="form-group">
                    <input type="checkbox" id="stressDie" name="stressDie">
                    <label for="stressDie">Add your <b><span style="color: ${CONFIG.ATDC.riskDieColor}">Stress Die</span></b> if you are willing to take that risk</label>
                </div>
                <hr>
                <div>
                    <input type="radio" id="namelessPawn" name="rollBonus" value="3">
                    <label for="namelessPawn">+3 if they are nameless pawns</label>
                </div>
                <div>
                    <input type="radio" id="namelessPawnLeader" name="rollBonus" value="2">
                    <label for="namelessPawnLeader">+2 if they are the leader of nameless pawns</label>
                </div>
                <div>
                    <input type="radio" id="supernatural" name="rollBonus" value="-1">
                    <label for="supernatural">-1 if they are a Supernatural</label>
                </div>
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
        console.error("Error: case not matched in _getDiceForOutput");
        return `error`;
    }
  }

  _getMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
      case 1: {
        // Investigate
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return `you get the minimum amount of information you need to proceed and mark <b><i>${this._getWordHeatWithFormatting()}</b></i>`;
          case "4":
          case "5":
            return `you get the minimum needed to proceed and <b><i>Control will also answer 1 question</b></i>.`;
          case "6":
            return `you get the minimum needed to proceed and <b><i>Control will also answer 2 questions</b></i>, also <b><i>${this._getWordIntelWithFormatting()} increases</b></i> and <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>.`;
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
            return `you succeed brilliantly: <b><i>agree what extra benefit you get; ${this._getWordIntelWithFormatting()} increases;</b></i> and <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>.`;
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
            return `you succeed brilliantly: <b><i>agree what extra benefit you get; ${this._getWordIntelWithFormatting()} increases;</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
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
            return `you succeed brilliantly: <b><i>agree what extra benefit you get; ${this._getWordIntelWithFormatting()} increases;</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
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
            return `you succeed brilliantly: <b><i>agree what extra benefit you get; ${this._getWordIntelWithFormatting()} increases;</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.6)</span>`;
        }
      case 7: // Harm
        switch (maxDieNumber) {
          case 1:
          case 2:
          case 3:
            return `
                        The consequences are serious, say if:
                        <ul>
                            <li>It’s mortal. You<b><i>fill your ${this._getWordRiskWithFormatting()} track</i></b> and crack.</li>
                            <li>It’s bloody. You’ll <b><i>die after one more action</i></b> without medical treatment.</li>
                            <li>It’s painful. You <b><i>cannot use your Expertise</i></b> until you get medical treatment.</li>
                        </ul>
                        Medical treatment requires an Operator, who could be the one needing treatment, to mark a gear slot and declare a "Medical Kit".
                    `;
          case 4:
          case 5:
            return `You were lucky this time! It hurts, but you’ll live`;
          case 6:
          case 7:
          case 8:
          case 9:
            return `You were lucky this time! It hurts, but you’ll live, also <b><i>${this._getWordIntelWithFormatting()} increases</b></i> But that was close <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>.`;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.7)</span>`;
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
            return `you succeed brilliantly: <b><i>agree what extra benefit you get; ${this._getWordIntelWithFormatting()} increases  ;</i></b> and <b><i>roll for ${this._getWordRiskWithFormatting()}</i></b>.`;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.4)</span>`;
        }
    }
  }

  _chatContent(
    moveNumber,
    diceOutput,
    maxDieNumber,
    stressMessage,
    harmMessage
  ) {
    const moveName = this._dialogTitle(moveNumber);
    return `
        <p style="font-size: 1.5em;"><b>${moveName}</b> Result:</p>
        <p>${diceOutput}</p>
        <p>${this._getMaxDieMessage(moveNumber, maxDieNumber)}</p>
        ${stressMessage}
        ${harmMessage}
    `;
  }

  _seekReliefMaxDieMessage(moveNumber, maxDieNumber) {
    switch (moveNumber) {
      case 1: {
        // Behave Badly
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return `Your inadequacy is clear, they pity you. You can’t use your Expertise until ${this._getWordRiskWithFormatting()} goes up.`;
          case "4":
          case "5":
            return `
                    <b>If they are an Operator</b>, agree with them why and they take it so badly that <b><i>THEY roll for ${this._getWordRiskWithFormatting()}</i></b>.
                    </br>
                    <b>If they are an NPC, <i>mark ${this._getWordHeatWithFormatting()}</i></b> and agree how this draws the Conspiracy’s attention.
                    `;
          case "6":
            return `
                    <b>If they are an Operator</b>, agree with them why and they take it so badly & <b><i>THEY roll for ${this._getWordRiskWithFormatting()}</i></b>.
                    </br>
                    <b>If they are an NPC, <i>mark ${this._getWordHeatWithFormatting()}</i></b> and agree how this draws the Conspiracy’s attention.
                    </br></br>It was really worth it: reduce ${this._getWordRiskWithFormatting()} by an extra 1.
                    `;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.1)</span>`;
        }
      }
      case 2: // Indulge a Vice
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return `You’re ashamed of yourself & distracted. You can’t use your Expertise until ${this._getWordRiskWithFormatting()} goes up.`;
          case "4":
          case "5":
            return `<b><i>Mark ${this._getWordHeatWithFormatting()}</i></b> and agree how this draws the Conspiracy’s attention.`;
          case "6":
            return `
                        <b><i>Mark ${this._getWordHeatWithFormatting()}</i></b> and agree how this draws the Conspiracy’s attention.
                        </br></br>It was really worth it: reduce ${this._getWordRiskWithFormatting()} by an extra 1.
                    `;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.2)</span>`;
        }
      case 3: // Look for Guidance
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return `They see through your false contrition. You can’t use your Expertise until ${this._getWordRiskWithFormatting()} goes up.`;
          case "4":
          case "5":
            return `<b><i>Mark ${this._getWordHeatWithFormatting()}</i></b> and describe what they ask you to do to restore their belief in you and how this draws the attention of the Conspiracy to the team or makes things difficult for you. You cannot go back to them for support until you fulfil the obligation they have placed on you.`;
          case "6":
            return `
                        <b><i>Mark ${this._getWordHeatWithFormatting()}</i></b> and describe what they ask you to do to restore their belief in you and how this draws the attention of the Conspiracy to the team or makes things difficult for you. You cannot go back to them for support until you fulfil the obligation they have placed on you.
                        </br></br>It was really worth it: reduce ${this._getWordRiskWithFormatting()} by an extra 1.
                    `;
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
            return `<b><i>Mark your ${this._getWordAnchorWithFormatting()}</i></b>, placing them on the Conspiracy Target list, or Missing if they are already a Target. Only Control can mark Taken.`;
          case "6":
            return `
                        <b><i>Mark your ${this._getWordAnchorWithFormatting()}</i></b>, placing them on the Conspiracy Target list, or Missing if they are already a Target. Only Control can mark Taken.    
                        </br></br>It was really worth it: reduce ${this._getWordRiskWithFormatting()} by an extra 1.
                    `;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.4)</span>`;
        }
      case 5: // Reveal some of your history together
        switch (maxDieNumber) {
          case "1":
          case "2":
          case "3":
            return `
                        <b>EITHER</b> say why you feel bad about the event and you can’t use your Expertise until ${this._getWordRiskWithFormatting()} goes up; 
                        </br><b>OR</b> add something about your ${this._getWordAnchorWithFormatting()} to your recollection or its aftermath and <b><i>mark them</b></i>.
                    `;
          case "4":
          case "5":
            return `
                        The other Operator describes a different version or view of the same event. 
                        </br>They <b>EITHER</b> say why they are hurt by it and they <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>; 
                        </br><b>OR</b> they choose to add something about their ${this._getWordAnchorWithFormatting()} to their recollection or its aftermath and <b><i>they mark their ${this._getWordAnchorWithFormatting()}</b></i>.
                    `;
          case "6":
            return `
                        The other Operator describes a different version or view of the same event. 
                        </br>They <b>EITHER</b> say why they are hurt by it and they <b><i>roll for ${this._getWordRiskWithFormatting()}</b></i>; 
                        </br><b>OR</b> they choose to add something about their ${this._getWordAnchorWithFormatting()} to their recollection or its aftermath and <b><i>they mark their ${this._getWordAnchorWithFormatting()}</b></i>.
                        </br></br>It was really worth it; reduce ${this._getWordRiskWithFormatting()} by an extra 1.
                    `;
          default:
            return `<span style="color:#ff0000">ERROR(getMaxDieMessage.5)</span>`;
        }
      default:
        return `<span style="color:#ff0000">ERROR(getMaxDieMessage.default)</span>`;
    }
  }

  _seekReliefChatContent(moveNumber, diceOutput, maxDieNumber) {
    const moveName = this._seekReliefDialogTitle(moveNumber);
    return `
        <p style="font-size: 1.5em;"><b>${moveName}</b> ${game.i18n.localize("ATDC.actor.actions.chat.result.label")}</p>
        <p>${diceOutput}</p>
        <p>${this._seekReliefMaxDieMessage(moveNumber, maxDieNumber)}</p>
    `;
  }

  _stressChatContent(diceOutput, stressMessage, stressValMessage) {
    return `
        ${stressValMessage}
        <p>
            <span style="font-size: 1.5em;">
              <b>${game.i18n.localize("ATDC.actor.actions.stress.label")}</b> ${game.i18n.localize("ATDC.actor.actions.chat.result.label")} 
            </span> ${diceOutput}
        </p>
        <hr>
        <span style="font-size: 1.2em;">${stressMessage}</span>
    `;
  }

  _harmChatContent(
    moveNumber,
    diceOutput,
    maxDieNumber,
    stressMessage,
    bonusValue
  ) {
    const moveName = this._dialogTitle(moveNumber);
    return `
            <p style="font-size: 1.5em;"><b>${moveName}</b> ${game.i18n.localize("ATDC.actor.actions.chat.result.label")}</p>
            <p>${diceOutput}</p>
            <b>${game.i18n.localize("ATDC.actor.actions.chat.result.harm.modifier.label")}</b> ${bonusValue}
            </br>
            <b>${game.i18n.localize("ATDC.actor.actions.chat.result.harm.final.label")}</b> ${maxDieNumber}
            <hr>
            ${this._getMaxDieMessage(moveNumber, maxDieNumber)}
            ${stressMessage}
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
    return `<b style="color: ${CONFIG.ATDC.intelColor}">${game.i18n.localize(
      "ATDC.actor.actions.intel.colored"
    )}</b>`;
  }

  _getWordRiskWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.riskDieColor}">${game.i18n.localize(
      "ATDC.actor.actions.risk.colored"
    )}</b>`;
  }

  _getWordHeatWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.heatColor}">${game.i18n.localize(
      "ATDC.actor.actions.heat.colored"
    )}</b>`;
  }

  _getWordAnchorWithFormatting() {
    return `<b style="color: ${CONFIG.ATDC.anchorColor}">${game.i18n.localize(
      "ATDC.actor.actions.anchor.colored"
    )}</b>`;
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
                  this._increaseStressByOne();
                  stressMessage = this._stressMoveMessage();
                }

                // Build Dice list
                let diceOutput = "";
                dice.forEach((die) => {
                  diceOutput = diceOutput.concat(
                    this._getDiceForOutput(die.rollVal, die.dieColor),
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
                    harmMessage = this._harmMoveMessage();
                  }

                  // Build Threat Dice list
                  let threatDiceOutput = "";
                  threatDice.forEach((die) => {
                    threatDiceOutput = threatDiceOutput.concat(
                      this._getDiceForOutput(die.rollVal, die.dieColor),
                      " "
                    );
                  });

                  if (threatDiceOutput) {
                    diceOutput = `
                          ${diceOutput}</br></br><b style="font-size:1.2em">Risk Die:</b></br>${threatDiceOutput}
                      `;
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

                // Check if intel should increase
                if (maxDie.rollVal == "6") {
                  this._increaseIntelByOne();
                }

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
                  stressMessage = this._stressMoveMessage();
                  maxDie = stressDieR;
                } else {
                  maxDie = setOfMaxDice[0];
                }

                const maxDieModified = parseInt(maxDie.rollVal) + bonusValue;

                dice.forEach((die) => {
                  diceOutput = diceOutput.concat(
                    this._getDiceForOutput(die.rollVal, die.dieColor),
                    " "
                  );
                });

                // Initialize chat data.
                const chatContentMessage = this._harmChatContent(
                  move,
                  diceOutput,
                  maxDieModified,
                  stressMessage,
                  bonusValue
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

                // Check if intel should increase
                if (maxDieModified == 6) {
                  this._increaseIntelByOne();
                }

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
    if (game.user.character != null) {
      // BUG this is always zero!!
      stressVal = game.user.character.system.stress.value;
      console.log("game.user.character.system.stress.value: "+game.user.character.system.stress);

      if (stressVal != null) {
        if (maxDieModified > stressVal) {
          this._increaseStressByOne();
          stressMessage = `Your ${this._getWordRiskWithFormatting()} is increases by one!`;
        } else {
          stressMessage = "All good, this time...";
        }

        stressValMessage = `Your Current Stress is ${this._getWordRiskWithFormatting()} <b>${stressVal}</b>`;
      }
    } else {
      console.log("game.user.character is null");
    }

    dice.forEach((die) => {
      diceOutput = diceOutput.concat(
        this._getDiceForOutput(die.rollVal, die.dieColor),
        " "
      );
    });

    // BUG: current stress is always zero
    console.log("stressValMessage: "+stressValMessage);
    const dialogData = {
      diceOutput: diceOutput,
      stressMessage: stressMessage,
      stressValMessage: stressValMessage
    }
    const template = 'systems/againstthedarkconspiracy/templates/msg/stress-chat-content.hbs';
    const rendered_html = await renderTemplate(template, dialogData);

    ChatMessage.create({
      user:game.user_id,
      type:CONST.CHAT_MESSAGE_TYPES.ROLL,
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      rollMode: game.settings.get("core", "rollMode"),
      content: rendered_html
    });
  }

  async asyncSeekReliefRoll(move = 0) {
    const roll = await new Roll("1d6").evaluate({ async: true });
    const diceOutput = this._getDiceForOutput(
      roll.result,
      CONFIG.ATDC.baseDieColor
    );
    const chatContentMessage = this._seekReliefChatContent(
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
    // TODO wording update for chat
    if (move == 4) {
      this._markAnchor(true);
    }
    
    // mark expertise
    // TODO wording update for chat
    if (move >= 1 && move <= 3) {
      if (roll.result >= 1 && roll.result <= 3) {
        console.log("mark expertise");
        this._switchExpertise(true);
      }
    }

    // Stress reduction
    // TODO wording update for chat; plus get result texts to add to chat
    if (move == 4 && (this.actor.system.anchor.missing || this.actor.system.anchor.taken)) {
      // don't reduce stress
      // TODO solace should be disabled in this state in the future
    } else {
      // reduce stress
      if (roll.result == "6") {
        this._reduceStress(2);
      } else {
        this._reduceStress(1);
      }      
    }
  }

  /* TODO
    When expertise used
    - disable it in move popups
    - some visual thing on the expertise area on the char sheet

    moves
    - update wording for things that are now automated
      - especially stress stuff on a 6
    - create stress roll button in chats

    - if anchor missing or taken, disable the solace move
  */

  // TODO return text to put in the 
  _markAnchor() {
    const anchorName = this.actor.system.anchor.name;
    let target = this.actor.system.anchor.target;
    let missing = this.actor.system.anchor.missing;
    let taken = this.actor.system.anchor.taken;
    if (!target) {
      target = true;
      this.actor.update({ "system.anchor.target": target });
      console.log("Anchor target");
      return `${anchorName} has become a target of the conspiracy!`;
    } else if (!missing) {
      missing = true;
      this.actor.update({ "system.anchor.missing": missing });
      console.log("Anchor missing");
      return `${anchorName} has gone missing!`;
    } else if (!taken) {
      taken = true;
      this.actor.update({ "system.anchor.taken": taken });
      console.log("Anchor taken");
      return `${anchorName} has been taken!`;
    } else {
      console.log("Anchor already taken!");
      return `${anchorName} has already been taken, you nee to save them.`;
    }
  }

  _switchExpertise(toggle) {
    this.actor.system.expertise.expertiseUsed = toggle;
    this.actor.update({ "system.expertise.expertiseUsed": toggle });
  }

  _increaseStressByOne() {
    let newStress = duplicate(this.actor.system.stress.value);

    if (newStress < 6) {
      let currentArray = this.actor.system.stress.states;
      const firstPos = currentArray.indexOf(false);
      if (firstPos != -1) {
        currentArray[firstPos] = true;
        this.actor.update({ ["system.stress.states"]: currentArray });
      }
    }

    // update Stress
    ++newStress;
    this.actor.system.stress.value = newStress;
    this.actor.update({ "system.stress.value": newStress });
  }

  _reduceStress(amount = 1) {
    let newStress = duplicate(this.actor.system.stress.value);

    if (newStress > 0) {
      let currentArray = this.actor.system.stress.states;
      for (let i = 0; i < amount; i++) {
        const firstPos = currentArray.lastIndexOf(true);
        if (firstPos != -1) {
          currentArray[firstPos] = false;
          this.actor.update({ ["system.stress.states"]: currentArray });
        }
      }
    }

    // update Stress
    newStress = newStress - amount;
    this.actor.system.stress.value = newStress;
    this.actor.update({ "system.stress.value": newStress });
  }

  _increaseIntelByOne() {
    let newIntel = duplicate(this.actor.system.intel.value);

    if (newIntel < 6) {
      let currentArray = this.actor.system.intel.states;
      const isFalse = (element) => element === false;
      const firstPos = currentArray.findIndex(isFalse);
      currentArray[firstPos] = true;
      return this.actor.update({ ["system.intel.states"]: currentArray });
    }

    // update Intel
    ++newIntel;
    this.actor.system.intel.value = newIntel;
    this.actor.update({ "system.intel.value": newIntel });
  }
}
