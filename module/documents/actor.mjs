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

    systemData.expertise.workedFor.tempQuestions = systemData.expertise.workedFor.options.map((x) => x.question);
    systemData.expertise.workedFor.answer = game.i18n.localize(systemData.expertise.workedFor.options[systemData.expertise.workedFor.index].answer);
    systemData.expertise.specialism.tempQuestions = systemData.expertise.specialism.options.map((x) => x.question);
    systemData.expertise.specialism.answer = game.i18n.localize(systemData.expertise.specialism.options[systemData.expertise.specialism.index].answer);
    
    systemData.whyConfrontConspiracy.tempAnswers = systemData.whyConfrontConspiracy.options.map((x) => x.answer);
    
    systemData.whyConfrontConspiracy.answer = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].answerMore);
    systemData.whyConfrontConspiracy.question = game.i18n.localize(systemData.whyConfrontConspiracy.options[systemData.whyConfrontConspiracy.index].question);

    systemData.anchor.noSolace = (systemData.anchor.missing || systemData.anchor.taken);

    systemData.conspiracyType = this._getConspiracyName();

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
    if (this.type == 'character') return;
    
    // Make modifications to data here. For example:
    const systemData = actorData.system;
    
    if (this.type == 'supernatural') {
      const conspiracyTypeKey = game.settings.get('againstthedarkconspiracy', 'conspiracyType')
      systemData.conspiracyType = this._getConspiracyName(conspiracyTypeKey);

      systemData.type.options = this._getTypeOptionsFor(conspiracyTypeKey);
      if (systemData.type.index == 0) {systemData.type.index = '0'};
      systemData.subType.options = this._getSubtypeOptionsFor(conspiracyTypeKey, systemData.type.index);
    }
    
    if (this.type != 'safeHouse') {
      systemData.stress.value = systemData.stress.states.filter(Boolean).length;
    }
  }

  _getTypeOptionsFor(conspiracyType) {
    switch (conspiracyType) {
      case 'vampires': {
        return [
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.servitor.label'), 
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.full.label')
        ];
      }
      case 'demons': {
        return [
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.servitor.label'), 
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.full.label')
        ];
      }
      case 'fae': {
        return [
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.servitor.label'), 
          game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.full.label')
        ];
      }
      default: {
        console.error(`_getTypeOptionsFor failed`);
      }
    }
  }

  _getSubtypeOptionsFor(conspiracyTypeKey ,typeIndex) {
    switch (conspiracyTypeKey) {
      case 'vampires': {
        switch (typeIndex) {
          case '0': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.servitor.subtypes.ghoul.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.servitor.subtypes.thrall.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.servitor.subtypes.shade.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.servitor.subtypes.zombie.label')
            ];
          }
          case '1': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.full.subtypes.young.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.full.subtypes.old.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.vampire.type.full.subtypes.ancient.label')
            ];
          }
          default: {
            console.error(`_getSubtypeOptionsFor:vampires failed`);
          }
        }
      }
      case 'demons': {
        switch (typeIndex) {
          case '0': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.servitor.subtypes.spirit.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.servitor.subtypes.wizard.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.servitor.subtypes.imp.label')
            ];
          }
          case '1': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.full.subtypes.soldier.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.full.subtypes.nobility.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.demonic.type.full.subtypes.favored.label')
            ];
          }
          default: {
            console.error(`_getSubtypeOptionsFor:demons failed`);
          }
        }
      }
      case 'fae': {
        switch (typeIndex) {
          case '0': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.servitor.subtypes.elemental.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.servitor.subtypes.redcap.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.servitor.subtypes.werewolf.label')
            ];
          }
          case '1': {
            return [
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.full.subtypes.courtier.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.full.subtypes.knight.label'),
              game.i18n.localize('ATDC.npc.supernatural.conspiracy_types.fae.type.full.subtypes.crown.label'),
            ];
          }
          default: {
            console.error(`_getSubtypeOptionsFor:fae failed`);
          }
        }
      }
      default: {
        console.error(`_getSubtypeOptionsFor failed`);
      }
    }
  }

  _getConspiracyName(conspiracyTypeKey) {
    switch (conspiracyTypeKey) {
      case 'vampires': {
        return game.i18n.localize("ATDC.settings.conspiracyType.choices.vampires.label");
      }
      case 'demons': {
        return game.i18n.localize("ATDC.settings.conspiracyType.choices.demons.label");
      }
      case 'fae': {
        return game.i18n.localize("ATDC.settings.conspiracyType.choices.fae.label");
      }
    }
  }
}