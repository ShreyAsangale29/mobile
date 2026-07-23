// Lets TypeScript type-check `require("...coach.glb")` / `import x from "...glb"`
// without erroring — Metro (the actual bundler) already knows how to load
// these at runtime via the assetExts change in metro.config.js. This file
// only silences the type-checker; it has no effect on the build itself.

declare module "*.glb" {
  const value: number;
  export default value;
}

declare module "*.gltf" {
  const value: number;
  export default value;
}