"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const request = require("request");
const console = require("console");
class FlashTease {
    constructor(id) {
        this._id = id;
        this._actionRegistry = new Array();
    }
    load() {
        // https://milovana.com/webteases/getscript.php?id=34313
        return new Promise((resolve, reject) => request.get("https://milovana.com/webteases/getscript.php?id=" + this._id, (error, response, body) => {
            if (error) {
                console.log("failed to load script " + error);
                reject(error);
            }
            else {
                console.log("downloaded script successfully");
                this._script = body;
                resolve();
            }
        }));
    }
    parse() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._script) {
                yield this.load();
            }
            var parser = new Parser();
            var actions = parser.explode("\n", this._script);
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
    addAction(actionId, command) {
        this._actionRegistry[actionId] = command;
    }
    runCommandAsAction(command) {
    }
}
exports.FlashTease = FlashTease;
class CommandString {
    constructor(action) {
        this._action = action;
    }
}
class Parser {
    explode(separator, string) {
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
}
//# sourceMappingURL=flashtease.js.map