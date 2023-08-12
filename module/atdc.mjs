// Import document classes.
import { AtDCActor } from "./documents/actor.mjs";
import { AtDCItem } from "./documents/item.mjs";
// Import sheet classes.
import { AtDCActorSheet } from "./sheets/actor-sheet.mjs";
import { AtDCItemSheet } from "./sheets/item-sheet.mjs";
// Import helper/utility classes and constants.
import { preloadHandlebarsTemplates } from "./helpers/templates.mjs";
import { ATDC } from "./helpers/config.mjs";
import { HeatPanel } from "./helpers/heat-panel.mjs";
import { registerSettings } from "./helpers/settings.mjs";
import * as Chat from "./helpers/chat.mjs";

/* -------------------------------------------- */
/*  Init Hook                                   */
/* -------------------------------------------- */

Hooks.once("init", () => {
  // Add utility classes to the global game object so that they're more easily
  // accessible in global contexts.
  game.atdc = {
    AtDCActor,
    AtDCItem,
    registerSettings,
  };

  // Add custom constants for configuration.
  CONFIG.ATDC = ATDC;

  // Define custom Document classes
  CONFIG.Actor.documentClass = AtDCActor;
  CONFIG.Item.documentClass = AtDCItem;

  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("atdc", AtDCActorSheet, { makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("atdc", AtDCItemSheet, { makeDefault: true });

  // Register system settings
  registerSettings();

  // Preload Handlebars templates.
  return preloadHandlebarsTemplates();
});

Hooks.once("ready", () => {
  // Heat
  ui.heatPanel = new HeatPanel();
  ui.heatPanel.render(true);

  Hooks.on('renderChatMessage', (chatMessage, html, messageData) => {
    const data = chatMessage.getFlag('againstthedarkconspiracy', 'data');
    if (data == undefined) return;
    const cssFlag = data.css;
    if (cssFlag) {
      html.addClass(cssFlag);
    }

    if (!game.user.isGM) return; // TODO what should we do if not the GM?

    const heatUpdate = data.heatUpdate;
    const heat = data.heat;
    if (heatUpdate && (heat >= 0 && heat <= 10)) {
      game.settings.set("againstthedarkconspiracy", "currentHeat", heat);
    }
  });
});



Hooks.on("preCreateActor", (actor) => {
  if (actor.type == 'safeHouse') {
    actor.updateSource({
      "img": 'systems/againstthedarkconspiracy/assets/actors/safe-house.svg'
    });
  }
});

Hooks.on('renderChatLog', (app, html, data) => Chat.addChatListeners(html));

/* -------------------------------------------- */
/*  Handlebars Helpers                          */
/* -------------------------------------------- */

// If you need to add Handlebars helpers, here are a few useful examples:
Handlebars.registerHelper("concat", function () {
  var outStr = "";
  for (var arg in arguments) {
    if (typeof arguments[arg] != "object") {
      outStr += arguments[arg];
    }
  }
  return outStr;
});

Handlebars.registerHelper("toLowerCase", function (str) {
  return str.toLowerCase();
});

Handlebars.registerHelper("getSetting", function(arg) {
  if (arg == "" || arg == "non" || arg == undefined) { return ; }
  return game.settings.get('againstthedarkconspiracy', arg);
});