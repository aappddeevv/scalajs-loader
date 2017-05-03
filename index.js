const exec = require('child_process').exec;
const path = require('path');
const readFileSync = require('fs').readFileSync;
const loaderUtils = require("loader-utils");

module.exports = function(source) {
    const options = loaderUtils.getOptions(this) || {dirSegment:"", jsStage: "fastOptJS"};
    const dirSegment = options.dirSegment;
    const jsStage = options.jsStage;
    const stageFileSegment = (jsStage === 'fastOptJS')?'fastopt':'opt';
  const callback = this.async();
  const cmd = `sbt clean ${jsStage} scalaVersion`;
  var self = this;
  exec(cmd, { cwd: this.options.context }, function(error, stdout, _stderr) {
    if (error) { return callback(error, null); }

    const scalaVersion = stdout.toString().trim().split('\n').pop().replace(/\u001b\[0m/g, '').replace(/^\[info\] (\d+\.\d+)(\.\d+)?/, '$1').trim();
      const outDir = path.join(self.options.context, 'target', `scala-${scalaVersion}`);

      const modName = JSON.parse(readFileSync(path.join(outDir, 'classes', 'JS_DEPENDENCIES')).toString()).origin.moduleName;
      const jsBasename = `${modName}-${stageFileSegment}.js`;
      const outFile = path.join(outDir, dirSegment, jsBasename);
    callback(
      null,
      readFileSync(outFile).toString().replace(
        new RegExp(`\/\/# sourceMappingURL=${modName}-${stageFileSegment}\\.js\\.map`),
        `//# sourceMappingURL=${outFile}.map`
      )
    );
  });
};
