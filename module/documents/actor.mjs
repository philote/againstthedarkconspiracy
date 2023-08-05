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
    if (this.type == 'character') return; // TODO fixme
    // if ((actorData.type !== 'nameless') || (actorData.type !== 'named') || (actorData.type !== 'supernatural')) return;

    // Make modifications to data here. For example:
    const systemData = actorData.system;

    const conspiracyTypeKey = game.settings.get('againstthedarkconspiracy', 'conspiracyType')
    systemData.conspiracyType = this._getConspiracyName(conspiracyTypeKey);
    systemData.types = this._setupNPCConspiracySubtypes(conspiracyTypeKey);
    systemData.stress.value = systemData.stress.states.filter(Boolean).length;
  }

  _setupNPCConspiracySubtypes(conspiracyType) {
    switch (conspiracyType) {
      case 'vampires': {
        return [
          {
            "typeName": "Vampiric Servitor",
            "subtypes": [
              "Ghoul",
              "Thrall",
              "Shade",
              "Zombie"
            ]
          },
          {
            "typeName": "Vampire",
            "subtypes": [
              "Young Vampire",
              "Old Vampire",
              "Ancient Vampire"
            ]
          },
        ];
      }
      case 'demons': {
        return [
          {
            "typeName": "Demonic Servitor",
            "subtypes": [
              "Demonic Spirit",
              "Grand Wizard",
              "Imp"
            ]
          },
          {
            "typeName": "Demons",
            "subtypes": [
              "Demonic Foot-soldier",
              "Hellish Nobility",
              "Favored of Lucifer"
            ]
          },
        ];
      }
      case 'fae': {
        return [
          {
            "typeName": "Fae Servitor",
            "subtypes": [
              "Elementals",
              "Redcaps",
              "Werewolves"
            ]
          },
          {
            "typeName": "Noble Fae",
            "subtypes": [
              "Fae Courtier",
              "Fae Knight",
              "Fae Crown"
            ]
          },
        ];
      }
      default: {
        return "default!"
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