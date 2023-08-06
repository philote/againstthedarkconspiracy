export const registerSettings = function() {

    game.settings.register('againstthedarkconspiracy', 'conspiracyType', {
        name: 'ATDC.settings.conspiracyType.name.label',
        scope: "world",
        config: true,
        type: String,
        choices: {
          "vampires": 'ATDC.settings.conspiracyType.choices.vampires.label',
          "demons": "ATDC.settings.conspiracyType.choices.demons.label",
          "fae": "ATDC.settings.conspiracyType.choices.fae.label"
        },
        default: "vampires",
        onChange: _ => window.location.reload()
    });

    game.settings.register("againstthedarkconspiracy", "currentHeat", {
      name: "currentHeat",
      scope: "world",
      type: Number,
      default: 0,
      config: false
    });
}