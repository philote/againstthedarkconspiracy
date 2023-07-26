export class HeatPanel extends Application {

    constructor(options) {
        super(options);
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
    // async getData(options) {
    //     const data = await super.getData(options);
    //     return {
    //         ...data
    //     };
    // }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        html.find('.on-click').click(this._onUpdate.bind(this));
    }

    _onUpdate(event) {
        event.preventDefault();
        console.error("Click!");
    }
}