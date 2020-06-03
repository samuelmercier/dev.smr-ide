"use strict";

const System=defineSystem(function () {
	window.sessionStorage.setItem("3e965e61-0f1e-4e4d-bd07-9053d011bfb1", "window.onload=function() { alert(\"Hello World!\"); };");
	window.sessionStorage.setItem("c4575f18-fc4b-4836-bb6a-0959ae3c17ab",
		"/* *** library https://raw.githubusercontent.com/samuelmercier/octopus-samples/builtins-1.3/builtins/index.html *** */\n\n"
		+"/* *** https://raw.githubusercontent.com/samuelmercier/octopus-samples/builtins-1.3/builtins/scripts/builtins.js *** */\n\n"
		+"\"use strict\";\n\n"
		+"@native class Array {\n\n"
//		+"	static [Symbol.species]() {}\n\n"
		+"	static from(arrayLike, @optional mapFn, @optional thisArg) {}\n"
		+"	static isArray(value) {}\n"
		+"	static of(...) {}\n\n"
		+"	constructor(@optional lengthOrFirstElement, ...) {}\n\n"
//		+"	[Symbol.iterator]() {}\n\n
		+"	get length() {}\n\n"
		+"	concat(...) {}\n"
		+"	copyWithin(target, @optional start, @optional end) {}\n"
		+"	entries() {}\n"
		+"	every(callback) {}\n"
		+"	fill(value, @optional start, @optional end) {}\n"
		+"	filter(callback, @optional thisArg) {}\n"
		+"	find(callback, @optional thisArg) {}\n"
		+"	findIndex(callback, @optional thisArg) {}\n"
		+"	flat(@optional depth) {}\n"
		+"	flatMap(callback, @optional thisArg) {}\n"
		+"	forEach(callback, @optional thisArg) {}\n"
		+"	includes(valueToFind, @optional fromIndex) {}\n"
		+"	indexOf(searchElement, @optional fromIndex) {}\n"
		+"	join(@optional separator) {}\n"
		+"	keys() {}\n"
		+"	lastIndexOf(searchElement, @optional fromIndex) {}\n"
		+"	map(callback, thisArg) {}\n"
		+"	pop() {}\n"
		+"	push(...) {}\n"
		+"	reduce(callback, @optional initialValue) {}\n"
		+"	reduceRight(callback, @optional initialValue) {}\n"
		+"	reverse() {}\n"
		+"	shift() {}\n"
		+"	slice(begin, @optional end) {}\n"
		+"	some(callback, @optional thisArg) {}\n"
		+"	sort(compareFunction) {}\n"
		+"	splice(start, deleteCount, ...) {}\n"
		+"	toLocaleString(@optional locales, @optional options) {}\n"
		+"	toString() {}\n"
		+"	unshift(...) {}\n"
		+"	values() {}\n\n"
		+"}\n\n"
		+"@native class ArrayBuffer {\n\n"
		+"	static isView(arg) {}\n\n"
		+"	constructor(length) {}\n\n"
		+"	get byteLength() {}\n\n"
		+"	slice(begin, @optional end) {}\n\n"
		+"}\n\n"
		+"@native @function class Boolean {\n\n"
		+"	constructor(@optional value) {}\n\n"
		+"	toString() {}\n"
		+"	valueOf() {}\n\n"
		+"}\n\n"
		+"@native class Date {\n\n"
		+"	static UTC(year, @optional month, @optional day, @optional hour, @optional minute, @optional second, @optional millisecond) {}\n"
		+"	static now() {}\n"
		+"	static parse(dateString) {}\n\n"
		+"	constructor(@optional value, @optional monthIndex, @optional day, @optional hours, @optional minutes, @optional seconds, @optional milliseconds) {}\n\n"
		+"	getDate() {}\n"
		+"	getDay() {}\n"
		+"	getFullYear() {}\n"
		+"	getHours() {}\n"
		+"	getMilliseconds() {}\n"
		+"	getMinutes() {}\n"
		+"	getMonth() {}\n"
		+"	getSeconds() {}\n"
		+"	getTime() {}\n"
		+"	getTimezoneOffset() {}\n"
		+"	getUTCDate() {}\n"
		+"	getUTCDay() {}\n"
		+"	getUTCFullYear() {}\n"
		+"	getUTCHours() {}\n"
		+"	getUTCMilliseconds() {}\n"
		+"	getUTCMinutes() {}\n"
		+"	getUTCMonth() {}\n"
		+"	getUTCSeconds() {}\n"
		+"	getYear() {}\n"
		+"	setDate(dayValue) {}\n"
		+"	setFullYear(yearValue, @optional monthValue, @optional dateValue) {}\n"
		+"	setHours(hoursValue, @optional minutesValue, @optional secondsValue, @optional msValue) {}\n"
		+"	setMilliseconds(millisecondsValue) {}\n"
		+"	setMinutes(minutesValue, @optional secondsValue, @optional msValue) {}\n"
		+"	setMonth(monthValue, @optional dayValue) {}\n"
		+"	setSeconds(secondsValue, @optional msValue) {}\n"
		+"	setTime(timeValue) {}\n"
		+"	setUTCDate(dayValue) {}\n"
		+"	setUTCFullYear(yearValue, @optional monthValue, @optional dayValue) {}\n"
		+"	setUTCHours(hoursValue, @optional minutesValue, @optional secondsValue, @optional msValue) {}\n"
		+"	setUTCMilliseconds(millisecondsValue) {}\n"
		+"	setUTCMinutes(minutesValue, @optional secondsValue, @optional msValue) {}\n"
		+"	setUTCMonth(monthValue, dayValue) {}\n"
		+"	setUTCSeconds(secondsValue, msValue) {}\n"
		+"	setYear(yearValue) {}\n"
		+"	toDateString() {}\n"
		+"	toISOString() {}\n"
		+"	toJSON() {}\n"
		+"	toGMTString() {}\n"
		+"	toLocaleDateString(@optional locales, @optional options) {}\n"
		+"	toLocaleString(@optional locales, @optional options) {}\n"
		+"	toLocaleTimeString(@optional locales, @optional options) {}\n"
		+"	toString() {}\n"
		+"	toTimeString() {}\n"
		+"	toUTCString() {}\n"
		+"	valueOf() {}\n\n"
		+"}\n\n"
		+"@native @function class Function {\n\n"
		+"	get length() {}\n"
		+"	get name() {}\n\n"
		+"	constructor(FirstArgOrFunctionBody, ...) {}\n\n"
		+"	apply(thisArg, @optional argsArray) {}\n"
		+"	bind(thisArg, ...) {}\n"
		+"	call(thisArg, ...) {}\n"
		+"	toString() {}\n\n"
		+"}\n\n"
		+"@native @function class Number {\n\n"
		+"	static EPSILON;\n"
		+"	static MAX_SAFE_INTEGER;\n"
		+"	static MAX_VALUE;\n"
		+"	static MIN_SAFE_INTEGER;\n"
		+"	static MIN_VALUE;\n"
		+"	static NaN;\n"
		+"	static NEGATIVE_INFINITY;\n"
		+"	static POSITIFE_INFINITY;\n\n"
		+"	static isFinite(value) {}\n"
		+"	static isInteger(value) {}\n"
		+"	static isNaN(value) {}\n"
		+"	static isSafeInteger(value) {}\n"
		+"	static parseFloat(value) {}\n"
		+"	static parseInt(string, @optional radix) {}\n\n"
		+"	constructor() {}\n\n"
		+"	toExponential(fractionDigits) {}\n"
		+"	toFixed(digits) {}\n"
		+"	toLocaleString(@optional locales, @optional options) {}\n"
		+"	toPrecision(precision) {}\n"
		+"	toString(@optional radix) {}\n"
		+"	valueOf() {}\n\n"
		+"}\n\n"
		+"@native function Error(@optional message, @optional fileName, @optional lineNumber) {}\n"
		+"@native function TypeError(@optional message, @optional fileName, @optional lineNumber) {}\n\n"
		+"@native @function class Object extends null {\n\n"
		+"	static assign(target, ...) {}\n"
		+"	static create(proto, @optional propertiesObject) {}\n"
		+"	static defineProperties(obj, props) {}\n"
		+"	static defineProperty(obj, prop, descriptor) {}\n"
		+"	static entries(obj) {}\n"
		+"	static freeze(obj) {}\n"
		+"	static fromEntries(iterable) {}\n"
		+"	static getOwnPropertyDescriptor(obj, prop) {}\n"
		+"	static getOwnPropertyDescriptors(obj) {}\n"
		+"	static getOwnPropertyNames(obj) {}\n"
		+"	static getOwnPropertySymbols(obj) {}\n"
		+"	static getPrototypeOf(obj) {}\n"
		+"	static is(value1, value2) {}\n"
		+"	static isExtensible(obj) {}\n"
		+"	static isFrozen(obj) {}\n"
		+"	static isSealed(obj) {}\n"
		+"	static keys(obj) {}\n"
		+"	static preventExtensions(obj) {}\n"
		+"	static seal(obj) {}\n"
		+"	static setPrototypeOf(obj, prototype) {}\n"
		+"	static values(obj) {}\n\n"
		+"	constructor(@optional value) {}\n\n"
		+"	hasOwnProperty(prop) {}\n"
		+"	isPrototypeOf(object) {}\n"
		+"	propertyIsEnumerable(prop) {}\n"
		+"	toLocaleString() {}\n"
		+"	toString() {}\n"
		+"	valueOf() {}\n\n"
		+"}\n\n"
		+"@native const JSON=Object.freeze({\n\n"
		+"	parse:function(text, @optional reviver) {},\n"
		+"	stringify:function(value, @optional replacer, @optional space) {}\n\n"
		+"});\n\n"
		+"@native class Map {\n\n"
		+"	constructor(@optional iterable) {}\n\n"
		+"	clear() {}\n"
		+"	delete(key) {}\n"
		+"	entries() {}\n"
		+"	forEach(callback) {}\n"
		+"	get(key) {}\n"
		+"	has(key) {}\n"
		+"	keys() {}\n"
		+"	set(key, value) {}\n"
		+"	values() {}\n\n"
		+"}\n\n"
		+"@native const Math=Object.freeze({});\n\n"
		+"@native class RegExp {\n\n"
		+"	constructor(pattern, @optional flags) {}\n\n"
		+"}\n\n"
		+"@native class String {\n\n"
		+"	static fromCharCode(...) {}\n"
		+"	static fromCodePoint(...) {}\n"
		+"	static raw(callSite, ...) {}\n\n"
		+"	constructor(thing) {}\n\n"
		+"	get length() {}\n\n"
//		+"	[Symbol.iterator]() {}\n\n"
		+"	charAt(index) {}\n"
		+"	charCodeAt(index) {}\n"
		+"	codePointAt(pos) {}\n"
		+"	concat(...) {}\n"
		+"	endsWith(searchString, @optional length) {}\n"
		+"	includes(searchString, @optional position) {}\n"
		+"	indexOf(searchValue, @optional fromIndex) {}\n"
		+"	lastIndexOf(searchValue, @optional fromIndex) {}\n"
		+"	localeCompare(compareString, @optional locales, @optional options) {}\n"
		+"	match(regexp) {}\n"
		+"	matchAll(regexp) {}\n"
		+"	normalize(@optional form) {}\n"
		+"	padEnd(targetLength, @optional padString) {}\n"
		+"	padStart(targetLength, @optional padString) {}\n"
		+"	repeat(count) {}\n"
		+"	replace(regexpOrSubstr, newSubstrOrFunction) {}\n"
		+"	search(regexp) {}\n"
		+"	slice(beginIndex, @optional endIndex) {}\n"
		+"	split(@optional separator, @optional limit) {}\n"
		+"	startsWith(searchString, @optional position) {}\n"
		+"	substring(indexStart, @optional indexEnd) {}\n"
		+"	toLocaleLowerCase(...) {}\n"
		+"	toLocaleUpperCase(...) {}\n"
		+"	toLowerCase() {}\n"
		+"	toString() {}\n"
		+"	toUpperCase() {}\n"
		+"	trim() {}\n"
		+"	trimEnd() {}\n"
		+"	trimStart() {}\n"
		+"	valueOf() {}\n\n"
		+"}\n\n"
		+"@native class Symbol extends null {\n\n"
		+"	static get asyncIterator() {}\n"
		+"	static get hasInstance() {}\n"
		+"	static get isConcatSpreadable() {}\n"
		+"	static get iterator() {}\n"
		+"	static get match() {}\n"
		+"	static get matchAll() {}\n"
		+"	static get replace() {}\n"
		+"	static get search() {}\n"
		+"	static get species() {}\n"
		+"	static get split() {}\n"
		+"	static get toPrimitive() {}\n"
		+"	static get toStringTag() {}\n"
		+"	static get unscopable() {}\n\n"
		+"	static for(key) {}\n"
		+"	static keyFor(sym) {}\n\n"
		+"}\n\n"
		+"@native class TypedArray {\n\n"
		+"	static from(source, @optional mapFn, @optional thisArg) {}\n"
		+"	static of() {}\n\n"
		+"	copyWithin(target, start, @optional end) {}\n"
		+"	entries() {}\n"
		+"	every(callback, @optional thisArg) {}\n"
		+"	fill(value, @optional start, @optional end) {}\n"
		+"	filter(callback, @optional thisArg) {}\n"
		+"	find(callback, @optional thisArg) {}\n"
		+"	findIndex(callback, @optional thisArg) {}\n"
		+"	forEach(callback, @optional thisArg) {}\n"
		+"	includes(searchElement, @optional fromIndex) {}\n"
		+"	indexOf(searchElement, @optional fromIndex) {}\n"
		+"	join(@optional separator) {}\n"
		+"	keys() {}\n"
		+"	lastIndexOf(searchElement, @optional fromIndex) {}\n"
		+"	map(mapFn, @optional thisArg) {}\n"
		+"	reduce(callback, @optional initialValue) {}\n"
		+"	reduceRight(callback, @optional initialValue) {}\n"
		+"	reverse() {}\n"
		+"	set(array, @optional offset) {}\n"
		+"	slice(begin, @optional end) {}\n"
		+"	some(callback, @optional thisArg) {}\n"
		+"	sort(@optional compareFunction) {}\n"
		+"	subarray(begin, @optional end) {}\n"
		+"	toLocaleString(@optional locales, @optional options) {}\n"
		+"	toString() {}\n"
		+"	values() {}\n\n"
		+"}\n\n"
		+"@native class Uint8Array extends TypedArray {\n\n"
		+"	constructor(@optional lengthOrTypedArrayOrObject, @optional byteOffset, @optional length) {}\n\n"
		+"}\n\n"
		+"@native function alert(@optional message) {}\n"
		+"@native function decodeURIComponent(encodedURI) {}\n"
		+"@native function encodeURIComponent(str) {}\n"
		+"@native function isFinite(testValue) {}\n"
		+"@native function isNaN(value) {}\n"
		+"@native function parseFloat(value) {}\n"
		+"@native function parseInt(string, @optional radix) {}\n"
		+"@native const Infinity;\n"
		+"@native const NaN;\n"
		+"@native const console;\n"
		+"@native const document;\n"
		+"@native const performance;\n"
		+"@native const undefined;\n"
		+"@native const window;\n\n"
		+"const octopus=function() {\n\n"
		+"	const initializers=new Map();\n"
		+"	const libraries=new Map();\n"
		+"	const module=Object.freeze({\n"
		+"		define:Object.freeze(function(libraryName, initializer) {\n"
		+"			if(typeof initializer!==\"function\")\n"
		+"				throw new Error(\"initializer is not a function\");\n"
		+"			if(initializers.has(libraryName))\n"
		+"				throw new Error(\"redefinition of library '\"+libraryName+\"'\");\n"
		+"			initializers.set(libraryName, initializer);\n"
		+"		}),\n"
		+"		resolve:Object.freeze(function(libraryName) {\n"
		+"			const library=libraries.get(libraryName);\n"
		+"			if(library!==undefined)\n"
		+"				return library;\n"
		+"			const initializer=initializers.get(libraryName);\n"
		+"			if(initializer===undefined)\n"
		+"				throw new Error(\"cannot resolve library '\"+libraryName+\"'\");\n"
		+"			const result=initializer();\n"
		+"			libraries.set(libraryName, result);\n"
		+"			return result;\n"
		+"		}),\n"
		+"		initialize:Object.freeze(function() {\n"
		+"			for(const libraryName of initializers.keys())\n"
		+"				module.resolve(libraryName);\n"
		+"		})\n"
		+"	});\n"
		+"	return module;\n\n"
		+"}();\n"
	);
	window.sessionStorage.setItem("293f21da-70ca-4335-9000-de9c556f4b10",
		"/* *** library https://raw.githubusercontent.com/samuelmercier/octopus-samples/testing-1.2/testing/index.html *** */\n\n"
		+"/* *** https://raw.githubusercontent.com/samuelmercier/octopus-samples/testing-1.2/testing/scripts/testing.js *** */\n\n"
		+"\"use strict\";\n\n"
		+"octopus.define(\"octopus/testing\", function() {\n\n"
		+"	const module=Object.freeze({\n\n"
		+"		diagnostics:[],\n\n"
		+"		run:function(testFunction) {\n"
		+"			const start=performance.now();\n"
		+"			try {\n"
		+"				testFunction();\n"
		+"				module.diagnostics.push({ name:testFunction.name, duration:performance.now()-start, status:\"pass\" });\n"
		+"			} catch(e) {\n"
		+"				module.diagnostics.push({ name:testFunction.name, duration:performance.now()-start, status:\"fail\", cause:e });\n"
		+"				console.log(\"test '\"+testFunction.name+\"' failed\");\n"
		+"				console.log(e);\n"
		+"			}\n"
		+"		},\n\n"
		+"		assertError:function(expression, expected) {\n"
		+"			try {\n"
		+"				expression();\n"
		+"			} catch(e) {\n"
		+"				module.assertEqual(e.message, expected);\n"
		+"				return;\n"
		+"			}\n"
		+"			throw new Error(\"expected '\"+expected+\"'; got no exception\");\n"
		+"		},\n\n"
		+"		assertEqual:function(actual, expected) {\n"
		+"			if(expected===undefined)\n"
		+"				throw new Error(\"expected is undefined; use assertUndefined instead\");\n"
		+"			if(actual!==expected)\n"
		+"				throw new Error(\"expected '\"+expected+\"'; got '\"+actual+\"'\");\n"
		+"		},\n\n"
		+"		assertFalse:function(actual) {\n"
		+"			if(actual!==false)\n"
		+"				throw new Error(\"expected 'false'; got '\"+actual+\"'\");\n"
		+"		},\n\n"
		+"		assertTrue:function(actual) {\n"
		+"			if(actual!==true)\n"
		+"				throw new Error(\"expected 'true'; got '\"+actual+\"'\");\n"
		+"		},\n\n"
		+"		assertUndefined:function(actual) {\n"
		+"			if(actual!==undefined)\n"
		+"				throw new Error(\"expected 'undefined'; got '\"+actual+\"'\");\n"
		+"		},\n\n"
		+"		fail:function(message) { throw new Error(message); }\n\n"
		+"	});\n\n"
		+"	return module;\n"
		+"});\n"
	);

	window.sessionStorage.setItem("f8ca0f94-8f91-4210-9f57-a33029af532e", JSON.stringify({
		libraries:[
			{
				id:"c4575f18-fc4b-4836-bb6a-0959ae3c17ab",
				name:"octopus/builtins",
				url:"https://raw.githubusercontent.com/samuelmercier/octopus-samples/builtins-1.0/builtins/index.html"
			},
			{
				id:"293f21da-70ca-4335-9000-de9c556f4b10",
				name:"octopus/testing",
				url:"https://raw.githubusercontent.com/samuelmercier/octopus-samples/testing-1.1/testing/index.html"
			}
		],
		scripts:[
			{ id:"3e965e61-0f1e-4e4d-bd07-9053d011bfb1", name:"hello-world.js" }
		],
		styles:[],
		tests:[]
	}));

	newWorkbench(Project.newProject(window.sessionStorage, "f8ca0f94-8f91-4210-9f57-a33029af532e"));
});

