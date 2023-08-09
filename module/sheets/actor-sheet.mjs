import {
  dialogTitle,
  dialogContent,
  asyncActionDialog,
  asyncHarmDialog,
  asyncStressRoll,
  asyncSeekReliefRoll,
} from "../helpers/rolls.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class AtDCActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    let width = 720;
    let height = 740;
    if (this.actor.type == "nameless") {
      height = 450;
    } else if (this.actor.type == "named") {
      height = 570;
    } else if (this.actor.type == "supernatural") {
      height = 650;
    } else if (this.actor.type == "safeHouse") {
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
    const context = super.getData();

    const actorData = this.actor.toObject(false);

    context.system = actorData.system;
    
    // Prepare character data and items.
    if (actorData.type == "character") {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type != "character") {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   * @param {Object} actorData The actor to prepare.
   * @return {undefined}
   */
  _prepareCharacterData(context) {}

  /**
   * Organize and classify Items for Character sheets.
   * @param {Object} actorData The actor to prepare.
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
    const npcType = dataset.npcType;

    switch (npcType) {
      case "nameless": {
        switch (choice) {
          case "0":
          case "1": {
            this._setStressMax(1, 1);
            return;
          }
          case "2":
          case "3": {
            this._setStressMax(2, 2);
            return;
          }
        }
        return;
      }
      case "supernatural": {
        switch (choice) {
          case "0": {
            this._setStressMax(4, 5);
            return;
          }
          case "1": {
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
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "cover": {
          const move = 2;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "flee": {
          const move = 3;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "chase": {
          const move = 5;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "takeThemOut": {
          const move = 6;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "doSomethingElse": {
          const move = 4;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncActionDialog({ title, content, move, actor });
          return;
        }
        case "harm": {
          const move = 7;
          const title = dialogTitle(move);
          const content = await dialogContent(move, this.actor);
          const actor = this.actor;
          asyncHarmDialog({ title, content, move, actor });
          return;
        }
        case "stress": {
          asyncStressRoll(this.actor);
          return;
        }
        case "behaveBadly": {
          asyncSeekReliefRoll(1, this.actor);
          return;
        }
        case "indulgeVice": {
          asyncSeekReliefRoll(2, this.actor);
          return;
        }
        case "seekGuidance": {
          asyncSeekReliefRoll(3, this.actor);
          return;
        }
        case "seekSolace": {
          asyncSeekReliefRoll(4, this.actor);
          return;
        }
        case "revealHistoryTogether": {
          asyncSeekReliefRoll(5, this.actor);
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
}
