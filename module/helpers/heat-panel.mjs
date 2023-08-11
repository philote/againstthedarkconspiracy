import { 
    createHeatChatMessage,
    getConspiracyThreatLevel 
} from "../helpers/rolls.mjs";
export class HeatPanel extends Application {

    constructor(options) {
        super(options);
        this.currentHeat = 0;
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
        
        if (savedCurrentHeat) {
            this.currentHeat = savedCurrentHeat;
        }

        let heatLevel = getConspiracyThreatLevel(this.currentHeat);

        return {
            ...data,
            currentHeat: this.currentHeat,
            heatTitle: game.i18n.localize("ATDC.dialog.heat.title"),
            heatLevel: heatLevel,
            max: 10,
            spokes: Array(10).keys()
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
        const tempCH = this.currentHeat
        this.currentHeat = Math.min(this.currentHeat + 1, 10);
        game.settings.set("againstthedarkconspiracy", "currentHeat", this.currentHeat);

        createHeatChatMessage(tempCH, this.currentHeat);
    }

    _onHeatDecrease(event) {
        event.preventDefault();
        this.currentHeat = Math.max(this.currentHeat - 1, 0);
        game.settings.set("againstthedarkconspiracy", "currentHeat", this.currentHeat);
    }


    _onClearHeat(event) {
        event.preventDefault();
        this.currentHeat = 0
        game.settings.set("againstthedarkconspiracy", "currentHeat", this.currentHeat);
    }
}