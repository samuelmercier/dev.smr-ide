"use strict";

Tests.run(function testLog() {

	function log(value) { element=value; }

	const console=Runtime.newConsole(null, log, null);
	let element;

	console.log(null);
	Assertions.assertEqual(element.innerHTML, "null");

	console.log(undefined);
	Assertions.assertEqual(element.innerHTML, "undefined");

	console.log("message");
	Assertions.assertEqual(element.innerHTML, "message");

	/** incomplete error without message. */
	console.log({stack:""});
	Assertions.assertEqual(element.innerHTML, "[object Object]");

	/** incomplete error without stack. */
	console.log({message:"message"});
	Assertions.assertEqual(element.innerHTML, "[object Object]");

	/** error with invalid stack. */
	console.log({message:"message", stack:{} });
	Assertions.assertEqual(element.innerHTML, "[object Object]");

	console.log({message:"message", stack:"error" });

});

Tests.run(function testLogFirefoxUnmappedSources() {

	function log(value) { element=value; }

	let element;

	/* without proper mapped sources, the original url is used. */
	Runtime.newConsole(new Map(), log, function() {}).log({
		"message":"Error",
		"stack":"test@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:2:8\n"
			+"definition.run@blob:http://localhost:8080/66c0ced7-8c91-4086-93c1-82d725228c12:14:4\n"
			+"@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:1:36"
	});
	Assertions.assertEqual(
		element.outerHTML,
		"<div class=\"entry\">"
			+"<div class=\"stack\">Error</div>"
			+"<div class=\"stack\">test@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:2:8</div>"
			+"<div class=\"stack\">definition.run@blob:http://localhost:8080/66c0ced7-8c91-4086-93c1-82d725228c12:14:4</div>"
			+"<div class=\"stack\">@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:1:36</div>"
		+"</div>"
	);

});

Tests.run(function testLogFirefoxMappedSources() {

	function log(value) { element=value; }

	function onstackentryclick(_source, _selectionStart, _selectionEnd) {
		source=_source;
		selectionStart=_selectionStart;
		selectionEnd=_selectionEnd;
	}

	const source1={
		name:function() { return "name1"; },
		tree:function() { return tree1; }
	};
	const source2={
		name:function() { return "name2"; },
		tree:function() { return tree2; }
	};
	const tree1={ lines:[ 0, 1, 42 ] };
	const tree2={ lines:[ 1, 3, 5, 43 ] };

	let element;
	let source;
	let selectionStart;
	let selectionEnd;

	/* with proper mapped sources, the name of the source is used. */
	Runtime.newConsole(new Map([
		[ "blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8", source1 ],
		[ "blob:http://localhost:8080/66c0ced7-8c91-4086-93c1-82d725228c12", source2 ]
	]), log, onstackentryclick).log({
		"message":"Error",
		"stack":"test@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:2:8\n"
			+"definition.run@blob:http://localhost:8080/66c0ced7-8c91-4086-93c1-82d725228c12:3:4\n"
			+"@blob:http://localhost:8080/51a30364-3893-49c8-8e4d-c9e8450fada8:1:36"
	});
	Assertions.assertEqual(
		element.outerHTML,
		"<div class=\"entry\">"
			+"<div class=\"stack\">Error</div>"
			+"<div class=\"stack-link\">test:name1:2</div>"
			+"<div class=\"stack-link\">definition.run:name2:3</div>"
			+"<div class=\"stack-link\">:name1:1</div>"
		+"</div>"
	);

	element.childNodes[1].onclick();
	Assertions.assertEqual(source, source1);
	Assertions.assertEqual(selectionStart, 1);
	Assertions.assertEqual(selectionEnd, 1);

	element.childNodes[2].onclick();
	Assertions.assertEqual(source, source2);
	Assertions.assertEqual(selectionStart, 5);
	Assertions.assertEqual(selectionEnd, 5);

});

Tests.run(function testLogFirefoxMappedSources() {

	function log(value) { element=value; }

	function onstackentryclick(_source, _selectionStart, _selectionEnd) {
		source=_source;
		selectionStart=_selectionStart;
		selectionEnd=_selectionEnd;
	}

	const source1={
		name:function() { return "name1"; },
		tree:function() { return tree1; }
	};
	const source2={
		name:function() { return "name2"; },
		tree:function() { return tree2; }
	};
	const tree1={ lines:[ 0, 1, 42 ] };
	const tree2={ lines:[ 1, 3, 5, 43 ] };

	let element;
	let source;
	let selectionStart;
	let selectionEnd;

	/* with proper mapped sources, the name of the source is used. */
	Runtime.newConsole(new Map([
		[ "blob:http://localhost:8080/d5cfa2ad-88a7-47d1-899f-957214c8af5c", source1 ],
		[ "blob:http://localhost:8080/39296211-387b-41d7-ac37-1726ca099945", source2 ]
	]), log, onstackentryclick).log({
		message:"Error",
		stack:"Error: error\n"
			+"    at test (blob:http://localhost:8080/d5cfa2ad-88a7-47d1-899f-957214c8af5c:2:8)\n"
			+"    at Object.definition.run (blob:http://localhost:8080/39296211-387b-41d7-ac37-1726ca099945:3:4)\n"
			+"    at blob:http://localhost:8080/d5cfa2ad-88a7-47d1-899f-957214c8af5c:1:36"
	});
	Assertions.assertEqual(
		element.outerHTML,
		"<div class=\"entry\">"
			+"<div class=\"stack\">Error</div>"
			+"<div class=\"stack-link\">test:name1:2</div>"
			+"<div class=\"stack-link\">Object.definition.run:name2:3</div>"
			+"<div class=\"stack-link\">:name1:1</div>"
		+"</div>"
	);

	element.childNodes[1].onclick();
	Assertions.assertEqual(source, source1);
	Assertions.assertEqual(selectionStart, 1);
	Assertions.assertEqual(selectionEnd, 1);

	element.childNodes[2].onclick();
	Assertions.assertEqual(source, source2);
	Assertions.assertEqual(selectionStart, 5);
	Assertions.assertEqual(selectionEnd, 5);

});
