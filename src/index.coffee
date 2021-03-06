fs = require 'fs'
path = require 'path'
crypto = require 'crypto'
shasum = (source) -> return crypto.createHash('sha1').update(source).digest('hex')

uglify = require 'uglify-js'
sqwish = require 'sqwish'
coffee = require 'coffee-script'
stylus = require 'stylus'

exports = module.exports = (config = {}) ->
  if process.env.NODE_ENV is 'production'
    config.builds or= yes
    config.minify or= yes

  config.assets or= path.resolve 'assets'
  config.public or= path.resolve 'public'
  config.builds or= no   # builds ot public dir
  config.minify or= no   # minify result code
  config.update or= yes  # update with mtime check
  config.stylesheet or= '.styl'   # stylesheet extension
  config.javascript or= '.coffee' # javascript extension


  config.stylesheet = ".#{config.stylesheet}" unless '.' is config.stylesheet.substr 0, 1
  config.javascript = ".#{config.stylesheet}" unless '.' is config.stylesheet.substr 0, 1

  return (req, res, next) ->

    ext = path.extname req.url

    # is this js or css?
    return next() if 0 > ['.js', '.css'].indexOf ext

    # is asset exists?
    src = stylesheet if fs.existsSync (stylesheet = path.join config.assets, (path.dirname req.url), "#{path.basename req.url, ext}#{config.stylesheet}")
    src = javascript if fs.existsSync (javascript = path.join config.assets, (path.dirname req.url), "#{path.basename req.url, ext}#{config.javascript}")
    return next() unless src

    req.route = path: 'Assets'
    dst = path.join config.public, req.url

    # check necessity of update
    return next() if fs.existsSync dst and !config.update

    # check necessity of recast
    mtime = String (fs.statSync src).mtime
    since = String req.headers['if-modified-since']
    if mtime is since
      res.writeHead 304
      return res.end()

    asset = { mime: '', code: '' }

    # parse javascript
    if ext is '.js'
      asset.mime = 'text/javascript'
      if config.javascript is '.coffee'
        asset.code = coffee.compile fs.readFileSync src, 'utf-8'
        if config.minify
          tmp = path.join '/tmp', shasum (Date.now()).toString()
          fs.writeFileSync tmp, asset.code
          asset.code = (uglify.minify tmp).code
          fs.unlinkSync tmp
      else
        return next()

    # parse stylesheet
    if ext is '.css'
      asset.mime = 'text/css'
      if config.stylesheet is '.styl'
        asset.code = (stylus fs.readFileSync src, 'utf-8').include((require 'nib').path).render()
        if config.minify
          asset.code = sqwish.minify asset.code
      else
        return next()

    # build
    if config.builds
      unless fs.existsSync (dstdir = path.dirname dst)
        for dir, i in (dirs = dstdir.split '/')
          if 0 < (target = (dirs.slice 0, i+2).join '/').length
            fs.mkdirSync target unless fs.existsSync target
      fs.writeFileSync dst, asset.code
      return next()

    # response
    res.writeHead 200,
      'Content-Type': asset.mime
      'Last-Modified': String (fs.statSync src).mtime
    return res.end asset.code
