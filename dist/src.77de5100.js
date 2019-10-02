// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/@mesa-engine/core/lib/entity.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Entity = (function () {
    function Entity() {
        this._id = null;
        this._components = {};
        this._listeners = [];
        this._componentClasses = {};
    }
    Object.defineProperty(Entity.prototype, "id", {
        get: function () {
            if (this._id === null) {
                throw new Error("Cannot retrieve an ID when is null.");
            }
            return this._id;
        },
        set: function (value) {
            if (value === null || value === undefined) {
                throw new Error("Must set a non null value when setting an entity id.");
            }
            if (this._id !== null) {
                throw new Error("Entity id is already set as \"" + this._id + "\".");
            }
            this._id = value;
        },
        enumerable: true,
        configurable: true
    });
    Entity.prototype.isNew = function () {
        return this._id === null;
    };
    Entity.prototype.listComponents = function () {
        var _this = this;
        return Object.keys(this._components).map(function (i) { return _this._components[i]; });
    };
    Entity.prototype.listComponentsWithTypes = function () {
        var _this = this;
        return Object.keys(this._components).map(function (i) { return ({
            component: _this._components[i],
            type: _this._componentClasses[i]
        }); });
    };
    Entity.prototype.listComponentsWithTags = function () {
        var _this = this;
        return Object.keys(this._components).map(function (tag) {
            return Object.freeze({
                tag: tag,
                component: _this._components[tag]
            });
        });
    };
    Entity.prototype.hasComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this._components[tag];
        if (!component)
            return false;
        if (!this.cast(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        return true;
    };
    Entity.prototype.getComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this._components[tag];
        if (!component) {
            throw new Error("Cannot get component \"" + tag + "\" from entity.");
        }
        if (!this.cast(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        return component;
    };
    Entity.prototype.putComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this._components[tag];
        if (component) {
            if (!this.cast(component, componentClass)) {
                throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
            }
            delete this._components[tag];
            delete this._componentClasses[tag];
        }
        var newComponent = new componentClass();
        this._components[tag] = newComponent;
        this._componentClasses[tag] = componentClass;
        for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(this);
        }
        return newComponent;
    };
    Entity.prototype.removeComponent = function (componentClass) {
        var tag = componentClass.tag || componentClass.name;
        var component = this._components[tag];
        if (!component) {
            throw new Error("Component of tag \"" + tag + "\".\nDoes not exists.");
        }
        if (!this.cast(component, componentClass)) {
            throw new Error("There are multiple classes with the same tag or name \"" + tag + "\".\nAdd a different property \"tag\" to one of them.");
        }
        delete this._components[tag];
        for (var _i = 0, _a = this._listeners; _i < _a.length; _i++) {
            var listener = _a[_i];
            listener(this);
        }
    };
    Entity.prototype.cast = function (component, componentClass) {
        return !!(component && component instanceof componentClass);
    };
    Entity.prototype.addListener = function (listener) {
        var index = this._listeners.indexOf(listener);
        if (index === -1) {
            this._listeners.push(listener);
        }
        return this;
    };
    Entity.prototype.removeListener = function (listener) {
        var index = this._listeners.indexOf(listener);
        if (index !== -1) {
            this._listeners.splice(index, 1);
        }
        return this;
    };
    return Entity;
}());
exports.Entity = Entity;

},{}],"../node_modules/@mesa-engine/core/lib/engine.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var entity_1 = require("./entity");
var Engine = (function () {
    function Engine() {
        this._entities = [];
        this._entityListeners = [];
        this._systems = [];
        this._systemsNeedSorting = false;
    }
    Engine.prototype.buildEntity = function (blueprintClass) {
        return this.getEntityFromBlueprint(new blueprintClass(), new entity_1.Entity());
    };
    Engine.prototype.getEntityFromBlueprint = function (blueprint, entity) {
        var _this = this;
        if (blueprint.blueprints) {
            blueprint.blueprints.forEach(function (inheritedBlueprint) {
                entity = _this.getEntityFromBlueprint(inheritedBlueprint, entity);
            });
        }
        blueprint.components.forEach(function (x) {
            entity.putComponent(x.component);
            if (x.value) {
                Object.assign(entity.getComponent(x.component), x.value);
            }
        });
        return entity;
    };
    Object.defineProperty(Engine.prototype, "entities", {
        get: function () {
            return Object.freeze(this._entities.slice(0));
        },
        enumerable: true,
        configurable: true
    });
    Engine.prototype.notifyPriorityChange = function (system) {
        this._systemsNeedSorting = true;
    };
    Engine.prototype.addEntityListener = function (listener) {
        if (this._entityListeners.indexOf(listener) === -1) {
            this._entityListeners.push(listener);
        }
        return this;
    };
    Engine.prototype.removeEntityListener = function (listener) {
        var index = this._entityListeners.indexOf(listener);
        if (index !== -1) {
            this._entityListeners.splice(index, 1);
        }
        return this;
    };
    Engine.prototype.addEntity = function (entity) {
        if (this._entities.indexOf(entity) === -1) {
            this._entities.push(entity);
            for (var _i = 0, _a = this._entityListeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener.onEntityAdded(entity);
            }
        }
        return this;
    };
    Engine.prototype.addEntities = function () {
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        for (var _a = 0, entities_1 = entities; _a < entities_1.length; _a++) {
            var entity = entities_1[_a];
            this.addEntity(entity);
        }
        return this;
    };
    Engine.prototype.removeEntity = function (entity) {
        var index = this._entities.indexOf(entity);
        if (index !== -1) {
            this._entities.splice(index, 1);
            for (var _i = 0, _a = this._entityListeners; _i < _a.length; _i++) {
                var listener = _a[_i];
                listener.onEntityRemoved(entity);
            }
        }
    };
    Engine.prototype.removeEntities = function () {
        var entities = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            entities[_i] = arguments[_i];
        }
        for (var _a = 0, entities_2 = entities; _a < entities_2.length; _a++) {
            var entity = entities_2[_a];
            this.removeEntity(entity);
        }
        return this;
    };
    Engine.prototype.addSystem = function (system) {
        var index = this._systems.indexOf(system);
        if (index === -1) {
            this._systems.push(system);
            system.onAttach(this);
            this._systemsNeedSorting = true;
        }
        return this;
    };
    Engine.prototype.addSystems = function () {
        var systems = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            systems[_i] = arguments[_i];
        }
        for (var _a = 0, systems_1 = systems; _a < systems_1.length; _a++) {
            var system = systems_1[_a];
            this.addSystem(system);
        }
    };
    Engine.prototype.removeSystem = function (system) {
        var index = this._systems.indexOf(system);
        if (index !== -1) {
            this._systems.splice(index, 1);
            system.onDetach(this);
        }
        return this;
    };
    Engine.prototype.removeSystems = function () {
        var systems = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            systems[_i] = arguments[_i];
        }
        for (var _a = 0, systems_2 = systems; _a < systems_2.length; _a++) {
            var system = systems_2[_a];
            this.removeSystem(system);
        }
    };
    Engine.prototype.update = function (delta) {
        if (this._systemsNeedSorting) {
            this._systemsNeedSorting = false;
            this._systems.sort(function (a, b) { return a.priority - b.priority; });
        }
        for (var _i = 0, _a = this._systems; _i < _a.length; _i++) {
            var system = _a[_i];
            system.update(this, delta);
        }
    };
    return Engine;
}());
exports.Engine = Engine;

},{"./entity":"../node_modules/@mesa-engine/core/lib/entity.js"}],"../node_modules/@mesa-engine/core/lib/family.js":[function(require,module,exports) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractFamily = (function () {
    function AbstractFamily(engine, include, exclude) {
        var _this = this;
        this.includesEntity = function (entity) {
            for (var _i = 0, _a = _this._include; _i < _a.length; _i++) {
                var include = _a[_i];
                if (!entity.hasComponent(include)) {
                    return false;
                }
            }
            for (var _b = 0, _c = _this._exclude; _b < _c.length; _b++) {
                var exclude = _c[_b];
                if (entity.hasComponent(exclude)) {
                    return false;
                }
            }
            return true;
        };
        this._engine = engine;
        this._include = Object.freeze(include.slice(0));
        this._exclude = Object.freeze(exclude.slice(0));
    }
    Object.defineProperty(AbstractFamily.prototype, "engine", {
        get: function () {
            return this._engine;
        },
        enumerable: true,
        configurable: true
    });
    return AbstractFamily;
}());
var CachedFamily = (function (_super) {
    __extends(CachedFamily, _super);
    function CachedFamily(engine, include, exclude) {
        var _this = _super.call(this, engine, include, exclude) || this;
        _this.onEntityChanged = function (entity) {
            var index = _this._entities.indexOf(entity);
            if (index === -1) {
                _this._entities.push(entity);
                entity.addListener(_this.onEntityChanged);
            }
            _this._needEntityRefresh = true;
        };
        var allEntities = _this.engine.entities;
        _this._entities = allEntities.filter(_this.includesEntity);
        _this.engine.addEntityListener(_this);
        for (var _i = 0, allEntities_1 = allEntities; _i < allEntities_1.length; _i++) {
            var entity = allEntities_1[_i];
            entity.addListener(_this.onEntityAdded);
        }
        _this._needEntityRefresh = false;
        return _this;
    }
    Object.defineProperty(CachedFamily.prototype, "entities", {
        get: function () {
            if (this._needEntityRefresh) {
                this._needEntityRefresh = false;
                this._entities = this._entities.filter(this.includesEntity);
            }
            return Object.freeze(this._entities.slice(0));
        },
        enumerable: true,
        configurable: true
    });
    CachedFamily.prototype.onEntityAdded = function (entity) {
        var index = this._entities.indexOf(entity);
        if (index === -1) {
            this._entities.push(entity);
            this._needEntityRefresh = true;
            entity.addListener(this.onEntityChanged);
        }
    };
    CachedFamily.prototype.onEntityRemoved = function (entity) {
        var index = this._entities.indexOf(entity);
        if (index !== -1) {
            var entity_1 = this._entities[index];
            this._entities.splice(index, 1);
            entity_1.removeListener(this.onEntityChanged);
        }
    };
    return CachedFamily;
}(AbstractFamily));
var NonCachedFamily = (function (_super) {
    __extends(NonCachedFamily, _super);
    function NonCachedFamily() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(NonCachedFamily.prototype, "entities", {
        get: function () {
            return this.engine.entities.filter(this.includesEntity);
        },
        enumerable: true,
        configurable: true
    });
    return NonCachedFamily;
}(AbstractFamily));
var FamilyBuilder = (function () {
    function FamilyBuilder(engine) {
        this._engine = engine || null;
        this._include = [];
        this._exclude = [];
        this._cached = true;
    }
    FamilyBuilder.prototype.include = function () {
        var _a;
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i] = arguments[_i];
        }
        (_a = this._include).push.apply(_a, classes);
        return this;
    };
    FamilyBuilder.prototype.exclude = function () {
        var _a;
        var classes = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            classes[_i] = arguments[_i];
        }
        (_a = this._exclude).push.apply(_a, classes);
        return this;
    };
    FamilyBuilder.prototype.changeEngine = function (engine) {
        this._engine = engine;
        return this;
    };
    FamilyBuilder.prototype.setCached = function (cached) {
        this._cached = cached;
    };
    FamilyBuilder.prototype.build = function () {
        if (!this._engine) {
            throw new Error("Family should always belong to an engine.");
        }
        if (!this._cached) {
            return new NonCachedFamily(this._engine, this._include, this._exclude);
        }
        return new CachedFamily(this._engine, this._include, this._exclude);
    };
    return FamilyBuilder;
}());
exports.FamilyBuilder = FamilyBuilder;

},{}],"../node_modules/@mesa-engine/core/lib/system.js":[function(require,module,exports) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var System = (function () {
    function System() {
        this._priority = 0;
        this._engines = [];
    }
    Object.defineProperty(System.prototype, "priority", {
        get: function () {
            return this._priority;
        },
        set: function (value) {
            this._priority = value;
            for (var _i = 0, _a = this._engines; _i < _a.length; _i++) {
                var engine = _a[_i];
                engine.notifyPriorityChange(this);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(System.prototype, "engines", {
        get: function () {
            return Object.freeze(this._engines.slice(0));
        },
        enumerable: true,
        configurable: true
    });
    System.prototype.onAttach = function (engine) {
        var index = this._engines.indexOf(engine);
        if (index === -1) {
            this._engines.push(engine);
        }
    };
    System.prototype.onDetach = function (engine) {
        var index = this._engines.indexOf(engine);
        if (index !== -1) {
            this._engines.splice(index, 1);
        }
    };
    return System;
}());
exports.System = System;

},{}],"../node_modules/@mesa-engine/core/lib/index.js":[function(require,module,exports) {
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./engine"));
__export(require("./entity"));
__export(require("./family"));
__export(require("./system"));

},{"./engine":"../node_modules/@mesa-engine/core/lib/engine.js","./entity":"../node_modules/@mesa-engine/core/lib/entity.js","./family":"../node_modules/@mesa-engine/core/lib/family.js","./system":"../node_modules/@mesa-engine/core/lib/system.js"}],"../node_modules/@mesa-engine/core/index.js":[function(require,module,exports) {
module.exports = require("./lib/index");
},{"./lib/index":"../node_modules/@mesa-engine/core/lib/index.js"}],"components/render.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var RenderComponent = function () {
  function RenderComponent() {
    this.color = 'black';
    this.opacity = 1;
  }

  return RenderComponent;
}();

exports.RenderComponent = RenderComponent;
},{}],"components/text.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var TextComponent = function () {
  function TextComponent() {
    this.text = '';
  }

  return TextComponent;
}();

