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
var teaseManager;
var settingsManager;
var Tease = (function () {
    function Tease(id) {
        this._id = id;
    }
    Tease.fromObject = function (obj) {
        var result = new Tease(obj._id);
        result._author = obj._author;
        result._title = obj._title;
        result._thumbnail = obj._thumbnail;
        if (window.localStorage.getItem("tease-" + obj._id)) {
            result._hasSaveState = true;
        }
        return result;
    };
    Tease.getIdFromUrl = function (text) {
        var regex = /https:\/\/milovana\.com\/webteases\/showflash.php\?id=(\d+)/g;
        var result = regex.exec(text);
        if (result == null) {
            return null;
        }
        return Number(result[1]);
    };
    Object.defineProperty(Tease.prototype, "id", {
        get: function () { return this._id; },
        enumerable: true,
        configurable: true
    });
    Tease.prototype.loadMeta = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2, new Promise(function (resolve, reject) {
                        return jQuery.get("meta?id=" + _this._id, function (body) {
                            console.log("downloaded metadata successfully");
                            var metaArray = body.split("\n");
                            _this._title = metaArray[1];
                            _this._author = metaArray[2];
                            _this._thumbnail = metaArray[3];
                            resolve(true);
                        });
                    })];
            });
        });
    };
    Tease.prototype.render = function (target) {
        var _this = this;
        var node = $("<tr><td><img src=\"" + this._thumbnail + "\" /></td><td><h3>" + this._title + "</h3></td><td><button>Start</button><button>Continue</button><button>Delete</button></td></tr>");
        target.append(node);
        var buttons = node.find("button");
        $(buttons[0]).click(function () {
            if (!_this._hasSaveState || confirm("Starting this tease will delete your saved state. Do you really want to start over?")) {
                location.href = "tease?id=" + _this._id + "&skin=" + settingsManager.get('skin');
            }
        });
        if (this._hasSaveState) {
            $(buttons[1]).click(function () {
                location.href = "tease?id=" + _this._id + "&skin=" + settingsManager.get('skin') + "&resume=1";
            });
        }
        else {
            $(buttons[1]).css("display", "none");
        }
        $(buttons[2]).click(function () {
            if (confirm("Do you really want to delete the Tease '" + _this._title + "'?")) {
                teaseManager.remove(_this._id);
            }
        });
    };
    return Tease;
}());
var TeaseManager = (function () {
    function TeaseManager(target) {
        this._target = target;
        this.load();
        this.render();
    }
    TeaseManager.prototype.add = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var tease;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (id == null) {
                            return [2];
                        }
                        if (this.containsTease(id)) {
                            alert("This Tease has already been added to your Tease List.");
                            return [2];
                        }
                        tease = new Tease(id);
                        return [4, tease.loadMeta()];
                    case 1:
                        if (_a.sent()) {
                            this._teases.splice(0, 0, tease);
                            this.save();
                            this.render();
                        }
                        return [2];
                }
            });
        });
    };
    TeaseManager.prototype.containsTease = function (id) {
        for (var t in this._teases) {
            if (this._teases[t].id == id) {
                return true;
            }
        }
        return false;
    };
    TeaseManager.prototype.render = function () {
        this._target.children().remove();
        if (this._teases.length > 0) {
            for (var tease in this._teases) {
                this._teases[tease].render(this._target);
            }
        }
        else {
            this._target.html("<tr><td colspan=\"3\"><p style=\"margin:5px\">No teases added yet.</p></td></tr>");
        }
    };
    TeaseManager.prototype.clear = function () {
        this._teases = [];
        this.save();
    };
    TeaseManager.prototype.remove = function (id) {
        this._teases = $.grep(this._teases, function (e) { return e.id != id; });
        window.localStorage.removeItem("tease-" + id);
        this.save();
        this.render();
    };
    TeaseManager.prototype.load = function () {
        var data = window.localStorage.getItem("teases");
        this._teases = [];
        if (data != null) {
            var tdata = JSON.parse(data);
            for (var t in tdata) {
                this._teases.push(Tease.fromObject(tdata[t]));
            }
        }
    };
    TeaseManager.prototype.save = function () {
        window.localStorage.setItem("teases", JSON.stringify(this._teases));
    };
    return TeaseManager;
}());
var SettingsManager = (function () {
    function SettingsManager() {
    }
    SettingsManager.prototype.registerSwitchGroup = function (inputs, name) {
        var self = this;
        inputs.change(function (e) {
            self.saveSetting(name, $(e.target).val());
        });
        var defaultInput = inputs.filter("input[checked='checked']");
        defaultInput = defaultInput.length == 0 ? $(inputs[0]) : defaultInput;
        var storedValue = this.loadSetting(name, defaultInput.val());
        inputs.filter("input[value='" + storedValue + "']").click();
    };
    SettingsManager.prototype.get = function (name) {
        return this.loadSetting(name, null);
    };
    SettingsManager.prototype.saveSetting = function (name, value) {
        window.localStorage.setItem("setting-" + name, JSON.stringify(value));
    };
    SettingsManager.prototype.loadSetting = function (name, defaultValue) {
        var result = window.localStorage.getItem("setting-" + name);
        if (result == null) {
            return defaultValue;
        }
        return JSON.parse(result);
    };
    return SettingsManager;
}());
function checkAddTease() {
    var value = $("#teaseurltb").val().toString();
    var id = Tease.getIdFromUrl(value);
    if (id == null) {
        $("#addtease").prop("disabled", true);
    }
    else {
        $("#addtease").prop("disabled", false);
    }
}
$(document).ready(function () {
    var _this = this;
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (!iOS)
        $('.ios').remove();
    teaseManager = new TeaseManager($("#teases"));
    settingsManager = new SettingsManager();
    settingsManager.registerSwitchGroup($("input[name='settings-skin']"), "skin");
    $("#teaseurltb").change(function (e) {
        checkAddTease();
    });
    $("#teaseurltb").keyup(function (e) {
        checkAddTease();
    });
    $("#addtease").click(function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, teaseManager.add(Tease.getIdFromUrl($("#teaseurltb").val().toString()))];
                case 1:
                    _a.sent();
                    $("#teaseurltb").val("");
                    return [2];
            }
        });
    }); });
    checkAddTease();
});
//# sourceMappingURL=main.js.map