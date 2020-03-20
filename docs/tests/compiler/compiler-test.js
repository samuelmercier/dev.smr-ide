"use strict";

(function testJavascriptGenerator() {

	function assertGeneratorOutput(input, expected) {
		if(Array.isArray(input))
			input=input.join("");
		if(expected===undefined)
			expected=input;
		const tree=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(tree.diagnostics.length, 0);

		const generator=Compiler.newJavascriptGenerator();
		tree.generate(generator);
		Assertions.assertEqual(generator.build(), expected);
	}

	Tests.run(function testAppend() {
		const generator=Compiler.newJavascriptGenerator();

		generator.append("some");
		generator.append("input");

		Assertions.assertEqual(generator.build(), "someinput");
	});

	Tests.run(function testGenerateTrivias() {
		assertGeneratorOutput(" /* comment */ ");
		assertGeneratorOutput(" // comment ");
		assertGeneratorOutput(" \t\n ");
	});

	Tests.run(function testGenerateExpression() {
		assertGeneratorOutput(" 1 = 1; ");

		assertGeneratorOutput(" (function f() {}); ");
		assertGeneratorOutput(" (function f(a) {}); ");
		assertGeneratorOutput(" (function f(a, b) {}); ");
	});

	Tests.run(function testGenerateFunction() {
		assertGeneratorOutput(" function f() {} ");
		assertGeneratorOutput(" function f(a) {} ");
		assertGeneratorOutput(" function f(a, b) {} ");
	});

})();
