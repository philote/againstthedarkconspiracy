export class ClockPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);

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
        const savedClock = game.settings.get("global-progress-clocks", "heatClock");
        return {
            ...data,
            editable: game.user.isGM,
            verticalEdge: "top",
            clock: savedClock,
        };
    }

    activateListeners($html) {
        $html.find(".clock").on("click", (event) => {

            const savedClock = game.settings.get("global-progress-clocks", "heatClock");
            if (!savedClock) return;

            savedClock.value = Math.min(savedClock.value + 1, savedClock.max);
            game.settings.set("global-progress-clocks", "heatClock", savedClock);
        });

        $html.find(".clock").on("contextmenu", (event) => {
            const savedClock = game.settings.get("global-progress-clocks", "heatClock");
            if (!savedClock) return;

            savedClock.value = Math.max(savedClock.value - 1, 0);
            game.settings.set("global-progress-clocks", "heatClock", savedClock);
        });
    }
}