var uid = 0;
function Submanager() {
    this.id = uid++;
    this.subs = [];
}

Submanager.prototype.addSub = function(sub) {
    this.subs.push(sub);
}

Submanager.prototype.removeSub = function(sub) {
    var index = this.subs.indexOf(sub);
    if(index === -1) return;
    this.subs.splice(index, 0);
}

Submanager.prototype.notify = function() {
    this.subs.forEach(function(sub) {
        sub.update();
    });
}

Submanager.prototype.depend = function() {
    Submanager.target.addSelf(this);
}

Submanager.target = null;