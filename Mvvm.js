function Mvvm(options = {}){

    this.$options = options;
    this.$data = this.$options.data;
    this.$dep = new Dep();

    observe(this.$data , this.$dep);
    render(this.$data , this , this.$dep);
}

function render(data , vm , dep){
    const dom = document.getElementById(vm.$options.el);
    vm.$el = dom;
    
    function replace( currentDom ){

        Array.from(currentDom.childNodes).forEach(node=>{
            const text = node.textContent;
            if( node.nodeType === 3 && /\{\{(.*?)\}\}/g.test(text) ){
                const params = RegExp.$1;
                const arr = params.split('.');
                let val = data;
                arr.forEach(item=>{
                    val = val[item];
                })
                node.textContent = val;
                dep.addSubs(new Watcher(vm , params , function(currentVal){
                    node.textContent = currentVal;
                }))
            }
    
            if( !!node.childNodes && node.childNodes.length !== 0 ){
                replace(node);
            }
    
        })
    }

    replace(dom);

}

function Observe( data , dep ){

    for( let key in data ){
        let val = data[key];
        observe(val , dep);
        Object.defineProperty(data,key,{
            configurable: true,
            get(){
                return val;
            },
            set( newVal ){
                if( val === newVal ){
                    return ;
                }

                val = newVal;
                observe(newVal , dep);
                dep.notify();
            }
        })

    }

}

function observe(data , dep){

    if(!!data && typeof data !== 'object') return

    return new Observe(data , dep);

}

function Dep(){
    this.subs = [];
}

Dep.prototype = {
    addSubs: function(fn){
        this.subs.push(fn);
    },
    notify:function(){
        this.subs.forEach(item=>item.update())
    }
}

function Watcher(vm , currentKey , fn){
    this.fn = fn;
    this.vm = vm;
    this.key = currentKey
}

Watcher.prototype = {
    update: function(){
        let val = this.vm.$data;
        const keys = this.key.split('.');
        keys.forEach(item=> {
            val = val[item];
        });
        this.fn(val);
    }
}