exports.TextComponent = TextComponent;
},{}],"components/position.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var PositionComponent = function () {
  function PositionComponent() {
    this.x = 0;
    this.y = 0;
  }

  return PositionComponent;
}();

exports.PositionComponent = PositionComponent;
},{}],"components/size.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var SizeComponent = function () {
  function SizeComponent() {}

  return SizeComponent;
}();

exports.SizeComponent = SizeComponent;
},{}],"components/interactiveComponent.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var InteractiveComponent = function () {
  function InteractiveComponent() {}

  return InteractiveComponent;
}();

exports.InteractiveComponent = InteractiveComponent;
},{}],"components/answer.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var AnswerComponent = function () {
  function AnswerComponent() {}

  return AnswerComponent;
}();

exports.AnswerComponent = AnswerComponent;
},{}],"components/input.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var InputComponent = function () {
  function InputComponent() {}

  return InputComponent;
}();

exports.InputComponent = InputComponent;
},{}],"components/button.component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var ButtonComponent = function () {
  function ButtonComponent() {}

  return ButtonComponent;
}();

exports.ButtonComponent = ButtonComponent;
},{}],"components/index.ts":[function(require,module,exports) {
"use strict";

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(require("./render.component"));

__export(require("./text.component"));

__export(require("./position.component"));

__export(require("./size.component"));

__export(require("./interactiveComponent"));

__export(require("./answer.component"));

__export(require("./input.component"));

__export(require("./button.component"));
},{"./render.component":"components/render.component.ts","./text.component":"components/text.component.ts","./position.component":"components/position.component.ts","./size.component":"components/size.component.ts","./interactiveComponent":"components/interactiveComponent.ts","./answer.component":"components/answer.component.ts","./input.component":"components/input.component.ts","./button.component":"components/button.component.ts"}],"blueprints/renderable.blueprint.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var components_1 = require("../components");

