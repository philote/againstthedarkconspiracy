/**
 * Extend the base Actor document by defining a custom roll data structure which is ideal for the Simple system.
 * @extends {Actor}
 */
export class AtDCActor extends Actor {

  /** @override */
  prepareData() {
    // Prepare data for the actor. Calling the super version of this executes
    // the following, in order: data reset (to clear active effects),
    // prepareBaseData(), prepareEmbeddedDocuments() (including active effects),
    // prepareDerivedData().
    super.prepareData();
  }

  /** @override */
  prepareBaseData() {
    // Data modifications in this step occur before processing embedded
    // documents or derived data.
  }

  /**
   * @override
   * Augment the basic actor data with additional dynamic data. Typically,
   * you'll want to handle most of your calculated/derived data in this step.
   * Data calculated in this step should generally not exist in template.json
   * (such as ability modifiers rather than ability scores) and should be
   * available both inside and outside of character sheets (such as if an actor
   * is queried and has a roll executed directly from it).
   */
  prepareDerivedData() {
    const actorData = this;
    // const systemData = actorData.system;

    // Make separate methods for each Actor type (character, npc, etc.) to keep
    // things organized.
    this._prepareCharacterData(actorData);
    this._prepareNpcData(actorData);
  }

  /**
   * Prepare Character type specific data
   */
  _prepareCharacterData(actorData) {
    if (actorData.type !== 'character') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    // update Stress and Intel so they can be used as token resources
    systemData.stress.value = systemData.stress.states.filter(Boolean).length;
    systemData.intel.value = systemData.intel.states.filter(Boolean).length;
    console.log("systemData.stress.value: "+systemData.stress.value);
    systemData.expertise.workedFor.answer = game.i18n.localize(systemData.expertise.workedFor.options[systemData.expertise.workedFor.index].answer);
    systemData.expertise.specialism.answer = game.i18n.localize(systemData.expertise.specialism.options[systemData.expertise.specialism.index].answer);
    systemData.whyConfrontConspiracy.answer = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].answerMore);
    systemData.whyConfrontConspiracy.question = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].question);

    // Load & Gear helpers
    if (systemData.load.light) {
      systemData.load.medDisabled = false;
    } else {
      systemData.load.medDisabled = true;
    }

    if ((systemData.load.light && systemData.load.medium)) {
      systemData.load.hvyDisabled = false;
      systemData.load.medGearDisabled = false;
    } else {
      systemData.load.hvyDisabled = true;
      systemData.load.medGearDisabled = true;
    }
 
    if ((systemData.load.light && systemData.load.medium && systemData.load.heavy)) {
      systemData.load.hvyGearDisabled = false;
    } else {
      systemData.load.hvyGearDisabled = true;
    }
  }

  /**
   * Prepare NPC type specific data.
   */
  _prepareNpcData(actorData) {
    if (actorData.type !== 'npc') return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    // systemData.xp = (systemData.cr * systemData.cr) * 100;
  }

  /**
   * Override getRollData() that's supplied to rolls.
   */
  getRollData() {
    const data = super.getRollData();

    // Prepare character roll data.
    this._getCharacterRollData(data);
    this._getNpcRollData(data);

    return data;
  }

  /**
   * Prepare character roll data.
   */
  _getCharacterRollData(data) {
    if (this.type !== 'character') return;
  }

  /**
   * Prepare NPC roll data.
   */
  _getNpcRollData(data) {
    if (this.type !== 'npc') return;

    // Process additional NPC data here.
  }

}