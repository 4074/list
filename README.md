
##列表展示插件 list.js

**列表展示插件，可实现分页、简单的搜索和排序。**

插件写得比较简洁，使用时需要较多配置。

[DEMO在这里](http://doctype.duapp.com/demo/list)

---

###Basic 基本

依赖：jquery, handlebars, bootstrap-pager


###Options 参数

#####data
*array* 展示的数据

#####template
*string* 展示数据的模板

#####setRenderData
*function* 利用要展示的数据，构造用于渲染模板的数据，默认

```
function(data, rule){
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
}
```

#####getHtml
*function*(一般不需要填写) 把数据和模板转换成html

```
function(data, template){
	var html = ''

	...

	return html
}
```

#####pageSize
*int*(10) 每页显示数据条数

#####pageContainer
*string* / *$dom* 分页html放置的容器

#####pageConfig
*object* 分页插件的参数

#####condition
*array* 初始化时过滤数据的条件

使用`indexOf`过滤

```
[{
	key: 'status'， // 搜索的字段名
	keyword: 'publish' // 搜索的关键词
}]
```

#####sortConfig
*object* 排序的参数设置，只有在这里设置了，才能使用后面的排序方法

```
{
	CreateTime: { // 排序的字段名
	    type: 'date', // 数据类型，可选'date', 'number', 其他视为字符串
	    fn: 'asc',	// string 或 function, 除function外，其他视为按值的升序排列
	    status: 'asc' // 当前的排序状态 'asc'升序，'desc' 降序
}

// fn的示例
function(a, b){
	// a, b是在data参数中的一条数据
	// 排序状态为'asc'时，排序结果就是该函数的排序结果，'desc'时，再反序一下
	var result = a.number - b.number

	return result
}

```

###Method 方法

#####search 搜索

```
var myList = $('#list').list(options).data('list')

myList.search(condition)
// condition 和上面的 condition参数格式一样

```

#####sort 排序

```
var myList = $('#list').list(options).data('list')

myList.sort(key)
// key为已在sortConfig中配置的字段名
// 排序对当前状态反向排序

```