var RenderableBlueprint = function () {
  function RenderableBlueprint() {
    this.components = [{
      component: components_1.PositionComponent
    }, {
      component: components_1.RenderComponent
    }];
  }

  return RenderableBlueprint;
}();

exports.RenderableBlueprint = RenderableBlueprint;
},{"../components":"components/index.ts"}],"blueprints/candidateAnswerBlueprint.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var renderable_blueprint_1 = require("./renderable.blueprint");

var components_1 = require("../components");

var CandidateAnswerBlueprint = function () {
  function CandidateAnswerBlueprint() {
    this.blueprints = [new renderable_blueprint_1.RenderableBlueprint()];
    this.components = [{
      component: components_1.TextComponent,
      value: {
        font: '52px sans-serif',
        color: 'black'
      }
    }, {
      component: components_1.AnswerComponent
    }];
  }

  return CandidateAnswerBlueprint;
}();

exports.CandidateAnswerBlueprint = CandidateAnswerBlueprint;
},{"./renderable.blueprint":"blueprints/renderable.blueprint.ts","../components":"components/index.ts"}],"blueprints/hexagon.blueprint.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var renderable_blueprint_1 = require("./renderable.blueprint");

var components_1 = require("../components");

var HexagonBlueprint = function () {
  function HexagonBlueprint() {
    this.blueprints = [new renderable_blueprint_1.RenderableBlueprint()];
    this.components = [{
      component: components_1.SizeComponent,
      value: {
        value: 55
      }
    }, {
      component: components_1.RenderComponent,
      value: {
        color: '#e6e6e6',
        opacity: 1
      }
    }, {
      component: components_1.TextComponent,
      value: {
        text: '~',
        font: '32px sans-serif',
        color: 'black',
        align: 'center',
        baseLine: 'middle'
      }
    }, {
      component: components_1.InteractiveComponent,
      value: {
        area: new Array(),
        clicked: false
      }
    }, {
      component: components_1.InputComponent
    }];
  }

  return HexagonBlueprint;
}();

