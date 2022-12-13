'use strict';

const autoprefixer = require('autoprefixer');
const CopyPlugin = require('copy-webpack-plugin');
const easingGradients = require('postcss-easing-gradients');
const Encore = require('@symfony/webpack-encore');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const glob = require('glob');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const sharp = require('sharp');
const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');

const distPath = '.webpack-dist';

/**
 * Whether to output to the paths where the source files are found.
 *
 * If this is true, compiled Sass files, source maps, etc. will be placed
 * alongside their source files. If this is false, built files will be placed in
 * the dist directory defined by distPath.
 *
 * @type {Boolean}
 */
const outputToSourcePaths = true;

/**
 * Output paths to clean before build.
 *
 * This is defined here so that it can be modified in production mode with
 * additional paths to clean. E.g. screenshots directories.
 *
 * @type {Array}
 *
 * @see https://github.com/johnagan/clean-webpack-plugin
 */
let cleanOutputPaths = [
  '**/*.css', '**/*.css.map', '!public/vendor/**',
];

/**
 * Get globbed stylesheet entry points.
 *
 * This uses the 'glob' package to automagically build the array of entry
 * points, as there are a lot of them spread out over many components.
 *
 * @return {Array}
 *
 * @see https://www.npmjs.com/package/glob
 */
function getStylesheetEntries() {

  return glob.sync(
    // This specifically only searches for SCSS files that aren't partials, i.e.
    // do not start with '_'.
    `./public/stylesheets/**/!(_)*.scss`
  ).reduce(function(entries, currentPath) {

      const parsed = path.parse(currentPath);

      entries[`${parsed.dir}/${parsed.name}`] = currentPath;

      return entries;

  }, {});

};

// @see https://symfony.com/doc/current/frontend/encore/installation.html#creating-the-webpack-config-js-file
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
.setOutputPath(path.resolve(__dirname, (outputToSourcePaths ? '.' : distPath)))

// Encore will complain if the public path doesn't start with a slash.
// Unfortunately, it doesn't seem Webpack's automatic public path works here.
//
// @see https://webpack.js.org/guides/public-path/#automatic-publicpath
.setPublicPath('/')
.setManifestKeyPrefix('')

// We output multiple files.
.disableSingleRuntimeChunk()

.configureFilenames({

  // Since Webpack started out primarily for building JavaScript applications,
  // it always outputs a JS files, even if empty. We place these in a temporary
  // directory by default. Note that the 'webpack-remove-empty-scripts' plug-in
  // should prevent these being output, but if there's an error while running
  // Webpack, you'll get a nice 'temp' directory you can just delete.
  js: 'temp/[name].js',

  // Assets are left at their original locations and not hashed. The [query]
  // must be left in to ensure any query string specified in the CSS is
  // preserved.
  //
  // @see https://stackoverflow.com/questions/68737296/disable-asset-bundling-in-webpack-5#68768905
  //
  // @see https://github.com/webpack-contrib/css-loader/issues/889#issuecomment-1298907914
  assets: '[file][query]',

})
.addEntries(getStylesheetEntries())

// Clean out any previously built files in case of source files being removed or
// renamed. We need to exclude the vendor directory or CSS bundled with
// libraries will get deleted.
//
// @see https://github.com/johnagan/clean-webpack-plugin
.cleanupOutputBeforeBuild(cleanOutputPaths)

.enableSourceMaps(!Encore.isProduction())

// We don't use Babel so we can probably just remove all presets to speed it up.
//
// @see https://github.com/symfony/webpack-encore/issues/154#issuecomment-361277968
.configureBabel(function(config) {
  config.presets = [];
})

// Remove any empty scripts Webpack would generate as we aren't a primarily
// JavaScript-based app and only output CSS and assets.
.addPlugin(new RemoveEmptyScriptsPlugin())

.enableSassLoader()
.enablePostCssLoader(function(options) {
  options.postcssOptions = {
    plugins: [
      easingGradients(),
      autoprefixer(),
    ],
  };
})
// Re-enable automatic public path for paths referenced in CSS.
//
// @see https://github.com/symfony/webpack-encore/issues/915#issuecomment-1189319882
.configureMiniCssExtractPlugin(function(config) {
  config.publicPath = 'auto';
})
// Disable the Encore image rule as we don't use it at the moment and it may try
// to bundle images from the vendor directory which we also don't want.
.configureImageRule({enabled: false})

