var teaseManager: TeaseManager;


class Tease {
    private _id: number;
    private _title: string;
    private _author: string;
    private _thumbnail: string;
    constructor(id: number) {
        this._id = id;

    }

    static fromObject(obj: any): Tease {
        var result = new Tease(obj._id);
        result._author = obj._author;
        result._title = obj._title;
        result._thumbnail = obj._thumbnail;
        return result;
    }

    static getIdFromUrl(text: string): number {
        var regex = /https:\/\/milovana\.com\/webteases\/showflash.php\?id=(\d+)/g
        var result = regex.exec(text);
        if (result == null) {
            return null;
        }
        return Number(result[1]);
    }

    get id() : number { return this._id;}

    async loadMeta() {
        return new Promise<boolean>((resolve, reject) =>
            jQuery.get("meta?id=" + this._id,
                (body) => {
                    console.log("downloaded metadata successfully");
                    var metaArray: Array<string> = body.split("\n");                    
                    this._title = metaArray[1];
                    this._author = metaArray[2];
                    var pic: string;
                    var i: number = 3;
                    do {
                        pic = metaArray[i++].split(':')[1];
                    } while (pic == "*.jpg");
                    this._thumbnail = `https://eu.media.milovana.com/timg/${metaArray[0]}/${this._id}/tb_s/${pic}`;
                    resolve(true);
                }));
    }

    render(target: JQuery) {
        var node = $(`<tr><td><img src="${this._thumbnail}" /></td><td><h3>${this._title}</h3></td><td><button>Start</button><button>Continue</button><button>Delete</button></td></tr>`);
        target.append(node);
        var buttons = node.find("button");
        $(buttons[0]).click(() => {
            location.href = `tease?id=${this._id}`;
        });
        $(buttons[1]).css("display", "none"); // not supported (yet?)
        $(buttons[2]).click(() => {
            if (confirm(`Do you really want to delete the Tease '${this._title}'?`)) {
                teaseManager.remove(this._id);
            }            
        });
    }
}

class TeaseManager {
    private _teases: Array<Tease>;
    private _target: JQuery;

    constructor(target: JQuery) {
        this._target = target;
        this.load();
        this.render();
    }

    async add(id: number) {
        if (id == null) {
            return;
        }

        if (this.containsTease(id)) {
            alert("This Tease has already been added to your Tease List.");
            return;
        }

        var tease = new Tease(id);
        if (await tease.loadMeta()) {
            this._teases.splice(0, 0, tease);
            this.save();
            this.render();
        }
    }

    private containsTease(id: number): boolean {
        for (var t in this._teases) {
            if (this._teases[t].id == id) {
                return true;
            }
        }
        return false;
    }

    render() {
        this._target.children().remove();
        if (this._teases.length > 0) {
            for (var tease in this._teases) {
                this._teases[tease].render(this._target);
            }
        } else {
            this._target.html("<tr><td colspan=\"3\"><p style=\"margin:5px\">No teases added yet.</p></td></tr>");
        }
    }

    clear() {
        this._teases = [];
        this.save();
    }

    remove(id: number) {
        this._teases = $.grep(this._teases, function (e) { return e.id != id });
        this.save();
        this.render();        
    }

    private load() {
        var data = window.localStorage.getItem("teases");
        this._teases = [];
        if (data != null) {
            var tdata = JSON.parse(data);
            for (var t in tdata) {
                this._teases.push(Tease.fromObject(tdata[t]));
            }
        }
    }

    private save() {
        window.localStorage.setItem("teases", JSON.stringify(this._teases));
    }
}

function checkAddTease() {
    var value: string = $("#teaseurltb").val();
    var id = Tease.getIdFromUrl(value);
    if (id==null) {
        $("#addtease").prop("disabled", true);
    } else {

        $("#addtease").prop("disabled", false);
    }
}

$(document).ready(function () {
    var iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream; if (!iOS) $('.ios').remove();

    teaseManager = new TeaseManager($("#teases"));

    $("#teaseurltb").change((e) => {
        checkAddTease();
    });
    $("#teaseurltb").keyup((e) => {
        checkAddTease();
    });

    $("#addtease").click(async () => {
        await teaseManager.add(Tease.getIdFromUrl($("#teaseurltb").val()));
        $("#teaseurltb").val("");
    });
    checkAddTease();
});