exports.HexagonBlueprint = HexagonBlueprint;
},{"./renderable.blueprint":"blueprints/renderable.blueprint.ts","../components":"components/index.ts"}],"blueprints/index.ts":[function(require,module,exports) {
"use strict";

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(require("./renderable.blueprint"));

__export(require("./candidateAnswerBlueprint"));

__export(require("./hexagon.blueprint"));
},{"./renderable.blueprint":"blueprints/renderable.blueprint.ts","./candidateAnswerBlueprint":"blueprints/candidateAnswerBlueprint.ts","./hexagon.blueprint":"blueprints/hexagon.blueprint.ts"}],"model/point.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Point = function () {
  function Point(x, y) {
    this._x = x;
    this._y = y;
  }

  Object.defineProperty(Point.prototype, "x", {
    get: function get() {
      return this._x;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(Point.prototype, "y", {
    get: function get() {
      return this._y;
    },
    enumerable: true,
    configurable: true
  });

  Point.prototype.toString = function () {
    return '{ ' + this.x + ', ' + this.y + ' }';
  };

  return Point;
}();

exports.Point = Point;
},{}],"systems/scene-creator.system.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var blueprints_1 = require("../blueprints");

var components_1 = require("../components");

var point_1 = require("../model/point");

var SceneCreatorSystem = function (_super) {
  __extends(SceneCreatorSystem, _super);

  function SceneCreatorSystem() {
    var _this = _super !== null && _super.apply(this, arguments) || this;

    _this.entities = [];
    return _this;
  }

  SceneCreatorSystem.prototype.onAttach = function (engine) {
    var _this = this;

    _super.prototype.onAttach.call(this, engine);

    window.addEventListener('resize', function (event) {
      _this.entities.forEach(function (entity) {
        return engine.removeEntity(entity);
      });

      _this.entities = [];

      _this.create(engine);
    });
    this.create(engine);
  };

  SceneCreatorSystem.prototype.update = function (engine, delta) {};

  SceneCreatorSystem.prototype.create = function (engine) {
    this.createHoneyComb(engine, window.innerWidth / 2, window.innerHeight / 2);
    this.createCandidateAnswer(engine, window.innerWidth / 2, window.innerHeight / 2);
  };

  SceneCreatorSystem.prototype.createHoneyComb = function (engine, xOrigin, yOrigin) {
    var hexagaon = engine.buildEntity(blueprints_1.HexagonBlueprint);
    var positionComponent = hexagaon.getComponent(components_1.PositionComponent);
    var renderComponent = hexagaon.getComponent(components_1.RenderComponent);
    var interactiveComponent = hexagaon.getComponent(components_1.InteractiveComponent);
    var sizeComponent = hexagaon.getComponent(components_1.SizeComponent);
    renderComponent.color = '#f8cd05';
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin;
    SceneCreatorSystem.createHexagonArea(positionComponent, sizeComponent, interactiveComponent);
    engine.addEntity(hexagaon);
    this.entities.push(hexagaon);
    var distance = 100;

    for (var i = 0; i < 6; i++) {
      var hexagaon_1 = engine.buildEntity(blueprints_1.HexagonBlueprint);
      var positionComponent_1 = hexagaon_1.getComponent(components_1.PositionComponent);
      var sizeComponent_1 = hexagaon_1.getComponent(components_1.SizeComponent);
      var interactiveComponent_1 = hexagaon_1.getComponent(components_1.InteractiveComponent);
      var angle = i * (Math.PI / 3) + Math.PI / 2;
      positionComponent_1.x = xOrigin + distance * Math.cos(angle);
      positionComponent_1.y = yOrigin + distance * Math.sin(angle);
      SceneCreatorSystem.createHexagonArea(positionComponent_1, sizeComponent_1, interactiveComponent_1);
      engine.addEntity(hexagaon_1);
      this.entities.push(hexagaon_1);
    }
  };

  SceneCreatorSystem.createHexagonArea = function (positionComponent, sizeComponent, interactiveComponent) {
    for (var i = 0; i < 7; i++) {
      var x = positionComponent.x + sizeComponent.value * Math.cos(i * (Math.PI / 3));
      var y = positionComponent.y + sizeComponent.value * Math.sin(i * (Math.PI / 3));
      interactiveComponent.area.push(new point_1.Point(x, y));
    }
  };

  SceneCreatorSystem.prototype.createCandidateAnswer = function (engine, xOrigin, yOrigin) {
    var candidateAnswer = engine.buildEntity(blueprints_1.CandidateAnswerBlueprint);
    var positionComponent = candidateAnswer.getComponent(components_1.PositionComponent);
    positionComponent.x = xOrigin;
    positionComponent.y = yOrigin - 250;
    engine.addEntity(candidateAnswer);
    this.entities.push(candidateAnswer);
  };

  return SceneCreatorSystem;
}(core_1.System);