// This disables asset bundling/copying for certain asset types.
//
// @see https://stackoverflow.com/questions/68737296/disable-asset-bundling-in-webpack-5#68768905
.addLoader({
  test: /\.(png|jpe?g|gif|svg)$/i,
  type: 'asset/resource',
  generator: {
    emit: false,
  },
})

// Production-only tasks.
//
// Note that files generated by these are not cleaned before non-production
// builds so that this can be run once in dev to build icons, screenshots, etc.,
// and then continue to do dev builds with those assets persisting.
.when(function(Encore) { return Encore.isProduction(); }, function(Encore) {

  // Build icon bundle.
  //
  // @see https://www.npmjs.com/package/svg-spritemap-webpack-plugin
  return Encore.addPlugin(new SVGSpritemapPlugin(
    './public/images/icons/neurocracy/*.svg', {
    output: {
      filename: './public/images/icons/generated/neurocracy.svg',
      svg: {
        sizes: false
      },
      svgo: {
        plugins: [
          {
            name: 'removeAttrs',
            params: {
              // Strip all fill attributes as icons are intended to inherit the
              // current colour of text they're displayed with.
              attrs: 'fill'
            }
          }
        ],
      },
    },
    sprite: {
      prefix: 'icon-',
      gutter: 0,
      generate: {
        title:  false,
        symbol: true,
        use:    true,
      }
    },
  }))

  // Generate shortcut icons.
  //
  // @see https://www.npmjs.com/package/favicons-webpack-plugin
  //
  // @todo Switch to using the generated manifest.webmanifest and
  //   browserconfig.xml? The paths don't seem easily customizable.
  .addPlugin(new FaviconsWebpackPlugin({

    logo:         './public/images/icons/icon.png',
    logoMaskable: './public/images/icons/icon_maskable.png',

    outputPath:   './public/images/icons/generated',

    favicons: {

      appName:      'Neurocracy',
      appShortName: 'Neurocracy',

      start_url: '/',

      // background: '#ffffff',
      // theme_color: '#c07300',

      display:  'browser',
      lang:     'en-GB',

      // @todo This doesn't seem to add a version query string?
      version:  '1',

      icons: {

        // We provide our own rather than have them generated.
        windows: false,

        yandex: false,

      },

    },

  }))

  // Copy, convert, and resize screenshots.
  //
  // Most solutions to processing and altering images assume that you have them
  // referenced or imported into one of your entry points, but since we don't do
  // that, Webpack won't find them. The solution is to use the CopyPlugin and
  // call sharp directly to do the conversion before saving them. Note that
  // Encore.copyFiles() doesn't currently support any kind of transform, so we
  // have to add the plug-in ourselves to use that option.
  //
  // @see https://stackoverflow.com/questions/54217627/using-webpack-to-optimise-unreferenced-images-img-loader#54220720
  //   Based on this Stack Overflow answer.
  //
  // @see https://webpack.js.org/plugins/copy-webpack-plugin/
  //
  // @see https://sharp.pixelplumbing.com/
  .addPlugin(new CopyPlugin({
    patterns: [
      {
        from: './public/images/screenshots/*.png',
        to:   'public/images/screenshots/thumbnails/[name].jpg',
        transform: function(content) {
          return sharp(content).resize(800).toFormat('jpeg').toBuffer();
        },
      },
      {
        from: './public/images/screenshots/*.png',
        to:   'public/images/screenshots/optimized/[name].jpg',
        transform: function(content) {
          return sharp(content).toFormat('jpeg').toBuffer();
        },
      },
    ],
  }))

  // Add the generated image directories to be cleaned before the build.
  .cleanupOutputBeforeBuild(cleanOutputPaths.concat([
    'public/images/icons/generated/**',
    'public/images/screenshots/optimized/**',
    'public/images/screenshots/thumbnails/**',
  ]));

});

module.exports = Encore.getWebpackConfig();
