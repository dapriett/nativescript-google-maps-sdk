var observable = require("data/observable");
var HelloWorldModel = (function (_super) {
    __extends(HelloWorldModel, _super);
    function HelloWorldModel() {
        _super.call(this);
        this.set("latitude", -33.86);
        this.set("longitude", 151.20);
        this.set("zoom", 8);
        this.set("bearing", 0);
        this.set("tilt", 0);
    }

    return HelloWorldModel;
})(observable.Observable);
exports.HelloWorldModel = HelloWorldModel;
exports.mainViewModel = new HelloWorldModel();
