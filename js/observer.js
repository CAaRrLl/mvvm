function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype.defineReactive = function(data, key, val) {
    var submanager = new Submanager();
    observer(val);
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: false,
        get: function() {
            if(Submanager.target) {
                submanager.depend();
            }
            return val;
        },
        set: function(newVal) {
            if(val === newVal) return;
            val = newVal;
            observer(val);
            submanager.notify();           
        }
    })
}

Observer.prototype.walk = function(data) {
    if(!isObject(data)) return;
    var _this = this;
    Object.keys(data).forEach(function(key) {
        _this.defineReactive(_this.data, key, data[key]);
    });
}

function observer(data) {
    if(!data || !isObject(data)) return;
    return new Observer(data);
}