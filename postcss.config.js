const fs = require('fs');
const path = require('path');

module.exports = {
  plugins: [
    require('postcss-modules-scope'),
    require('postcss-modules-extract-imports'),
    require('postcss-modules-local-by-default'),
    require('postcss-modules')({
      getJSON: (cssFileName, json) => {
        const outputDir = path.join(__dirname, '_site/assets/css');
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const outputPath = path.join(outputDir, path.basename(cssFileName) + '.json');
        fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));
      }
    })
  ]
}