"use strict";

const Project=function() {

	const Project={};

	Project.fetchLibrary=Object.freeze(function(asyncRequest, url, onsuccess, onerror) {

		function parseLibrary(html) {
			for(const node1 of html.childNodes)
				if(node1.nodeName==="HEAD") {
					for(const node2 of node1.childNodes)
						switch(node2.nodeName) {
						case "META":
							if(node2.getAttribute("name")==="application-name")
								applicationName=node2.getAttribute("content");
							continue;
						case "SCRIPT":
							const src=node2.getAttribute("src");
							if(src!=="")
								scripts.push(src);
							continue;
						}
				}
			if(applicationName===undefined)
				return void onerror(new Error("meta application-name was not specified"));
			if(scripts.length===0)
				return void onerror(new Error("no source in library"));
			source.push("/* *** library "+url+" *** */\n\n");
			loadScript(scripts[Symbol.iterator]());
		}

		function loadScript(iterator) {
			const entry=iterator.next();
			if(entry.done)
				return void onsuccess({ applicationName:applicationName, content:source.join(""), url:url });
			const target=url.substring(0, url.lastIndexOf("/")+1)+entry.value;
			asyncRequest("GET", target, null, function(request) {
				source.push("/* *** "+target+" *** */\n\n");
				source.push(request.responseText);
				source.push("\n");
				loadScript(iterator);
			}, function(request) {
				onerror(new Error("failed to fetch script '"+target+": "+request.status));
			});
		}

		let applicationName=undefined;
		const scripts=[];
		const source=[];
		asyncRequest("GET", url, null, function(request) {
			parseLibrary(new DOMParser().parseFromString(request.responseText, "text/html").documentElement);
		}, function(request) {
			onerror(new Error("failed to load project '"+url+"': "+request.status));
		});
	});

	Project.newProject=Object.freeze(function(localStorage, projectId) {

		const diagnostics=System.util.newNotifyingList(function(a) { return a; });
		const libraries=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const scripts=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const styles=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const tests=System.util.newNotifyingDataset(function(a) { return a.id(); });
		const onscriptchange=[];
		const onstylechange=[];
		const ontestchange=[];

		let librariesScope;
		let projectScope;

		if(localStorage.getItem(projectId)===null)
			localStorage.setItem(projectId, JSON.stringify({scripts:[],styles:[]}));
		else {
			const definition=JSON.parse(localStorage.getItem(projectId));
			for(const library of definition.libraries)
				newLibrary(library.id, library.name, library.url, localStorage.getItem(library.id));
			for(const script of definition.scripts)
				newScript(script.id, script.name, localStorage.getItem(script.id));
			for(const style of definition.styles)
				newStyle(style.id, style.name, localStorage.getItem(style.id));
			for(const test of definition.tests)
				newTest(test.id, test.name, localStorage.getItem(test.id));
		}
		analyzeLibraries();

		return Object.freeze({

			diagnostics:function() { return diagnostics; },
			id:function() { return projectId; },
			libraries:function() { return libraries; },
			scripts:function() { return scripts; },
			styles:function() { return styles; },
			tests:function() { return tests; },

			onscriptchange:function() { return onscriptchange; },
			onstylechange:function() { return onstylechange; },
			ontestchange:function() { return ontestchange; },

			/**  builds the content of the script tag. */
			buildScripts:function() {
				const generator=Compiler.newJavascriptGenerator();
				for(const library of libraries)
					library.tree().generate(generator.append("/* *** "+library.name()+" *** */\n\n"));
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

			importLibrary:function(url, onsuccess, onerror) {
				Project.fetchLibrary(System.io.asyncRequest, url, function(descriptor) {
					for(const library of libraries)
						if(library.name()===descriptor.applicationName)
							return void onerror(new Error("a library named '"+descriptor.applicationName+"' already exists."));
					const library=newLibrary(System.util.randomUUID(), descriptor.applicationName, url, descriptor.content);
					localStorage.setItem(library.id(), descriptor.content);
					saveProject();
					analyzeLibraries();
					onsuccess(library);
				}, onerror);
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

		function analyzeLibraries() {
			librariesScope=Compiler.analyzeJavascript(undefined, libraries.map(library=>library.tree()));
			analyzeProject();
		}

		function analyzeProject() {
			const result=[];
			result.push(...librariesScope.diagnostics);
			projectScope=Compiler.analyzeJavascript(librariesScope, scripts.map(script=>script.tree()));
			result.push(...projectScope.diagnostics);
			for(const test of tests) {
				const testScope=Compiler.analyzeJavascript(projectScope, [ test.tree() ]);
				result.push(...testScope.diagnostics);
			}
			diagnostics.replace(result);
		}

		function saveProject() {
			localStorage.setItem(projectId, JSON.stringify({
				libraries:Array.from(libraries).map(library=>({ id:library.id(), name:library.name(), url:library.url() })),
				scripts:Array.from(scripts).sort((a, b)=>a.id().localeCompare(b.id())).map(script=>({ id:script.id(), name:script.name() })),
				styles:Array.from(styles).sort((a, b)=>a.id().localeCompare(b.id())).map(script=>({ id:script.id(), name:script.name() })),
				tests:Array.from(tests).sort((a, b)=>a.id().localeCompare(b.id())).map(test=>({ id:test.id(), name:test.name() }))
			}));
		}

		function newLibrary(id, name, url, content) {
			const library=Object.freeze({
				id:function() { return id; },
				content:function() { return content; },
				delete:function() {
					libraries.delete(library);
					saveProject();
					localStorage.removeItem(id);
					analyzeLibraries();
				},
				name:function() { return name; },
				url:function() { return url; },
				tree:function() { return tree; },
			});
			let tree=Compiler.parseJavascript(library, content);
			libraries.set(library);
			return library;
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
			const test=Object.freeze({
				id:function() { return id; },
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
