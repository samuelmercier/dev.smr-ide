"use strict";

const Runtime=function() {

	let handle;

	const Runtime={};

	/** instantiate a new console for logging instrumented code.
		sources: a mapping: url => Tree.Source
		log: function(element: Element) called to log an Element representing a message.
		onstackentryclick: function(source, selectionStart, selectionEnd) called when a stack trace element is clicked.
	*/
	Runtime.newConsole=Object.freeze(function newConsole(sources, log, onstackentryclick) {

		function build(logLevel, value) {
			if(value===undefined) {
				const message=(logLevel!==undefined ? logLevel : "")+"undefined";
				return System.gui.createElement("div", "entry", undefined, document.createTextNode(message));
			}
			if(value===null) {
				const message=(logLevel!==undefined ? logLevel : "")+"null";
				return System.gui.createElement("div", "entry", undefined, document.createTextNode(message));
			}
			if(typeof value!=="object"||typeof value.message!=="string"||typeof value.stack!=="string") {
				const message=(logLevel!==undefined ? logLevel : "")+value.toString();
				return System.gui.createElement("div", "entry", undefined, document.createTextNode(message));
			}
			const stack=System.gui.createElement("div", "entry");
			stack.appendChild(System.gui.createElement("div", "stack", undefined, document.createTextNode(value.message)));
			for(let entry of value.stack.split("\n")) {
				/* get rid of empty lines and chromium's error message (part of stack trace). */
				if(entry===""||entry.startsWith("Error: "))
					continue;
				if(entry.startsWith("    at "))
					entry=entry.substring(7);
				const colon1=entry.lastIndexOf(":");
				const colon2=entry.lastIndexOf(":", colon1-1);
				const blobIndex=entry.lastIndexOf("blob:");
				if(blobIndex===-1) {
					stack.appendChild(System.gui.createElement("div", "stack", undefined, document.createTextNode(entry)));
					continue;
				}
				const source=sources.get(entry.substring(blobIndex, colon2));
				if(source===undefined) {
					stack.appendChild(System.gui.createElement("div", "stack", undefined, document.createTextNode(entry)));
					continue;
				}
				const lineIndex=parseInt(entry.substring(colon2+1, colon1));
				let name=entry.substring(0, blobIndex);
				/* get rid of firefox's @ */
				if(name.endsWith("@"))
					name=name.substring(0, name.length-1);
				/* get rid of chromium's trailer. */
				if(name.endsWith(" ("))
					name=name.substring(0, name.length-2);
				stack.appendChild(System.gui.createElement("div", "stack-link", {
					onclick:function(event) { onstackentryclick(source, source.tree().lines[lineIndex-1], source.tree().lines[lineIndex-1]); }
				}, document.createTextNode(name+":"+source.name()+":"+lineIndex)));
			}
			return stack;
		}

		return Object.freeze({
			clear:function() {},
			debug:function(value) { log(build("debug", value)); },
			dir:function(value) { log(build(undefined, value)); },
			dirxml:function(value) { log(build(undefined, value)); },
			error:function(value) { log(build("error", value)); },
			info:function(value) { log(build("info", value)); },
			log:function(value) { log(build(undefined, value)); }
		});
	});

	return Object.freeze(Runtime);

}();
