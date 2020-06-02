"use strict";

const Coverage=function() {

	let runtime=undefined;

	const definition={};

	definition.run=Object.freeze(function(project, tests) {
		if(runtime!==undefined)
			runtime.close();
		runtime=window.open("about:blank", "_blank", "menubar=0,toolbar=0,location=0,titlebar=0");
		setTimeout(function() {
			runtime.window.document.head.appendChild(System.gui.createElement("link", undefined, {
				rel:"stylesheet",
				type:"text/css",
				href:window.location.origin+window.location.pathname+(window.location.pathname.endsWith("/") ? "" : "/")+"styles/application.css"
			}));

			const coverages=new Map();
			const sources=new Map();
			const heads=[];
			for(const library of project.libraries()) {
				const generator=Compiler.newJavascriptGenerator();
				library.tree().generate(generator, false);
				const libraryUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
				sources.set(libraryUrl, library);
				heads.push("<script type=\"text/javascript\" src=\""+libraryUrl+"\"></script>\n");
			}
			let probeIndex=0;
			for(const script of project.scripts()) {
				const generator=Compiler.newCoverageGenerator(probeIndex);
				script.tree().generate(generator, true);
				probeIndex+=generator.probes().length;
				const scriptUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
				coverages.set(script, { lines:[], probes:generator.probes() });
				sources.set(scriptUrl, script);
				heads.push("<script type=\"text/javascript\" src=\""+scriptUrl+"\"></script>\n");
			}
			performTest(tests[Symbol.iterator]());

			function performTest(iterator) {
				const next=iterator.next();
				if(next.done) {
					finalizeTests();
					return;
				}
				const test=next.value;
				const generator=Compiler.newCoverageGenerator(probeIndex);
				test.tree().generate(generator, true);
				probeIndex+=generator.probes().length;
				const testUrl=window.URL.createObjectURL(new Blob([ generator.build() ], { type:"text/javascript" }));
				sources.set(testUrl, test);
				const url=window.URL.createObjectURL(new Blob([
					"<!DOCTYPE html>\n",
					"<html>\n",
					"<head>\n",
					"<meta charset=\"UTF8\">\n",
					"<script type=\"text/javascript\">\n",
					"window[\"##oct##probes\"]=[];\n",
					"window[\"##oct##c\"]=function(probeIndex, value) {\n",
					"	const current=window[\"##oct##probes\"][probeIndex];\n",
					"	window[\"##oct##probes\"][probeIndex]=(current!==undefined ? current : 0)|(value ? 2 : 1);\n",
					"	return value;\n",
					"};\n",
					"window[\"##oct##e\"]=function(probeIndex, value) { return window[\"##oct##probes\"][probeIndex]=3, value; };\n",
					"</script>\n",
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
				runtime.contentWindow["##oct##terminate"]=function(diagnostics) {
					coverages.set(test, { lines:[], probes:generator.probes(), result:runtime.contentWindow["##oct##probes"] });
					performTest(iterator);
				};
				runtime.onload=function() {
					if(runtime.contentWindow.location.href===url) {
						sources.delete(testUrl);
						window.URL.revokeObjectURL(url);
						window.URL.revokeObjectURL(testUrl);
					}
				};
			}

			function mark(tree, callback) {
				switch(tree.kind()) {
				case "array-access":
					mark(tree.operandTree, callback);
					callback(tree.openSquareToken.line);
					mark(tree.indexTree, callback);
					callback(tree.closeSquareToken.line);
					return;
				case "array-literal":
					callback(tree.openSquareToken.line);
					if(tree.initializersTree!==undefined)
						mark(tree.initializersTree, callback);
					callback(tree.closeSquareToken.line);
					return;
				case "assign":
					mark(tree.leftOperandTree, callback);
					callback(tree.operatorToken.line);
					mark(tree.rightOperandTree, callback);
					return;
				case "class":
					callback(tree.classTree.classToken.line);
					if(tree.classTree.nameToken!==undefined)
						callback(tree.classTree.nameToken.line);
					callback(tree.classTree.openCurlyToken.line);
					callback(tree.classTree.closeCurlyToken.line);
					return;
				case "function":
					callback(tree.functionTree.functionToken.line);
					if(tree.functionTree.nameToken!==undefined)
						callback(tree.functionTree.nameToken.line);
					mark(tree.functionTree.parametersTree, callback);
					return;
				case "function-parameters":
					callback(tree.openParenthesisToken.line);
					for(const parameterTree of tree.parameterTrees) {
						if(parameterTree.precedingCommaToken!==undefined)
							callback(parameterTree.precedingCommaToken.line);
						callback(parameterTree.nameToken.line);
					}
					callback(tree.closeParenthesisToken.line);
					return;
				case "infix":
					mark(tree.leftOperandTree, callback);
					callback(tree.operatorToken.line);
					mark(tree.rightOperandTree, callback);
					return;
				case "invocation":
					mark(tree.operandTree, callback);
					callback(tree.openParenthesisToken.line);
					if(tree.argumentsTree!==undefined)
						mark(tree.argumentsTree, callback);
					callback(tree.closeParenthesisToken.line);
					return;
				case "lambda-function":
					mark(tree.parametersTree, callback);
					callback(tree.operatorToken.line);
					return;
				case "literal":
					callback(tree.token.line);
					return;
				case "member-access":
					mark(tree.operandTree, callback);
					callback(tree.dotToken.line);
					callback(tree.nameToken.line);
					return;
				case "object-literal":
					mark(tree.openCurlyToken);
					for(const memberTree of tree.memberTrees)
						mark(memberTree, callback);
					mark(tree.closeCurlyToken);
					return;
				case "object-literal-computed-key":
					mark(tree.keyTree, callback);
					mark(tree.valueTree, callback);
					return;
				case "object-literal-literal-key":
					mark(tree.valueTree, callback);
					return;
				case "object-literal-method":
					return;
				case "parenthesized":
					callback(tree.openParenthesisToken.line);
					mark(tree.operandTree, callback);
					callback(tree.closeParenthesisToken.line);
					return;
				case "postfix":
					mark(tree.operandTree, callback);
					callback(tree.operatorToken.line);
					return;
				case "prefix":
					callback(tree.operatorToken.line);
					mark(tree.operandTree, callback);
					return;
				case "scope-access":
					callback(tree.nameToken.line);
					return;
				case "ternary":
					mark(tree.conditionTree, callback);
					callback(tree.questionToken.line);
					mark(tree.trueExpressionTree, callback);
					callback(tree.colonToken.line);
					mark(tree.falseExpressionTree, callback);
				}
			}

			function updateLines(coverage, result) {
				for(const probe of coverage.probes) {
					const hit=result[probe.index]!==undefined ? result[probe.index] : 0;
					probe.hits=(probe.hits!==undefined ? probe.hits : 0)|hit;
					mark(probe.tree, function(index) {
						coverage.lines[index]=(coverage.lines[index]!==undefined ? coverage.lines[index] : 0)|hit;
					});
				}
			}

			function finalizeTests() {
				for(const url of sources.keys())
					window.URL.revokeObjectURL(url);
				for(const test of tests) {
					const coverage=coverages.get(test);
					for(const script of project.scripts())
						updateLines(coverages.get(script), coverage.result);
					updateLines(coverage, coverage.result);
				}
				const items=new Map();
				const tree=System.gui.components.newTree();
				const projectItem=tree.getItems().add()
					.setText("project")
					.onclick(function(event) { selectResource(project); });
				items.set(project, projectItem);
				const scripts=Array.from(project.scripts())
					.sort(function(a, b) { return a.name().localeCompare(b.name()); });
				const scriptsItem=projectItem.getItems().add()
					.setText("scripts")
					.onclick(function(event) { selectResource(project.scripts()); });
				items.set(project.scripts(), scriptsItem);
				scriptsItem.getItems().refresh(scripts, function(script, item) {
					items.set(script, item);
					const hits=coverages.get(script).probes.reduce((misses, probe)=>misses+(probe.hits===3 ? 1 : 0), 0);
					const total=coverages.get(script).probes.length;
					item
						.setText(script.name()+": ("+Math.round(hits*100/total)+"%) "+hits+" / "+total)
						.onclick(function(event) { selectResource(script); });
				});
				const testsItem=projectItem.getItems().add()
					.setText("tests")
					.onclick(function(event) { selectResource(project.tests()); });
				items.set(project.tests(), testsItem);
				testsItem.getItems().refresh(tests, function(test, item) {
					items.set(test, item);
					const hits=coverages.get(test).probes.reduce((misses, probe)=>misses+(probe.hits===3 ? 1 : 0), 0);
					const total=coverages.get(test).probes.length;
					item
						.setText(test.name()+": ("+Math.round(hits*100/total)+"%) "+hits+" / "+total)
						.onclick(function(event) { selectResource(test); });
				});

				const elements={};
				elements.element=System.gui.createElement("div", "UICoverage", undefined,
					elements.left=System.gui.createElement("div", "left", undefined),
					elements.right=System.gui.createElement("div", "right", undefined,
						System.gui.createElement("div", "resize", { onmousedown:startResize }),
						elements.container=System.gui.createElement("div", "container")
					)
				);
				runtime.window.document.body.appendChild(elements.element);
				tree.setParentElement(elements.left);

				const editors=new Map();
				function selectResource(resource, positionStart, positionEnd) {
					tree.clearSelection();
					const item=items.get(resource);
					if(item!==undefined)
						item.setSelected(true);
					let editor=editors.get(resource);
					if(editor===undefined) {
						for(const script of project.scripts())
							if(script===resource)
								editors.set(resource, editor=newCodeRenderer(resource));
						for(const test of project.tests())
							if(test===resource)
								editors.set(resource, editor=newCodeRenderer(resource));
						if(editor!==undefined) {
							editor.className="UISource";
							elements.container.appendChild(editor);
						}
					}
					if(editor!==undefined) {
						elements.container.scrollTop=editor.offsetTop;
						if(positionStart!==undefined&&positionEnd!==undefined)
							editor.setSelectionRange(positionStart, positionEnd);
					}
				}

				function newCodeRenderer(resource) {
					const current=coverages.get(resource).lines;
					const generator=Compiler.newHtmlGenerator({
						getCoverageFor:function(line) {
							switch(current[line]) {
							default:
								return undefined;
							case 0:
								return "none";
							case 1:
							case 2:
								return "partial";
							case 3:
								return "total";
							}
						}
					});
					resource.tree().generate(generator);
					return generator.build();
				}

				function startResize(event) {
					if(event.button!==0)
						return;
					const onmouseup=function(event) {
						if(event.button!==0)
							return;
						runtime.window.document.removeEventListener("mouseup", onmouseup);
						runtime.window.document.removeEventListener("mousemove", onmousemove);
					};
					const onmousemove=function(event) {
						const width=event.pageX+"px";
						elements.element.style.paddingLeft=width;
						elements.left.style.width=width;
					};
					runtime.window.document.addEventListener("mouseup", onmouseup);
					runtime.window.document.addEventListener("mousemove", onmousemove);
				}
			}
		}, 1);
	});

	return Object.freeze(definition);

}();