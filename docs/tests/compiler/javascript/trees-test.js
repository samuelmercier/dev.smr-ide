"use strict";

(function testGenerator() {

	function assertGenerateSingleStatement(input, expected) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		const generator=Compiler.newJavascriptGenerator();
		result.statementTrees[0].generate(generator);
		Assertions.assertEqual(generator.build(), expected!==undefined ? expected : input);
	}

	Tests.run(function testGenerateBlock() {
		assertGenerateSingleStatement(" { }");
		assertGenerateSingleStatement("label1: label2: { }");
	});

	Tests.run(function testGenerateEmpty() {
		assertGenerateSingleStatement(" { }");
		assertGenerateSingleStatement("label1: label2: { }");
	});

	Tests.run(function testGenerateExpressionArrayAccess() {
		assertGenerateSingleStatement(" a [ b ] ;");
	});

	Tests.run(function testGenerateExpressionArrayLiteral() {
		assertGenerateSingleStatement(" [ ] ;");
		assertGenerateSingleStatement(" [ a , b ] ;");
	});

	Tests.run(function testGenerateExpressionAssign() {
		assertGenerateSingleStatement(" a = b ;");
	});

	Tests.run(function testGenerateExpressionClass() {
		assertGenerateSingleStatement(" ( class { } ) ;");
		assertGenerateSingleStatement(" ( class Class extends Base { } ) ;");
	});

	Tests.run(function testGenerateExpressionFunction() {
		assertGenerateSingleStatement(" ( function() { } ) ;");
		assertGenerateSingleStatement(" ( function f ( a , b ) { } ) ;");
	});

	Tests.run(function testGenerateExpressionInfix() {
		assertGenerateSingleStatement(" a | b ;");
	});

	Tests.run(function testGenerateExpressionInvocation() {
		assertGenerateSingleStatement(" f ( ) ;");
		assertGenerateSingleStatement(" f ( a , b ) ;");
	});

	Tests.run(function testGenerateExpressionLambda() {
		assertGenerateSingleStatement(" f => 0 ;");
		assertGenerateSingleStatement(" ( ) => 0 ;");
		assertGenerateSingleStatement(" ( a , b ) => { } ;");
	});

	Tests.run(function testGenerateExpressionLiteral() {
		assertGenerateSingleStatement(" 0 ;");
	});

	Tests.run(function testGenerateExpressionMemberAccess() {
		assertGenerateSingleStatement(" a . b ;");
	});

	Tests.run(function testGenerateExpressionObjectLiteral() {
		assertGenerateSingleStatement(" ( { a : value1 , b : value2 } ) ;");
		assertGenerateSingleStatement(" ( { 0 : value1 , 1 : value2 } ) ;");
		assertGenerateSingleStatement(" ( { [ e1 ] : value1 , [ e2 ] : value2 } ) ;");
		assertGenerateSingleStatement(" ( { method1 ( ) { } , method2 ( a, b ) { } } ) ;");
	});

	Tests.run(function testGenerateExpressionParenthesized() {
		assertGenerateSingleStatement(" ( a ) ;");
	});

	Tests.run(function testGenerateExpressionPostfix() {
		assertGenerateSingleStatement(" a ++ ;");
	});

	Tests.run(function testGenerateExpressionPrefix() {
		assertGenerateSingleStatement(" ++ a ;");
	});

	Tests.run(function testGenerateExpressionScopeAccess() {
		assertGenerateSingleStatement(" a ;");
	});

	Tests.run(function testGenerateExpressionTernary() {
		assertGenerateSingleStatement(" a ? b : c ;");
	});

	Tests.run(function testGenerateMethod() {
		assertGenerateSingleStatement(" class Class { method ( ) { } }");
		assertGenerateSingleStatement(
			" class Class { @ annotation1 @ annotation2 static method ( a , b ) { } }",
			" class Class {/*  @ annotation1 @ annotation2 */ static method ( a , b ) { } }"
		);
	});

	Tests.run(function testGenerateSource() {
		const result=Compiler.parseJavascript("sourceId", " ");
		Assertions.assertEqual(result.statementTrees.length, 0);
		const generator=Compiler.newJavascriptGenerator();
		result.generate(generator);
		Assertions.assertEqual(generator.build(), " ");
	});

	Tests.run(function testGenerateBreak() {
		assertGenerateSingleStatement(" break ;");
		assertGenerateSingleStatement(" label1 : label2 : break label ;");
	});

	Tests.run(function testGenerateStatementClass() {
		assertGenerateSingleStatement(" class Class { }");
		assertGenerateSingleStatement(" @native class Class { }", "/*  @native class Class { } */");

		assertGenerateSingleStatement(
			" @annotation class Class extends Base { }",
			"/*  @annotation */ class Class extends Base { }"
		);
	});

	Tests.run(function testGenerateStatementContinue() {
		assertGenerateSingleStatement(" continue ;");
		assertGenerateSingleStatement(" label1 : label2 : continue label ;");
	});

	Tests.run(function testGenerateStatementDo() {
		assertGenerateSingleStatement(" do a ; while ( condition ) ;");
	});

	Tests.run(function testGenerateStatementExpression() {
		assertGenerateSingleStatement(" a ;");
		assertGenerateSingleStatement(" label1 : label2 : a ;");
	});

	Tests.run(function testGenerateStatementFor() {
		assertGenerateSingleStatement(" for ( initializer ; condition ; increment) ;");
		assertGenerateSingleStatement(" for ( const initializer = 0 ; condition ; increment) ;");
		assertGenerateSingleStatement(" for ( let initializer = 0 ; condition ; increment) ;");
		assertGenerateSingleStatement(" for ( var initializer = 0 ; condition ; increment) ;");
		assertGenerateSingleStatement(" label1 : label2 : for ( ; ; ) ;");
	});

	Tests.run(function testGenerateStatementForEach() {
		assertGenerateSingleStatement(" for ( const a in object ) ;");
		assertGenerateSingleStatement(" for ( let a in object ) ;");
		assertGenerateSingleStatement(" for ( var a in object ) ;");
		assertGenerateSingleStatement(" label1 : label2 : for ( a of iterable ) ;");
	});

	Tests.run(function testGenerateStatementFunction() {
		assertGenerateSingleStatement(" function f ( ) { }");
		assertGenerateSingleStatement(" @native function f ( ) { }", "/*  @native function f ( ) { } */");
	});

	Tests.run(function testGenerateStatementIf() {
		assertGenerateSingleStatement(" if ( condition ) a ;");
		assertGenerateSingleStatement(" if ( condition ) a ; else b ;");
	});

	Tests.run(function testGenerateStatementReturn() {
		assertGenerateSingleStatement(" return ;");
		assertGenerateSingleStatement(" return expression ;");
	});

	Tests.run(function testGenerateStatementSwitch() {
		assertGenerateSingleStatement(" switch ( condition ) { case a : expression1; default : expression2; }");
	});

	Tests.run(function testGenerateStatementThrow() {
		assertGenerateSingleStatement(" throw expression ;");
	});

	Tests.run(function testGenerateStatementTry() {
		assertGenerateSingleStatement(" label1 : label2 : try { }");
		assertGenerateSingleStatement(" try { } catch ( e ) { }");
		assertGenerateSingleStatement(" try { } finally { }");
	});

	Tests.run(function testGenerateStatementWhile() {
		assertGenerateSingleStatement(" while ( condition ) expression ;");
		assertGenerateSingleStatement(" label1 : label2 : while ( condition ) expression ;");
	});

	Tests.run(function testGenerateStatementVar() {
		assertGenerateSingleStatement(" var a , b = 1 ;");
		assertGenerateSingleStatement(" @native var a , b = 1 ;", "/*  @native var a , b = 1 ; */");
	});

})();

