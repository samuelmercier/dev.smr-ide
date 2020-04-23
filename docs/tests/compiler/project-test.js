"use strict";

(function testProject() {

	function newLocalStorage() {
		const result=Object.freeze({
			items:new Map(),
			getItem:function(id) {
				const value=result.items.get(id);
				return value!==undefined ? value : null;
			},
			removeItem:function(id) { result.items.delete(id); },
			setItem:function(id, value) { result.items.set(id, value); }
		});
		return result;
	};

	Tests.run(function testCreateProject() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");
		Assertions.assertEqual(project.id(), "b1295ad4-1e00-4f77-8e40-f24875ec4557");
		Assertions.assertEqual(project.diagnostics().size(), 0);
		Assertions.assertEqual(project.scripts().size(), 0);
		Assertions.assertEqual(project.styles().size(), 0);

		Assertions.assertEqual(storage.items.size, 1);
		Assertions.assertEqual(storage.items.get("b1295ad4-1e00-4f77-8e40-f24875ec4557"), JSON.stringify({scripts:[],styles:[]}));
	});

	Tests.run(function testFetchLibrary() {

		function asyncRequest(method, url, payload, onsuccess, onerror) {
			switch(url) {
			case "base/project":
				return void onsuccess({responseText:["<!DOCTYPE html>",
					"<html>",
					"	<head>",
					"		<meta charset=\"utf-8\">",
					"		<meta name=\"application-name\" content=\"octopus/library\">",
					"		<script type=\"text/javascript\" src=\"scripts/script1.js\"></script>",
					"		<script type=\"text/javascript\" src=\"scripts/script2.js\"></script>",
					"	</head>",
					"</html>"
				].join("")});
			case "base/scripts/script1.js":
				return void onsuccess({ responseText:"// content1" });
			case "base/scripts/script2.js":
				return void onsuccess({ responseText:"// content2" });
			default:
				return void onerror({ status:500 });
			}
		}

		let library=undefined;
		Project.fetchLibrary(asyncRequest, "base/project", function(result) {
			library=result;
		}, function(error) {
			throw error;
		});

		Assertions.assertEqual(library.applicationName, "octopus/library");
		Assertions.assertEqual(library.content, [
			"/* *** library base/project *** */\n\n",
			"/* *** base/scripts/script1.js *** */\n\n",
			"// content1\n",
			"/* *** base/scripts/script2.js *** */\n\n",
			"// content2\n"
		].join(""));
		Assertions.assertEqual(library.url, "base/project");
	});

	Tests.run(function testFetchLibraryFetchFail() {

		function asyncRequest(method, url, payload, onsuccess, onerror) { return void onerror({ status:500 }); }

		let error=undefined;
		Project.fetchLibrary(asyncRequest, "base/project", function(result) {
			throw new Error("should not be reached");
		}, function(value) {
			error=value;
		});

		Assertions.assertEqual(error.message, "failed to load project 'base/project': 500");
	});

	Tests.run(function testFetchLibraryFetchScriptFail() {

		function asyncRequest(method, url, payload, onsuccess, onerror) {
			switch(url) {
			case "base/project":
				return void onsuccess({responseText:["<!DOCTYPE html>",
					"<html>",
					"	<head>",
					"		<meta charset=\"utf-8\">",
					"		<meta name=\"application-name\" content=\"octopus/library\">",
					"		<script type=\"text/javascript\" src=\"scripts/script.js\"></script>",
					"	</head>",
					"</html>"
				].join("")});
			default:
				return void onerror({ status:500 });
			}
		}

		let error=undefined;
		Project.fetchLibrary(asyncRequest, "base/project", function(result) {
			throw new Error("should not be reached");
		}, function(value) {
			error=value;
		});

		Assertions.assertEqual(error.message, "failed to fetch script 'base/scripts/script.js: 500");
	});

	Tests.run(function testLoadProject() {
		const storage=newLocalStorage();
		storage.items.set("b1295ad4-1e00-4f77-8e40-f24875ec4557", JSON.stringify({
			libraries:[
				{ id:"0aee62c0-efdd-44c1-89fe-c2eb6bf66308", name:"library1", url:"url1" }
			],
			scripts:[
				{ id:"6c8faf8d-ee4d-4928-b2d1-02ed87f59377", name:"script1" },
				{ id:"7bb35b40-5308-4e79-9fd5-44f945c24bfa", name:"script2" }
			],
			styles:[ { id:"968f03af-234b-4e0b-bf37-a5ac13b4ec8e", name:"style1" } ],
			tests:[ { id:"58eadfdf-ca6a-4e72-a903-a9fd9b7a3767", name:"test1" } ]
		}));
		storage.items.set("0aee62c0-efdd-44c1-89fe-c2eb6bf66308", "// library1");
		storage.items.set("6c8faf8d-ee4d-4928-b2d1-02ed87f59377", "content1");
		storage.items.set("7bb35b40-5308-4e79-9fd5-44f945c24bfa", "content2");
		storage.items.set("58eadfdf-ca6a-4e72-a903-a9fd9b7a3767", "content3");

		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		Assertions.assertEqual(project.id(), "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		Assertions.assertEqual(project.diagnostics().size(), 3);
		Assertions.assertEqual(project.diagnostics().at(0).message, "syntax error: expected ';'");
		Assertions.assertEqual(project.diagnostics().at(1).message, "syntax error: expected ';'");
		Assertions.assertEqual(project.diagnostics().at(2).message, "syntax error: expected ';'");

		Assertions.assertEqual(project.libraries().size(), 1);
		Assertions.assertEqual(project.libraries().get("0aee62c0-efdd-44c1-89fe-c2eb6bf66308").id(), "0aee62c0-efdd-44c1-89fe-c2eb6bf66308");
		Assertions.assertEqual(project.libraries().get("0aee62c0-efdd-44c1-89fe-c2eb6bf66308").name(), "library1");
		Assertions.assertEqual(project.libraries().get("0aee62c0-efdd-44c1-89fe-c2eb6bf66308").content(), "// library1");
		Assertions.assertEqual(project.libraries().get("0aee62c0-efdd-44c1-89fe-c2eb6bf66308").tree().diagnostics.length, 0);

		Assertions.assertEqual(project.scripts().size(), 2);
		Assertions.assertEqual(project.scripts().get("6c8faf8d-ee4d-4928-b2d1-02ed87f59377").id(), "6c8faf8d-ee4d-4928-b2d1-02ed87f59377");
		Assertions.assertEqual(project.scripts().get("6c8faf8d-ee4d-4928-b2d1-02ed87f59377").name(), "script1");
		Assertions.assertEqual(project.scripts().get("6c8faf8d-ee4d-4928-b2d1-02ed87f59377").content(), "content1");
		Assertions.assertEqual(project.scripts().get("6c8faf8d-ee4d-4928-b2d1-02ed87f59377").tree().diagnostics.length, 1);

		Assertions.assertEqual(project.scripts().get("7bb35b40-5308-4e79-9fd5-44f945c24bfa").id(), "7bb35b40-5308-4e79-9fd5-44f945c24bfa");
		Assertions.assertEqual(project.scripts().get("7bb35b40-5308-4e79-9fd5-44f945c24bfa").name(), "script2");
		Assertions.assertEqual(project.scripts().get("7bb35b40-5308-4e79-9fd5-44f945c24bfa").content(), "content2");
		Assertions.assertEqual(project.scripts().get("7bb35b40-5308-4e79-9fd5-44f945c24bfa").tree().diagnostics.length, 1);

		Assertions.assertEqual(project.styles().size(), 1);
		Assertions.assertEqual(project.styles().get("968f03af-234b-4e0b-bf37-a5ac13b4ec8e").id(), "968f03af-234b-4e0b-bf37-a5ac13b4ec8e");
		Assertions.assertEqual(project.styles().get("968f03af-234b-4e0b-bf37-a5ac13b4ec8e").name(), "style1");

		Assertions.assertEqual(project.tests().size(), 1);
		Assertions.assertEqual(project.tests().get("58eadfdf-ca6a-4e72-a903-a9fd9b7a3767").id(), "58eadfdf-ca6a-4e72-a903-a9fd9b7a3767");
		Assertions.assertEqual(project.tests().get("58eadfdf-ca6a-4e72-a903-a9fd9b7a3767").name(), "test1");
	});

	Tests.run(function testScript() {
		let changecount=0;
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");
		project.onscriptchange().push(function(value) { changecount+=1; });

		const script=project.createScript("script1");
		Assertions.assertEqual(changecount, 0);

		Assertions.assertEqual(script.content(), "");
		Assertions.assertEqual(script.name(), "script1");
		Assertions.assertEqual(script.tree().diagnostics.length, 0);
		Assertions.assertEqual(storage.items.get(script.id()), "");
		Assertions.assertEqual(project.scripts().size(), 1);
		Assertions.assertEqual(project.scripts().get(script.id()), script);

		script.save("content");
		Assertions.assertEqual(changecount, 1);

		Assertions.assertEqual(script.content(), "content");
		Assertions.assertEqual(script.name(), "script1");
		Assertions.assertEqual(script.tree().diagnostics.length, 1);
		Assertions.assertEqual(storage.items.get(script.id()), "content");
		Assertions.assertEqual(project.scripts().size(), 1);
		Assertions.assertEqual(project.scripts().get(script.id()), script);

		script.rename("script2");
		Assertions.assertEqual(changecount, 2);

		Assertions.assertEqual(script.content(), "content");
		Assertions.assertEqual(script.name(), "script2");
		Assertions.assertEqual(script.tree().diagnostics.length, 1);
		Assertions.assertEqual(storage.items.get(script.id()), "content");
		Assertions.assertEqual(project.scripts().size(), 1);
		Assertions.assertEqual(project.scripts().get(script.id()), script);

		script.delete();

		Assertions.assertEqual(storage.getItem(script.id()), null);
		Assertions.assertEqual(project.scripts().size(), 0);
	});

	Tests.run(function testScriptDuplicateNameMustFail() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		const script1=project.createScript("script1");

		Assertions.assertError(()=>project.createScript("script1"), "a script named 'script1' already exists.");

		project.createScript("script2");

		Assertions.assertError(()=>script1.rename("script2"), "a script named 'script2' already exists.");
	});

	Tests.run(function testStyle() {
		let changecount=0;
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");
		project.onstylechange().push(function(value) { changecount+=1; });

		const style=project.createStyle("style1");
		Assertions.assertEqual(changecount, 0);

		Assertions.assertEqual(style.content(), "");
		Assertions.assertEqual(style.name(), "style1");
		Assertions.assertEqual(storage.items.get(style.id()), "");
		Assertions.assertEqual(project.styles().size(), 1);
		Assertions.assertEqual(project.styles().get(style.id()), style);

		style.save("content");
		Assertions.assertEqual(changecount, 0);

		Assertions.assertEqual(style.content(), "content");
		Assertions.assertEqual(style.name(), "style1");
		Assertions.assertEqual(storage.items.get(style.id()), "content");
		Assertions.assertEqual(project.styles().size(), 1);
		Assertions.assertEqual(project.styles().get(style.id()), style);

		style.rename("style2");
		Assertions.assertEqual(changecount, 1);

		Assertions.assertEqual(style.content(), "content");
		Assertions.assertEqual(style.name(), "style2");
		Assertions.assertEqual(storage.items.get(style.id()), "content");
		Assertions.assertEqual(project.styles().size(), 1);
		Assertions.assertEqual(project.styles().get(style.id()), style);

		style.delete();

		Assertions.assertEqual(storage.getItem(style.id()), null);
		Assertions.assertEqual(project.styles().size(), 0);
	});

	Tests.run(function testStyleDuplicateNameMustFail() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		const style1=project.createStyle("style1");

		Assertions.assertError(()=>project.createStyle("style1"), "a style sheet named 'style1' already exists.");

		project.createStyle("style2");

		Assertions.assertError(()=>style1.rename("style2"), "a style sheet named 'style2' already exists.");
	});

	Tests.run(function testTest() {
		let changecount=0;
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");
		project.ontestchange().push(function(value) { changecount+=1; });

		const test=project.createTest("test1");
		Assertions.assertEqual(changecount, 0);

		Assertions.assertEqual(test.content(), "");
		Assertions.assertEqual(test.name(), "test1");
		Assertions.assertEqual(test.tree().diagnostics.length, 0);
		Assertions.assertEqual(storage.items.get(test.id()), "");
		Assertions.assertEqual(project.tests().size(), 1);
		Assertions.assertEqual(project.tests().get(test.id()), test);

		test.save("content");
		Assertions.assertEqual(changecount, 0);

		Assertions.assertEqual(test.content(), "content");
		Assertions.assertEqual(test.name(), "test1");
		Assertions.assertEqual(test.tree().diagnostics.length, 1);
		Assertions.assertEqual(storage.items.get(test.id()), "content");
		Assertions.assertEqual(project.tests().size(), 1);
		Assertions.assertEqual(project.tests().get(test.id()), test);

		test.rename("script2");
		Assertions.assertEqual(changecount, 1);

		Assertions.assertEqual(test.content(), "content");
		Assertions.assertEqual(test.name(), "script2");
		Assertions.assertEqual(test.tree().diagnostics.length, 1);
		Assertions.assertEqual(storage.items.get(test.id()), "content");
		Assertions.assertEqual(project.tests().size(), 1);
		Assertions.assertEqual(project.tests().get(test.id()), test);

		test.delete();

		Assertions.assertEqual(storage.getItem(test.id()), null);
		Assertions.assertEqual(project.tests().size(), 0);
	});

	Tests.run(function testTestDuplicateNameMustFail() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		const test1=project.createTest("test1");

		Assertions.assertError(()=>project.createTest("test1"), "a test named 'test1' already exists.");

		project.createTest("test2");

		Assertions.assertError(()=>test1.rename("test2"), "a test named 'test2' already exists.");
	});

	Tests.run(function testBuildScripts() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		project.createScript("script1").save("var a=1;");
		project.createScript("script2").save("var b=2;");

		Assertions.assertEqual(project.buildScripts(), "/* *** script1 *** */\n\nvar a=1;/* *** script2 *** */\n\nvar b=2;");
	});

	Tests.run(function testBuildStyles() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		project.createStyle("style1").save("style1");
		project.createStyle("style2").save("style2");

		Assertions.assertEqual(project.buildStyles(), "/* *** style1 *** */\n\nstyle1/* *** style2 *** */\n\nstyle2");
	});

	Tests.run(function testBuildTests() {
		const storage=newLocalStorage();
		const project=Project.newProject(storage, "b1295ad4-1e00-4f77-8e40-f24875ec4557");

		project.createScript("script1").save("var a=1;");
		project.createScript("script2").save("var b=2;");

		const test1=project.createTest("test1");
		test1.save("Tests.run(function test1() {});");
		const test2=project.createTest("test2");
		test2.save("Tests.run(function test2() {});");

		Assertions.assertEqual(
			project.buildTest(test1),
			"/* *** script1 *** */\n\nvar a=1;/* *** script2 *** */\n\nvar b=2;/* *** test1 *** */\n\nTests.run(function test1() {});"
		);
		Assertions.assertEqual(
			project.buildTest(test2),
			"/* *** script1 *** */\n\nvar a=1;/* *** script2 *** */\n\nvar b=2;/* *** test2 *** */\n\nTests.run(function test2() {});"
		);
	});

})();
