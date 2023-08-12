import { 
    createHeatChatMessage,
    getConspiracyThreatLevel 
} from "../helpers/rolls.mjs";
export class HeatPanel extends Application {

    constructor(options) {
        super(options);
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "heat-panel",
            popOut: false,
            template: "systems/againstthedarkconspiracy/templates/panel/heat-panel.hbs",
        };
    }

    /** @override */
    getData(options) {
        const data = super.getData(options);
        const savedCurrentHeat = game.settings.get("againstthedarkconspiracy", "currentHeat");

        return {
            ...data,
            currentHeat: savedCurrentHeat,
            heatTitle: game.i18n.localize("ATDC.dialog.heat.title"),
            heatLevel: getConspiracyThreatLevel(savedCurrentHeat),
            max: 10,
            spokes: Array(10).keys(),
            isGM: game.user.isGM
        };
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.on-click').click(this._onHeatIncrease.bind(this));
        html.find('.on-click').contextmenu(this._onHeatDecrease.bind(this));
        html.find('.on-click-clear').click(this._onClearHeat.bind(this));
    }

    async _onHeatIncrease(event) {
        event.preventDefault();
        createHeatChatMessage();
    }

    _onHeatDecrease(event) {
        event.preventDefault();
        let heat = game.settings.get("againstthedarkconspiracy", "currentHeat");
        heat = Math.max(heat - 1, 0);
        game.settings.set("againstthedarkconspiracy", "currentHeat", heat);
    }


    _onClearHeat(event) {
        event.preventDefault();
        game.settings.set("againstthedarkconspiracy", "currentHeat", 0);
    }
}