exports.SceneCreatorSystem = SceneCreatorSystem;
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","../blueprints":"blueprints/index.ts","../components":"components/index.ts","../model/point":"model/point.ts"}],"systems/text-generation.system.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var components_1 = require("../components");

var TextGenerationSystem = function (_super) {
  __extends(TextGenerationSystem, _super);

  function TextGenerationSystem() {
    var _this = _super.call(this) || this;

    _this.word = TextGenerationSystem.shuffleWord('ALCOVES');
    _this.canvas = document.getElementById('canvas');
    _this.ctx = _this.canvas.getContext('2d');
    return _this;
  }

  TextGenerationSystem.prototype.onAttach = function (engine) {
    _super.prototype.onAttach.call(this, engine);

    this.inputFamily = new core_1.FamilyBuilder(engine).include(components_1.InputComponent).build();

    for (var i = 0; i < this.inputFamily.entities.length; i++) {
      var entity = this.inputFamily.entities[i];

      if (entity.hasComponent(components_1.TextComponent)) {
        var text = entity.getComponent(components_1.TextComponent);
        text.text = this.word[i];
      }
    }
  };

  TextGenerationSystem.prototype.update = function (engine, delta) {};

  TextGenerationSystem.shuffleWord = function (word) {
    var array = word.split('');

    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }

    return array.join('');
  };

  return TextGenerationSystem;
}(core_1.System);

