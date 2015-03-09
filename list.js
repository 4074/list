/**
 *  list.js 列表展示数据的封装
 *  author: dengwenfeng@4399.com
 *  date: 2014-09-25
 */

+ function($, Handlebars){
    
    // array filter
    var arrayFilter = function(source, predicate, context){
        if(Array.prototype.filter && source.filter === Array.prototype.filter){
            return source.filter(predicate, context)
        }
        
        var result = []
        for(var i=0, len=source.length; i<len; i++){
            predicate.call(context, source[i], i, source) && result.push(result)
        }
        return result
    }
    
    var List = function(element, options){
        
        if (!$.fn.pager) throw new Error('List requires bootstarp-pager.js')
        
        this.options = options
        this.element = element
        this.$element = $(element)
        
        this.init()
    }
    
    List.defaults = {
        
        // 渲染数据
        data: [],
        template: '',
        setRenderData: function(data, rule){
            var sort = {
                key: '',
                status: ''
            }
            
            if(rule && rule.length){
                sort = {
                    key: rule[0].key,
                    status: rule[0].status
                }
            }
            
            return {list: data, sort: sort.key + sort.status}
        },
        getHtml: null,
        onRender: null,
        
        // 分页
        pageSize: 10,
        pageContainer: '',
        pageConfig: {},
        
        // 搜索
        condition: null,
        
        // 排序
        sortRule: null,
        sortConfig: null
    }
    
    List.prototype.init = function(){
        
        var data = this.getData()
        this.renderList(data)
    }
    
    List.prototype.renderList = function(data, size){
        
        var self = this
        size = size || this.options.pageSize
        data = data || this.options.data
        
        this.data = data.slice(0)
        
        var config = $.extend({
            pages: Math.ceil(data.length / size)
        }, self.options.pageConfig)
        
        
        var _fn = config.onchange || $.noop
        config.onchange = function(pager){
            if(_fn(pager) === false){
                return
            }

            var data_start = (pager.current - 1) * size
            var data_slice = data.slice(data_start, size + data_start)

            var _getHtml = self.options.getHtml || self.getHtml
            var _html = _getHtml.call(self, data_slice, self.options.template)

            self.$element.html(_html)

            self.options.onRender && self.options.onRender.call(self, self.$element)

            self.options.pageConfig.onchange && self.options.pageConfig.onchange(pager)
        }
        
        config = $.extend({}, config)
        $(this.options.pageContainer).pager(config)
    }
    
    List.prototype.search = function(conditions){
        
        this.options.condition = conditions
        var data = this.getData()
        
        this.renderList(data)
    }
    
    List.prototype.current = function(_cur){
        _cur = parseInt(_cur, 10)
        this.options.pageConfig.current = _cur
    }
    
    List.prototype.sort = function(key){
        
        if(!this.options.sortConfig) return;
        
        var config = this.options.sortConfig[key]
        var status = config.status == 'asc' ? 'desc' : 'asc'

        var rules = [{
            key: key,
            type: config.type,
            fn: config.fn,
            status: status
        }]
        config.status = status
        
        this.options.sortRule = rules
        var data = this.getData()
        
        this.renderList(data)
    }
    
    List.prototype.getData = function(){
        
        var data = this.options.data
        
        data = this.options.condition ? this.getSearchData() : data
        data = this.options.sortRule ? this.getSortData(data) : data
        
        return data
    }
    
    List.prototype.getSearchData = function(data, conditions){
        
        var result = data || this.options.data
        conditions = conditions || this.options.condition
        
        for(var i = 0, len = conditions.length; i < len; i++){
            var condition = conditions[i]
            result = this.filter(result, condition)
        }
        
        return result
    }
    
    List.prototype.getSortData = function(data, rules){
        
        var result = data || this.options.data
        result = result.slice(0)
        
        rules = rules || this.options.sortRule
        
        // TODO 多个排序条件
        var keys = []
        
        for(var i = 0, len = rules.length; i < len; i++){
            
            var _rule = rules[i]
            var _key = _rule['key']
            var _type = _rule['type']
            var _fn = _rule['fn']
            
            keys.push(_key)
            
            result.sort(function(a, b){

                var _rs
                var _a, _b
                
                switch(_type){
                    case 'number': 
                        _a = Number(a[_key], 10) || 0
                        _b = Number(b[_key], 10) || 0
                        break;
                    case 'date':
                        _a = new Date(a[_key])
                        _b = new Date(b[_key])
                        break;
                    default:
                        _a = a[_key]
                        _b = b[_key]
                        break;
                }
                
                if(_fn && (typeof _fn).toLowerCase() != 'string'){
                    _rs = _fn(a, b)
                }else{
                    _rs = _a == _b ? 0 : (_a > _b ? 1 : -1)
                }
 
                return _rs
            })
            
            if(_rule.status == 'desc'){
                result.reverse()
            }
        }
        
        return result
    }
    
    List.prototype.filter = function(data, condition) {
        
        var result
        var key = condition.key, keyword = condition.keyword, type = condition.type, fn = condition.fn
        
        result = arrayFilter(data, function(item){

            var val = item[key]

            if(fn && typeof fn == 'function'){
                return fn(val, keyword)
            }

            if(type == 'equal'){
                return val == keyword
            }else if(type == 'less'){
                return val < keyword
            }else if(type == 'greater'){
                return val > keyword
            }else{
                if(!val && val !== 0) return false;
                return val.indexOf(keyword) >= 0 ? true : false 
            }

        })
        
        
        return result
    }
    
    List.prototype.getHtml = function(data, tpl){
        
        var _data = {}
        
        tpl = Handlebars.compile(tpl)
        _data = this.options.setRenderData ? this.options.setRenderData.call(this, data, this.options.sortRule) : data
            
        return tpl(_data)
    }
    
    var old = $.fn.list
    
    $.fn.list = function(option){
        var options = $.extend({}, List.defaults, option)
        
        return $(this).each(function(){
            $(this).data('list', new List(this, options))
        })
    }
    
    $.fn.list.noConflict = function () {
        $.fn.list = old
    }
    
}(jQuery, Handlebars)