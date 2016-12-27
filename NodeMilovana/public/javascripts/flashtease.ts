var rating: Rating;

class Control {
    protected children: Array<Control> = Array()
    protected node: JQuery;

    constructor() {
        this.node = $("<div></div>");
        this.node.attr("flashclass", this.constructor.name);
    }

    private _x: number = 0;
    get x(): number { return this._x; }
    set x(value: number) { this._x = value; this.updateNode(); }

    private _y: number = 0;
    get y(): number { return this._y; }
    set y(value: number) { this._y = value; this.updateNode();}

    private _width: number = 0;
    get width(): number { return this._width; }
    set width(value: number) { this._width = value; this.updateNode();}

    private _height: number = 0;
    get height(): number { return this._height; }
    set height(value: number) { this._height = value; this.updateNode();}

    private _parent: Control;
    get parent(): Control { return this._parent; }
    set parent(value: Control) { this._parent= value; }

    private updateNode() {
        this.node.width(this.width);
        this.node.height(this.height);
        this.node.css("left", this.x);
        this.node.css("top", this.y);
        this.node.css("position", "absolute");
    }

    render(target: JQuery) {
        
        for (var idx in this.children) {
            this.children[idx].render(this.node);
        }

        target.append(this.node);
    }

    addChild(child: Control) {
        this.children.push(child);
        child.parent = this;
    }

    removeChild(child: Control) {
        child.parent = null;
        child.destroy();
        delete this.children[this.children.indexOf(child)];
        //this.children
    }

    destroy() {
        for (var idx in this.children) {
            this.children[idx].destroy();
        }
        this.node.remove();
    }
}


class FlashTease extends Control {
    _id: number;
    _script: string;
    _actionRegistry: Array<string>;
    _currentClip: Command;
    _renderTarget:JQuery

    constructor(id: number, renderTarget: JQuery) {
        super();

        $(window).resize(e => {
            
            this.width = renderTarget.width();
            this.height = renderTarget.height();
            this._currentClip.setBounds(this.bounds);
            /*this._renderTarget.children().remove();
            this.render(this._renderTarget);*/
        });

        this._id = id;
        this._renderTarget = renderTarget;
        this._actionRegistry = new Array<string>();
        this.width = renderTarget.width();
        this.height = renderTarget.height();

    }

    private load() {
        return new Promise<string>((resolve, reject) =>
            jQuery.get("script?id=" + this._id,
            (body) =>
            {
               console.log("downloaded script successfully");
               this._script = body;
               resolve();               
                
            }));
    }

    private loadMeta() {
        return new Promise<string>((resolve, reject) =>
            jQuery.get("meta?id=" + this._id,
                (body) => {
                    console.log("downloaded metadata successfully");
                    MediaLoader.interpretMetainfo(body);
                    MediaLoader.cacheAction(new ActionString("start"));
                    resolve();

                }));
    }

