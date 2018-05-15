function Subscriber(vm, expOrFn, cb) {
    this.vm = vm;
    this.cb =cb;
    this.expOrFn = expOrFn;
    this.submanagerIds = {};

    this.getter = parserGetterOfExp(this.expOrFn);
    this.val = this.getVal();
}

Subscriber.prototype.update = function() {
    var newVal = this.getVal();
    var oldVal = this.val;
    if(newVal === oldVal) return;
    this.val = newVal;
    this.cb.call(this.vm, oldVal, newVal);
}

Subscriber.prototype.addSelf = function(submanager) {
    if(!this.submanagerIds.hasOwnProperty(submanager.id)) {
        submanager.addSub(this);
        this.submanagerIds[submanager.id] = submanager;
    }
}

Subscriber.prototype.getVal = function() {
    Submanager.target = this;
    var val = this.getter(this.vm);
    Submanager.target = null;
    return val;
}