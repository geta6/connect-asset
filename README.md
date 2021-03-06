# connect-asset

## features

* coffee compilable
* stylus with nib compilable
* cluster ok
* 302 responsible

## install

`npm install connect-asset`

## usage

### server (nodejs)

```
app.use(require('connect-asset')());
```
or
```
app.use(require('connect-asset')({...options...}));
```


### view (jade)

```
link(rel='stylesheet', href='/css/style.css')
```

### directories

```
app
├ app.coffee
├ assets
│  └ css
│      └ style.styl
└ public
```

## compilable

* `stylus` with `nib`
* `coffee-script`

## options
#### `assets: [dirpath]`
path for assets directory.

Default, `path.resolve('assets')`.

#### `public: [dirpath]`
path for public directory (web root).

Default, `path.resolve('public')`.

#### `builds: [Boolean]`
save compiled code to public directory.

Default, if `NODE_ENV=production` then `true` else `false`.

#### `minify: [Boolean]`
minify compiled code or not.

Default, if `NODE_ENV=production` then `true` else `false`.

#### `update: [Boolean]`
re-build assets when modification time differ from `Last-Modified` header.

Default, `true`.

#### `stylesheet: [extname]`
target extension.

Default, `.styl`. [^1]

#### `javascript: [extname]`
target extension. 

Default, `.coffee`. [^2]

## Roadmap

* rewrite to module style

[^1]: `.styl` is ok, `styl` is ok too.
[^2]: `.coffee` is ok, `coffee` is ok too.
