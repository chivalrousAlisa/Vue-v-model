function Watcher(name, el, vm, exp, attr) {
  this.name = name;
  this.el = el;
  this.vm = vm;
  this.attr = attr;
  this.exp = exp;
  this.update();
}
Watcher.prototype.update = function() {
  this.el[this.attr] = this.vm.$data[this.exp];
}

function MyVue(options) {
  this._init(options);
}
MyVue.prototype = {
  _init: function(options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;
    this._binding = {};
    this._obverse(this.$data);
    this._complie(this.$el);
  },
  _obverse : function(obj) {
    var value;
    for(key in obj) {
      if (obj.hasOwnProperty(key)) {
        this._binding[key] = {
          _directives: []
        };
        value = obj[key];
        if (typeof value === 'object') {
          this._obverse(value);
        }
        var binding = this._binding[key];
        Object.defineProperty(this.$data, key, {
          enumerable:true,
          configurable:true,
          get: function() {
            console.log('获取'+ value);
            return value;
          },
          set: function(newVal) {
            console.log('更新' + newVal);
            if (value != newVal) {
              value = newVal;
              binding._directives.forEach(function(item){
                item.update();
              });
            }
          }
        });
      }
    }
  },
  _complie: function(root) {
    var self = this;
    var nodes = root.children;
    for (var i = 0; i<nodes.length; i++) {
      var node = nodes[i];
      if (node.children.length) {
        this._complie(node);
      }

      if (node.hasAttribute('v-click')) {
        var attrVal = nodes[i].getAttribute('v-click');
        // node.onclick = (function(){
        //   var attrVal = nodes[i].getAttribute('v-click');
        //   return self.$methods[attrVal].bind(self.$data);
        // })()
        node.onclick = self.$methods[attrVal].bind(self.$data);
      }

      if (node.hasAttribute('v-model') && (node.tagName == 'INPUT' || node.tagName=='TEXTAREA')) {
        node.addEventListener('change', (function(key){
          var attrVal = node.getAttribute('v-model');
          self._binding[attrVal]._directives.push(new Watcher('input', node, self, attrVal, 'value'));

          return function() {
            self.$data[attrVal] = nodes[key].value
          }
        })(i));
      }

      if (node.hasAttribute('v-bind')) {
        var attrVal = node.getAttribute('v-bind');
        self._binding[attrVal]._directives.push(new Watcher('text', node, self, attrVal, 'innerHTML'));
      }

    }
  }
}
