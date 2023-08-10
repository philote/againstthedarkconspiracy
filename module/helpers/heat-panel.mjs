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

        let heatLevel = this._getConspiracyThreatLevel(this.currentHeat);

        return {
            ...data,
            currentHeat: this.currentHeat,
            heatTitle: 'HEAT',
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

        // Chat message
        const dialogData = {
            tempCH: tempCH,
            currentHeat: this.currentHeat,
            conspiracyThreatLevel: this._getConspiracyThreatLevel(this.currentHeat)
        }
        const template = 'systems/againstthedarkconspiracy/templates/msg/heat-increased-chat-msg.hbs';
        const rendered_html = await renderTemplate(template, dialogData);
    
        ChatMessage.create({
            content: rendered_html
        });
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

    _getConspiracyThreatLevel(heat) {
        if (heat >= 1 && heat <= 4) {
            return '<b style="color: #707000; font-size: 1.5em;">Suspicious</b>';
        } else if (heat >= 5 && heat <= 7) {
            return '<b style="color: #784e00; font-size: 1.5em;">Alarmed</b>';
        } else if (heat >= 8 && heat <= 9) {
            return '<b style="color: red; font-size: 1.5em;">Capture</b>';
        } else if (heat > 9) {
            return '<b style="color: purple; font-size: 1.5em;">Attack</b>';
        } else {
            return "";
        }
    }
}