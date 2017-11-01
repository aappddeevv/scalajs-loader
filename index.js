const exec = require('child_process').exec;
const path = require('path');
const readFileSync = require('fs').readFileSync;
const loaderUtils = require("loader-utils");

const util = require("util");

module.exports = function(source) {
    const options = Object.assign({},
                                  {clean: true, dirSegment:"", jsStage: "fastOptJS",
                                   removeSourceMapUrl: false, verbose: false},
                                  loaderUtils.getOptions(this));
    const verbose = options.verbose;
    const dirSegment = options.dirSegment;
    const clean = options.clean ? "clean": "";
    const jsStage = options.jsStage;
    const stageFileSegment = (jsStage === 'fastOptJS')?'fastopt':'opt';
    const callback = this.async();
    const cmd = `sbt ${clean} ${jsStage} scalaVersion`;
    const context = this.options.context;
    var self = this;
    if(verbose) {
        console.log("\nscalajs-loader options: " + util.inspect(options));
        console.log("Running command: " + cmd);
    }
    exec(cmd, { cwd: context }, function(error, stdout, _stderr) {
        if (error) { return callback(error, null); }
        const scalaVersion = stdout.toString().trim().split('\n').pop().replace(/\u001b\[0m/g, '').replace(/^\[info\] (\d+\.\d+)(\.\d+)?/, '$1').trim();
        const outDir = path.join(context, 'target', `scala-${scalaVersion}`);

        const modName = JSON.parse(readFileSync(path.join(outDir, 'classes', 'JS_DEPENDENCIES')).toString()).origin.moduleName;
        const jsBasename = `${modName}-${stageFileSegment}.js`;
        const outFile = path.join(outDir, dirSegment, jsBasename);
        const sourceMapFile = path.join(outDir, dirSegment, `${modName}-${stageFileSegment}.js.map`);
        if(verbose) { console.log("Reading source map file: " + sourceMapFile); }
        const sourceMap = readFileSync(sourceMapFile).toString();
        const replacement = options.removeSourceMapUrl? '': `\n//# sourceMappingURL=${outFile}.map`;
        if(verbose) {
            console.log("Processing scala file: " + outFile);
            if(options.removeSourceMapUrl) { console.log("Removing sourceMappingURL."); }
            else { console.log("Replacing source map url with: " + replacement); }
        }
        const regex = new RegExp(`\\n\/\/# sourceMappingURL=${modName}-${stageFileSegment}\\.js\\.map`);
        const passAlongContent = readFileSync(outFile).toString().replace(regex, replacement);
        callback(
            null,
            passAlongContent,
            sourceMap
        );
    });
};
