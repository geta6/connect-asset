// Generated by CoffeeScript 1.6.2
(function() {
  var coffee, crypto, exports, fs, path, shasum, sqwish, stylus, uglify;

  fs = require('fs');

  path = require('path');

  crypto = require('crypto');

  shasum = function(source) {
    return crypto.createHash('sha1').update(source).digest('hex');
  };

  uglify = require('uglify-js');

  sqwish = require('sqwish');

  coffee = require('coffee-script');

  stylus = require('stylus');

  exports = module.exports = function(config) {
    if (config == null) {
      config = {};
    }
    config.assets || (config.assets = path.resolve('assets'));
    config["public"] || (config["public"] = path.resolve('public'));
    config.builds || (config.builds = false);
    config.minify || (config.minify = true);
    config.update || (config.update = true);
    config.stylesheet || (config.stylesheet = '.styl');
    config.javascript || (config.javascript = '.coffee');
    if ('.' !== config.stylesheet.substr(0, 1)) {
      config.stylesheet = "." + config.stylesheet;
    }
    if ('.' !== config.stylesheet.substr(0, 1)) {
      config.javascript = "." + config.stylesheet;
    }
    return function(req, res, next) {
      var asset, dir, dirs, dst, dstdir, ext, i, javascript, mtime, since, src, stylesheet, target, tmp, _i, _len, _ref;

      ext = path.extname(req.url);
      if (0 > ['.js', '.css'].indexOf(ext)) {
        return next();
      }
      if (fs.existsSync((stylesheet = path.join(config.assets, path.dirname(req.url), "" + (path.basename(req.url, ext)) + config.stylesheet)))) {
        src = stylesheet;
      }
      if (fs.existsSync((javascript = path.join(config.assets, path.dirname(req.url), "" + (path.basename(req.url, ext)) + config.javascript)))) {
        src = javascript;
      }
      if (!src) {
        return next();
      }
      req.route = {
        path: 'Assets'
      };
      dst = path.join(config["public"], req.url);
      if (fs.existsSync(dst && !config.update)) {
        return next();
      }
      mtime = String((fs.statSync(src)).mtime);
      since = String(req.headers['if-modified-since']);
      if (mtime === since) {
        res.writeHead(304);
        return res.end();
      }
      asset = {
        mime: '',
        code: ''
      };
      if (ext === '.js') {
        asset.mime = 'text/javascript';
        if (config.javascript === '.coffee') {
          asset.code = coffee.compile(fs.readFileSync(src, 'utf-8'));
          if (config.minify) {
            tmp = path.join('/tmp', shasum((Date.now()).toString()));
            fs.writeFileSync(tmp, asset.code);
            asset.code = (uglify.minify(tmp)).code;
            fs.unlinkSync(tmp);
          }
        } else {
          return next();
        }
      }
      if (ext === '.css') {
        asset.mime = 'text/css';
        if (config.stylesheet === '.styl') {
          asset.code = (stylus(fs.readFileSync(src, 'utf-8'))).include((require('nib')).path).render();
          if (config.minify) {
            asset.code = sqwish.minify(asset.code);
          }
        } else {
          return next();
        }
      }
      if (config.builds) {
        if (!fs.existsSync((dstdir = path.dirname(dst)))) {
          _ref = (dirs = dstdir.split('/'));
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            dir = _ref[i];
            if (0 < (target = (dirs.slice(0, i + 2)).join('/')).length) {
              if (!fs.existsSync(target)) {
                fs.mkdirSync(target);
              }
            }
          }
        }
        fs.writeFileSync(dst, asset.code);
        return next();
      }
      res.writeHead(200, {
        'Content-Type': asset.mime,
        'Last-Modified': String((fs.statSync(src)).mtime)
      });
      return res.end(asset.code);
    };
  };

}).call(this);