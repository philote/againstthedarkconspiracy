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
    systemData.expertise.workedFor.answer = game.i18n.localize(systemData.expertise.workedFor.options[systemData.expertise.workedFor.index].answer);
    systemData.expertise.specialism.answer = game.i18n.localize(systemData.expertise.specialism.options[systemData.expertise.specialism.index].answer);
    systemData.whyConfrontConspiracy.answer = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].answerMore);
    systemData.whyConfrontConspiracy.question = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].question);

    systemData.anchor.noSolace = (systemData.anchor.missing || systemData.anchor.taken);

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
    if (this.type == 'character') return; // TODO fixme
    // if ((actorData.type !== 'nameless') || (actorData.type !== 'named') || (actorData.type !== 'supernatural')) return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
    systemData.stress.value = systemData.stress.states.filter(Boolean).length;
  }
}