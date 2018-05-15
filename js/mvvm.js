function MVVM(option) {
    this.$option = option || {};
    this.$data = this.$option.data;

    var data = this.$data;
    var _this = this;

    this.initComputed();

    observer(option.computed);

    Object.keys(data).forEach(function(key) {
        _this.proxyData(data, key);
    });

    observer(data);
    this.$compile = new Compile(option.el || document.body, this);
}

MVVM.prototype.proxyData = function(data, key) {
    Object.defineProperty(this, key, {
        configurable: false,
        enumerable: true,
        get: function() {
            return data[key];
        },
        set: function(newVal) {
            data[key] = newVal;
        }
    })
}

MVVM.prototype.initComputed = function() {
    var computes = this.$option.computed;
    var _this = this;
    Object.keys(computes).forEach(function(key) {
        Object.defineProperty(_this, key, {
            configurable: false,
            enumerable: true,
            get: typeof computes[key] === 'function'? computes[key] : function() {
                return computes[key];
            },
            set:function(){}
        })
    })
}