(function testAnalyze() {

	function parseSingleStatement(input) {
		const result=Compiler.parseJavascript("sourceId", input);
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);
		return result.statementTrees[0];
	}

	function parseSingleStatementWithDiagnostics(input) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		return assertDiagnostics(result);
	}

	Tests.run(function testAnalyzeFunctionArgumentsDefinitionMustFail() {
		parseSingleStatementWithDiagnostics("function f(arguments) {}")
			.assertDiagnostic(11, 20, "'arguments' can't be defined or assigned to")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAnalyzeFunctionParameterRedefinitionMustFail() {
		parseSingleStatementWithDiagnostics("(function f(arg, arg) {});")
			.assertDiagnostic(17, 20, "redefinition of parameter 'arg'")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f(arg) { var arg; }")
			.assertDiagnostic(22, 25, "redefinition of parameter 'arg'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAnalyzeFunctionVarRedefinitionMustFail() {
		parseSingleStatementWithDiagnostics("function f() { var def, def; }")
			.assertDiagnostic(24, 27, "redefinition of 'def'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAnalyzeLabelDuplicateLabelMustFail() {

		function assertDuplicateLabelMustFail(offsetStart, offsetEnd, input) {
			const result=Compiler.parseJavascript("sourceId", input);
			assertDiagnostics(result)
				.assertDiagnostic(offsetStart, offsetEnd, "redefinition of label 'label'")
				.assertNoMoreDiagnostic();
			Assertions.assertEqual(result.statementTrees[0].labels.size, 1);
			Assertions.assertTrue(result.statementTrees[0].labels.has("label"));
		}

		assertDuplicateLabelMustFail(9, 14, "label: { label: {} }");
		assertDuplicateLabelMustFail(7, 12, "label: label: {}");
		assertDuplicateLabelMustFail(7, 12, "label: label: do ; while(true);");
		assertDuplicateLabelMustFail(7, 12, "label: label: for(let name in 0);");
		assertDuplicateLabelMustFail(7, 12, "label: label: for(; ; );");
		assertDuplicateLabelMustFail(7, 12, "label: label: if(true);");
		assertDuplicateLabelMustFail(7, 12, "label: label: switch(true) {}");
		assertDuplicateLabelMustFail(7, 12, "label: label: try {}");
		assertDuplicateLabelMustFail(7, 12, "label: label: while(true);");
	});

	/** some statements cannot reasonably have labels, since they cannot be targeted by a break or continue. */
	Tests.run(function testAnalyzeLabelOnInvalidStatementMustFail() {

		function assertLabelOnInvalidStatementMustFail(offsetStart, offsetEnd, input) {
			parseSingleStatementWithDiagnostics(input)
				.assertDiagnostic(offsetStart, offsetEnd, "label cannot be referenced")
				.assertNoMoreDiagnostic();
		}

		assertLabelOnInvalidStatementMustFail(14, 19, "while(true) { label: break; }");
		assertLabelOnInvalidStatementMustFail(14, 19, "while(true) { label: continue; }");
		assertLabelOnInvalidStatementMustFail(0, 5, "label: ;");
		assertLabelOnInvalidStatementMustFail(0, 5, "label: 0;");
		assertLabelOnInvalidStatementMustFail(0, 5, "label: return;");
		assertLabelOnInvalidStatementMustFail( 0, 5, "label: throw 0;");
	});

	Tests.run(function testAnalyzeLabel() {

		function assertDoubleLabel(input) {
			const statement=parseSingleStatement(input);
			Assertions.assertEqual(statement.labels.size, 2);
			Assertions.assertTrue(statement.labels.has("label1"));
			Assertions.assertTrue(statement.labels.has("label2"));
		}

		assertDoubleLabel("label1: label2: {}");
		assertDoubleLabel("label1: label2: do ; while(true);");
		assertDoubleLabel("label1: label2: for(let name in 0);");
		assertDoubleLabel("label1: label2: for(; ; );");
		assertDoubleLabel("label1: label2: if(true);");
		assertDoubleLabel("label1: label2: switch(true) {}");
		assertDoubleLabel("label1: label2: try {}");
		assertDoubleLabel("label1: label2: while(true);");
	});

	Tests.run(function testAnalyzeLabelInvalidTargetMustFail() {
		parseSingleStatementWithDiagnostics("break invalid;")
			.assertDiagnostic(6, 13, "cannot resolve label 'invalid'")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("continue invalid;")
			.assertDiagnostic(9, 16, "cannot resolve label 'invalid'")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ break; }")
			.assertDiagnostic(2, 7, "unlabeled break must be inside loop or switch")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ continue; }")
			.assertDiagnostic(2, 10, "continue must be inside loop")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("if(true) break;")
			.assertDiagnostic(9, 14, "unlabeled break must be inside loop or switch")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("if(true) continue;")
			.assertDiagnostic(9, 17, "continue must be inside loop")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("switch(true) { default: continue; }")
			.assertDiagnostic(24, 32, "continue must be inside loop")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("try { break; } catch(e) { break; } finally { break; }")
			.assertDiagnostic(6, 11, "unlabeled break must be inside loop or switch")
			.assertDiagnostic(26, 31, "unlabeled break must be inside loop or switch")
			.assertDiagnostic(45, 50, "unlabeled break must be inside loop or switch")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("try { continue; } catch(e) { continue; } finally { continue; }")
			.assertDiagnostic(6, 14, "continue must be inside loop")
			.assertDiagnostic(29, 37, "continue must be inside loop")
			.assertDiagnostic(51, 59, "continue must be inside loop")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAnalyzeLabelResolveBreakInDo() {
		const tree=parseSingleStatement("do { { break; } } while(true);");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveBreakInFor() {
		const tree=parseSingleStatement("for(; ; ) { { break; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveBreakInForEach() {
		const tree=parseSingleStatement("for(var a in 0) { { break; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveBreakInSwitch() {
		const tree=parseSingleStatement("switch(true) { default: { break; } }");
		Assertions.assertEqual(tree.caseTrees[0].statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveBreakInWhile() {
		const tree=parseSingleStatement("while(true) { { break; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveContinueInDo() {
		const tree=parseSingleStatement("do { { continue; } } while(true);");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveContinueInFor() {
		const tree=parseSingleStatement("for(; ; ) { { continue; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveContinueInForEach() {
		const tree=parseSingleStatement("for(var a in 0) { { continue; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testAnalyzeLabelResolveContinueInWhile() {
		const tree=parseSingleStatement("while(true) { { continue; } }");
		Assertions.assertEqual(tree.statementTree.statementTrees[0].statementTrees[0].statementTree, tree);
	});

	Tests.run(function testResolutions() {
		const result=Compiler.parseJavascript("sourceId", [
			"function f(arg) {",
				"let let1;",
				"var var1;",
				"{ arg, let1, var1; }",
				"unresolved;",
			"}"
		].join("\n"));
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);

		const functionTree=result.statementTrees[0].functionTree;
		const arg=functionTree.parameters.get("arg");
		const let1=functionTree.blockTree.declarations.get("let1");
		const var1=functionTree.vars.get("var1");
		const expressionTree=functionTree.blockTree.statementTrees[2].statementTrees[0].expressionTree;
		const ref1=expressionTree.leftOperandTree.declaration;
		const ref2=expressionTree.rightOperandTree.leftOperandTree.declaration;
		const ref3=expressionTree.rightOperandTree.rightOperandTree.declaration;

		Assertions.assertEqual(ref1, arg);
		Assertions.assertEqual(ref2, let1);
		Assertions.assertEqual(ref3, var1);

		const scopeAccessTree=functionTree.blockTree.statementTrees[3].expressionTree;
		Assertions.assertUndefined(scopeAccessTree.declaration);
		Assertions.assertEqual(result.references.length, 1);
		Assertions.assertEqual(result.references[0].scope, functionTree.blockTree);
		Assertions.assertEqual(result.references[0].tree, scopeAccessTree);
	});

	Tests.run(function testArgumentsResolutionInMethod() {
		const result=Compiler.parseJavascript("sourceId", "class Class { constructor() { arguments; } }");
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);

		const constructorTree=result.statementTrees[0].classTree.memberTrees[0];
		// FIXME: currently arguments resolves to the method name token, which is wrong.
		Assertions.assertEqual(constructorTree.blockTree.statementTrees[0].expressionTree.declaration, constructorTree.nameToken);
	});

	Tests.run(function testSuperResolutionInClass() {
		const result=Compiler.parseJavascript("sourceId", "class Class { constructor() { super; } }");
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);

		const constructorTree=result.statementTrees[0].classTree.memberTrees[0];
		// FIXME: currently super resolves to the method name token, which is wrong.
		Assertions.assertEqual(constructorTree.blockTree.statementTrees[0].expressionTree.declaration, constructorTree.nameToken);
	});

	Tests.run(function testAnalyzeRegisterVar() {
		Assertions.assertTrue(parseSingleStatement("function f() { var a; }").functionTree.vars.has("a"));

		Assertions.assertTrue(parseSingleStatement("function f() { do { var a; } while(true); }").functionTree.vars.has("a"));

		Assertions.assertTrue(parseSingleStatement("function f() { for(; ; ) { var a; } }").functionTree.vars.has("a"));

		Assertions.assertTrue(parseSingleStatement("function f() { for(var a in 0) { var b; } }").functionTree.vars.has("a"));
		Assertions.assertTrue(parseSingleStatement("function f() { for(var a in 0) { var b; } }").functionTree.vars.has("b"));

		Assertions.assertTrue(parseSingleStatement("function f() { if(true) { var a; } }").functionTree.vars.has("a"));

		Assertions.assertTrue(parseSingleStatement("function f() { switch(true) { default: var a; } }").functionTree.vars.has("a"));

		Assertions.assertTrue(parseSingleStatement("function f() { switch(true) { default: var a; } }").functionTree.vars.has("a"));

		const tryFunction=parseSingleStatement("function f() { try { var a; } catch(e) { var b; } finally { var c; } }").functionTree;
		Assertions.assertTrue(tryFunction.vars.has("a"));
		Assertions.assertTrue(tryFunction.vars.has("b"));
		Assertions.assertTrue(tryFunction.vars.has("c"));

		Assertions.assertTrue(parseSingleStatement("function f() { while(true) { var a; } }").functionTree.vars.has("a"));
	});

})();