    async parse() {
        if (!this._script) {
            await this.load();
            await this.loadMeta();
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
    }

    start() {
        this.runAction("start");
    }

    runAction(actionString:string) {
        var action:any = null;
        var actionId: ActionString = null;
        var actionList: Array<string> = null;
        var i: number = NaN;


        if ((actionString as any) instanceof ActionString) {
            actionString = actionString.toString(); // may be ActionString
        }
        if ((actionString as any) instanceof CommandString) {
            actionString = actionString.toString(); // may be CommandString
        }
        actionId = this.resolveAction(actionString);
        console.log("Running action " + actionId + "...");

        if (actionId.toString() == "exittease") {
            rating.show();
            return;
        }

        if (this._actionRegistry[actionId.toString()] != undefined) {
            action = this._actionRegistry[actionId.toString()];
            Pcm2Compat.noteActionRun(actionId); 
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
            var actionCommand: any = Parser.parseParameter(action);
            if (!(actionCommand instanceof CommandString))
            {
                console.error(this, "Action " + actionId + " does not contain a valid command.");
            }
            this.runCommandAsAction(actionCommand as CommandString);
            return;
        }
        console.error(this, "Action not found: " + actionId);
    }

    isValidAction(actionId: string): boolean {
        return this._actionRegistry[actionId] != undefined;
    }

    private runCommandAsAction(actionCommand: CommandString) {
        this.clearCurrentClip();
        this._currentClip = actionCommand.getCmdObject();
        this._currentClip.setViewer(this);
        var inputVars: Array<string> = actionCommand.getInputVars();
        this.addChild(this._currentClip);
        this._currentClip.initialize(inputVars, this.bounds);

        
        this.render(this._renderTarget);
    }

    private clearCurrentClip(): void {
        if (this._currentClip != null) {
            this._currentClip.destroy();
            if (this._currentClip.parent == this) {
                this.removeChild(this._currentClip);
            }
        }
    }

    resolveAction(actionString: string) {
        var actionId: ActionString = null;
        var cmd: Command = null;
        if (actionString.substr(-1) == ")") {
            cmd = new CommandString(actionString).loadCmdClip(this);
            actionId = (cmd as ActionSelectorCommand).getAction();
        }
        else {
            actionId = new ActionString(actionString);
        }
        return actionId;
    }

    private addAction(actionId: string, command: string) {
        this._actionRegistry[actionId] = command;
    }

    private get bounds() {
        return {
            "x": this.x,
            "y": this.y,
            "width": this.width,
            "height": this.height
        };
    }
}

interface ActionSelectorCommand extends Command {
    getAction(): ActionString;
}

interface CalculatingCommand extends Command {
    getResult(): any;
}

class CommandString {
    _action: string;
    constructor(action: string) {
        this._action = action;
    }

    getCmdObject(): Command {
        var sepPos: number = this._action.indexOf("(");
        var cmd: string = this._action.substr(0, sepPos);
        var clip: Command = Library.getCommandClass(cmd);
        return clip;
    }

    loadCmdClip(viewer: FlashTease, bounds: any = null) : Command {
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
           // clip.visible = false; TODO
        }
        clip.initialize(inputVars, bounds);
        return clip;
    }

    getInputVars(): Array<any> {
        var sepPos: number = this._action.indexOf("(");
        var cmdParams: string = this._action.substr(sepPos + 1, this._action.length - sepPos - 2);
        return Parser.parseParamList(cmdParams);
    }

    toString(): String {
        return this._action;
    }
}

class Library {
    static getCommandClass(command: string): Command {
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
    _string: string;
    constructor(string: string) {
        this._string = string;
    }

    public toString = (): string => {
        return this._string;
    }
}

class Settings {
    static _settings: Array<any> = Array();
    static get(key: string, defaultValue: any = null): any {
        if (Settings._settings[key] == undefined) {
            return defaultValue;
        }
        return Settings._settings[key];
    }

    static set(key: string, newValue: any) {
        Settings._settings[key] = newValue;
    }
}

class MediaLoader {
    static _mediaList: Array<any> = new Array();
    static _execTree: Array<any> = new Array();
    static _queue: Array<any> = new Array();
    static _queueRunning: boolean = false;
    static _queueIdleTimer: number;
    static _loadedImages: Array<string> = new Array();
    static _loadedSounds: Array<string> = new Array();

