import Encore from '@symfony/webpack-encore';
import { glob } from 'glob';
import * as path from 'node:path';
import { default as vendorize } from '@consensus.enterprises/pnp-vendorize';

// The remaining modules are CommonJS only. Because of this, they must be
// import()ed and destructured like so to behave similarly to ESM imports.
const { default: autoprefixer } = await import('autoprefixer');
const { default: easingGradients } = await import(
  '@neurocracy/postcss-easing-gradients',
);
const { default: FaviconsWebpackPlugin } = await import(
  'favicons-webpack-plugin',
);
const { default: RemoveEmptyScriptsPlugin } = await import(
  'webpack-remove-empty-scripts',
);
const { default: CopyPlugin } = await import('copy-webpack-plugin');

const { default: sharp } = await import('sharp');
const { default: SVGSpritemapPlugin } = await import(
  'svg-spritemap-webpack-plugin',
);

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
  '**/*.css', '**/*.css.map', `!${vendorize.getVendorDirName()}/**`,
];

/**
 * Get globbed entry points.
 *
 * This uses the 'glob' package to automagically build the array of entry
 * points, as there are a lot of them spread out over many components.
 *
 * @return {Object.<string, string>}
 *
 * @see https://www.npmjs.com/package/glob
 */
function getGlobbedEntries() {

  /**
   * Entries to be returned.
   *
   * @type {Object.<string, string>}
   *
   * @see Encore#addEntries()
   *   Explains expected format.
   */
  let entries = {};

  const results = glob.sync(`./**/!(_)*.scss`, {
    ignore: [
      `./${distPath}/**`,
      `./${vendorize.getVendorDirName()}/**`,
    ],
  });

  for (const result of results) {

    const parsed = path.parse(result);

    // Note the leading './'
    entries[`./${parsed.dir}/${parsed.name}`] = `./${result}`;

  }

  return entries;

};

// @see https://symfony.com/doc/current/frontend/encore/installation.html#creating-the-webpack-config-js-file
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath(path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  (outputToSourcePaths ? '.' : distPath)
))

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
.addEntries(getGlobbedEntries())

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
    './web/images/icons/neurocracy/*.svg', {
    output: {
      filename: './web/images/icons/generated/neurocracy.svg',
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

    logo:         './web/images/icons/icon.png',
    logoMaskable: './web/images/icons/icon_maskable.png',

    outputPath:   './web/images/icons/generated',

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
        from: './web/images/screenshots/*.png',
        to:   'web/images/screenshots/thumbnails/[name].jpg',
        transform: function(content) {
          return sharp(content).resize(800).toFormat('jpeg').toBuffer();
        },
      },
      {
        from: './web/images/screenshots/*.png',
        to:   'web/images/screenshots/optimized/[name].jpg',
        transform: function(content) {
          return sharp(content).toFormat('jpeg').toBuffer();
        },
      },
    ],
  }))

  // Add the generated image directories to be cleaned before the build.
  .cleanupOutputBeforeBuild(cleanOutputPaths.concat([
    'web/images/icons/generated/**',
    'web/images/screenshots/optimized/**',
    'web/images/screenshots/thumbnails/**',
  ]));

});

export default Encore.getWebpackConfig();
