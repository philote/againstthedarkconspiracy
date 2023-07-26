export class ClockPanel extends Application {
    
    constructor(options) {
        super(options)
    }

    static get defaultOptions() {
        return {
            ...super.defaultOptions,
            id: "clock-panel",
            popOut: false,
            template: "systems/againstthedarkconspiracy/templates/panel/heat-panel.hbs",
        };
    }

    async getData(options) {
        const data = await super.getData(options);
        return {
            ...data
        };
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.test').click(this._onRoll.bind(this));
        // html.find(".test").on("click", (event) => {
        //     console.error("Click");
        // })
    }

    _onRoll(event) {
        event.preventDefault();
        console.error("Click");
    }
}