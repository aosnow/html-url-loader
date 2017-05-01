html-url-loader
===
`webpack` 利用 `html-webpack-plugin` 来完成 HTML5 页面的动态更新（如 js、css、png 等资源随版本跟进而改变路径），但该插件对于静态 HTML模板 中直接使用 `img` 标签 `src` 加载图片的话，因为没有与应用程序发生任何依赖关系，因此图片将不会被打包和处理。

研究其源码得知， `html-webpack-plugin` 使用 `lib/loader.js` 来处理 HTML 页面内容，而其并未对 `img` 标签 `src` 作出处理而导致该问题。

另外 `html-loader` 虽然解决了图片解析问题，但又使用原本支持的 `模板变量解析` 功能丧失。

而使用 `html-url-loader` 可以顺利解决以上问题，图片将会自动被打包，而且路径也自动与 `url-loader` 发生关联得到正确设置，而且变量也会正确被解析。

为了增强模板支持，额外提供 HTML 模板嵌套功能。



## 安装
```
npm install html-url-loader --save-dev
```

## 使用方法
**在应用程序中使用：**
```
var html = require('html-url-loader!../xxx.html');
```

**通过 webpack 配置 (推荐)：**
```
module.exports = {
    module: {
        rules: [
            test: /\.html?$/,
            use: "html-url-loader",
            query: { deep: true }
        ]
    },
    {
    	test: /\.(png|jpe?g|gif|svg)$/,
    	use: [
    		{
    			loader: "url-loader",
    			options: { limit: 10240, name: "assets/[name].[ext]" }
    		}
    	]
    }
}
```
`html-url-loader` 会与 `html-webpack-plugin` 插件协同工作，其将替换 `html-webpack-plugin` 的默认 `lib/loader.js` 来完成 **图片自动解析** 和 **模板变量的解析**。

## 选项
`html-url-loader` 的特殊功能选项使用 `query` 属性来进行设置，列表如下：

名称|默认值|描述
---|---|---
deep | true | 是否使用模板页面嵌套 `#include("../tpl.html")` 功能来增强模板支持。


## 使用范例
**HTML 模板内容：**
```
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title><%=htmlWebpackPlugin.options.title%></title>
</head>
<body>
	<img src="img/react.jpg" width="100%">
	<div id="app"></div>
</body>
</html>
```
**解析后的结果如下：**

```
<!doctype html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Reacter 开发者</title>
</head>
<body>
	<img src="assets/react.jpg" width="100%">
	<div id="app"></div>
</body>
</html>
```



## 模板嵌套
**示例代码如下：**
```
<div>
    #include("./layout/top.html")
</div>
```

## 更新历史
### 1.0.0501
- 基础版本
- 使图片自动解析及路径替换问题
- 使模板变量正确解析