function newWorkbench(project) {

	function openCreateDialog(title, callback) {
		let cancel, commit, name, dialog=System.gui.openPopupDialog({
			left:"2em",
			top:"2em",
			width:"40em",
			title:title,
			content:System.gui.createElement("div", "UIContainer", undefined,
				System.gui.createElement("div", "UILabel", undefined, document.createTextNode("Name")),
				name=System.gui.createElement("input", "UIInput")
			),
			buttons:[
				cancel=System.gui.createElement("button", undefined, {
					onclick:function() { dialog.close(); }
				}, document.createTextNode("Cancel")),
				commit=System.gui.createElement("button", undefined, {
					onclick:function() {
						try {
							selectResource(callback({ name:name.value }));
							dialog.close();
						} catch(e) {
							alert(e.message);
						}
					}
				}, document.createTextNode("Create"))
			],
			controls:[ name, commit, cancel ]
		});
	}

	function openDeleteDialog(message, resource) {
		let cancel, commit, dialog=System.gui.openPopupDialog({
			left:"2em",
			top:"2em",
			width:"40em",
			title:"Confirmation",
			content:document.createTextNode(message),
			buttons:[
				cancel=System.gui.createElement("button", undefined, {
					onclick:function() { dialog.close(); }
				}, document.createTextNode("Cancel")),
				commit=System.gui.createElement("button", undefined, {
					onclick:function() { resource.delete(), dialog.close(); }
				}, document.createTextNode("Delete"))
			],
			controls:[ commit, cancel ]
		});
	}

	function openRenameDialog(title, resource) {
		let cancel, commit, name, dialog=System.gui.openPopupDialog({
			left:"2em",
			top:"2em",
			width:"40em",
			title:title,
			content:System.gui.createElement("div", undefined, undefined,
				System.gui.createElement("div", "UILabel", undefined, document.createTextNode("Name")),
				name=System.gui.createElement("input", "UIInput", { value:resource.name() })
			),
			buttons:[
				cancel=System.gui.createElement("button", undefined, {
					onclick:function() { dialog.close(); }
				}, document.createTextNode("Cancel")),
				commit=System.gui.createElement("button", undefined, {
					onclick:function() {
						try {
							resource.rename(name.value), dialog.close();
						} catch(e) {
							alert(e.message);
						}
					}
				}, document.createTextNode("Update"))
			],
			controls:[ name, commit, cancel ]
		});
	}

	function openProjectContextMenu(event) {
		selectResource(undefined);
		const popup=System.gui.openContextMenu({
			items:[
				{ text:"Run", onclick:function() { popup.close(), run(); } },
				{ text:"Generate source", onclick:function() { popup.close(), generateSource(); } }
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openImportLibraryDialog() {
		let cancel, commit, input, dialog=System.gui.openPopupDialog({
			left:"2em",
			top:"2em",
			width:"40em",
			title:"Import a library",
			content:System.gui.createElement("div", "UIContainer", undefined,
				System.gui.createElement("div", "UILabel", undefined, document.createTextNode("Url")),
				input=System.gui.createElement("input", "UIInput")
			),
			buttons:[
				cancel=System.gui.createElement("button", undefined, {
					onclick:function() { dialog.close(); }
				}, document.createTextNode("Cancel")),
				commit=System.gui.createElement("button", undefined, {
					onclick:function() {
						const url=input.value;
						project.importLibrary(url, function onsuccess(library) {
							selectResource(library);
							dialog.close();
						}, function onerror(error) {
							alert(error.message);
						});
					}
				}, document.createTextNode("Import"))
			],
			controls:[ input, commit, cancel ]
		});
	}

	function openLibraryContextMenu(event, library) {
		selectResource(library);
		const popup=System.gui.openContextMenu({
			items:[
				{ text:"Delete", onclick:function() { popup.close(), openDeleteDialog("Delete library '"+library.name()+"' ?", library); } }
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openLibrariesContextMenu(event) {
		selectResource(project.libraries());
		const popup=System.gui.openContextMenu({
			items:[
				{
					text:"Import a library",
					onclick:function() { openImportLibraryDialog(), popup.close(); }
				}
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openScriptContextMenu(event, script) {
		selectResource(script);
		const popup=System.gui.openContextMenu({
			items:[
				{ text:"Delete", onclick:function() { popup.close(), openDeleteDialog("Delete script '"+script.name()+"' ?", script); } },
				{ text:"Rename", onclick:function() { popup.close(), openRenameDialog("Rename script '"+script.name()+"'", script); } }
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openScriptsContextMenu(event) {
		selectResource(undefined);
		const popup=System.gui.openContextMenu({
			items:[
				{
					text:"Create a new script",
					onclick:function() {
						popup.close();
						openCreateDialog("Create a new script", function(descriptor) { return project.createScript(descriptor.name); });
					}
				}
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openStyleContextMenu(event, style) {
		selectResource(style);
		const popup=System.gui.openContextMenu({
			items:[
				{ text:"Delete", onclick:function() { popup.close(), openDeleteDialog("Delete style sheet '"+style.name()+"' ?", style); } },
				{ text:"Rename", onclick:function() { popup.close(), openRenameDialog("Rename script '"+style.name()+"'", style); } }
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openStylesContextMenu(event) {
		selectResource(undefined);
		const popup=System.gui.openContextMenu({
			items:[
				{
					text:"Create a new style sheet",
					onclick:function() {
						popup.close();
						openCreateDialog("Create a new style sheet", function(descriptor) { return project.createStyle(descriptor.name); });
					}
				}
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openTestContextMenu(event, test) {
		selectResource(test);
		const popup=System.gui.openContextMenu({
			items:[
				{ text:"Delete", onclick:function() { popup.close(), openDeleteDialog("Delete test case '"+test.name()+"' ?", test); } },
				{ text:"Rename", onclick:function() { popup.close(), openRenameDialog("Rename test case '"+test.name()+"'", test); } },
				{ text:"Run", onclick:function() { popup.close(), testJavascript([ test ]); } },
				{ text:"Run Coverage", onclick:function() { popup.close(), Coverage.run(project, [ test ]); } },
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function openTestsContextMenu(event) {
		selectResource(undefined);
		const popup=System.gui.openContextMenu({
			items:[
				{
					text:"Create a new test case",
					onclick:function() {
						popup.close();
						openCreateDialog("Create a new test case", function(descriptor) { return project.createTest(descriptor.name); });
					}
				},
				{ text:"Run all tests", onclick:function() { popup.close(), testJavascript(project.tests()); } },
				{ text:"Run all coverage tests", onclick:function() { popup.close(), Coverage.run(project, Array.from(project.tests())); } }
			]
		}).setPosition(event.pageX+"px", event.pageY+"px");
		return false;
	}

	function generateSource() {
		const source=window.open("about:blank", "window", "menubar=0,toolbar=0,location=0,titlebar=0");
		setTimeout(function() {
			const pre=source.document.createElement("pre");
			pre.textContent=[ project.buildScripts(), project.buildStyles() ].join("");
			source.document.body.appendChild(pre);
			source.focus();
		}, 0);
	}

	function newTextEditor(parentElement, resource, descriptor, readonly) {
		const element=System.gui.createElement("textarea", "UITextEditor", { spellcheck:false, readOnly:readonly, value:resource.content() });
		parentElement.appendChild(element);
		element.focus();
		element.onkeydown=function(event) {
			if(event.keyCode===9) {
				const value=element.value;
				const selectionStart=element.selectionStart;
				element.value=value.substring(0, selectionStart)+"\t"+value.substring(element.selectionEnd);
				element.selectionStart=selectionStart+1;
				element.selectionEnd=selectionStart+1;
				event.preventDefault();
				return false;
			}
			if(event.ctrlKey&&(event.which===83||event.which===115)) {
				if(!readonly)
					resource.save(element.value);
				return false;
			}
		};
		return {
			remove:function() {
				if(!readonly)
					resource.save(element.value);
				descriptor.scrollLeft=element.scrollLeft;
				descriptor.scrollTop=element.scrollTop;
				descriptor.selectionEnd=element.selectionEnd;
				descriptor.selectionStart=element.selectionStart;
				parentElement.removeChild(element);
			},
			setSelectionRange(descriptor, positionStart, positionEnd) {
				if(positionStart!==undefined&&positionEnd!==undefined) {
					/* explicitly set the selection. workaround for chrome which does not automatically
					scroll to show the selection. */
					const value=element.value;
					element.value=value.substring(0, positionStart);
					const scrollTop=element.scrollHeight;
					element.value=value;
					element.selectionStart=positionStart;
					element.selectionEnd=positionEnd;
					element.scrollTop=scrollTop-element.clientHeight/2;
				}
				else {
					element.selectionStart=descriptor.selectionStart!==undefined ? descriptor.selectionStart : 0;
					element.selectionEnd=descriptor.selectionEnd!==undefined ? descriptor.selectionEnd : 0;
					element.scrollLeft=descriptor.scrollLeft!==undefined ? descriptor.scrollLeft : 0;
					element.scrollTop=descriptor.scrollTop!==undefined ? descriptor.scrollTop : 0;
				}
				element.focus();
			}
		};
	}

	/** reference to the runtime window. */
	let runtime=undefined;

	/** currently selected resource. */
	let selectedResource=undefined;

	function testJavascript(tests) {
		const sources=new Map();
		const heads=[];
		for(const library of project.libraries()) {
			const generator=Compiler.newJavascriptGenerator();
			library.tree().generate(generator);
			const libraryUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
			sources.set(libraryUrl, library);
			heads.push("<script type=\"text/javascript\" src=\""+libraryUrl+"\"></script>\n");
		}
		for(const script of project.scripts()) {
			const generator=Compiler.newJavascriptGenerator();
			script.tree().generate(generator);
			const scriptUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
			sources.set(scriptUrl, script);
			heads.push("<script type=\"text/javascript\" src=\""+scriptUrl+"\"></script>\n");
		}
		performTest(tests[Symbol.iterator]());

		function performTest(iterator) {
			const next=iterator.next();
			if(next.done) {
				for(const url of sources.keys())
					window.URL.revokeObjectURL(url);
				return;
			}
			const test=next.value;
			const generator=Compiler.newJavascriptGenerator();
			test.tree().generate(generator);
			const testUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
			sources.set(testUrl, test);
			const url=window.URL.createObjectURL(new Blob([
				"<!DOCTYPE html>\n",
				"<html>\n",
				"<head>\n",
				"<meta charset=\"UTF8\">\n",
				...heads,
				"<script type=\"text/javascript\" src=\""+testUrl+"\"></script>\n",
				"<script type=\"text/javascript\">\n",
				"window.onload=undefined;\n",
				"window[\"##oct##terminate\"](octopus.resolve(\"octopus/testing\").diagnostics);\n",
				"</script>\n",
				"</head>\n",
				"</html>"
			], { type:"text/html" }));
			const runtime=System.gui.createElement("iframe", undefined, { src:url });
			document.body.appendChild(runtime);
			runtime.contentWindow.console=Runtime.newConsole(sources, output.log, selectResource);
			runtime.contentWindow["##oct##terminate"]=function(diagnostics) {
				const errors=diagnostics.reduce((errors, diagnostic)=>errors+(diagnostic.status==="fail" ? 1 : 0), 0);
				items.get(test)
					.setText(test.name()+": "+(diagnostics.length!==0&&errors===0 ? "pass" : "fail"))
					.getItems().refresh(diagnostics, function(diagnostic, item) {
						item.setText(diagnostic.name+": "+(diagnostic.status==="fail" ? diagnostic.cause : "pass"));
					});
				if(diagnostics.length===0)
					runtime.contentWindow.console.log(test.name()+": no test. parse error?");
				else
					runtime.contentWindow.console.log(test.name()+": executed "+diagnostics.length+" test(s); "+errors+" error(s)");
			};
			runtime.onload=function() {
				if(runtime.contentWindow.location.href===url) {
					sources.delete(testUrl);
					window.URL.revokeObjectURL(url);
					window.URL.revokeObjectURL(testUrl);
					performTest(iterator);
				}
			};
		}
	}

	function run() {
		const sources=new Map();
		const heads=[];
		for(const library of project.libraries()) {
			const generator=Compiler.newJavascriptGenerator();
			library.tree().generate(generator);
			const libraryUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
			sources.set(libraryUrl, library);
			heads.push("<script type=\"text/javascript\" src=\""+libraryUrl+"\"></script>\n");
		}
		for(const script of project.scripts()) {
			const generator=Compiler.newJavascriptGenerator();
			script.tree().generate(generator);
			const scriptUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
			sources.set(scriptUrl, script);
			heads.push("<script type=\"text/javascript\" src=\""+scriptUrl+"\"></script>\n");
		}
		const url=window.URL.createObjectURL(new Blob([
			"<!DOCTYPE html>\n",
			"<html>\n",
			"<head>\n",
			"<meta charset=\"UTF8\">\n",
			"<style type=\"text/css\">"+project.buildStyles()+"</style>\n",
			...heads,
			"</head>\n",
			"</html>"
		], { type:"text/html" }));
		if(runtime!==undefined)
			runtime.close();
		runtime=window.open(url, "window", "menubar=0,toolbar=0,location=0,titlebar=0");
		runtime.window.console=Runtime.newConsole(sources, output.log, selectResource);
		runtime.onunload=function() {
			if(runtime.window.location.href===url) {
				window.URL.revokeObjectURL(url);
				for(const url of sources.keys())
					window.URL.revokeObjectURL(url);
			}
		};
		runtime.focus();
	};

	function selectDiagnostic(diagnostic) {
		diagnostics.setSelectedIndex(project.diagnostics().indexOf(diagnostic));
		if(diagnostic!==undefined) {
			selectTreeItem(diagnostic.sourceId);
			selectEditor(diagnostic.sourceId, diagnostic.positionStart, diagnostic.positionEnd);
			selectedResource=diagnostic.sourceId;
		}
	}

	function selectResource(resource, positionStart, positionEnd) {
		diagnostics.setSelectedIndex(-1);
		selectTreeItem(resource);
		selectEditor(resource, positionStart, positionEnd);
		selectedResource=resource;
	}

	const output=function() {
		const elements={};
		elements.element=System.gui.createElement("div", "UIConsole", {
			oncontextmenu:function(event) {
				const popup=System.gui.openContextMenu({
					items:[ { text:"Clear", onclick:function() { popup.close(), output.clear(); } } ]
				}).setPosition(event.pageX+"px", event.pageY+"px");
				return false;
			}
		});
		const output={
			clear:function() {
				while(elements.element.lastChild!==null)
					elements.element.removeChild(elements.element.lastChild);
			},
			log:function(element) { elements.element.appendChild(element); },
			setParentElement:function(parentElement) {
				if(parentElement!==null)
					parentElement.appendChild(elements.element);
				else
					elements.element.parentElement.removeChild(elements.element);
			}
		};
		return output;
	}();

	const diagnostics=System.gui.components.newTable({
		onselect:function(diagnostic) { selectDiagnostic(diagnostic); },
		columns:[
			{
				initializer:function(diagnostic) { return diagnostic.sourceId.name(); },
				title:"Resource",
				width:"32em"
			},
			{
				initializer:function(diagnostic) { return diagnostic.lineIndex; },
				title:"Location",
				width:"8em"
			},
			{
				initializer:function(diagnostic) { return diagnostic.message; },
				title:"Message",
				width:"64em"
			}
		]
	});
	project.diagnostics().registerListener(function(added, removed) { diagnostics.refresh(Array.from(project.diagnostics())); });

	const descriptors=new Map();
	let editor;
	function selectEditor(resource, positionStart, positionEnd) {
		let descriptor=descriptors.get(resource);
		if(descriptor===undefined)
			descriptors.set(resource, descriptor={});
		if(editor===undefined||selectedResource!==resource) {
			if(editor!==undefined) {
				editor.remove();
				editor=undefined;
			}
			for(const library of project.libraries())
				if(library===resource)
					editor=newTextEditor(elements.top, resource, descriptor, true);
			for(const script of project.scripts())
				if(script===resource)
					editor=newTextEditor(elements.top, resource, descriptor, false);
			for(const style of project.styles())
				if(style===resource)
					editor=newTextEditor(elements.top, resource, descriptor, false);
			for(const test of project.tests())
				if(test===resource)
					editor=newTextEditor(elements.top, resource, descriptor, false);
		}
		if(editor!==undefined)
			editor.setSelectionRange(descriptor, positionStart, positionEnd);
	}

	function selectTreeItem(resource) {
		tree.clearSelection();
		const item=items.get(resource);
		if(item!==undefined)
			item.setSelected(true);
	}

	const items=new Map();
	const tree=System.gui.components.newTree();
	const projectItem=tree.getItems().add()
		.setText("project")
		.onclick(function(event) { selectResource(project); })
		.oncontextmenu(function(event) { openProjectContextMenu(event); });
	items.set(project, projectItem);
	const librariesItem=projectItem.getItems().add()
		.setText("libraries")
			.onclick(function(event) { selectResource(project.libraries()); })
			.oncontextmenu(function(event) { openLibrariesContextMenu(event); });
	project.libraries().registerListener(function(added, removed) {
		const libraries=Array.from(project.libraries())
			.sort(function(a, b) { return a.name().localeCompare(b.name()); });
		librariesItem.getItems().refresh(libraries, function(library, item) {
			items.set(library, item);
			item
				.setText(library.name()+" ("+library.url()+")")
				.onclick(function(event) { selectResource(library); })
				.oncontextmenu(function(event) { openLibraryContextMenu(event, library); })
				.setSelected(library===selectedResource);
		});
	});
	items.set(project.libraries(), librariesItem);
	const scriptsItem=projectItem.getItems().add()
		.setText("scripts")
		.onclick(function(event) { selectResource(project.scripts()); })
		.oncontextmenu(function(event) { openScriptsContextMenu(event); });
	items.set(project.scripts(), scriptsItem);
	const stylesItem=projectItem.getItems().add()
		.setText("styles")
		.onclick(function(event) { selectResource(project.styles()); })
		.oncontextmenu(function(event) { openStylesContextMenu(event); });
	items.set(project.styles(), stylesItem);
	const testsItem=projectItem.getItems().add()
		.setText("tests")
		.onclick(function(event) { selectResource(project.tests()); })
		.oncontextmenu(function(event) { openTestsContextMenu(event); });
	items.set(project.tests(), testsItem);
	project.onscriptchange().push(function(script) {
		items.get(script)
			.setText(script.name())
			.getItems().refresh(Array.from(script.tree().declarations.entries()).sort((a, b)=>a[0].localeCompare(b[0])), function(entry, item) {
				const token=entry[1].nameToken;
				item
					.setText(entry[0])
					.onclick(function(event) { selectResource(script, token.offset, token.offset+token.text.length); });
			});
	});
	project.onstylechange().push(function(style) { items.get(style).setText(style.name()); });
	project.ontestchange().push(function(test) { items.get(test).setText(test.name()); });
	project.scripts().registerListener(function(added, removed) {
		const scripts=Array.from(project.scripts())
			.sort(function(a, b) { return a.name().localeCompare(b.name()); });
		scriptsItem.getItems().refresh(scripts, function(script, item) {
			items.set(script, item);
			item
				.setText(script.name())
				.onclick(function(event) { selectResource(script); })
				.oncontextmenu(function(event) { openScriptContextMenu(event, script); })
				.setSelected(script===selectedResource)
				.getItems().refresh(Array.from(script.tree().declarations.entries()).sort((a, b)=>a[0].localeCompare(b[0])), function(entry, item) {
					item
						.setText(entry[0])
						.onclick(function(event) { selectResource(script, entry[1].offset, entry[1].offset+entry[1].text.length); });
				});
		});
	});
	project.styles().registerListener(function(added, removed) {
		const styles=Array.from(project.styles())
			.sort(function(a, b) { return a.name().localeCompare(b.name()); });
		stylesItem.getItems().refresh(styles, function(style, item) {
			items.set(style, item);
			item
				.setText(style.name())
				.onclick(function(event) { selectResource(style); })
				.oncontextmenu(function(event) { openStyleContextMenu(event, style); })
				.setSelected(style===selectedResource);
		});
	});
	project.tests().registerListener(function(added, removed) {
		const tests=Array.from(project.tests())
			.sort(function(a, b) { return a.name().localeCompare(b.name()); });
		testsItem.getItems().refresh(tests, function(test, item) {
			items.set(test, item);
			item
				.setText(test.name())
				.onclick(function(event) { selectResource(test); })
				.oncontextmenu(function(event) { openTestContextMenu(event, test); })
				.setSelected(test===selectedResource);
		});
	});

	function startResize(event, resizeX, resizeY) {
		if(event.button!==0)
			return;
		const onmouseup=function(event) {
			if(event.button!==0)
				return;
			document.removeEventListener("mouseup", onmouseup);
			document.removeEventListener("mousemove", onmousemove);
		};
		const onmousemove=function(event) {
			if(resizeX) {
				const width=event.pageX+"px";
				elements.element.style.paddingLeft=width;
				elements.left.style.width=width;
			}
			if(resizeY) {
				const height=event.pageY+"px";
				elements.top.style.height=height;
				elements.right.style.paddingTop=height;
			}
		};
		document.addEventListener("mouseup", onmouseup);
		document.addEventListener("mousemove", onmousemove);
	}

	const elements={};
	elements.element=System.gui.createElement("div", "UIWorkbench", undefined,
		elements.left=System.gui.createElement("div", "left", undefined),
		elements.right=System.gui.createElement("div", "right", undefined,
			elements.top=System.gui.createElement("div", "top", undefined,
				System.gui.createElement("div", "resizeh", { onmousedown:function(event) { return startResize(event, true, false); } }),
				System.gui.createElement("div", "resizev", { onmousedown:function(event) { return startResize(event, false, true); } }),
				System.gui.createElement("div", "resizehv", { onmousedown:function(event) { return startResize(event, true, true); } })
			),
			elements.bottom=System.gui.createElement("div", "bottom", undefined,
				System.gui.createElement("div", "resizeh", { onmousedown:function(event) { return startResize(event, true, false); } })
			)
		)
	);
	document.body.appendChild(elements.element);
	tree.setParentElement(elements.left);
	System.gui.components.newTabbedPanel()
		.addTab("Diagnostics", diagnostics)
		.addTab("Console", output)
		.setTabIndex(0)
		.setParentElement(elements.bottom);
}