    static showImage(url: string, onload:(url:string)=> void = null): string {        
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
                MediaLoader._loadedImages[url] = realurl;
                onload(realurl);
            });            
        }
        return null;
    }

    static getSound(url: string, onload: (url: string) => void = null): string {
        if (MediaLoader._loadedSounds[url] != null) {
            console.log("Image " + url + " from cache...");
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
                MediaLoader._loadedSounds[url] = realurl;
                onload(realurl);
            });
        }
    }

    private static emptyQueue() {
        MediaLoader._queue = [];
    }

    private static queueMedia(url: string) {
        MediaLoader._queue.push(url);
    }

    private static runQueue() {
        if (MediaLoader._queueRunning) {
            return;
        }
        MediaLoader._queueRunning = true;
        MediaLoader.loadNextQueueItem();
    }


    private static loadNextQueueItem(event: Event = null) {
        window.clearInterval(MediaLoader._queueIdleTimer);
        if (MediaLoader._queue.length == 0) {
            MediaLoader._queueIdleTimer = window.setInterval(MediaLoader.loadNextQueueItem, 1000);
            return;
        }
        var item: String = MediaLoader._queue.shift();
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

    private static loadSound(url: string) {
        if (MediaLoader._loadedSounds[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }
        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");

        $.get(fullurl, realurl => {
            var img = $("<img />");
            img.load((e) => {
                MediaLoader._loadedSounds[url] = realurl;
                MediaLoader.loadNextQueueItem();
            });
            // preload image
            img.attr("src", realurl);
        });
                
    }

    private static loadImage(url: string) {
        if (MediaLoader._loadedImages[url] != null) {
            MediaLoader.loadNextQueueItem();
            return;
        }

        var fullurl = "medialocation?folder=" + Settings.get("mediaFolder") + "&id=" + url;
        console.log("Preloading " + fullurl + "...");

        $.get(fullurl, realurl => {
            var img = $("<img />"); 
            img.load((e) => {
                MediaLoader._loadedImages[url] = realurl;
                MediaLoader.loadNextQueueItem();
            });
            // preload image
            img.attr("src", realurl);                
        });        
    }

    static cacheAction(actionId: ActionString) {        
        MediaLoader.emptyQueue();
        MediaLoader.queueActionMedia(actionId);
        for (var i in MediaLoader._execTree[actionId.toString()]) {
            MediaLoader.queueActionMedia(MediaLoader._execTree[actionId.toString()][i]);
        }
        MediaLoader.runQueue();
    }

    private static queueActionMedia(actionId: ActionString) {        
        for (var i in MediaLoader._mediaList[actionId.toString()]) {
            MediaLoader.queueMedia(MediaLoader._mediaList[actionId.toString()][i]);
        }
    }

    static interpretMetainfo(metainfo: string) {
        var i:any = null;
        var sep: number = NaN;
        var action: ActionString = null;
        var parts: Array<string> = null;
        var j: any = null;
        console.log("MetaInfo loaded.");
        var metaArray: Array<string> = metainfo.split("\n");
        var authorId = metaArray[0];
        var title = metaArray[1];
        var author = metaArray[2];
        Settings.set("mediaFolder", authorId+"/" + Settings.get("teaseId"));
        metaArray = metaArray.slice(3);
        var mode: Number = 1;
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

    private static addExecRelation(action: ActionString, target: ActionString) {
        if (MediaLoader._execTree[action.toString()] == null) {
            MediaLoader._execTree[action.toString()] = new Array();
        }
        MediaLoader._execTree[action.toString()].push(target);
    }

    private static addMediaInstance(action: ActionString, url: string) {
        if (MediaLoader._mediaList[action.toString()] == null) {
            MediaLoader._mediaList[action.toString()] = new Array();
        }
        MediaLoader._mediaList[action.toString()].push(url);
    }
}


class Pcm2Compat {
    private static _actionSet: Array<number> = new Array();
    private static _currentAction: ActionString;
    private static _actionRunCounter:number = 0;
    private static _actionFirstRun:Array<number> = new Array();
    private static _actionLastRun: Array<number> = new Array();
    private static _actionRepeat: Array<number> = new Array();
    private static _actionNumActions: Array<any> = new Array();
    private static _actionMustNot:Array<number> = new Array();
    private static _actionMust: Array<number> = new Array();
    private static _actionNumActionsFrom:Array<any> = new Array();

    static setAction(actionId: ActionString) {
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        Pcm2Compat._actionSet[actionId.toString()] = Pcm2Compat._actionSet[actionId.toString()] + 1;
    }

    static unsetAction(actionId: ActionString) {
        Pcm2Compat._actionSet[actionId.toString()] = 0;
    }


    static noteActionRun(actionId: ActionString) {
        Pcm2Compat._currentAction = actionId;
        Pcm2Compat._actionRunCounter++;
        Pcm2Compat.setAction(actionId);
        if (Pcm2Compat._actionFirstRun[actionId.toString()] == undefined) {
            Pcm2Compat._actionFirstRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
        }
        Pcm2Compat._actionLastRun[actionId.toString()] = Pcm2Compat._actionRunCounter;
    }

    static checkRelations(actionId: ActionString): boolean {
        var i:any = null;
        var actionsSince: number = NaN;
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

    static addMustNotRelation(actionId: ActionString, mustNotActionId: ActionString) {
        if (Pcm2Compat._actionMustNot[actionId.toString()] == undefined) {
            Pcm2Compat._actionMustNot[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMustNot[actionId.toString()].push(mustNotActionId);
    }

    static addMustRelation(actionId: ActionString, mustActionId: ActionString) {
        if (Pcm2Compat._actionMust[actionId.toString()] == undefined) {
            Pcm2Compat._actionMust[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionMust[actionId.toString()].push(mustActionId);
    }

    static addNumActionsFromRelation(actionId: ActionString, sinceActionId: string, numActionsFrom: number) {
        if (Pcm2Compat._actionNumActionsFrom[actionId.toString()] == undefined) {
            Pcm2Compat._actionNumActionsFrom[actionId.toString()] = new Array();
        }
        Pcm2Compat._actionNumActionsFrom[actionId.toString()].push({
            "num": numActionsFrom,
            "since": sinceActionId
        });
    }

    static addNumActionsRelation(actionId: ActionString, numActions: number): void {
        Pcm2Compat._actionNumActions[actionId.toString()] = numActions;
    }

    static getCurrentAction(): ActionString {
        return Pcm2Compat._currentAction;
    }

    static addRepeat(actionId: ActionString, count: number): void {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] + count;
    }

    static setRepeat(actionId: ActionString, count: number): void {
        Pcm2Compat._actionRepeat[actionId.toString()] = count;
    }

    static delRepeat(actionId: ActionString, count: number): void {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        Pcm2Compat._actionRepeat[actionId.toString()] = Pcm2Compat._actionRepeat[actionId.toString()] - count;
    }

    private static isSetAction(actionId: ActionString): boolean {
        if (Pcm2Compat._actionRepeat[actionId.toString()] == undefined) {
            Pcm2Compat._actionRepeat[actionId.toString()] = 1;
        }
        if (Pcm2Compat._actionSet[actionId.toString()] == undefined) {
            Pcm2Compat._actionSet[actionId.toString()] = 0;
        }
        return Pcm2Compat._actionSet[actionId.toString()] >= Pcm2Compat._actionRepeat[actionId.toString()];
    }
}

class Command extends Control {
    protected bounds: any;
    protected viewer: FlashTease
    private _inbounds: boolean

    initialize(inputVars: Array<string>, bounds: any) {
        this.bounds = bounds;
    }

    setBounds(bounds: any) {
        /*if (this._inbounds) return;
        this._inbounds = true;*/
        this.bounds = bounds;
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
        /*
        for (var i in this.children) {
            if (this.children[i] instanceof Command) {
                var c = this.children[i] as any;
                c.setBounds(bounds);
            }
        }*/
        //this._inbounds = false;
    }
    

    setViewer(viewer: FlashTease) {
        this.viewer = viewer;
    }
}

class InvisibleCommand extends Command {
    render(target: JQuery) {}
}

class Dummy extends InvisibleCommand {
    
}



class SetCommand extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i = 0; inputVars["action" + i] instanceof ActionString; i++)
        {
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
        for (var i: number = 0; inputVars["action" + i] instanceof ActionString; i++)
        {
            Pcm2Compat.addMustRelation(inputVars.self, inputVars["action" + i]);
        }
    }
}

class MustNot extends InvisibleCommand {
    initialize(inputVars, bounds) {
        for (var i: number = 0; inputVars["action" + i] instanceof ActionString; i++) {
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

class RandomCommand extends InvisibleCommand implements CalculatingCommand {
    private _result: number;

    initialize(inputVars, bounds) {
        this._result = Math.floor(Math.random() * (inputVars.max - inputVars.min)) + inputVars.min;
        console.log("Random number between " + inputVars.min + " and " + inputVars.max + ": " + this._result);
    }

    getResult(): Object {
        return this._result;
    }
}

class Repeat extends InvisibleCommand implements ActionSelectorCommand {
    private static _repeats:Array<number> = new Array();
    private _total:number;
    private _targetAction:ActionString;

    initialize(inputVars, bounds) {
        if (inputVars.max != undefined) {
            this._total = Math.floor(Math.random() * (inputVars.max - inputVars.count)) + inputVars.count;
        }
        else {
            this._total = inputVars.count;
        }
        this._targetAction = inputVars.target;
    }

    getAction(): ActionString {
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

class RangeCommand extends InvisibleCommand implements ActionSelectorCommand {
    private _validActions: Array<ActionString>;


    initialize(inputVars, bounds) {
        var actionId: ActionString = null;
        this._validActions = new Array();
        var prefix: string = inputVars.prefix != undefined ? inputVars.prefix : "";
        for (var n: number = inputVars.from; n <= inputVars.to; n++) {
            actionId = new ActionString(prefix + n.toString());
            if (this.viewer.isValidAction(actionId.toString()) && Pcm2Compat.checkRelations(actionId)) {
                this._validActions.push(actionId);
            }
        }
    }

    getAction(): ActionString {
        if (this._validActions == null || this._validActions.length == 0) {
            console.error("Range failed: All actions set!");
            return null;
        }
        var randomKey: number = Math.floor(Math.random() * this._validActions.length);
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
    
    private CLOCKTEMPLATE = `<div>
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

    private UNKNOWNTEMPLATE = `<div>
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

    private _destroyed: boolean;
    private _timer: number;
    private _remainingTime: JQuery;
    private _clockDisplay: JQuery;
    

    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);

        if (inputVars.time instanceof CommandString)
        {
            var cmd = (inputVars.time as CommandString).loadCmdClip(this.viewer);
            inputVars.time = (cmd as CalculatingCommand).getResult();
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
            var remainingSeconds: number = NaN;
            var remainingMinutes: number = NaN;
            if (this._destroyed) {
                window.clearInterval(this._timer);
                return;
            }
            var remainingTime: number = targetTime - new Date().getTime();
            var frame: number = Math.min(Math.ceil(400 * (1 - remainingTime / totalTime)), 400);
            if (inputVars.style != "secret" && inputVars.style != "hidden") {
                //_clockDisplay.gotoAndPlay(frame);
                
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
    _textField: JQuery;

    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);

        this._textField = $('<p style="text-align:center;margin:0 5px;"></p>');

        var text = $(inputVars.text);

        // modify fonts
        text.find("font").attr("size", (i, old) => {
            return Number(old) / 5
        });
        text.find("font").attr("face","");
        
        // replace link text with actual links
        var regexp = /(https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*))/gi;
        text.each(function () {
            $(this).html(
                $(this).html().replace(regexp, '<a href="$1" target="_blank">$1</a>')
            );
        });

        this._textField.html($('<div>').append(text).html());
        this._textField.css("padding", "20 10");
        this.node.css("overflow-y", "auto");
        this.node.append(this._textField);
        this.setBounds(bounds);
    }    
}


class Pic extends Command {
    _img: JQuery;
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }

        var url = MediaLoader.showImage(inputVars.id, (url) => this.createImage(url));
        if (url != null) {
            this.createImage(url);
        }
    }

    private createImage(url:string) {

        this._img = $("<img />");
        this._img.load(() => this.setBounds(this.bounds));
        this._img.attr("src", url);
        this._img.css("position","absolute");
        this.node.append(this._img);
    }

    setBounds(bounds: any) {
        super.setBounds(bounds);
        if (this._img == null) {
            return;
        }

        if (this._img.width() / this._img.height() > bounds.width / bounds.height) {
            this._img.width(bounds.width);
            this._img.css("left", bounds.x);
            this._img.css("top", bounds.y + (bounds.height - this._img.height()) / 2);
        }
        else {
            this._img.height(bounds.height);
            this._img.css("top", bounds.y);
            this._img.css("left", bounds.x + (bounds.width - this._img.width()) / 2);
        }
    }
}



class SoundCommand extends InvisibleCommand {
    
    _sound: HTMLAudioElement;

    initialize(inputVars, bounds) {
        if (inputVars.id == undefined) {
            inputVars.id = "";
        }
        if (inputVars.loops == undefined) {
            inputVars.loops = 1;
        }
        var url = MediaLoader.getSound(inputVars.id, (url) => this.createElement(url));
        if (url != null) {
            this.createElement(url);
        }
    }

    private createElement(url: string) {      
        this._sound = new Audio(url);
        this._sound.play();
        this.node.append(this._sound);
        // play
    }

    destroy() {
        if (this._sound && !this._sound.paused) {
            this._sound.pause();
        }
    }
}

class Mult extends Command {
    _elements: Array<Command> = new Array();

    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        for (var i = 0; inputVars["e" + i] instanceof CommandString; i++)
        {
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

    setBounds(bounds: any) {
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

    constructor(text: string) {
        super();
        this.node = $("<button>" + text + "</button>");
        this.node.css("position","absolute");
    }

    addClickHandler(handler: (sender: Button) => void) {
        this.node.click(e => handler(this));
    }


}

class Go extends Command {
    private _button: Button;
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        this._button = new Button("Continue");
        this._button.addClickHandler(s => {
            this.viewer.runAction(inputVars.target);
        });

        this.addChild(this._button);
        this.setBounds(this.bounds);
    }

    setBounds(bounds: any) {
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
    private _yesButton: Button;
    private _noButton: Button;
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

    setBounds(bounds: any) {
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
    protected _elements: Array<any> = new Array();
    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        for (var i: number = 0; inputVars["e" + i] instanceof CommandString; i++)
        {
            this._elements[i] = inputVars["e" + i].loadCmdClip(this.viewer, this.calculateElementBounds(bounds, i));
            this.addChild(this._elements[i]);
        }
        this.setBounds(bounds);
    }

    setBounds(bounds: any) {
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

    protected calculateElementBounds(bounds: any, element: number): Object {
        var widthPerElement: number = bounds.width / this._elements.length;
        return {
            "x": widthPerElement * element,
            "y": 0,
            "width": widthPerElement,
            "height": bounds.height
        };
    }
}


class Vert extends Horiz {
    protected calculateElementBounds(bounds: any, element: number): Object {
        var heightPerElement: number = bounds.height / this._elements.length;
        return {
            "x": 0,
            "y": heightPerElement * element,
            "width": bounds.width,
            "height": heightPerElement
        };
    }
}

class Buttons extends Command {
    _buttonCaps: Array<string> = new Array()
    _buttons: Array<any> = new Array()

    initialize(inputVars, bounds) {
        super.initialize(inputVars, bounds);
        var caption: string = null;
        
        for (var i: number = 0; inputVars["target" + i] != null; i++) {
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


    private addButton(i: number, target: ActionString, caption: string): void {
        this._buttons[i] = new Button(caption);
        this._buttons[i].addClickHandler((button) => {
            this.viewer.runAction(target.toString());
        });
        this.addChild(this._buttons[i]);
    }

    private calculateButtonBounds(bounds: any, button: number): any {
        var buttonwidth = bounds.width - 20;
        var buttonheight = 25;
        return {
            "x": bounds.width / 2 - buttonwidth / 2,
            "y": 35 * button,
            "width": buttonwidth,
            "height": buttonheight
        };
    }

    setBounds(bounds: any) {
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
        this.node.css("border-left", "2px solid #B85959");
        this.node.css("background-color","#F3E2E2");
    }
}

class Page extends Command {
    _textClip: Command;
    _splitView: Command;
    _instrucClip: Command;
    _hiddenClip: Command;
    _mediaClip: Command;
    _actionClip: Command;
    

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
        } else if (inputVars.text.constructor.name == "String") {
            var textCommandString = new CommandString("text(text:\'" + inputVars.text.split("\'").join("\\\'") + "\')");
            this._textClip = textCommandString.loadCmdClip(this.viewer, this.calculateTextBounds(bounds));
            this.addChild(this._textClip);
        }
        if (inputVars.media instanceof CommandString)
        {
            this._mediaClip = inputVars.media.loadCmdClip(this.viewer, this.calculateMediaBounds(bounds));
            this.addChild(this._mediaClip);
        }
        if (inputVars.instruc instanceof CommandString)
        {
            this._instrucClip = inputVars.instruc.loadCmdClip(this.viewer, this.calculateInstrucBounds(bounds));
            this.addChild(this._instrucClip);
        }
        if (inputVars.action instanceof CommandString)
        {
            this._actionClip = inputVars.action.loadCmdClip(this.viewer, this.calculateActionBounds(bounds));
            this.addChild(this._actionClip);
        }
        if (inputVars.hidden instanceof CommandString)
        {
            this._hiddenClip = inputVars.hidden.loadCmdClip(this.viewer, {});
        }
        this.setBounds(bounds);

        if (this._splitView == null && this._actionClip == null && this._hiddenClip == null) {
            // we seem to be done
            this._splitView = new SplitView();
            this.addChild(this._splitView);
            this.positionSidebar(bounds);
            var commandString = new CommandString("buttons(target0:\'exittease\',cap0:\'Exit Tease\')");
            this._actionClip = commandString.loadCmdClip(this.viewer, this.calculateActionBounds(bounds));
            this.addChild(this._actionClip );
        }

    }

    setBounds(bounds: Object): void {
        
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

    private calculateTextBounds(bounds: any): any {
        var newWidth: number = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        
        return {
            "x": bounds.x,
            "y": bounds.y + bounds.height * 0.7,
            "width": newWidth,
            "height": bounds.height * 0.3
        };
    }

    private calculateInstrucBounds(bounds: any): any {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y,
            "width": 150,
            "height": bounds.height * 0.5
        };
    }

    private calculateMediaBounds(bounds: any): any {
        var newWidth: Number = this._splitView != null ? Number(bounds.width - 150) : Number(bounds.width);
        return {
            "x": bounds.x,
            "y": bounds.y,
            "width": newWidth,
            "height": bounds.height * 0.7
        };
    }

    private calculateActionBounds(bounds: any): any {
        return {
            "x": bounds.x + bounds.width - 150,
            "y": bounds.y + bounds.height * 0.5,
            "width": 150,
            "height": bounds.height * 0.5
        };
    }

    private positionSidebar(bounds: any) {
        this._splitView.x = bounds.x + bounds.width - 150;
        this._splitView.y = bounds.y;
        this._splitView.width = 150;
        this._splitView.height = bounds.height;
    }
}



class Parser {
    
    static explode(separator: string, string: string) : Array<string> {
        var nextIndex: number = NaN;
        var word: string = null;
        var list: Array<string> = new Array<string>();

        if (separator == null) {
            return [];
        }
        if (string == null) {
            return [];
        }
        var currentStringPosition: number = 0;
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

    static explodeWithParenthesis(separator: string, string: string): Array<string> {
        var word: string = null;
        if (string == null) {
            return [];
        }
        var list: Array<string> = new Array();
        var current: string = "";
        var last: string = "";
        var state: number = 0;
        var level: number = 0;
        var slicePos: number = 0;
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

    static parseParameter(param: string): any {
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

    static parseParamList(paramList: string): Array<any> {
        var key: any = null;
        var parameter: string = null;
        var colonPos: number = NaN;
        var paramName: string = null;
        var paramValue: string = null;
        var cmdParams: Array<string> = Parser.explodeWithParenthesis(",", paramList);
        var cmdParamsAssoc: Array<any> = new Array();
        for (key in cmdParams) {
            parameter = cmdParams[key];
            colonPos = parameter.indexOf(":");
            paramName = parameter.substr(0, colonPos);
            paramValue = parameter.substr(colonPos + 1);
            cmdParamsAssoc[paramName] = Parser.parseParameter(paramValue);
        }
        return cmdParamsAssoc;
    }

    private static parseString(string: string): string {
        string = string.substr(1, string.length - 2);
        string = string.split("\\\'").join("\'");
        return string;
    }

    private static parseTime(time: string): number {
        var multiplier: string = time.substr(-3);
        var number: number = parseInt(time.substr(0, time.length - 3));
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
    private _target: JQuery;

    constructor(target: JQuery) {
        this._target = target;
        this.render();
        this._target.hide();
    }

    show() {
        this._target.show(1);
    }

    private render() {
        var div = $("<div></div>");
        div.append("<p>Please rate this tease.</p>")
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
        
        div.append("<p><a href=\"/\">Go Back.</a></p>")
        this._target.append(div);
    }

    private highlight(div: JQuery, id:number, highlight:boolean) {
        var images = div.find("img");
        for (var i = 0; i < id; i++) {
            $(images[i]).attr("src", highlight ? "images/star.png" : "images/ustar.png");
        }
    }

    private submit(id: number) {        
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
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}


async function runTease(id: number) {
    Settings.set("teaseId", id);

    $('#exit').click(() => {
        rating.show();
    });

    rating = new Rating($("#rating"));

    var tease = new FlashTease(id, $("#tease"));
    await tease.parse();
    $("#loading").hide();
    tease.start();

}

//Settings.set("DEBUG", true);
$().ready(() => runTease(Number(getQueryVariable("id"))));

