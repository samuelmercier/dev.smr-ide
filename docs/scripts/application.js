"use strict";

const System=defineSystem(function () {
	window.sessionStorage.setItem("3e965e61-0f1e-4e4d-bd07-9053d011bfb1", "window.onload=function() { alert(\"Hello World!\"); };");
	window.sessionStorage.setItem("c4575f18-fc4b-4836-bb6a-0959ae3c17ab",
		"/* *** library https://raw.githubusercontent.com/samuelmercier/octopus-samples/master/builtins/index.html *** */\n\n"
		+"/* *** https://raw.githubusercontent.com/samuelmercier/octopus-samples/master/builtins/scripts/builtins.js *** */\n\n"
		+"\"use strict\";\n\n"
		+"@native function Date(@optional value, @optional monthIndex, @optional day, @optional hours, @optional minutes, @optional seconds, @optional milliseconds) {};\n"
		+"@native function Error(@optional message, @optional fileName, @optional lineNumber) {}\n"
		+"@native function Object(@optional value) {}\n"
		+"@native function Map(@optional iterable) {}\n\n"
		+"@native function alert(@optional message) {}\n"
		+"@native var console;\n"
		+"@native var performance;\n"
		+"@native const undefined;\n"
		+"@native const window;\n\n"
		+"const octopus=function() {\n\n"
		+"	const initializers=new Map();\n"
		+"	const libraries=new Map();\n"
		+"	const octopus={};\n\n"
		+"	octopus.define=Object.freeze(function(libraryName, initializer) {\n"
		+"		if(typeof initializer!==\"function\")\n"
		+"			throw new Error(\"initializer is not a function\");\n"
		+"		if(initializers.has(libraryName))\n"
		+"			throw new Error(\"redefinition of library '\"+libraryName+\"'\");\n"
		+"		initializers.set(libraryName, initializer);\n"
		+"	});\n\n"
		+"	octopus.resolve=Object.freeze(function(libraryName) {\n"
		+"		const library=libraries.get(libraryName);\n"
		+"		if(library!==undefined)\n"
		+"			return library;\n"
		+"		const initializer=initializers.get(libraryName);\n"
		+"		if(initializer===undefined)\n"
		+"			throw new Error(\"cannot resolve library '\"+libraryName+\"'\");\n"
		+"		const result={};\n"
		+"		libraries.set(libraryName, result);\n"
		+"		initializer(result);\n"
		+"		return Object.freeze(result);\n"
		+"	});\n\n"
		+"	octopus.initialize=function() {\n"
		+"		for(const libraryName of initializers.keys())\n"
		+"			octopus.resolve(libraryName);\n"
		+"	};\n\n"
		+"	return Object.freeze(octopus);\n\n"
		+"}();\n"
	);
	window.sessionStorage.setItem("293f21da-70ca-4335-9000-de9c556f4b10",
		"/* *** library https://raw.githubusercontent.com/samuelmercier/octopus-samples/testing-1.1/testing/index.html *** */\n\n"
		+"/* *** https://raw.githubusercontent.com/samuelmercier/octopus-samples/testing-1.1/testing/scripts/testing.js *** */\n\n"
		+"\"use strict\";\n\n"
		+"octopus.define(\"octopus/testing\", function(definition) {\n\n"
		+"	definition.diagnostics=[];\n\n"
		+"	definition.run=function(testFunction) {\n"
		+"		const start=performance.now();\n"
		+"		try {\n"
		+"			testFunction();\n"
		+"			definition.diagnostics.push({ name:testFunction.name, duration:performance.now()-start, status:\"pass\" });\n"
		+"		} catch(e) {\n"
		+"			definition.diagnostics.push({ name:testFunction.name, duration:performance.now()-start, status:\"fail\", cause:e });\n"
		+"			console.log(\"test '\"+testFunction.name+\"' failed\");\n"
		+"			console.log(e);\n"
		+"		}\n"
		+"	};\n\n"
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
				item
					.setText(entry[0])
					.onclick(function(event) { selectResource(script, entry[1].offset, entry[1].offset+entry[1].text.length); });
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
