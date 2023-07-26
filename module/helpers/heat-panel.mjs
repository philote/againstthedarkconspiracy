export class HeatPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);
    clockSize = 10;

    constructor(options) {
        super(options);
        this.heat = {
            value: 0,
            max: this.clockSize,
            spokes: Array(this.clockSize).keys()
        };
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "heat-panel",
            popOut: false,
            template: "systems/againstthedarkconspiracy/templates/panel/heat-panel.html",
        };
    }

    /** @override */
    async getData(options) {
        const data = await super.getData(options);
        const savedHeat = game.settings.get("againstthedarkconspiracy", "heat");
        console.log("savedHeat: "+savedHeat);
        if (savedHeat) {
            this.heat = savedHeat;
        }
        return {
            ...data,
            options: {
                editable: game.user.isGM,
            },
            heat: this.heat
        };
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.on-click').click(this._onHeatIncrease.bind(this));
        html.find('.on-click').contextmenu(this._onHeatDecrease.bind(this));
    }

    _onHeatIncrease(event) {
        event.preventDefault();
        this.heat.value = Math.min(this.heat.value + 1, this.heat.max);
        game.settings.set("againstthedarkconspiracy", "heat", this.heat);
        console.log("Heat goes up! "+this.heat.value);
    }

    _onHeatDecrease(event) {
        event.preventDefault();
        this.heat.value = Math.max(this.heat.value - 1, 0);
        game.settings.set("againstthedarkconspiracy", "heat", this.heat);
        console.log("Heat goes down! "+this.heat.value);
    }
}