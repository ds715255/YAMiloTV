var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var rating;
class Control {
    constructor() {
        this.children = Array();
        this._x = 0;
        this._y = 0;
        this._width = 0;
        this._height = 0;
        this.node = $("<div></div>");
        this.node.attr("flashclass", this.constructor.name);
    }
    get x() { return this._x; }
    set x(value) { this._x = value; this.updateNode(); }
    get y() { return this._y; }
    set y(value) { this._y = value; this.updateNode(); }
    get width() { return this._width; }
    set width(value) { this._width = value; this.updateNode(); }
    get height() { return this._height; }
    set height(value) { this._height = value; this.updateNode(); }
    get parent() { return this._parent; }
    set parent(value) { this._parent = value; }
    updateNode() {
        this.node.css("box-sizing", "content-box");
        this.node.width(this.width);
        this.node.height(this.height);
        this.node.css("left", this.x);
        this.node.css("top", this.y);
        this.node.css("position", "absolute");
        this.node.css("box-sizing", "");
    }
    render(target) {
        for (var idx in this.children) {
            this.children[idx].render(this.node);
        }
        target.append(this.node);
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
    removeChild(child) {
        child.parent = null;
        child.destroy();
        delete this.children[this.children.indexOf(child)];
    }
    destroy() {
        for (var idx in this.children) {
            this.children[idx].destroy();
        }
        this.node.remove();
    }
}
var StateLoadResult;
(function (StateLoadResult) {
    StateLoadResult[StateLoadResult["Ok"] = 0] = "Ok";
    StateLoadResult[StateLoadResult["NoData"] = 1] = "NoData";
    StateLoadResult[StateLoadResult["VersionMismatch"] = 2] = "VersionMismatch";
})(StateLoadResult || (StateLoadResult = {}));
class FlashTease extends Control {
    constructor(id, renderTarget) {
        super();
        $(window).resize(e => {
            this.width = renderTarget.width();
            this.height = renderTarget.height();
            this._currentClip.setBounds(this.bounds);
        });
        this._id = id;
        this._renderTarget = renderTarget;
        this._actionRegistry = new Array();
        this.width = renderTarget.width();
        this.height = renderTarget.height();
    }
    saveState() {
        window.localStorage.setItem(`tease-${this._id}`, Pcm2Compat.serialize(this._scriptHash));
    }
    loadState(force) {
        var data = window.localStorage.getItem(`tease-${this._id}`);
        if (!data || data == "") {
            return StateLoadResult.NoData;
        }
        var result = Pcm2Compat.deserialize(this._scriptHash, data, force);
        if (result == StateLoadResult.Ok) {
            this.runAction(Pcm2Compat.getCurrentAction().toString(), false);
        }
        return result;
    }
    load() {
        return new Promise((resolve, reject) => jQuery.get("script?id=" + this._id, (body, status, xhr) => {
            console.log("downloaded script successfully");
            this._scriptHash = SparkMD5.hash(body);
            this._script = body;
            resolve();
        }));
    }
    loadMeta() {
        return new Promise((resolve, reject) => jQuery.get("meta?id=" + this._id, (body) => {
            console.log("downloaded metadata successfully");
            MediaLoader.interpretMetainfo(body);
            MediaLoader.cacheAction(new ActionString("start"));
            resolve();
        }));
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._script) {
                yield this.load();
                yield this.loadMeta();
            }
            var actions = Parser.explode("\n", this._script);
            for (var key in actions) {
                var action = actions[key];
                if (action.length != 0) {
                    var splitPos = action.indexOf("#");
                    if (splitPos == -1 || splitPos > action.indexOf("(")) {
                        this.runCommandAsAction(new CommandString(action));
                    }
                    else {
                        var actionId = action.substr(0, splitPos);
                        var command = action.substr(splitPos + 1);
                        this.addAction(actionId, command);
                    }
                }
            }
        });
    }
    start() {
        this.runAction("start");
    }
    runAction(actionString, countRun = true) {
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
            window.localStorage.removeItem(`tease-${this._id}`);
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
    }
    isValidAction(actionId) {
        return this._actionRegistry[actionId] != undefined;
    }
    runCommandAsAction(actionCommand) {
        this.clearCurrentClip();
        this._currentClip = actionCommand.getCmdObject();
        this._currentClip.setViewer(this);
        var inputVars = actionCommand.getInputVars();
        this.addChild(this._currentClip);
        this._currentClip.initialize(inputVars, this.bounds);
        this.render(this._renderTarget);
        this.saveState();
    }
    clearCurrentClip() {
        if (this._currentClip != null) {
            this._currentClip.destroy();
            if (this._currentClip.parent == this) {
                this.removeChild(this._currentClip);
            }
        }
    }
    resolveAction(actionString) {
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
    }
    addAction(actionId, command) {
        this._actionRegistry[actionId] = command;
    }
    get bounds() {
        return {
            "x": this.x,
            "y": this.y,
            "width": this.width,
            "height": this.height
        };
    }
}
class CommandString {
    constructor(action) {
        this._action = action;
    }
    getCmdObject() {
        var sepPos = this._action.indexOf("(");
        var cmd = this._action.substr(0, sepPos);
        var clip = Library.getCommandClass(cmd);
        return clip;
    }
    loadCmdClip(viewer, bounds = null) {
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
    }
    getInputVars() {
        var sepPos = this._action.indexOf("(");
        var cmdParams = this._action.substr(sepPos + 1, this._action.length - sepPos - 2);
        return Parser.parseParamList(cmdParams);
    }
    toString() {
        return this._action;
    }
}
class Library {
    static getCommandClass(command) {
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
    }
}
class ActionString {
    constructor(string) {
        this.toString = () => {
            return this._string;
        };
        this._string = string;
    }
}
class Settings {
    static get(key, defaultValue = null) {
        if (Settings._settings[key] == undefined) {
            return defaultValue;
        }
        return Settings._settings[key];
    }
    static set(key, newValue) {
        Settings._settings[key] = newValue;
    }
}
Settings._settings = Array();
class MediaImage {
    constructor(url) {
        this.url = url;
    }
}
class Sound {
    constructor(url) {
        this.url = url;
    }
}
class MediaLoader {
    static showImage(url, onload = null) {
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
            $.get(url, realurl => {
                MediaLoader._loadedImages[url] = new MediaImage(realurl);
                onload(realurl);
            });
        }
        return null;
    }
    static getSound(url, onload = null) {
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
            $.get(url, realurl => {
                MediaLoader._loadedSounds[url] = new Sound(realurl);
                onload(realurl);
            });
        }
    }
    static emptyQueue() {
        MediaLoader._queue = [];
    }
    static queueMedia(url) {
        MediaLoader._queue.push(url);
    }
    static runQueue() {
        if (MediaLoader._queueRunning) {
            return;
        }
        MediaLoader._queueRunning = true;
        MediaLoader.loadNextQueueItem();
    }
    static loadNextQueueItem(event = null) {
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
    }
    static loadSound(url) {
        if (MediaLoader._loadedSounds[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }
        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");
        $.get(fullurl, realurl => {
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
    }
    static loadImage(url) {
        if (MediaLoader._loadedImages[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }
        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");
        $.get(fullurl, realurl => {
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
    }
    static cacheAction(actionId) {
        MediaLoader.emptyQueue();
        MediaLoader.queueActionMedia(actionId);
        for (var i in MediaLoader._execTree[actionId.toString()]) {
            MediaLoader.queueActionMedia(MediaLoader._execTree[actionId.toString()][i]);
        }
        MediaLoader.runQueue();
    }
    static queueActionMedia(actionId) {
        for (var i in MediaLoader._mediaList[actionId.toString()]) {
            MediaLoader.queueMedia(MediaLoader._mediaList[actionId.toString()][i]);
        }
    }
    static interpretMetainfo(metainfo) {
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
    }
    static addExecRelation(action, target) {
        if (MediaLoader._execTree[action.toString()] == null) {
            MediaLoader._execTree[action.toString()] = new Array();
        }
        MediaLoader._execTree[action.toString()].push(target);
    }
    static addMediaInstance(action, url) {
        if (MediaLoader._mediaList[action.toString()] == null) {
            MediaLoader._mediaList[action.toString()] = new Array();
        }
        MediaLoader._mediaList[action.toString()].push(url);
    }
}
MediaLoader._mediaList = new Array();
MediaLoader._execTree = new Array();
MediaLoader._queue = new Array();
MediaLoader._queueRunning = false;
MediaLoader._loadedImages = new Array();
MediaLoader._loadedSounds = new Array();
class Pcm2Compat {
    static serialize(scriptHash) {
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
    }
    static deserialize(scriptHash, json, force) {
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
    }
    static setAction(actionId) {
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        Pcm2Compat._actionSet[actionId.toString()] = Pcm2Compat._actionSet[actionId.toString()] + 1;
    }
    static unsetAction(actionId) {
        Pcm2Compat._actionSet[actionId.toString()] = 0;
    }
    static noteActionRun(actionId) {
        Pcm2Compat._currentAction = actionId;
        Pcm2Compat._actionRunCounter++;
        Pcm2Compat.setAction(actionId);
        if (Pcm2Compat._actionFirstRun[actionId.toString()] == undefined) {
            Pcm2Compat._actionFirstRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
        }
        Pcm2Compat._actionLastRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
    }
    static checkRelations(actionId) {
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
    }
    static addMustNotRelation(actionId, mustNotActionId) {
        if (Pcm2Compat._actionMustNot[actionId.toString()] == undefined) {
            Pcm2Compat._actionMustNot[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMustNot[actionId.toString()].push(mustNotActionId);
    }
    static addMustRelation(actionId, mustActionId) {
        if (Pcm2Compat._actionMust[actionId.toString()] == undefined) {
            Pcm2Compat._actionMust[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMust[actionId.toString()].push(mustActionId);
    }
    static addNumActionsFromRelation(actionId, sinceActionId, numActionsFrom) {
        if (Pcm2Compat._actionNumActionsFrom[actionId.toString()] == undefined) {
            Pcm2Compat._actionNumActionsFrom[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionNumActionsFrom[actionId.toString()].push({
            "num": numActionsFrom,
            "since": sinceActionId
        });
    }
    static addNumActionsRelation(actionId, numActions) {
        Pcm2Compat._actionNumActions[actionId.toString()] = numActions;
    }
    static getCurrentAction() {
        return Pcm2Compat._currentAction;
    }
    static addRepeat(actionId, count) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] + count;
    }
    static setRepeat(actionId, count) {
        Pcm2Compat._actionRepeat[actionId.toString()] = count;
    }
    static delRepeat(actionId, count) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] - count;
    }
    static isSetAction(actionId) {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        return Pcm2Compat._actionSet[actionId.toString()] >= Pcm2Compat._actionRepeat[actionId.toString()];
    }
}
Pcm2Compat._actionSet = new Array();
Pcm2Compat._actionRunCounter = 0;
Pcm2Compat._actionFirstRun = new Array();
Pcm2Compat._actionLastRun = new Array();
Pcm2Compat._actionRepeat = new Array();
Pcm2Compat._actionNumActions = new Array();
Pcm2Compat._actionMustNot = new Array();
Pcm2Compat._actionMust = new Array();
Pcm2Compat._actionNumActionsFrom = new Array();
class Command extends Control {
    initialize(inputVars, bounds) {
        this.bounds = bounds;
    }
    setBounds(bounds) {
        this.bounds = bounds;
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
    }
    setViewer(viewer) {
        this.viewer = viewer;
    }
}
class InvisibleCommand extends Command {
    render(target) { }
}
class Dummy extends InvisibleCommand {
}
class SetCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.setAction(inputVars["action" + i]);
        }
    }
}
class UnsetCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.unsetAction(inputVars["action" + i]);
        }
    }
}
class Goto extends InvisibleCommand {
    initialize(inputVars, bounds) {
        this.viewer.runAction(inputVars.target);
    }
}
class Must extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.addMustRelation(inputVars.self, inputVars["action" + i]);
        }
    }
}
class MustNot extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++) {
            Pcm2Compat.addMustNotRelation(inputVars.self, inputVars["action" + i]);
        }
    }
}
class NumActions extends InvisibleCommand {
    initialize(inputVars, bounds) {
        Pcm2Compat.addNumActionsRelation(inputVars.self, inputVars.count);
    }
}
class NumActionsFrom extends InvisibleCommand {
    initialize(inputVars, bounds) {
        Pcm2Compat.addNumActionsFromRelation(inputVars.self, inputVars.since, inputVars.count);
    }
}
class RandomCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        this._result = Math.floor(Math.random() * (inputVars.max - inputVars.min)) + inputVars.min;
        console.log("Random number between " + inputVars.min + " and " + inputVars.max + ": " + this._result);
    }
    getResult() {
        return this._result;
    }
}
class Repeat extends InvisibleCommand {
    initialize(inputVars, bounds) {
        if (inputVars.max != undefined) {
            this._total = Math.floor(Math.random() * (inputVars.max - inputVars.count)) + inputVars.count;
        }
        else {
            this._total = inputVars.count;
        }
        this._targetAction = inputVars.target;
    }
    getAction() {
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
    }
}
Repeat._repeats = new Array();
class RangeCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        var actionId = null;
        this._validActions = new Array();
        var prefix = inputVars.prefix != undefined ? inputVars.prefix : "";
        for (var n = inputVars.from; n <= inputVars.to; n++) {
            actionId = new ActionString(prefix + n.toString());
            if (this.viewer.isValidAction(actionId.toString()) && Pcm2Compat.checkRelations(actionId)) {
                this._validActions.push(actionId);
            }
        }
    }
    getAction() {
        if (this._validActions == null || this._validActions.length == 0) {
            console.error("Range failed: All actions set!");
            return null;
        }
        var randomKey = Math.floor(Math.random() * this._validActions.length);
        return this._validActions[randomKey];
    }
}
class RepeatAdd extends InvisibleCommand {
    initialize(inputVars, bounds) {
        Pcm2Compat.addRepeat(inputVars.target, inputVars.count);
    }
}
class RepeatDel extends InvisibleCommand {
    initialize(inputVars, bounds) {
        Pcm2Compat.delRepeat(inputVars.target, inputVars.count);
    }
}
class RepeatSet extends InvisibleCommand {
    initialize(inputVars, bounds) {
        Pcm2Compat.setRepeat(inputVars.target, inputVars.count);
    }
}
class Delay extends Command {
    constructor() {
        super(...arguments);
        this.CLOCKTEMPLATE = `<div>
  <style>
    .wrapper {
      background:#E89E9E;
      width:$SIZE$px;
      height:$SIZE$px;
      position:relative;
      margin:4px auto;    
      border:1px solid #B85959;
      border-radius:50%;
    }  
    
    .pie {
      width:50%;
      height:100%;
      position:absolute;
      background-color:#B85959;
      transform-origin: 100% 50%;
      border:0px solid rgba(0,0,0,0.4);
    }
    
    .spinner {
      border-radius:100% 0 0 100% / 50% 0 0 50%;
      z-index:200;
      border-right:none;            
      animation: rota $SECONDS$s linear 1;
      animation-fill-mode:forwards;
    }
    
    .filler {
      border-radius:0 100% 100% 0 / 0 50% 50% 0;
      z-index:100;
      border-left:none;
      animation:mask $SECONDS$s steps(1,end) 1 reverse;
      animation-fill-mode:forwards;
      left:50%;
      opacity:0;
    }
    
    .mask {
      width:50%;
      height:100%;
      position:absolute;
      z-index:300;      
      opacity:1;
      background:inherit;
      border-radius:100% 0 0 100% / 50% 0 0 50%;
      animation:mask $SECONDS$s steps(1,end) 1;
      animation-fill-mode:forwards;
    }
    
    @keyframes rota {
      0% { transform:rotate(0deg); }
      100% { transform:rotate(360deg);}
    }
    
    @keyframes mask {
      0%        { opacity: 1; }
      50%, 100% { opacity: 0; }
    }
    
    .pietext {
      position:relative;      
      z-index:500;
      height:100%;
    }
    
    .pietext p {      
      position:absolute;
      top:60%;
      transform:translate(-50%,-50%);
      margin:0;
      left:50%;
      color:white;
      font-weight:bold;
    }
  </style>
  <div class="wrapper">
    <div class="pie spinner"></div>
    <div class="pie filler"></div>
    <div class="mask"></div>    
    <div class="pietext"><p></p></div>
  </div>
</div>`;
        this.UNKNOWNTEMPLATE = `<div>
  <style>
    .wrapper {
      background:#E89E9E;
      width:$SIZE$px;
      height:$SIZE$px;
      position:relative;
      margin:4px auto;    
      border:1px solid #B85959;
      border-radius:50%;
    }  
    
    .pie {
      width:50%;
      height:100%;
      position:absolute;
      background-color:#B85959;
      transform-origin: 100% 50%;
    }
    
    .spinner {
      border-radius:100% 0 0 100% / 50% 0 0 50%;
      z-index:200;
      border-right:none;           
      transform:rotate(35deg);     
    }
    
    .filler {
      border-radius:0 100% 100% 0 / 0 50% 50% 0;
      z-index:100;
      border-left:none;
      left:50%;
      opacity:0;
    }
    
    .mask {
      width:50%;
      height:100%;
      position:absolute;
      z-index:300;      
      opacity:1;
      background:inherit;
      border-radius:100% 0 0 100% / 50% 0 0 50%;
    }
        
    .pietext {
      position:relative;      
      z-index:500;
      height:100%;
    }
    
    .pietext p {      
      position:absolute;
      top:50%;
      transform:translate(-50%,-50%);
      margin:0;
      left:50%;
      color:white;
      font-weight:bold;
      font-size:90px;
      font-family:serif;
    }
    
    .fgpie {
      background-color:white;
      z-index:450;
      position:absolute;
      width:100%;
      height:100%;
      border-radius:50%;
      opacity:0;
      animation:mask 500ms ease infinite ; 
      animation-direction: alternate;
    }
    
    @keyframes mask {
      0%        { opacity: 0.5; }
      50%, 100% { opacity: 0; }
    }
  </style>
  <div class="wrapper">
    <div class="pie spinner"></div>
    <div class="pie filler"></div>
    <div class="mask"></div>    
    <div class="fgpie"></div>  
    <div class="pietext"><p>?</p></div>
  </div>
</div>`;
    }
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
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
        this._timer = window.setInterval(() => {
            var remainingSeconds = NaN;
            var remainingMinutes = NaN;
            if (this._destroyed) {
                window.clearInterval(this._timer);
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
                        this._remainingTime.text(remainingMinutes + ":0" + remainingSeconds);
                    }
                    else {
                        this._remainingTime.text(remainingMinutes + ":" + remainingSeconds);
                    }
                }
                else {
                    this._remainingTime.text(remainingSeconds.toString());
                }
            }
            if (frame == 400) {
                window.clearInterval(this._timer);
                this.viewer.runAction(inputVars.target);
            }
        }, 100);
        this.setBounds(bounds);
    }
    destroy() {
        this._destroyed = true;
        super.destroy();
    }
}
class TextView extends Command {
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        this._textField = $('<p></p>');
        var text = $(inputVars.text);
        text.find("font").attr("size", (i, old) => {
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
    }
}
class Pic extends Command {
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }
        var image = MediaLoader.showImage(inputVars.id, (url) => this.createImage(url, 0, 0));
        if (image != null) {
            this.createImage(image.url, image.width, image.height);
        }
    }
    createImage(url, width, height) {
        this._img = $("<img />");
        this._img.css("position", "absolute");
        if (width != 0 || height != 0) {
            this._imgwidth = width;
            this._imgheight = height;
            this.setBounds(this.bounds);
        }
        else {
            console.log("image was not preloaded");
            this._img.load(() => {
                this._imgwidth = this._img.width();
                this._imgheight = this._img.height();
                this.setBounds(this.bounds);
            });
        }
        this._img.attr("src", url);
        this.node.append(this._img);
    }
    setBounds(bounds) {
        super.setBounds(bounds);
        if (this._img == null) {
            return;
        }
        let factor = Math.min(bounds.width / this._imgwidth, bounds.height / this._imgheight);
        this._img.width(this._imgwidth * factor);
        this._img.height(this._imgheight * factor);
        this._img.css("left", (bounds.width - this._img.width()) / 2 + bounds.x);
        this._img.css("top", (bounds.height - this._img.height()) / 2 + bounds.y);
    }
}
class SoundCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }
        if (inputVars.loops == undefined) {
            inputVars.loops = 1;
        }
        var sound = MediaLoader.getSound(inputVars.id, (url) => this.createElement(url));
        if (sound != null) {
            this._sound = sound.audio;
            this._sound.play();
            this.node.append(this._sound);
        }
    }
    createElement(url) {
        this._sound = new Audio(url);
        this._sound.play();
        this.node.append(this._sound);
    }
    destroy() {
        if (this._sound && !this._sound.paused) {
            this._sound.pause();
        }
    }
}
class Mult extends Command {
    constructor() {
        super(...arguments);
        this._elements = new Array();
    }
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        for (var i = 0; inputVars["e" + i] instanceof CommandString; i++) {
            this._elements[i] = inputVars["e" + i].loadCmdClip(this.viewer, bounds);
            this.addChild(this._elements[i]);
        }
        this.setBounds(bounds);
    }
    destroy() {
        for (var i in this._elements) {
            this._elements[i].destroy();
        }
        super.destroy();
    }
    setBounds(bounds) {
        super.setBounds(bounds);
        var b = bounds;
        b.x = 0;
        b.y = 0;
        for (var i in this._elements) {
            this._elements[i].setBounds(b);
        }
    }
}
class Button extends Control {
    constructor(text) {
        super();
        this.node = $("<button>" + text + "</button>");
        this.node.css("position", "absolute");
    }
    addClickHandler(handler) {
        this.node.click(e => handler(this));
    }
}
class Go extends Command {
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        this._button = new Button("Continue");
        this._button.addClickHandler(s => {
            this.viewer.runAction(inputVars.target);
        });
        this.addChild(this._button);
        this.setBounds(this.bounds);
    }
    setBounds(bounds) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        super.setBounds(bounds);
        this._button.y = 10;
        this._button.width = buttonwidth;
        this._button.height = buttonheight;
        this._button.x = bounds.width / 2 - this._button.width / 2;
    }
}
class Yn extends Command {
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        this._yesButton = new Button("YES");
        this._yesButton.addClickHandler(s => {
            this.viewer.runAction(inputVars.yes.toString());
        });
        this.addChild(this._yesButton);
        this._noButton = new Button("NO");
        this._noButton.addClickHandler(s => {
            this.viewer.runAction(inputVars.no.toString());
        });
        this.addChild(this._noButton);
        this.setBounds(this.bounds);
    }
    setBounds(bounds) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        super.setBounds(bounds);
        this._yesButton.y = 10;
        this._yesButton.width = buttonwidth;
        this._yesButton.height = buttonheight;
        this._yesButton.x = bounds.width / 2 - this._yesButton.width / 2;
        this._noButton.y = 45;
        this._noButton.width = buttonwidth;
        this._noButton.height = buttonheight;
        this._noButton.x = bounds.width / 2 - this._noButton.width / 2;
    }
}
class Horiz extends Command {
    constructor() {
        super(...arguments);
        this._elements = new Array();
    }
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        for (var i = 0; inputVars["e" + i] instanceof CommandString; i++) {
            this._elements[i] = inputVars["e" + i].loadCmdClip(this.viewer, this.calculateElementBounds(bounds, i));
            this.addChild(this._elements[i]);
        }
        this.setBounds(bounds);
    }
    setBounds(bounds) {
        super.setBounds(bounds);
        for (var i in this._elements) {
            this._elements[i].setBounds(this.calculateElementBounds(bounds, Number(i)));
        }
    }
    destroy() {
        for (var i in this._elements) {
            this._elements[i].destroy();
        }
    }
    calculateElementBounds(bounds, element) {
        var widthPerElement = bounds.width / this._elements.length;
        return {
            "x": widthPerElement * element,
            "y": 0,
            "width": widthPerElement,
            "height": bounds.height
        };
    }
}
class Vert extends Horiz {
    calculateElementBounds(bounds, element) {
        var heightPerElement = bounds.height / this._elements.length;
        return {
            "x": 0,
            "y": heightPerElement * element,
            "width": bounds.width,
            "height": heightPerElement
        };
    }
}
class Buttons extends Command {
    constructor() {
        super(...arguments);
        this._buttonCaps = new Array();
        this._buttons = new Array();
    }
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
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
    }
    addButton(i, target, caption) {
        this._buttons[i] = new Button(caption);
        this._buttons[i].addClickHandler((button) => {
            this.viewer.runAction(target.toString());
        });
        this.addChild(this._buttons[i]);
    }
    calculateButtonBounds(bounds, button) {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        return {
            "x": bounds.width / 2 - buttonwidth / 2,
            "y": 35 * button,
            "width": buttonwidth,
            "height": buttonheight
        };
    }
    setBounds(bounds) {
        super.setBounds(bounds);
        for (var i in this._buttons) {
            var buttonBounds = this.calculateButtonBounds(bounds, Number(i));
            this._buttons[i].x = buttonBounds.x;
            this._buttons[i].y = buttonBounds.y;
            this._buttons[i].width = buttonBounds.width;
            this._buttons[i].height = buttonBounds.height;
        }
    }
}
class SplitView extends Command {
    constructor() {
        super();
        this.node.addClass("splitView");
    }
}
class Page extends Command {
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
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
    }
    setBounds(bounds) {
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
        super.setBounds(bounds);
    }
    destroy() {
        if (this._hiddenClip != null) {
            this._hiddenClip.destroy();
            this._hiddenClip = null;
        }
        super.destroy();
    }
    calculateTextBounds(bounds) {
        var newWidth = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        return {
            "x": bounds.x,
            "y": bounds.y + bounds.height * 0.7,
            "width": newWidth,
            "height": bounds.height * 0.3
        };
    }
    calculateInstrucBounds(bounds) {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y,
            "width": 150,
            "height": bounds.height * 0.5
        };
    }
    calculateMediaBounds(bounds) {
        var newWidth = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        return {
            "x": bounds.x,
            "y": bounds.y,
            "width": newWidth,
            "height": bounds.height * 0.7
        };
    }
    calculateActionBounds(bounds) {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y + bounds.height * 0.5,
            "width": 150,
            "height": bounds.height * 0.5
        };
    }
    positionSidebar(bounds) {
        this._splitView.x = bounds.x + bounds.width - 150;
        this._splitView.y = bounds.y;
        this._splitView.width = 150;
        this._splitView.height = bounds.height;
    }
}
class Parser {
    static explode(separator, string) {
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
    }
    static explodeWithParenthesis(separator, string) {
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
    }
    static parseParameter(param) {
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
    }
    static parseParamList(paramList) {
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
    }
    static parseString(string) {
        string = string.substr(1, string.length - 2);
        string = string.split("\\\'").join("\'");
        return string;
    }
    static parseTime(time) {
        var multiplier = time.substr(-3);
        var number = parseInt(time.substr(0, time.length - 3));
        if (multiplier == "hrs") {
            return number * 3600;
        }
        if (multiplier == "min") {
            return number * 60;
        }
        return number;
    }
}
class Rating {
    constructor(target) {
        this._target = target;
        this.render();
        this._target.hide();
    }
    show() {
        this._target.show(1);
    }
    render() {
        var div = $("<div></div>");
        div.append("<p>Please rate this tease.</p>");
        var self = this;
        for (var i = 1; i <= 5; i++) {
            var star = $(`<img src="images/ustar.png" data-id="${i}" title="${i} Star${i > 1 ? "s" : ""}" />`);
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
    }
    highlight(div, id, highlight) {
        var images = div.find("img");
        for (var i = 0; i < id; i++) {
            $(images[i]).attr("src", highlight ? "images/star.png" : "images/ustar.png");
        }
    }
    submit(id) {
        $.ajax({
            url: `vote?id=${Settings.get("teaseId")}&vote=${id}`,
            type: 'GET',
            success: function (data) {
                location.href = "/";
            }
        });
    }
}
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
    return __awaiter(this, void 0, void 0, function* () {
        Settings.set("teaseId", id);
        $('#exit').click(() => {
            rating.show();
        });
        rating = new Rating($("#rating"));
        var tease = new FlashTease(id, $("#tease"));
        yield tease.parse();
        $("#loading").hide();
        if (resume == 1) {
            var result = tease.loadState(false);
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
    });
}
$().ready(() => runTease(Number(getQueryVariable("id")), Number(getQueryVariable("resume"))));
//# sourceMappingURL=flashtease.js.map