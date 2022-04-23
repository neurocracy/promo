This contains the source files for the [Neurocracy promo site](https://neurocracy.site/).

-----------------

# Installation

To build assets for this project, you'll need to have
[Node.js](https://nodejs.org/) installed.

## Using ```nvm```

We recommend using [Node Version Manager
(```nvm```)](https://github.com/nvm-sh/nvm) ([Windows
port](https://github.com/coreybutler/nvm-windows)) to ensure you're using the
same version used to develop this codebase. Once nvm is installed, you can
simply navigate to the project root and run ```nvm install``` to install the
appropriate version contained in the ```.nvmrc``` file.

Note that if you're using the [Windows
port](https://github.com/coreybutler/nvm-windows), it [does not support
```.nvmrc```
files](https://github.com/coreybutler/nvm-windows/wiki/Common-Issues#why-isnt-nvmrc-supported-why-arent-some-nvm-for-macoslinux-features-supported),
so you'll have to provide the version contained in the ```.nvmrc``` as a
parameter: ```nvm install <version>``` (without the ```<``` and ```>```).

## Dependencies

Once Node.js is installed, run ```npm install``` in the project root to install
all dependencies.

## Grunt CLI

We also recommend installing the [Grunt
CLI](https://gruntjs.com/getting-started) globally from the commandline:
```npm install -g grunt-cli```

Note that if you use ```nvm```, this must be done for each Node.js version that
you plan to use it for.

## ImageMagick

To build icons, optimize screenshots, and create screenshot thumbnails, you'll
also need to install [ImageMagick](https://imagemagick.org/).

-----------------

# Building

To build everything, you can run ```grunt all``` in the commandline in the
project root.

To build specific things:

* ```grunt css``` - compiles CSS files from Sass; applies [Autoprefixer](https://github.com/postcss/autoprefixer).

* ```grunt favicons``` - builds all the shortcut/browser icons for the theme, using [japrescott/grunt-favicons](https://github.com/japrescott/grunt-favicons); requires [ImageMagick](https://imagemagick.org/) to be installed.

* ```grunt fonts``` - copy fonts from ```node_modules``` to ```public/fonts``` so they're web accessible.

* ```grunt imagemagick``` - convert PNG screenshots to much smaller JPEG files and generate thumbnails; requires [ImageMagick](https://imagemagick.org/) to be installed.

* ```grunt vendor``` - copy libraries from ```node_modules``` to ```public/vendor``` so they're web accessible.

-----------------

# Planned improvements

* Convert stylesheets to [Sass modules](https://sass-lang.com/documentation/modules).

* Convert to a [Drupal](https://www.drupal.org/) site using [Layout Builder](https://www.drupal.org/docs/8/core/modules/layout-builder) for easier content management.
