This contains the source files for the [Neurocracy promo site](https://neurocracy.site/).

----

# Why open source?

We're dismayed by how much knowledge and technology is kept under lock and key
in the videogame industry, with years of work often never seeing the light of
day when projects are cancelled. We've gotten to where we are by building upon
the work of countless others, and we want to keep that going. We hope that some
part of this codebase is useful or will inspire someone out there.

----

# Requirements

To build front-end assets for this project, [Node.js](https://nodejs.org/) and
[Yarn](https://yarnpkg.com/) are required.

-----------------

# Installation

To build front-end assets for this project, you'll need to install
[Node.js](https://nodejs.org/) and [Yarn](https://yarnpkg.com/). If you don't
have Yarn installed yet, follow [its installation
instructions](https://yarnpkg.com/getting-started/install). Then run `yarn
install` and let it do the rest.

-----------------

# Building

We use [Webpack](https://webpack.js.org/) and [Symfony Webpack
Encore](https://symfony.com/doc/current/frontend.html) to automate most of the
build process. These will have been installed for you if you followed the Yarn
installation instructions above.

The following commands can be run from the root of the project to build:

* `yarn build` - Development build; primarily compiles Sass (SCSS) into CSS without minifying it and with sourcemaps.

* `yarn build:production` - Builds everything for production:

  * Sass is compiled into minified CSS without sourcemaps.

  * Optimized and thumbnail versions of screenshots are generated.

  * SVG icon bundle is built from individual source files.

  * Shortcut icons are generated at multiple sizes from a single source file.

* `yarn build:vendor` - Copies third-party front-end assets from the Yarn viritual file system into the publicly accessible web directory. Running this manually should not be required as it's set as [a `postinstall` lifecycle script](https://yarnpkg.com/advanced/lifecycle-scripts) and so should be run automatically by Yarn when you first install and subsequently if dependencies of this project change.

-----------------

# Deploying

We have a fully automated deployment process on [DigitalOcean's App
Platform](https://docs.digitalocean.com/products/app-platform/). See [our deploy
template](../.do/deploy.template.yaml) for an overview of how our app spec is
structured. The App Platform build process builds all our front-end assets via
[Yarn](https://yarnpkg.com/).

If you'd like to give this repository a try (and also potentially get us
referral credits 👉👈 🥺), use this link:

[![Deploy to DO](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://gitlab.com/neurocracy/promo/tree/3.x&refcode=44bfd65c116f)

-----------------

# Planned improvements

* Convert to a [Drupal](https://www.drupal.org/) site using [Layout Builder](https://www.drupal.org/docs/8/core/modules/layout-builder) for easier content management.

-----------------

# Breaking changes

The following major version bumps indicate breaking changes:

* 2.x:

  * Front-end dependencies now installed via [Yarn](https://yarnpkg.com/).

  * Front-end build process ported to [Webpack](https://webpack.js.org/).

  * Switched from [Node Sass to Dart Sass](https://sass-lang.com/blog/libsass-is-deprecated).

  * Converted stylesheets to [Sass modules](https://sass-lang.com/documentation/modules).

* 3.x:

  * Content updates for *Neurocracy 2.049* re-release.

  * Renamed `public` directory to `web` in keeping with Drupal projects.
