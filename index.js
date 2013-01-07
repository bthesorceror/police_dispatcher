var path = require('path');

function PoliceDispatcher(app_path, controller_folder) {
  this.controller_folder = controller_folder || "controllers";
  this.app_path = app_path;
  this.routes = [];
  this.extras = {}
}

PoliceDispatcher.prototype.addExtra = function(name, obj) {
  this.extras[name] = obj;
}

PoliceDispatcher.prototype.get = function(path, route) {
  this.routes.push([path, route, 'GET']);
}

PoliceDispatcher.prototype.post = function(path, route) {
  this.routes.push([path, route, 'POST']);
}

PoliceDispatcher.prototype.middleware = function() {
  var self = this;

  return function(req, res, next) {
    var url = req.url.split('?')[0];

    self.routes.some(function(route) {
      var match = url.match(route[0]);

      if (match && route[2] == req.method) {
        var controller_name = route[1].split('#')[0] + "_controller",
            action_name = route[1].split('#')[1],
            full_path = path.join(self.app_path,
                                  self.controller_folder,
                                  controller_name),
            controller_file = require(full_path),
            controller = new controller_file(req, res, self.extras),
            args = match.slice(1, match.length);

        controller[action_name].apply(controller, args);
        return true;
      }
      return false;
    }) || next();

  }
}

module.exports = PoliceDispatcher;
