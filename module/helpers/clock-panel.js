export class ClockPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);
    // lastRendered = [];

    constructor(clock, options) {
        super(options)
        this.clock = clock;
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
        const clock = this.clock
        return {
            ...data,
            options: {
                editable: game.user.isGM,
            },
            verticalEdge: "top",
            clock: clock,
        };
    }

    activateListeners($html) {
        // Fade in all new rendered clocks
        // const rendered = [...$html.get(0).querySelectorAll("[data-id]")].map((el) => el.dataset.id);
        // const newlyRendered = rendered.filter((r) => !this.lastRendered.includes(r));
        // for (const newId of newlyRendered) {
        //     gsap.fromTo($html.find(`[data-id=${newId}]`), { opacity: 0 }, { opacity: 1, duration: 0.25 });
        // }

        // Update the last rendered list (to get ready for next cycle)
        // this.lastRendered = rendered;

        // $html.find(".clock").on("click", (event) => {
        //     const clockId = event.target.closest("heat-clock").dataset.id;
        //     const clock = this.db.get(clockId);
        //     if (!clock) return;

        //     clock.value = Math.min(clock.value + 1, clock.max);
        //     this.db.update(clock);
        // });

        // $html.find(".clock").on("contextmenu", (event) => {
        //     const clockId = event.target.closest("[data-id]").dataset.id;
        //     const clock = this.db.get(clockId);
        //     if (!clock) return;

        //     clock.value = Math.max(clock.value - 1, 0);
        //     this.db.update(clock);
        // });
    }
}