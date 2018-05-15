function Compile(el, vm) {
    this.vm = vm;
    this.el = Type.isElementNode(el)? el : document.querySelector(el);

    if(this.el) {
        var fragment = this.nodeToFragment(this.el);
        this.compile(fragment);
        //将编译渲染完的文档片段插入当前文档
        this.el.appendChild(fragment);
    }
}

//将某个节点的子孙节点转移到文档片段，以便在文档片段中编译渲染
Compile.prototype.nodeToFragment = function(node) {
    var fragment = document.createDocumentFragment();
    var child;
    
    while(node.firstChild) {
        child = node.firstChild;
        fragment.appendChild(child);
    }
    return fragment;
}

//编译一个节点及其子孙节点
Compile.prototype.compile = function(node) {
    var childNodes = node.childNodes;
    var _this = this;

    Array.prototype.slice.call(childNodes).forEach(function(node) {
        var text = node.textContent;
        var reg = /\{\{(.*)\}\}/;
        
        if(Type.isElementNode(node)) {
            _this.compileElement(node);
        }else if(Type.isTextNode(node) && reg.test(text)) {
            _this.compileText(node, RegExp.$1);
        }

        //有子节点编译子节点
        if(node.childNodes && node.childNodes.length > 0) {
            _this.compile(node);
        }
    });
}

//编译元素节点
Compile.prototype.compileElement = function(node) {
    var attributes = node.attributes;
    var _this = this;

    //遍历该节点的所有属性
    [].slice.call(attributes).forEach(function(attr) {
        var attrName = attr.name;
        var attrVal = attr.value;

        //是否是自定义指令
        if(Type.isDirective(attrName)) {
            var dir = attrName.substr(2);

            //事件指令
            if(Type.isEventDirective(dir)) {
                var type = dir.split(':')[1];
                //绑定事件
                compileUtil.eventHandler(node, type, attrVal, _this.vm);
            //其他指令
            }else {
                compileUtil[dir] && compileUtil[dir](node, attrVal, _this.vm);
            }
            node.removeAttribute(attrName);
        }
    });
}

//编译文本节点
Compile.prototype.compileText = function(node, exp) {
    compileUtil.text(node, exp, this.vm);
}

//判断节点或指令的类别
var Type = {
    isElementNode:function(node) {
        return node.nodeType === Node.ELEMENT_NODE;
    },
    isTextNode:function(node) {
        return node.nodeType === Node.TEXT_NODE;
    },
    
    isDirective:function(attrName) {
        return attrName.substr(0, 2) === 'v-';
    },
    
    isEventDirective:function(dir) {
        return dir.substr(0,2) === 'on';
    }
}

//编译指令工具
var compileUtil = {
    text: function(node, exp, vm) {
        this.bind(node, exp, vm, 'text');
    },
    model: function(node, exp, vm) {
        this.bind(node, exp, vm, 'model');
        var _this = this;
        switch(node.nodeName.toLowerCase()) {
            case 'input':
                node.addEventListener('input', function(event) {
                    _this.setVMVal(vm, exp, event.target.value);
                });
                break;
            default:
                break;
        }
    },
    bind: function(node, exp, vm, type) {
        var val = this.getVMVal(vm, exp);
        var updateFn = updater[type+'Updater'];
        //将数据输出到页面
        updateFn && updateFn(node, val);

        new Subscriber(vm, exp, function(oldVal, newVal) {
            updateFn(node, newVal);
        });
    },
    eventHandler: function(node, eventType, exp, vm) {
        var cb = vm.$option.method && vm.$option.method[exp];

        if(typeof cb !== 'function' && !eventType) return;
        node.addEventListener(eventType, cb.bind(vm));
    },
    getVMVal: function(vm, exp) {
        var exps = exp.split('.');
    
        exps.forEach(function(key) {
            vm = vm[key];
        });
    
        return vm;
    },
    setVMVal: function(vm, exp, val) {
        var exps = exp.split('.');
    
        exps.forEach(function(key, i) {
            if(i!==exps.length-1) {
                vm = vm[key];
            }else {
                vm[key] = val;
            }
        });
    }
}

//渲染工具
var updater = {
    textUpdater: function(node, val) {
        node.textContent = typeof val === 'undefined'? '' : val;
    },
    modelUpdater: function(node, val) {
        node.value = typeof val === 'undefined'? '' : val;
    }
}