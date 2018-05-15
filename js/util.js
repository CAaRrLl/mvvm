function isObject(data) {
    return typeof data === 'object' && Object.prototype.toString.call(data) === '[object Object]';
}

function parserGetterOfExp(exp) {
    if(/[^\w.$]/.test(exp)) return;
    return function(obj) {
        var exps = exp.split('.');
        exps.forEach(function(key) {
            if(!obj) return;
            obj = obj[key];
        });
        return obj;
    }
}