// <define:__ROUTES__>
var define_ROUTES_default = { version: 1, include: ["/api/*", "/events.ics"], exclude: [] };

// node_modules/wrangler/templates/pages-dev-pipeline.ts
import worker from "/Users/richardogundele/Documents/ChatGPT/Sacrifcial Seed/cod-canterbury-live-ux/.wrangler/tmp/pages-4AmPiU/bundledWorker-0.39261246336958844.mjs";
import { isRoutingRuleMatch } from "/Users/richardogundele/Documents/ChatGPT/Sacrifcial Seed/cod-canterbury-live-ux/node_modules/wrangler/templates/pages-dev-util.ts";
export * from "/Users/richardogundele/Documents/ChatGPT/Sacrifcial Seed/cod-canterbury-live-ux/.wrangler/tmp/pages-4AmPiU/bundledWorker-0.39261246336958844.mjs";
var routes = define_ROUTES_default;
var pages_dev_pipeline_default = {
  fetch(request, env, context) {
    const { pathname } = new URL(request.url);
    for (const exclude of routes.exclude) {
      if (isRoutingRuleMatch(pathname, exclude)) {
        return env.ASSETS.fetch(request);
      }
    }
    for (const include of routes.include) {
      if (isRoutingRuleMatch(pathname, include)) {
        const workerAsHandler = worker;
        if (workerAsHandler.fetch === void 0) {
          throw new TypeError("Entry point missing `fetch` handler");
        }
        return workerAsHandler.fetch(request, env, context);
      }
    }
    return env.ASSETS.fetch(request);
  }
};
export {
  pages_dev_pipeline_default as default
};
//# sourceMappingURL=7o002llcaq4.js.map
