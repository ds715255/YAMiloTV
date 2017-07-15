var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var rating;
var Control = (function () {
    function Control() {
        this.children = Array();
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this.node = $("<div></div>");
        this.node.attr("flashclass", this.constructor.name);
    }
    Object.defineProperty(Control.prototype, "x", {
        get: function () { return this._x; },
        set: function (value) { this._x = value; this.updateNode(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Control.prototype, "y", {
        get: function () { return this._y; },
        set: function (value) { this._y = value; this.updateNode(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Control.prototype, "width", {
        get: function () { return this._width; },
        set: function (value) { this._width = value; this.updateNode(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Control.prototype, "height", {
        get: function () { return this._height; },
        set: function (value) { this._height = value; this.updateNode(); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Control.prototype, "parent", {
        get: function () { return this._parent; },
        set: function (value) { this._parent = value; },
        enumerable: true,
        configurable: true
    });
    Control.prototype.updateNode = function () {
        this.node.css("box-sizing", "content-box");
        this.node.width(this.width);
        this.node.height(this.height);
        this.node.css("left", this.x);
        this.node.css("top", this.y);
        this.node.css("position", "absolute");
        this.node.css("box-sizing", "");
    };
    Control.prototype.render = function (target) {
        for (var idx in this.children) {
            this.children[idx].render(this.node);
        }
        target.append(this.node);
    };
    Control.prototype.addChild = function (child) {
        this.children.push(child);
        child.parent = this;
    };
    Control.prototype.removeChild = function (child) {
        child.parent = null;
        child.destroy();
        delete this.children[this.children.indexOf(child)];
    };
    Control.prototype.destroy = function () {
        for (var idx in this.children) {
            this.children[idx].destroy();
        }
        this.node.remove();
    };
    return Control;
}());
var StateLoadResult;
(function (StateLoadResult) {
    StateLoadResult[StateLoadResult["Ok"] = 0] = "Ok";
    StateLoadResult[StateLoadResult["NoData"] = 1] = "NoData";
    StateLoadResult[StateLoadResult["VersionMismatch"] = 2] = "VersionMismatch";
})(StateLoadResult || (StateLoadResult = {}));
var FlashTease = (function (_super) {
    __extends(FlashTease, _super);
    function FlashTease(id, renderTarget) {
        var _this = _super.call(this) || this;
        $(window).resize(function (e) {
            _this.width = renderTarget.width();
            _this.height = renderTarget.height();
            _this._currentClip.setBounds(_this.bounds);
        });
        _this._id = id;
        _this._renderTarget = renderTarget;
        _this._actionRegistry = new Array();
        _this.width = renderTarget.width();
        _this.height = renderTarget.height();
        return _this;
    }
    FlashTease.prototype.saveState = function () {
        window.localStorage.setItem("tease-" + this._id, Pcm2Compat.serialize(this._scriptHash));
    };
    FlashTease.prototype.loadState = function (force) {
        var data = window.localStorage.getItem("tease-" + this._id);
        if (!data || data == "") {
            return StateLoadResult.NoData;
        }
        var result = Pcm2Compat.deserialize(this._scriptHash, data, force);
        if (result == StateLoadResult.Ok) {
            this.runAction(Pcm2Compat.getCurrentAction().toString(), false);
        }
        return result;
    };
    FlashTease.prototype.load = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            return jQuery.get("script?id=" + _this._id, function (body, status, xhr) {
                console.log("downloaded script successfully");
                _this._scriptHash = SparkMD5.hash(body);
                _this._script = body;
                resolve();
            });
        });
    };
    FlashTease.prototype.loadMeta = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            return jQuery.get("meta?id=" + _this._id, function (body) {
                console.log("downloaded metadata successfully");
                MediaLoader.interpretMetainfo(body);
                MediaLoader.cacheAction(new ActionString("start"));
                resolve();
            });
        });
    };
    FlashTease.prototype.parse = function () {
        return __awaiter(this, void 0, void 0, function () {
            var actions, key, action, splitPos, actionId, command;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this._script) return [3, 3];
                        return [4, this.load()];
                    case 1:
                        _a.sent();
                        return [4, this.loadMeta()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        actions = Parser.explode("\n", this._script);
                        for (key in actions) {
                            action = actions[key];
                            if (action.length != 0) {
                                splitPos = action.indexOf("#");
                                if (splitPos == -1 || splitPos > action.indexOf("(")) {
                                    this.runCommandAsAction(new CommandString(action));
                                }
                                else {
                                    actionId = action.substr(0, splitPos);
                                    command = action.substr(splitPos + 1);
                                    this.addAction(actionId, command);
                                }
                            }
                        }
                        return [2];
                }
            });
        });
    };
    FlashTease.prototype.start = function () {
        this.runAction("start");
    };
    FlashTease.prototype.runAction = function (actionString, countRun) {
        if (countRun === void 0) { countRun = true; }
        var action = null;
        var actionId = null;
        var actionList = null;
        var i = NaN;
        if (actionString instanceof ActionString) {
            actionString = actionString.toString();
        }
        if (actionString instanceof CommandString) {
            actionString = actionString.toString();
        }
        actionId = this.resolveAction(actionString);
        console.log("Running action " + actionId + "...");
        if (actionId.toString() == "exittease") {
            window.localStorage.removeItem("tease-" + this._id);
            rating.show();
            return;
        }
        if (this._actionRegistry[actionId.toString()] != undefined) {
            action = this._actionRegistry[actionId.toString()];
            if (countRun) {
                Pcm2Compat.noteActionRun(actionId);
            }
            MediaLoader.cacheAction(actionId);
            if (action.substr(0, 1) == "{") {
                actionList = Parser.explodeWithParenthesis(";", action.substr(1));
                action = "mult(";
                i = 0;
                while (actionList.length) {
                    action = action + ("e" + i + ":" + actionList.shift());
                    i++;
                    if (actionList.length) {
                        action = action + ",";
                    }
                }
                action = action + ")";
            }
            var actionCommand = Parser.parseParameter(action);
            if (!(actionCommand instanceof CommandString)) {
                console.error(this, "Action " + actionId + " does not contain a valid command.");
            }
            this.runCommandAsAction(actionCommand);
            return;
        }
        console.error(this, "Action not found: " + actionId);
    };
    FlashTease.prototype.isValidAction = function (actionId) {
        return this._actionRegistry[actionId] != undefined;
    };
    FlashTease.prototype.runCommandAsAction = function (actionCommand) {
        this.clearCurrentClip();
        this._currentClip = actionCommand.getCmdObject();
        this._currentClip.setViewer(this);
        var inputVars = actionCommand.getInputVars();
        this.addChild(this._currentClip);
        this._currentClip.initialize(inputVars, this.bounds);
        this.render(this._renderTarget);
        this.saveState();
    };
    FlashTease.prototype.clearCurrentClip = function () {
        if (this._currentClip != null) {
            this._currentClip.destroy();
            if (this._currentClip.parent == this) {
                this.removeChild(this._currentClip);
            }
        }
    };
    FlashTease.prototype.resolveAction = function (actionString) {
        var actionId = null;
        var cmd = null;
        if (actionString.substr(-1) == ")") {
            cmd = new CommandString(actionString).loadCmdClip(this);
            actionId = cmd.getAction();
        }
        else {
            actionId = new ActionString(actionString);
        }
        return actionId;
    };
    FlashTease.prototype.addAction = function (actionId, command) {
        this._actionRegistry[actionId] = command;
    };
    Object.defineProperty(FlashTease.prototype, "bounds", {
        get: function () {
            return {
                "x": this.x,
                "y": this.y,
                "width": this.width,
                "height": this.height
            };
        },
        enumerable: true,
        configurable: true
    });
    return FlashTease;
}(Control));
var CommandString = (function () {
    function CommandString(action) {
        this._action = action;
    }
    CommandString.prototype.getCmdObject = function () {
        var sepPos = this._action.indexOf("(");
        var cmd = this._action.substr(0, sepPos);
        var clip = Library.getCommandClass(cmd);
        return clip;
    };
    CommandString.prototype.loadCmdClip = function (viewer, bounds) {
        if (bounds === void 0) { bounds = null; }
        var clip = this.getCmdObject();
        var inputVars = this.getInputVars();
        clip.setViewer(viewer);
        if (bounds == null) {
            bounds = {
                "x": 0,
                "y": 0,
                "width": 0,
                "height": 0
            };
        }
        clip.initialize(inputVars, bounds);
        return clip;
    };
    CommandString.prototype.getInputVars = function () {
        var sepPos = this._action.indexOf("(");
        var cmdParams = this._action.substr(sepPos + 1, this._action.length - sepPos - 2);
        return Parser.parseParamList(cmdParams);
    };
    CommandString.prototype.toString = function () {
        return this._action;
    };
    return CommandString;
}());
var Library = (function () {
    function Library() {
    }
    Library.getCommandClass = function (command) {
        switch (command) {
            case "buttons":
                return new Buttons();
            case "page":
                return new Page();
            case "text":
                return new TextView();
            case "pic":
                return new Pic();
            case "mult":
                return new Mult();
            case "yn":
                return new Yn();
            case "set":
                return new SetCommand();
            case "unset":
                return new UnsetCommand();
            case "delay":
                return new Delay();
            case "go":
                return new Go();
            case "range":
                return new RangeCommand();
            case "dummy":
                return new Dummy();
            case "goto":
                return new Goto();
            case "horiz":
                return new Horiz();
            case "vert":
                return new Vert();
            case "must":
                return new Must();
            case "mustnot":
                return new MustNot();
            case "numactions":
                return new NumActions();
            case "numactionsfrom":
                return new NumActionsFrom();
            case "random":
                return new RandomCommand();
            case "repeat":
                return new Repeat();
            case "repeatadd":
                return new RepeatAdd();
            case "repeatdel":
                return new RepeatDel();
            case "repeatset":
                return new RepeatSet();
            case "sound":
                return new SoundCommand();
        }
        console.log("Invalid command: " + command);
        return new Dummy();
    };
    return Library;
}());
var ActionString = (function () {
    function ActionString(string) {
        var _this = this;
        this.toString = function () {
            return _this._string;
        };
        this._string = string;
    }
    return ActionString;
}());
var Settings = (function () {
    function Settings() {
    }
    Settings.get = function (key, defaultValue) {
        if (defaultValue === void 0) { defaultValue = null; }
        if (Settings._settings[key] == undefined) {
            return defaultValue;
        }
        return Settings._settings[key];
    };
    Settings.set = function (key, newValue) {
        Settings._settings[key] = newValue;
    };
    return Settings;
}());
Settings._settings = Array();
var MediaImage = (function () {
    function MediaImage(url) {
        this.url = url;
    }
    return MediaImage;
}());
var Sound = (function () {
    function Sound(url) {
        this.url = url;
    }
    return Sound;
}());
var MediaLoader = (function () {
    function MediaLoader() {
    }
    MediaLoader.showImage = function (url, onload) {
        if (onload === void 0) { onload = null; }
        if (MediaLoader._loadedImages[url] != null) {
            console.log("Image " + url + " from cache...");
            var result = MediaLoader._loadedImages[url];
            if (url.indexOf("*") > -1) {
                delete MediaLoader._loadedImages[url];
            }
            return result;
        }
        else {
            console.log("Downloading image " + url + " ...");
            url = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
            $.get(url, function (realurl) {
                MediaLoader._loadedImages[url] = new MediaImage(realurl);
                onload(realurl);
            });
        }
        return null;
    };
    MediaLoader.getSound = function (url, onload) {
        if (onload === void 0) { onload = null; }
        if (MediaLoader._loadedSounds[url] != null) {
            console.log("Sound " + url + " from cache...");
            var result = MediaLoader._loadedSounds[url];
            if (url.indexOf("*") > -1) {
                delete MediaLoader._loadedSounds[url];
            }
            return result;
        }
        else {
            console.log("Downloading sound " + url + " ...");
            url = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
            $.get(url, function (realurl) {
                MediaLoader._loadedSounds[url] = new Sound(realurl);
                onload(realurl);
            });
        }
    };
    MediaLoader.emptyQueue = function () {
        MediaLoader._queue = [];
    };
    MediaLoader.queueMedia = function (url) {
        MediaLoader._queue.push(url);
    };
    MediaLoader.runQueue = function () {
        if (MediaLoader._queueRunning) {
            return;
        }
        MediaLoader._queueRunning = true;
        MediaLoader.loadNextQueueItem();
    };
    MediaLoader.loadNextQueueItem = function (event) {
        if (event === void 0) { event = null; }
        window.clearInterval(MediaLoader._queueIdleTimer);
        if (MediaLoader._queue.length == 0) {
            MediaLoader._queueIdleTimer = window.setInterval(MediaLoader.loadNextQueueItem, 1000);
            return;
        }
        var item = MediaLoader._queue.shift();
        if (item.substr(0, 4) == "pic:") {
            MediaLoader.loadImage(item.substr(4));
        }
        else if (item.substr(0, 6) == "sound:") {
            MediaLoader.loadSound(item.substr(6));
        }
        else {
            MediaLoader.loadNextQueueItem();
        }
    };
    MediaLoader.loadSound = function (url) {
        if (MediaLoader._loadedSounds[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }
        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");
        $.get(fullurl, function (realurl) {
            var sound = document.createElement("audio");
            sound.autoplay = false;
            sound.preload = "auto";
            sound.addEventListener("loadeddata", function (e) {
                MediaLoader._loadedSounds[url] = new Sound(realurl);
                MediaLoader._loadedSounds[url].audio = e.target;
                MediaLoader.loadNextQueueItem();
            });
            sound.src = realurl;
        });
    };
    MediaLoader.loadImage = function (url) {
        if (MediaLoader._loadedImages[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }
        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");
        $.get(fullurl, function (realurl) {
            var img = document.createElement("img");
            img.addEventListener("load", function (e) {
                var loadedimg = e.target;
                MediaLoader._loadedImages[url] = new MediaImage(realurl);
                MediaLoader._loadedImages[url].width = loadedimg.width;
                MediaLoader._loadedImages[url].height = loadedimg.height;
                MediaLoader.loadNextQueueItem();
            });
            img.src = realurl;
        });
    };
    MediaLoader.cacheAction = function (actionId) {
        MediaLoader.emptyQueue();
        MediaLoader.queueActionMedia(actionId);
        for (var i in MediaLoader._execTree[actionId.toString()]) {
            MediaLoader.queueActionMedia(MediaLoader._execTree[actionId.toString()][i]);
        }
        MediaLoader.runQueue();
    };
    MediaLoader.queueActionMedia = function (actionId) {
        for (var i in MediaLoader._mediaList[actionId.toString()]) {
            MediaLoader.queueMedia(MediaLoader._mediaList[actionId.toString()][i]);
        }
    };
    MediaLoader.interpretMetainfo = function (metainfo) {
        var i = null;
        var sep = NaN;
        var action = null;
        var parts = null;
        var j = null;
        console.log("MetaInfo loaded.");
        var metaArray = metainfo.split("\n");
        var authorId = metaArray[0];
        var title = metaArray[1];
        var author = metaArray[2];
        Settings.set("mediaFolder", authorId + "/" + Settings.get("teaseId"));
        metaArray = metaArray.slice(3);
        var mode = 1;
        for (i in metaArray) {
            if (metaArray[i] == "==============================") {
                mode = 2;
            }
            else if (mode > 0) {
                sep = metaArray[i].indexOf("#");
                action = new ActionString(metaArray[i].substr(0, sep));
                parts = metaArray[i].substr(sep + 1).split(",");
                for (j in parts) {
                    if (mode == 1) {
                        MediaLoader.addMediaInstance(action, parts[j]);
                    }
                    else {
                        MediaLoader.addExecRelation(action, new ActionString(parts[j]));
                    }
                }
            }
        }
    };
    MediaLoader.addExecRelation = function (action, target) {
        if (MediaLoader._execTree[action.toString()] == null) {
            MediaLoader._execTree[action.toString()] = new Array();
        }
        MediaLoader._execTree[action.toString()].push(target);
    };
    MediaLoader.addMediaInstance = function (action, url) {
        if (MediaLoader._mediaList[action.toString()] == null) {
            MediaLoader._mediaList[action.toString()] = new Array();
        }
        MediaLoader._mediaList[action.toString()].push(url);
    };
    return MediaLoader;
}());
MediaLoader._mediaList = new Array();
MediaLoader._execTree = new Array();
MediaLoader._queue = new Array();
MediaLoader._queueRunning = false;
MediaLoader._loadedImages = new Array();
MediaLoader._loadedSounds = new Array();
var Pcm2Compat = (function () {
    function Pcm2Compat() {
    }
    Pcm2Compat.serialize = function (scriptHash) {
        var obj = {
            version: 1,
            hash: scriptHash,
            actionSet: Pcm2Compat._actionSet,
            currentAction: Pcm2Compat._currentAction.toString(),
            actionRunCounter: Pcm2Compat._actionRunCounter,
            actionFirstRun: Pcm2Compat._actionFirstRun,
            actionLastRun: Pcm2Compat._actionLastRun,
            actionRepeat: Pcm2Compat._actionRepeat,
            actionNumActions: Pcm2Compat._actionNumActions,
            actionMustNot: Pcm2Compat._actionMustNot,
            actionMust: Pcm2Compat._actionMust,
            actionNumActionsFrom: Pcm2Compat._actionNumActionsFrom
        };
        return JSON.stringify(obj);
    };
    Pcm2Compat.deserialize = function (scriptHash, json, force) {
        var data = JSON.parse(json);
        if (data == null) {
            return StateLoadResult.NoData;
        }
        if (!force && data.hash != scriptHash) {
            return StateLoadResult.VersionMismatch;
        }
        Pcm2Compat._actionSet = data.actionSet;
        Pcm2Compat._currentAction = new ActionString(data.currentAction);
        Pcm2Compat._actionRunCounter = data.actionRunCounter;
        Pcm2Compat._actionFirstRun = data.actionFirstRun;
        Pcm2Compat._actionLastRun = data.actionLastRun;
        Pcm2Compat._actionRepeat = data.actionRepeat;
        Pcm2Compat._actionNumActions = data.actionNumActions;
        Pcm2Compat._actionMustNot = data.actionMustNot;
        Pcm2Compat._actionMust = data.actionMust;
        Pcm2Compat._actionNumActionsFrom = data.actionNumActionsFrom;
        return StateLoadResult.Ok;
    };
    Pcm2Compat.setAction = function (actionId) {
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        Pcm2Compat._actionSet[actionId.toString()] = Pcm2Compat._actionSet[actionId.toString()] + 1;
    };
    Pcm2Compat.unsetAction = function (actionId) {
        Pcm2Compat._actionSet[actionId.toString()] = 0;
    };
    Pcm2Compat.noteActionRun = function (actionId) {
        Pcm2Compat._currentAction = actionId;
        Pcm2Compat._actionRunCounter++;
        Pcm2Compat.setAction(actionId);
        if (Pcm2Compat._actionFirstRun[actionId.toString()] == undefined) {
            Pcm2Compat._actionFirstRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
        }
        Pcm2Compat._actionLastRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
    };
    Pcm2Compat.checkRelations = function (actionId) {
        var i = null;
        var actionsSince = NaN;
        if (Pcm2Compat.isSetAction(actionId)) {
            console.log(actionId + " relation unfulfilled: action is set");
            return false;
        }
        for (i in Pcm2Compat._actionMust[actionId.toString()]) {
            if (!Pcm2Compat.isSetAction(Pcm2Compat._actionMust[actionId.toString()][i])) {
                console.log(actionId + " relation unfulfilled: must " + Pcm2Compat._actionMust[actionId.toString()][i]);
                return false;
            }
        }
        for (i in Pcm2Compat._actionMustNot[actionId.toString()]) {
            if (Pcm2Compat.isSetAction(Pcm2Compat._actionMustNot[actionId.toString()][i])) {
                console.log(actionId + " relation unfulfilled: mustnot " + Pcm2Compat._actionMustNot[actionId.toString()][i]);
                return false;
            }
        }
        if (Pcm2Compat._actionNumActions[actionId.toString()] != undefined) {
            if (Pcm2Compat._actionRunCounter < Pcm2Compat._actionNumActions[actionId.toString()]) {
                console.log(actionId + " relation unfulfilled: numactions > " + Pcm2Compat._actionNumActions[actionId.toString()] + " (but is " + Pcm2Compat._actionRunCounter + ")");
                return false;
            }
        }
        for (i in Pcm2Compat._actionNumActionsFrom[actionId.toString()]) {
            actionsSince = Pcm2Compat._actionRunCounter - Pcm2Compat._actionFirstRun[Pcm2Compat._actionNumActionsFrom[actionId.toString()][i].since];
            if (actionsSince < Pcm2Compat._actionNumActionsFrom[actionId.toString()][i].num) {
                console.log(actionId + " relation unfulfilled: numactionsfrom " + Pcm2Compat._actionNumActionsFrom[actionId.toString()][i].since + " > " + Pcm2Compat._actionNumActionsFrom[actionId.toString()][i].num + " (but is " + actionsSince + ")");
                return false;
            }
        }
        console.log(actionId + " all relations fulfilled");
        return true;
    };
    Pcm2Compat.addMustNotRelation = function (actionId, mustNotActionId) {
        if (Pcm2Compat._actionMustNot[actionId.toString()] == undefined) {
            Pcm2Compat._actionMustNot[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMustNot[actionId.toString()].push(mustNotActionId);
    };
    Pcm2Compat.addMustRelation = function (actionId, mustActionId) {
        if (Pcm2Compat._actionMust[actionId.toString()] == undefined) {
            Pcm2Compat._actionMust[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMust[actionId.toString()].push(mustActionId);
    };
    Pcm2Compat.addNumActionsFromRelation = function (actionId, sinceActionId, numActionsFrom) {
        if (Pcm2Compat._actionNumActionsFrom[actionId.toString()] == undefined) {
            Pcm2Compat._actionNumActionsFrom[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionNumActionsFrom[actionId.toString()].push({
            "num": numActionsFrom,
            "since": sinceActionId
        });
    };
    Pcm2Compat.addNumActionsRelation = function (actionId, numActions) {
        Pcm2Compat._actionNumActions[actionId.toString()] = numActions;
    };
    Pcm2Compat.getCurrentAction = function () {
        return Pcm2Compat._currentAction;
    };
    Pcm2Compat.addRepeat = function (actionId, count) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] + count;
    };
    Pcm2Compat.setRepeat = function (actionId, count) {
        Pcm2Compat._actionRepeat[actionId.toString()] = count;
    };
    Pcm2Compat.delRepeat = function (actionId, count) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] - count;
    };
    Pcm2Compat.isSetAction = function (actionId) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        return Pcm2Compat._actionSet[actionId.toString()] >= Pcm2Compat._actionRepeat[actionId.toString()];
    };
    return Pcm2Compat;
}());
Pcm2Compat._actionSet = new Array();
Pcm2Compat._actionRunCounter = 0;
Pcm2Compat._actionFirstRun = new Array();
Pcm2Compat._actionLastRun = new Array();
Pcm2Compat._actionRepeat = new Array();
Pcm2Compat._actionNumActions = new Array();
Pcm2Compat._actionMustNot = new Array();
Pcm2Compat._actionMust = new Array();
Pcm2Compat._actionNumActionsFrom = new Array();
var Command = (function (_super) {
    __extends(Command, _super);
    function Command() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Command.prototype.initialize = function (inputVars, bounds) {
        this.bounds = bounds;
    };
    Command.prototype.setBounds = function (bounds) {
        this.bounds = bounds;
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
    };
    Command.prototype.setViewer = function (viewer) {
        this.viewer = viewer;
    };
    return Command;
}(Control));
var InvisibleCommand = (function (_super) {
    __extends(InvisibleCommand, _super);
    function InvisibleCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InvisibleCommand.prototype.render = function (target) { };
    return InvisibleCommand;
}(Command));
var Dummy = (function (_super) {
    __extends(Dummy, _super);
    function Dummy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return Dummy;
}(InvisibleCommand));
var SetCommand = (function (_super) {
    __extends(SetCommand, _super);
    function SetCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SetCommand.prototype.initialize = function (inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.setAction(inputVars["action" + i]);
        }
    };
    return SetCommand;
}(InvisibleCommand));
var UnsetCommand = (function (_super) {
    __extends(UnsetCommand, _super);
    function UnsetCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UnsetCommand.prototype.initialize = function (inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.unsetAction(inputVars["action" + i]);
        }
    };
    return UnsetCommand;
}(InvisibleCommand));
var Goto = (function (_super) {
    __extends(Goto, _super);
    function Goto() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Goto.prototype.initialize = function (inputVars, bounds) {
        this.viewer.runAction(inputVars.target);
    };
    return Goto;
}(InvisibleCommand));
var Must = (function (_super) {
    __extends(Must, _super);
    function Must() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Must.prototype.initialize = function (inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.addMustRelation(inputVars.self, inputVars["action" + i]);
        }
    };
    return Must;
}(InvisibleCommand));
var MustNot = (function (_super) {
    __extends(MustNot, _super);
    function MustNot() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MustNot.prototype.initialize = function (inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.addMustNotRelation(inputVars.self, inputVars["action" + i]);
        }
    };
    return MustNot;
}(InvisibleCommand));
var NumActions = (function (_super) {
    __extends(NumActions, _super);
    function NumActions() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumActions.prototype.initialize = function (inputVars, bounds) {
        Pcm2Compat.addNumActionsRelation(inputVars.self, inputVars.count);
    };
    return NumActions;
}(InvisibleCommand));
var NumActionsFrom = (function (_super) {
    __extends(NumActionsFrom, _super);
    function NumActionsFrom() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumActionsFrom.prototype.initialize = function (inputVars, bounds) {
        Pcm2Compat.addNumActionsFromRelation(inputVars.self, inputVars.since, inputVars.count);
    };
    return NumActionsFrom;
}(InvisibleCommand));
var RandomCommand = (function (_super) {
    __extends(RandomCommand, _super);
    function RandomCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RandomCommand.prototype.initialize = function (inputVars, bounds) {
        this._result = Math.floor(Math.random() * (inputVars.max - inputVars.min)) + inputVars.min;
        console.log("Random number between " + inputVars.min + " and " + inputVars.max + ": " + this._result);
    };
    RandomCommand.prototype.getResult = function () {
        return this._result;
    };
    return RandomCommand;
}(InvisibleCommand));
var Repeat = (function (_super) {
    __extends(Repeat, _super);
    function Repeat() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Repeat.prototype.initialize = function (inputVars, bounds) {
        if (inputVars.max != undefined) {
            this._total = Math.floor(Math.random() * (inputVars.max - inputVars.count)) + inputVars.count;
        }
        else {
            this._total = inputVars.count;
        }
        this._targetAction = inputVars.target;
    };
    Repeat.prototype.getAction = function () {
        var cur = Pcm2Compat.getCurrentAction();
        var scur = cur.toString();
        if (Repeat._repeats[scur] == undefined) {
            Repeat._repeats[scur] = 0;
        }
        if (Repeat._repeats[scur] < this._total) {
            Repeat._repeats[scur] = Repeat._repeats[scur] + 1;
            console.log("Repeating action (" + Repeat._repeats[scur] + "/" + this._total + ")...");
            return cur;
        }
        Repeat._repeats[scur] = 0;
        return this.viewer.resolveAction(this._targetAction.toString());
    };
    return Repeat;
}(InvisibleCommand));
Repeat._repeats = new Array();
var RangeCommand = (function (_super) {
    __extends(RangeCommand, _super);
    function RangeCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RangeCommand.prototype.initialize = function (inputVars, bounds) {
        var actionId = null;
        this._validActions = new Array();
        var prefix = inputVars.prefix != undefined ? inputVars.prefix : "";
        for (var n = inputVars.from; n <= inputVars.to; n++) {
            actionId = new ActionString(prefix + n.toString());
            if (this.viewer.isValidAction(actionId.toString()) && Pcm2Compat.checkRelations(actionId)) {
                this._validActions.push(actionId);
            }
        }
    };
    RangeCommand.prototype.getAction = function () {
        if (this._validActions == null || this._validActions.length == 0) {
            console.error("Range failed: All actions set!");
            return null;
        }
        var randomKey = Math.floor(Math.random() * this._validActions.length);
        return this._validActions[randomKey];
    };
    return RangeCommand;
}(InvisibleCommand));
var RepeatAdd = (function (_super) {
    __extends(RepeatAdd, _super);
    function RepeatAdd() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepeatAdd.prototype.initialize = function (inputVars, bounds) {
        Pcm2Compat.addRepeat(inputVars.target, inputVars.count);
    };
    return RepeatAdd;
}(InvisibleCommand));
var RepeatDel = (function (_super) {
    __extends(RepeatDel, _super);
    function RepeatDel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepeatDel.prototype.initialize = function (inputVars, bounds) {
        Pcm2Compat.delRepeat(inputVars.target, inputVars.count);
    };
    return RepeatDel;
}(InvisibleCommand));
var RepeatSet = (function (_super) {
    __extends(RepeatSet, _super);
    function RepeatSet() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RepeatSet.prototype.initialize = function (inputVars, bounds) {
        Pcm2Compat.setRepeat(inputVars.target, inputVars.count);
    };
    return RepeatSet;
}(InvisibleCommand));
var Delay = (function (_super) {
    __extends(Delay, _super);
    function Delay() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.CLOCKTEMPLATE = "<div>\n  <style>\n    .wrapper {\n      background:#E89E9E;\n      width:$SIZE$px;\n      height:$SIZE$px;\n      position:relative;\n      margin:4px auto;    \n      border:1px solid #B85959;\n      border-radius:50%;\n    }  \n    \n    .pie {\n      width:50%;\n      height:100%;\n      position:absolute;\n      background-color:#B85959;\n      transform-origin: 100% 50%;\n      border:0px solid rgba(0,0,0,0.4);\n    }\n    \n    .spinner {\n      border-radius:100% 0 0 100% / 50% 0 0 50%;\n      z-index:200;\n      border-right:none;            \n      animation: rota $SECONDS$s linear 1;\n      animation-fill-mode:forwards;\n    }\n    \n    .filler {\n      border-radius:0 100% 100% 0 / 0 50% 50% 0;\n      z-index:100;\n      border-left:none;\n      animation:mask $SECONDS$s steps(1,end) 1 reverse;\n      animation-fill-mode:forwards;\n      left:50%;\n      opacity:0;\n    }\n    \n    .mask {\n      width:50%;\n      height:100%;\n      position:absolute;\n      z-index:300;      \n      opacity:1;\n      background:inherit;\n      border-radius:100% 0 0 100% / 50% 0 0 50%;\n      animation:mask $SECONDS$s steps(1,end) 1;\n      animation-fill-mode:forwards;\n    }\n    \n    @keyframes rota {\n      0% { transform:rotate(0deg); }\n      100% { transform:rotate(360deg);}\n    }\n    \n    @keyframes mask {\n      0%        { opacity: 1; }\n      50%, 100% { opacity: 0; }\n    }\n    \n    .pietext {\n      position:relative;      \n      z-index:500;\n      height:100%;\n    }\n    \n    .pietext p {      \n      position:absolute;\n      top:60%;\n      transform:translate(-50%,-50%);\n      margin:0;\n      left:50%;\n      color:white;\n      font-weight:bold;\n    }\n  </style>\n  <div class=\"wrapper\">\n    <div class=\"pie spinner\"></div>\n    <div class=\"pie filler\"></div>\n    <div class=\"mask\"></div>    \n    <div class=\"pietext\"><p></p></div>\n  </div>\n</div>";
        _this.UNKNOWNTEMPLATE = "<div>\n  <style>\n    .wrapper {\n      background:#E89E9E;\n      width:$SIZE$px;\n      height:$SIZE$px;\n      position:relative;\n      margin:4px auto;    \n      border:1px solid #B85959;\n      border-radius:50%;\n    }  \n    \n    .pie {\n      width:50%;\n      height:100%;\n      position:absolute;\n      background-color:#B85959;\n      transform-origin: 100% 50%;\n    }\n    \n    .spinner {\n      border-radius:100% 0 0 100% / 50% 0 0 50%;\n      z-index:200;\n      border-right:none;           \n      transform:rotate(35deg);     \n    }\n    \n    .filler {\n      border-radius:0 100% 100% 0 / 0 50% 50% 0;\n      z-index:100;\n      border-left:none;\n      left:50%;\n      opacity:0;\n    }\n    \n    .mask {\n      width:50%;\n      height:100%;\n      position:absolute;\n      z-index:300;      \n      opacity:1;\n      background:inherit;\n      border-radius:100% 0 0 100% / 50% 0 0 50%;\n    }\n        \n    .pietext {\n      position:relative;      \n      z-index:500;\n      height:100%;\n    }\n    \n    .pietext p {      \n      position:absolute;\n      top:50%;\n      transform:translate(-50%,-50%);\n      margin:0;\n      left:50%;\n      color:white;\n      font-weight:bold;\n      font-size:90px;\n      font-family:serif;\n    }\n    \n    .fgpie {\n      background-color:white;\n      z-index:450;\n      position:absolute;\n      width:100%;\n      height:100%;\n      border-radius:50%;\n      opacity:0;\n      animation:mask 500ms ease infinite ; \n      animation-direction: alternate;\n    }\n    \n    @keyframes mask {\n      0%        { opacity: 0.5; }\n      50%, 100% { opacity: 0; }\n    }\n  </style>\n  <div class=\"wrapper\">\n    <div class=\"pie spinner\"></div>\n    <div class=\"pie filler\"></div>\n    <div class=\"mask\"></div>    \n    <div class=\"fgpie\"></div>  \n    <div class=\"pietext\"><p>?</p></div>\n  </div>\n</div>";
        return _this;
    }
    Delay.prototype.initialize = function (inputVars, bounds) {
        var _this = this;
        _super.prototype.initialize.call(this, inputVars, bounds);
        if (inputVars.time instanceof CommandString) {
            var cmd = inputVars.time.loadCmdClip(this.viewer);
            inputVars.time = cmd.getResult();
        }
        if (Settings.get("DEBUG", false)) {
            inputVars.style = "normal";
            inputVars.time = 2;
        }
        var startTime = new Date().getTime();
        var totalTime = inputVars.time * 1000;
        var targetTime = startTime + totalTime;
        if (inputVars.style == "secret") {
            var size = Math.min(bounds.width, bounds.height, 100);
            var clock = $(this.UNKNOWNTEMPLATE.split("$SIZE$").join(size.toString()));
            this.node.append(clock);
        }
        else if (inputVars.style == "hidden") {
            console.log("Hidden delay: " + inputVars.time + " seconds");
        }
        else {
            var size = Math.min(bounds.width, bounds.height, 100);
            var clock = $(this.CLOCKTEMPLATE.split("$SECONDS$").join(inputVars.time).split("$SIZE$").join(size.toString()));
            this._remainingTime = clock.find(".pietext>p");
            this.node.append(clock);
        }
        this._timer = window.setInterval(function () {
            var remainingSeconds = NaN;
            var remainingMinutes = NaN;
            if (_this._destroyed) {
                window.clearInterval(_this._timer);
                return;
            }
            var remainingTime = targetTime - new Date().getTime();
            var frame = Math.min(Math.ceil(400 * (1 - remainingTime / totalTime)), 400);
            if (inputVars.style != "secret" && inputVars.style != "hidden") {
                remainingSeconds = Math.ceil(remainingTime / 1000);
                if (remainingSeconds > 60) {
                    remainingMinutes = Math.floor(remainingSeconds / 60);
                    remainingSeconds = remainingSeconds % 60;
                    if (remainingSeconds < 10) {
                        _this._remainingTime.text(remainingMinutes + ":0" + remainingSeconds);
                    }
                    else {
                        _this._remainingTime.text(remainingMinutes + ":" + remainingSeconds);
                    }
                }
                else {
                    _this._remainingTime.text(remainingSeconds.toString());
                }
            }
            if (frame == 400) {
                window.clearInterval(_this._timer);
                _this.viewer.runAction(inputVars.target);
            }
        }, 100);
        this.setBounds(bounds);
    };
    Delay.prototype.destroy = function () {
        this._destroyed = true;
        _super.prototype.destroy.call(this);
    };
    return Delay;
}(Command));
var TextView = (function (_super) {
    __extends(TextView, _super);
    function TextView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TextView.prototype.initialize = function (inputVars, bounds) {
        _super.prototype.initialize.call(this, inputVars, bounds);
        this._textField = $('<p></p>');
        var text = $(inputVars.text);
        text.find("font").attr("size", function (i, old) {
            return Number(old) / 5;
        });
        text.find("font").attr("face", "");
        var regexp = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/gi;
        text.each(function () {
            $(this).html($(this).html().replace(regexp, '<a href="$1" target="_blank">$1</a>'));
        });
        this._textField.html($('<div>').append(text).html());
        this.node.append(this._textField);
        this.setBounds(bounds);
    };
    return TextView;
}(Command));
var Pic = (function (_super) {
    __extends(Pic, _super);
    function Pic() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Pic.prototype.initialize = function (inputVars, bounds) {
        var _this = this;
        _super.prototype.initialize.call(this, inputVars, bounds);
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }
        var image = MediaLoader.showImage(inputVars.id, function (url) { return _this.createImage(url, 0, 0); });
        if (image != null) {
            this.createImage(image.url, image.width, image.height);
        }
    };
    Pic.prototype.createImage = function (url, width, height) {
        var _this = this;
        this._img = $("<img />");
        this._img.css("position", "absolute");
        if (width != 0 || height != 0) {
            this._imgwidth = width;
            this._imgheight = height;
            this.setBounds(this.bounds);
        }
        else {
            console.log("image was not preloaded");
            this._img.load(function () {
                _this._imgwidth = _this._img.width();
                _this._imgheight = _this._img.height();
                _this.setBounds(_this.bounds);
            });
        }
        this._img.attr("src", url);
        this.node.append(this._img);
    };
    Pic.prototype.setBounds = function (bounds) {
        _super.prototype.setBounds.call(this, bounds);
        if (this._img == null) {
            return;
        }
        var factor = Math.min(bounds.width / this._imgwidth, bounds.height / this._imgheight);
        this._img.width(this._imgwidth * factor);
        this._img.height(this._imgheight * factor);
        this._img.css("left", (bounds.width - this._img.width()) / 2 + bounds.x);
        this._img.css("top", (bounds.height - this._img.height()) / 2 + bounds.y);
    };
    return Pic;
}(Command));
var SoundCommand = (function (_super) {
    __extends(SoundCommand, _super);
    function SoundCommand() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SoundCommand.prototype.initialize = function (inputVars, bounds) {
        var _this = this;
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }
        if (inputVars.loops == undefined) {
            inputVars.loops = 1;
        }
        var sound = MediaLoader.getSound(inputVars.id, function (url) { return _this.createElement(url); });
        if (sound != null) {
            this._sound = sound.audio;
            this._sound.play();
            this.node.append(this._sound);
        }
    };
    SoundCommand.prototype.createElement = function (url) {
        this._sound = new Audio(url);
        this._sound.play();
        this.node.append(this._sound);
    };
    SoundCommand.prototype.destroy = function () {
        if (this._sound && !this._sound.paused) {
            this._sound.pause();
        }
    };
    return SoundCommand;
}(InvisibleCommand));
var Mult = (function (_super) {
    __extends(Mult, _super);
    function Mult() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._elements = new Array();
        return _this;
    }
    Mult.prototype.initialize = function (inputVars, bounds) {
        _super.prototype.initialize.call(this, inputVars, bounds);
        for (var i = 0; inputVars["e" + i] instanceof CommandString; i++) {
            this._elements[i] = inputVars["e" + i].loadCmdClip(this.viewer, bounds);
            this.addChild(this._elements[i]);
        }
        this.setBounds(bounds);
    };
    Mult.prototype.destroy = function () {
        for (var i in this._elements) {
            this._elements[i].destroy();
        }
        _super.prototype.destroy.call(this);
    };
    Mult.prototype.setBounds = function (bounds) {
        _super.prototype.setBounds.call(this, bounds);
        var b = bounds;
        b.x = 0;
        b.y = 0;
        for (var i in this._elements) {
            this._elements[i].setBounds(b);
        }
    };
    return Mult;
}(Command));
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(text) {
        var _this = _super.call(this) || this;
        _this.node = $("<button>" + text + "</button>");
        _this.node.css("position", "absolute");
        return _this;
    }
    Button.prototype.addClickHandler = function (handler) {
        var _this = this;
        this.node.click(function (e) { return handler(_this); });
    };
    return Button;
}(Control));
var Go = (function (_super) {
    __extends(Go, _super);
    function Go() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Go.prototype.initialize = function (inputVars, bounds) {
        var _this = this;
        _super.prototype.initialize.call(this, inputVars, bounds);
        this._button = new Button("Continue");
        this._button.addClickHandler(function (s) {
            _this.viewer.runAction(inputVars.target);
        });
        this.addChild(this._button);
        this.setBounds(this.bounds);
    };
    Go.prototype.setBounds = function (bounds) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        _super.prototype.setBounds.call(this, bounds);
        this._button.y = 10;
        this._button.width = buttonwidth;
        this._button.height = buttonheight;
        this._button.x = bounds.width / 2 - this._button.width / 2;
    };
    return Go;
}(Command));
var Yn = (function (_super) {
    __extends(Yn, _super);
    function Yn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Yn.prototype.initialize = function (inputVars, bounds) {
        var _this = this;
        _super.prototype.initialize.call(this, inputVars, bounds);
        this._yesButton = new Button("YES");
        this._yesButton.addClickHandler(function (s) {
            _this.viewer.runAction(inputVars.yes.toString());
        });
        this.addChild(this._yesButton);
        this._noButton = new Button("NO");
        this._noButton.addClickHandler(function (s) {
            _this.viewer.runAction(inputVars.no.toString());
        });
        this.addChild(this._noButton);
        this.setBounds(this.bounds);
    };
    Yn.prototype.setBounds = function (bounds) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        _super.prototype.setBounds.call(this, bounds);
        this._yesButton.y = 10;
        this._yesButton.width = buttonwidth;
        this._yesButton.height = buttonheight;
        this._yesButton.x = bounds.width / 2 - this._yesButton.width / 2;
        this._noButton.y = 45;
        this._noButton.width = buttonwidth;
        this._noButton.height = buttonheight;
        this._noButton.x = bounds.width / 2 - this._noButton.width / 2;
    };
    return Yn;
}(Command));
var Horiz = (function (_super) {
    __extends(Horiz, _super);
    function Horiz() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._elements = new Array();
        return _this;
    }
    Horiz.prototype.initialize = function (inputVars, bounds) {
        _super.prototype.initialize.call(this, inputVars, bounds);
        for (var i = 0; inputVars["e" + i] instanceof CommandString; i++) {
            this._elements[i] = inputVars["e" + i].loadCmdClip(this.viewer, this.calculateElementBounds(bounds, i));
            this.addChild(this._elements[i]);
        }
        this.setBounds(bounds);
    };
    Horiz.prototype.setBounds = function (bounds) {
        _super.prototype.setBounds.call(this, bounds);
        for (var i in this._elements) {
            this._elements[i].setBounds(this.calculateElementBounds(bounds, Number(i)));
        }
    };
    Horiz.prototype.destroy = function () {
        for (var i in this._elements) {
            this._elements[i].destroy();
        }
    };
    Horiz.prototype.calculateElementBounds = function (bounds, element) {
        var widthPerElement = bounds.width / this._elements.length;
        return {
            "x": widthPerElement * element,
            "y": 0,
            "width": widthPerElement,
            "height": bounds.height
        };
    };
    return Horiz;
}(Command));
var Vert = (function (_super) {
    __extends(Vert, _super);
    function Vert() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Vert.prototype.calculateElementBounds = function (bounds, element) {
        var heightPerElement = bounds.height / this._elements.length;
        return {
            "x": 0,
            "y": heightPerElement * element,
            "width": bounds.width,
            "height": heightPerElement
        };
    };
    return Vert;
}(Horiz));
var Buttons = (function (_super) {
    __extends(Buttons, _super);
    function Buttons() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._buttonCaps = new Array();
        _this._buttons = new Array();
        return _this;
    }
    Buttons.prototype.initialize = function (inputVars, bounds) {
        _super.prototype.initialize.call(this, inputVars, bounds);
        var caption = null;
        for (var i = 0; inputVars["target" + i] != null; i++) {
            if (inputVars["cap" + i]) {
                caption = inputVars["cap" + i];
            }
            else {
                caption = i.toString();
            }
            this.addButton(i, inputVars["target" + i], caption);
        }
        this.setBounds(bounds);
    };
    Buttons.prototype.addButton = function (i, target, caption) {
        var _this = this;
        this._buttons[i] = new Button(caption);
        this._buttons[i].addClickHandler(function (button) {
            _this.viewer.runAction(target.toString());
        });
        this.addChild(this._buttons[i]);
    };
    Buttons.prototype.calculateButtonBounds = function (bounds, button) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        return {
            "x": bounds.width / 2 - buttonwidth / 2,
            "y": 35 * button,
            "width": buttonwidth,
            "height": buttonheight
        };
    };
    Buttons.prototype.setBounds = function (bounds) {
        _super.prototype.setBounds.call(this, bounds);
        for (var i in this._buttons) {
            var buttonBounds = this.calculateButtonBounds(bounds, Number(i));
            this._buttons[i].x = buttonBounds.x;
            this._buttons[i].y = buttonBounds.y;
            this._buttons[i].width = buttonBounds.width;
            this._buttons[i].height = buttonBounds.height;
        }
    };
    return Buttons;
}(Command));
var SplitView = (function (_super) {
    __extends(SplitView, _super);
    function SplitView() {
        var _this = _super.call(this) || this;
        _this.node.addClass("splitView");
        return _this;
    }
    return SplitView;
}(Command));
var Page = (function (_super) {
    __extends(Page, _super);
    function Page() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Page.prototype.initialize = function (inputVars, bounds) {
        _super.prototype.initialize.call(this, inputVars, bounds);
        if (inputVars.instruc instanceof CommandString || inputVars.action instanceof CommandString) {
            this._splitView = new SplitView();
            this.addChild(this._splitView);
            this.positionSidebar(bounds);
        }
        if (inputVars.text instanceof CommandString) {
            this._textClip = inputVars.text.loadCmdClip(this.viewer, "text", this.calculateTextBounds(bounds));
            this.addChild(this._textClip);
        }
        else if (inputVars.text.constructor.name == "String") {
            var textCommandString = new CommandString("text(text:\'" + inputVars.text.split("\'").join("\\\'") + "\')");
            this._textClip = textCommandString.loadCmdClip(this.viewer, this.calculateTextBounds(bounds));
            this.addChild(this._textClip);
        }
        if (inputVars.media instanceof CommandString) {
            this._mediaClip = inputVars.media.loadCmdClip(this.viewer, this.calculateMediaBounds(bounds));
            this.addChild(this._mediaClip);
        }
        if (inputVars.instruc instanceof CommandString) {
            this._instrucClip = inputVars.instruc.loadCmdClip(this.viewer, this.calculateInstrucBounds(bounds));
            this.addChild(this._instrucClip);
        }
        if (inputVars.action instanceof CommandString) {
            this._actionClip = inputVars.action.loadCmdClip(this.viewer, this.calculateActionBounds(bounds));
            this.addChild(this._actionClip);
        }
        if (inputVars.hidden instanceof CommandString) {
            this._hiddenClip = inputVars.hidden.loadCmdClip(this.viewer, {});
        }
        this.setBounds(bounds);
        if (this._splitView == null && this._actionClip == null && this._hiddenClip == null) {
            this._splitView = new SplitView();
            this.addChild(this._splitView);
            this.positionSidebar(bounds);
            var commandString = new CommandString("buttons(target0:\'exittease\',cap0:\'Exit Tease\')");
            this._actionClip = commandString.loadCmdClip(this.viewer, this.calculateActionBounds(bounds));
            this.addChild(this._actionClip);
        }
    };
    Page.prototype.setBounds = function (bounds) {
        if (this._splitView != null) {
            this.positionSidebar(bounds);
        }
        if (this._textClip != null) {
            this._textClip.setBounds(this.calculateTextBounds(bounds));
        }
        if (this._mediaClip != null) {
            this._mediaClip.setBounds(this.calculateMediaBounds(bounds));
        }
        if (this._instrucClip != null) {
            this._instrucClip.setBounds(this.calculateInstrucBounds(bounds));
        }
        if (this._actionClip != null) {
            this._actionClip.setBounds(this.calculateActionBounds(bounds));
        }
        _super.prototype.setBounds.call(this, bounds);
    };
    Page.prototype.destroy = function () {
        if (this._hiddenClip != null) {
            this._hiddenClip.destroy();
            this._hiddenClip = null;
        }
        _super.prototype.destroy.call(this);
    };
    Page.prototype.calculateTextBounds = function (bounds) {
        var newWidth = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        return {
            "x": bounds.x,
            "y": bounds.y + bounds.height * 0.7,
            "width": newWidth,
            "height": bounds.height * 0.3
        };
    };
    Page.prototype.calculateInstrucBounds = function (bounds) {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y,
            "width": 150,
            "height": bounds.height * 0.5
        };
    };
    Page.prototype.calculateMediaBounds = function (bounds) {
        var newWidth = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        return {
            "x": bounds.x,
            "y": bounds.y,
            "width": newWidth,
            "height": bounds.height * 0.7
        };
    };
    Page.prototype.calculateActionBounds = function (bounds) {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y + bounds.height * 0.5,
            "width": 150,
            "height": bounds.height * 0.5
        };
    };
    Page.prototype.positionSidebar = function (bounds) {
        this._splitView.x = bounds.x + bounds.width - 150;
        this._splitView.y = bounds.y;
        this._splitView.width = 150;
        this._splitView.height = bounds.height;
    };
    return Page;
}(Command));
var Parser = (function () {
    function Parser() {
    }
    Parser.explode = function (separator, string) {
        var nextIndex = NaN;
        var word = null;
        var list = new Array();
        if (separator == null) {
            return [];
        }
        if (string == null) {
            return [];
        }
        var currentStringPosition = 0;
        while (currentStringPosition < string.length) {
            nextIndex = string.indexOf(separator, currentStringPosition);
            if (nextIndex == -1) {
                break;
            }
            word = string.slice(currentStringPosition, nextIndex);
            list.push(word);
            currentStringPosition = nextIndex + 1;
        }
        if (list.length < 1) {
            list.push(string);
        }
        else {
            list.push(string.slice(currentStringPosition, string.length));
        }
        return list;
    };
    Parser.explodeWithParenthesis = function (separator, string) {
        var word = null;
        if (string == null) {
            return [];
        }
        var list = new Array();
        var current = "";
        var last = "";
        var state = 0;
        var level = 0;
        var slicePos = 0;
        for (var pos = 0; pos < string.length; pos++) {
            current = string.charAt(pos);
            switch (state) {
                case 0:
                    if (current == "\'") {
                        state = 1;
                    }
                    else if (current == "\"") {
                        state = 2;
                    }
                    else if (current == "(") {
                        level++;
                    }
                    else if (current == ")") {
                        level--;
                    }
                    else if (current == separator) {
                        if (level == 0) {
                            word = string.slice(slicePos, pos);
                            list.push(word);
                            slicePos = pos + 1;
                        }
                    }
                    break;
                case 1:
                    if (current == "\'" && last != "\\") {
                        state = 0;
                    }
                    break;
                case 2:
                    if (current == "\"" && last != "\\") {
                        state = 0;
                    }
            }
            last = current;
        }
        if (list.length < 1) {
            list.push(string);
        }
        else {
            list.push(string.slice(slicePos, string.length));
        }
        return list;
    };
    Parser.parseParameter = function (param) {
        if (param.substr(0, 1) == "\'" || param.substr(0, 1) == "\"") {
            return Parser.parseString(param);
        }
        if (param.substr(-1) == "#") {
            return new ActionString(param.substr(0, param.length - 1));
        }
        if (param.substr(-3) == "hrs" || param.substr(-3) == "min" || param.substr(-3) == "sec") {
            return Parser.parseTime(param);
        }
        if (!isNaN(parseInt(param))) {
            return parseInt(param);
        }
        if (param.indexOf("(") && param.substr(-1) == ")") {
            return new CommandString(param);
        }
        return param;
    };
    Parser.parseParamList = function (paramList) {
        var key = null;
        var parameter = null;
        var colonPos = NaN;
        var paramName = null;
        var paramValue = null;
        var cmdParams = Parser.explodeWithParenthesis(",", paramList);
        var cmdParamsAssoc = new Array();
        for (key in cmdParams) {
            parameter = cmdParams[key];
            colonPos = parameter.indexOf(":");
            paramName = parameter.substr(0, colonPos);
            paramValue = parameter.substr(colonPos + 1);
            cmdParamsAssoc[paramName] = Parser.parseParameter(paramValue);
        }
        return cmdParamsAssoc;
    };
    Parser.parseString = function (string) {
        string = string.substr(1, string.length - 2);
        string = string.split("\\\'").join("\'");
        return string;
    };
    Parser.parseTime = function (time) {
        var multiplier = time.substr(-3);
        var number = parseInt(time.substr(0, time.length - 3));
        if (multiplier == "hrs") {
            return number * 3600;
        }
        if (multiplier == "min") {
            return number * 60;
        }
        return number;
    };
    return Parser;
}());
var Rating = (function () {
    function Rating(target) {
        this._target = target;
        this.render();
        this._target.hide();
    }
    Rating.prototype.show = function () {
        this._target.show(1);
    };
    Rating.prototype.render = function () {
        var div = $("<div></div>");
        div.append("<p>Please rate this tease.</p>");
        var self = this;
        for (var i = 1; i <= 5; i++) {
            var star = $("<img src=\"images/ustar.png\" data-id=\"" + i + "\" title=\"" + i + " Star" + (i > 1 ? "s" : "") + "\" />");
            star.mouseenter(function (e) {
                self.highlight(div, Number($(e.target).attr("data-id")), true);
            });
            star.mouseout(function (e) {
                self.highlight(div, Number($(e.target).attr("data-id")), false);
            });
            star.click(function (e) {
                self.submit(Number($(e.target).attr("data-id")));
            });
            div.append(star);
        }
        div.append("<p><a href=\"/\">Go Back.</a></p>");
        this._target.append(div);
    };
    Rating.prototype.highlight = function (div, id, highlight) {
        var images = div.find("img");
        for (var i = 0; i < id; i++) {
            $(images[i]).attr("src", highlight ? "images/star.png" : "images/ustar.png");
        }
    };
    Rating.prototype.submit = function (id) {
        $.ajax({
            url: "vote?id=" + Settings.get("teaseId") + "&vote=" + id,
            type: 'GET',
            success: function (data) {
                location.href = "/";
            }
        });
    };
    return Rating;
}());
function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}
function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    }
    else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
    else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    }
    else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}
function runTease(id, resume) {
    return __awaiter(this, void 0, void 0, function () {
        var tease, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    Settings.set("teaseId", id);
                    $('#exit').click(function () {
                        rating.show();
                    });
                    rating = new Rating($("#rating"));
                    tease = new FlashTease(id, $("#tease"));
                    return [4, tease.parse()];
                case 1:
                    _a.sent();
                    $("#loading").hide();
                    if (resume == 1) {
                        result = tease.loadState(false);
                        if (result == StateLoadResult.VersionMismatch) {
                            console.log("Version mismatch with saved data");
                            if (confirm("The tease was updated since your last visit.\nContinuing may result in strange behavior. Do you really want to load your saved state?")) {
                                result = tease.loadState(true);
                            }
                        }
                        if (result != StateLoadResult.Ok) {
                            console.log("Failed to load state.");
                            tease.start();
                        }
                    }
                    else {
                        tease.start();
                    }
                    return [2];
            }
        });
    });
}
$().ready(function () { return runTease(Number(getQueryVariable("id")), Number(getQueryVariable("resume"))); });
//# sourceMappingURL=flashtease.js.map