/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/againstthedarkconspiracy/templates/actor/parts/actor-main.hbs",
    "systems/againstthedarkconspiracy/templates/actor/parts/actor-biography.hbs",
    "systems/againstthedarkconspiracy/templates/actor/parts/actor-relationships.hbs"
  ]);
};
