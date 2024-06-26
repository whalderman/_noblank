import * as esbuild from "esbuild";

await esbuild.build({
    entryPoints: ["src/**"],
    minify: true,
    platform: "browser",
    bundle: true, // in case this extension ever gets more complicated
    target: "es6",
    loader: {
        ".json": "copy",
        ".png": "copy",
    },
    outdir: "dist",
});