exports.TextGenerationSystem = TextGenerationSystem;
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","../components":"components/index.ts"}],"systems/interactionListenerSystem.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var components_1 = require("../components");

var point_1 = require("../model/point");

var InteractionListenerSystem = function (_super) {
  __extends(InteractionListenerSystem, _super);

  function InteractionListenerSystem() {
    var _this = _super.call(this) || this;

    _this.clicks = [];
    return _this;
  }

  InteractionListenerSystem.prototype.onAttach = function (engine) {
    var _this = this;

    _super.prototype.onAttach.call(this, engine);

    this.interactionFamily = new core_1.FamilyBuilder(engine).include(components_1.InteractiveComponent).build();
    var canvas = document.getElementById('canvas');

    if (canvas) {
      canvas.addEventListener('click', function (event) {
        _this.clicks.push(new point_1.Point(event.clientX, event.clientY));
      });
    }
  };

  InteractionListenerSystem.prototype.update = function (engine, delta) {
    for (var _i = 0, _a = this.interactionFamily.entities; _i < _a.length; _i++) {
      var entity = _a[_i];

      if (entity.hasComponent(components_1.InteractiveComponent)) {
        for (var _b = 0, _c = this.clicks; _b < _c.length; _b++) {
          var click = _c[_b];
          var interactiveComponent = entity.getComponent(components_1.InteractiveComponent);
          var inside = InteractionListenerSystem.insidePolygon(interactiveComponent.area, 6, click);

          if (inside) {
            interactiveComponent.clicked = true;

            if (entity.hasComponent(components_1.TextComponent)) {
              var textComponent = entity.getComponent(components_1.TextComponent);
              this.answer += textComponent.text;
              console.debug(textComponent.text);
            }
          }
        }
      }
    }

    this.clicks = [];
  };

  InteractionListenerSystem.insidePolygon = function (points, N, p) {
    var counter = 0;
    var i;
    var xInters;
    var p1;
    var p2;
    p1 = points[0];

    for (i = 1; i <= N; i++) {
      p2 = points[i % N];

      if (p.y > Math.min(p1.y, p2.y)) {
        if (p.y <= Math.max(p1.y, p2.y)) {
          if (p.x <= Math.max(p1.x, p2.x)) {
            if (p1.y != p2.y) {
              xInters = (p.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;

              if (p1.x == p2.x || p.x <= xInters) {
                counter++;
              }
            }
          }
        }
      }

      p1 = p2;
    }

    return counter % 2 != 0;
  };

  return InteractionListenerSystem;
}(core_1.System);

exports.InteractionListenerSystem = InteractionListenerSystem;
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","../components":"components/index.ts","../model/point":"model/point.ts"}],"systems/interactionHandlerSystem.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var components_1 = require("../components");

var InteractionHandlerSystem = function (_super) {
  __extends(InteractionHandlerSystem, _super);

  function InteractionHandlerSystem() {
    var _this = _super.call(this) || this;

    _this.clicks = [];
    return _this;
  }

  InteractionHandlerSystem.prototype.onAttach = function (engine) {
    _super.prototype.onAttach.call(this, engine);

    this.interactionFamily = new core_1.FamilyBuilder(engine).include(components_1.InteractiveComponent).build();
    this.answerFamily = new core_1.FamilyBuilder(engine).include(components_1.AnswerComponent).build();
  };

  InteractionHandlerSystem.prototype.update = function (engine, delta) {
    for (var _i = 0, _a = this.interactionFamily.entities; _i < _a.length; _i++) {
      var interactionEntity = _a[_i];

      for (var _b = 0, _c = this.answerFamily.entities; _b < _c.length; _b++) {
        var answerEntity = _c[_b];
        var interactiveComponent = interactionEntity.getComponent(components_1.InteractiveComponent);

        if (interactiveComponent.clicked) {
          interactiveComponent.clicked = false;
          var interactionEntityTextComponent = interactionEntity.getComponent(components_1.TextComponent);
          var answerEntityTextComponent = answerEntity.getComponent(components_1.TextComponent);
          answerEntityTextComponent.text += interactionEntityTextComponent.text;
        }
      }
    }
  };

  return InteractionHandlerSystem;
}(core_1.System);

exports.InteractionHandlerSystem = InteractionHandlerSystem;
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","../components":"components/index.ts"}],"systems/render.system.ts":[function(require,module,exports) {
"use strict";

var __extends = this && this.__extends || function () {
  var _extendStatics = function extendStatics(d, b) {
    _extendStatics = Object.setPrototypeOf || {
      __proto__: []
    } instanceof Array && function (d, b) {
      d.__proto__ = b;
    } || function (d, b) {
      for (var p in b) {
        if (b.hasOwnProperty(p)) d[p] = b[p];
      }
    };

    return _extendStatics(d, b);
  };

  return function (d, b) {
    _extendStatics(d, b);

    function __() {
      this.constructor = d;
    }

    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var components_1 = require("../components");

var RenderSystem = function (_super) {
  __extends(RenderSystem, _super);

  function RenderSystem() {
    var _this = _super.call(this) || this;

    _this.canvas = document.getElementById('canvas');

    if (_this.canvas) {
      _this.canvas.id = 'canvas';
      _this.canvas.width = window.innerWidth;
      _this.canvas.height = window.innerHeight;
      _this.ctx = _this.canvas.getContext('2d');
    }

    return _this;
  }

  RenderSystem.prototype.onAttach = function (engine) {
    _super.prototype.onAttach.call(this, engine);

    this.family = new core_1.FamilyBuilder(engine).include(components_1.PositionComponent, components_1.RenderComponent).build();
  };

  RenderSystem.prototype.update = function (engine, delta) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (var _i = 0, _a = this.family.entities; _i < _a.length; _i++) {
      var entity = _a[_i];
      var position = entity.getComponent(components_1.PositionComponent);
      var render = entity.getComponent(components_1.RenderComponent);
      this.ctx.fillStyle = render.color;
      this.ctx.globalAlpha = render.opacity;

      if (entity.hasComponent(components_1.InteractiveComponent)) {
        var interactiveComponent = entity.getComponent(components_1.InteractiveComponent);
        this.ctx.beginPath();

        for (var _b = 0, _c = interactiveComponent.area; _b < _c.length; _b++) {
          var point = _c[_b];
          this.ctx.lineTo(point.x, point.y);
        }

        this.ctx.closePath();
        this.ctx.fillStyle = render.color;
        this.ctx.fill();
      }

      if (entity.hasComponent(components_1.TextComponent)) {
        var text = entity.getComponent(components_1.TextComponent);
        this.ctx.font = text.font;
        this.ctx.fillStyle = text.color;
        this.ctx.textAlign = text.align;
        this.ctx.textBaseline = text.baseLine;
        this.ctx.fillText(text.text, position.x, position.y);
      }
    }
  };

  return RenderSystem;
}(core_1.System);

exports.RenderSystem = RenderSystem;
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","../components":"components/index.ts"}],"systems/index.ts":[function(require,module,exports) {
"use strict";

function __export(m) {
  for (var p in m) {
    if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
}

Object.defineProperty(exports, "__esModule", {
  value: true
});

__export(require("./scene-creator.system"));

__export(require("./text-generation.system"));

__export(require("./interactionListenerSystem"));

__export(require("./interactionHandlerSystem"));

__export(require("./render.system"));
},{"./scene-creator.system":"systems/scene-creator.system.ts","./text-generation.system":"systems/text-generation.system.ts","./interactionListenerSystem":"systems/interactionListenerSystem.ts","./interactionHandlerSystem":"systems/interactionHandlerSystem.ts","./render.system":"systems/render.system.ts"}],"index.ts":[function(require,module,exports) {
"use strict";

var __importStar = this && this.__importStar || function (mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k in mod) {
    if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
  }
  result["default"] = mod;
  return result;
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var core_1 = require("@mesa-engine/core");

var s = __importStar(require("./systems"));

var App = function () {
  function App() {
    var _a;

    this.lastRender = 0;
    this.engine = new core_1.Engine();

    (_a = this.engine).addSystems.apply(_a, Object.keys(s).map(function (system) {
      return new s[system]();
    }));

    window.requestAnimationFrame(this.loop.bind(this));
  }

  App.prototype.loop = function (timestamp) {
    var progress = timestamp - this.lastRender;
    this.engine.update(progress);
    this.lastRender = timestamp;
    window.requestAnimationFrame(this.loop.bind(this));
  };

  return App;
}();

exports.App = App;
new App();
},{"@mesa-engine/core":"../node_modules/@mesa-engine/core/index.js","./systems":"systems/index.ts"}],"../../../../../usr/local/lib/node_modules/@mesa-engine/cli/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63423" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/@mesa-engine/cli/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.ts"], null)
//# sourceMappingURL=/src.77de5100.js.map