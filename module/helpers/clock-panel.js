export class ClockPanel extends Application {
    refresh = foundry.utils.debounce(this.render, 100);

    constructor(options) {
        super(options)
        this.clock = {
            value: 0,
            max: 10,
            name: "HEAT",
            id: "clock-panel" ,
            spokes: Array(10).keys()
        }
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
        console.log("LOG --getData.this.clock.value: "+this.clock.value);
        return {
            ...data,
            editable: game.user.isGM,
            clock: this.clock,
        };
    }

    // refresh() {
    //     console.log("LOG -- refresh()");
    //     const savedClock = game.settings.get("againstthedarkconspiracy", "heat");
    //     if (!savedClock) {
    //         game.settings.set("againstthedarkconspiracy", "heat", this.clock);
    //     } else {
    //         this.clock = savedClock;
    //     }

    //     if (canvas.ready) {
    //         window.clockPanel.render(true);
    //     }
    // }

    activateListeners($html) {
        $html.find(".clock").on("click", (event) => {
            console.error("Click");
        })
        
        // $html.find(".clock").on("click", (event) => {
        //     console.error("CLICK!");
        // });

        // $html.find(".clock").on("click", (event) => {
            
        //     console.log("LOG --click this.clock.value: "+this.clock.value);

        //     this.clock.value = Math.min(this.clock.value + 1, this.clock.max);
        //     game.settings.set("againstthedarkconspiracy", "heat", this.clock);
        // });

        // $html.find(".clock").on("contextmenu", (event) => {
        //     const savedClock = game.settings.get("againstthedarkconspiracy", "heat");
            
        //     console.log("LOG --contextmenu savedClock.value: "+savedClock.value);
        //     if (!savedClock) return;

        //     savedClock.value = Math.max(savedClock.value - 1, 0);
        //     game.settings.set("againstthedarkconspiracy", "heat", savedClock);
        // });
    }
}