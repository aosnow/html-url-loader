/**

 html-url-loader for webpack

 MIT License

 Copyright (c) 2017 喵大斯

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */
"use strict";

var fs = require( 'fs' );
var path = require( 'path' );
var _ = require( 'lodash' );
var loaderUtils = require( "loader-utils" );

module.exports = function( fileContent )
{
	var options = this.query;
	if( typeof options === "string" )
	{
		options = (options.substr( 0, 1 ) !== "?" ? "?" : "") + options;
		options = loaderUtils.parseQuery( options );
	}

	if( options.deep !== false ) fileContent = include_file( fileContent, this.query );

	var template = _.template( fileContent, _.defaults( options, { variable: 'data' } ) );
	var templateVariables = [ 'compilation', 'webpack', 'webpackConfig', 'htmlWebpackPlugin' ];

	template.source = parse_html_tag( template.source );

	return 'var _ = require(' + loaderUtils.stringifyRequest( this, require.resolve( 'lodash' ) ) + ');' +
		   'module.exports = function (templateParams) {' +
		   // Declare the template variables in the outer scope of the
		   // lodash template to unwrap them
		   templateVariables.map( function( variableName )
		   {
			   return 'var ' + variableName + ' = templateParams.' + variableName;
		   } ).join( ';' ) + ';' +
		   // Execute the lodash template
		   'return (' + template.source + ')();' +
		   '}';
};

function parse_html_tag( fileContent )
{
	fileContent = fileContent.replace( /((<img[^<>]*?\s+src)|(<link[^<>]*?\s+href))=\\?["']?[^'"<>+]+?\\?['"][^<>]*?>/ig, function( str )
	{
		var reg = /((src)|(href))=\\?['"][^"']+\\?['"]/i;
		var regResult = reg.exec( str );
		if( !regResult ) return str;

		var attrName = /\w+=/.exec( regResult[ 0 ] )[ 0 ].replace( '=', '' );
		var imgUrl = regResult[ 0 ].replace( attrName + '=', '' ).replace( /[\\'"]/g, '' );
		if( !imgUrl ) return str; // 避免空src引起编译失败

		// 绝对路径的图片不处理
		if( /^(https?:)?[\/]{1,2}/.test( imgUrl ) ) return str;

		// 限制处理图片类型
		if( !/\.(png|jpe?g|gif|svg)/i.test( imgUrl ) ) return str;

		// 前置 ./
		if( !(/^[\.\/]/).test( imgUrl ) )
		{
			imgUrl = './' + imgUrl;
		}
		return str.replace( reg, attrName + "='+JSON.stringify(require(" + JSON.stringify( imgUrl ) + "))+'" );
	} );

	return fileContent;
}

function include_file( fileContent, queryStr )
{
	return fileContent.replace( /#include\(\\?['"][^'"]+\\?['"]\);?/g, function( str )
	{
		var childFileSrc = str.replace( /[\\'">();]/g, '' ).replace( '#include', '' );
		return "\"+require(" + JSON.stringify( "html-url-loader" + queryStr + "!" + childFileSrc ) + ")+\"";
	} );
}
