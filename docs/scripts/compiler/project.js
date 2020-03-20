"use strict";

const Project=function() {

	const Project={};

	Project.newProject=Object.freeze(function(localStorage, projectId) {

		const diagnostics=System.util.newNotifyingList(function(a) { return a; });
		const scripts=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const styles=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const tests=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const onscriptchange=[];
		const onstylechange=[];
		const ontestchange=[];

		let analysis;

		if(localStorage.getItem(projectId)===null)
			localStorage.setItem(projectId, JSON.stringify({scripts:[],styles:[]}));
		else {
			const definition=JSON.parse(localStorage.getItem(projectId));
			for(const script of definition.scripts)
				newScript(script.id, script.name, localStorage.getItem(script.id));
			for(const style of definition.styles)
				newStyle(style.id, style.name, localStorage.getItem(style.id));
			for(const test of definition.tests)
				newTest(test.id, test.name, localStorage.getItem(test.id));
			analyzeProject();
		}

		return Object.freeze({

			analysis:function() { return analysis; },
			diagnostics:function() { return diagnostics; },
			id:function() { return projectId; },
			scripts:function() { return scripts; },
			styles:function() { return styles; },
			tests:function() { return tests; },

			onscriptchange:function() { return onscriptchange; },
			onstylechange:function() { return onstylechange; },
			ontestchange:function() { return ontestchange; },

			/**  builds the content of the script tag. */
			buildScripts:function() {
				const generator=Compiler.newJavascriptGenerator();
				for(const script of scripts)
					script.tree().generate(generator.append("/* *** "+script.name()+" *** */\n\n"));
				return generator.build();
			},

			/** builds the content of the style tag. */
			buildStyles:function() {
				const result=[];
				for(const style of styles)
					result.push("/* *** ", style.name(), " *** */\n\n", style.content());
				return result.join("");
			},

			/** builds the content of the style tag. */
			buildTest:function(test) {
				const generator=Compiler.newJavascriptGenerator();
				for(const script of scripts)
					script.tree().generate(generator.append("/* *** "+script.name()+" *** */\n\n"));
				test.tree().generate(generator.append("/* *** "+test.name()+" *** */\n\n"));
				return generator.build();
			},

			createScript:function(name) {
				for(const script of scripts)
					if(script.name()===name)
						throw new Error("a script named '"+name+"' already exists.");
				const result=newScript(System.util.randomUUID(), name, "");
				localStorage.setItem(result.id(), "");
				saveProject();
				return result;
			},

			createStyle:function(name) {
				for(const style of styles)
					if(style.name()===name)
						throw new Error("a style sheet named '"+name+"' already exists.");
				const result=newStyle(System.util.randomUUID(), name, "");
				localStorage.setItem(result.id(), "");
				saveProject();
				return result;
			},

			createTest:function(name) {
				for(const test of tests)
					if(test.name()===name)
						throw new Error("a test named '"+name+"' already exists.");
				const result=newTest(System.util.randomUUID(), name, "");
				localStorage.setItem(result.id(), "");
				saveProject();
				return result;
			}

		});

		function analyzeProject() {
			const sources=[];
			for(const script of scripts)
				sources.push(script.tree());
			analysis=Compiler.analyzeJavascript(undefined, sources);
			for(const test of tests) {
				test.analyze(analysis);
				analysis.diagnostics.push(...test.analysis().diagnostics);
			}
			diagnostics.replace(analysis.diagnostics);
		}

		function saveProject() {
			localStorage.setItem(projectId, JSON.stringify({
				scripts:Array.from(scripts).sort((a, b)=>a.id().localeCompare(b.id())).map(script=>({ id:script.id(), name:script.name() })),
				styles:Array.from(styles).sort((a, b)=>a.id().localeCompare(b.id())).map(script=>({ id:script.id(), name:script.name() })),
				tests:Array.from(tests).sort((a, b)=>a.id().localeCompare(b.id())).map(test=>({ id:test.id(), name:test.name() }))
			}));
		}

		function newScript(id, name, content) {
			const script=Object.freeze({
				id:function() { return id; },
				content:function() { return content; },
				delete:function() {
					scripts.delete(script);
					saveProject();
					localStorage.removeItem(id);
					analyzeProject();
				},
				name:function() { return name; },
				rename:function(value) {
					for(const other of scripts)
						if(other!==script&&other.name()===value)
							throw new Error("a script named '"+value+"' already exists.");
					name=value;
					saveProject();
					for(const listener of onscriptchange)
						listener(script);
				},
				save:function(value) {
					if(value!==content) {
						localStorage.setItem(id, value);
						content=value;
						tree=Compiler.parseJavascript(script, content);
						analyzeProject();
						for(const listener of onscriptchange)
							listener(script);
					}
				},
				tree:function() { return tree; }
			});
			let tree=Compiler.parseJavascript(script, content);
			scripts.set(script);
			return script;
		}

		function newStyle(id, name, content) {
			const style=Object.freeze({
				id:function() { return id; },
				content:function() { return content; },
				delete:function() {
					styles.delete(style);
					saveProject();
					localStorage.removeItem(id);
				},
				name:function() { return name; },
				rename:function(value) {
					for(const other of styles)
						if(other!==style&&other.name()===value)
							throw new Error("a style sheet named '"+value+"' already exists.");
					name=value;
					saveProject();
					for(const listener of onstylechange)
						listener(style);
				},
				save:function(value) {
					if(value!==content) {
						localStorage.setItem(id, value);
						content=value;
					}
				}
			});
			styles.set(style);
			return style;
		}

		function newTest(id, name, content) {
			let analysis;
			const test=Object.freeze({
				id:function() { return id; },
				analyze:function(global) { analysis=Compiler.analyzeJavascript(global, [ tree ]); },
				analysis:function() { return analysis; },
				content:function() { return content; },
				delete:function() {
					tests.delete(test);
					saveProject();
					localStorage.removeItem(id);
					analyzeProject();
				},
				name:function() { return name; },
				rename:function(value) {
					for(const other of tests)
						if(other!==test&&other.name()===value)
							throw new Error("a test named '"+value+"' already exists.");
					name=value;
					saveProject();
					for(const listener of ontestchange)
						listener(test);
				},
				save:function(value) {
					if(value!==content) {
						localStorage.setItem(id, value);
						content=value;
						tree=Compiler.parseJavascript(test, content);
						analyzeProject();
					}
				},
				tree:function() { return tree; }
			});
			let tree=Compiler.parseJavascript(test, content);
			tests.set(test);
			return test;
		}

	});

	return Object.freeze(Project);

}();
