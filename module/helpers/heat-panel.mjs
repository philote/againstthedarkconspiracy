export class HeatPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);

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
    async getData(options) {
        const data = await super.getData(options);
        const savedCurrentHeat = game.settings.get("againstthedarkconspiracy", "currentHeat");
        
        if (savedCurrentHeat) {
            this.currentHeat = savedCurrentHeat;
        }

        return {
            ...data,
            currentHeat: this.currentHeat,
            heatTitle: 'HEAT',
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

    _onHeatIncrease(event) {
        event.preventDefault();
        this.currentHeat = Math.min(this.currentHeat + 1, 10);
        game.settings.set("againstthedarkconspiracy", "currentHeat", this.currentHeat);
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