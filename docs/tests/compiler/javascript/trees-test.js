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
		assertGenerateSingleStatement(" ;");
		assertGenerateSingleStatement("label1: label2: ;");
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
		assertGenerateSingleStatement(" 'character' ;");
		assertGenerateSingleStatement(" \"string\" ;");
		assertGenerateSingleStatement(" /regex/ ;");
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

	Tests.run(function testGenerateStatementBreak() {
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
		assertGenerateSingleStatement(" label1 : label2 : do a ; while ( condition ) ;");
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
		assertGenerateSingleStatement(" label1 : label2 : if ( condition ) a ; else b ;");
	});

	Tests.run(function testGenerateStatementReturn() {
		assertGenerateSingleStatement(" return ;");
		assertGenerateSingleStatement(" return expression ;");
	});

	Tests.run(function testGenerateStatementSwitch() {
		assertGenerateSingleStatement(" label1 : label2 : switch ( condition ) { case a : expression1; default : expression2; }");
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

	function assertGenerateHtmlStatement(input, expected) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		const generator=Compiler.newHtmlGenerator({ getCoverageFor:function(line) { return undefined; } });
		result.statementTrees[0].generate(generator);
		Assertions.assertEqual(generator.build().innerHTML, expected!==undefined ? expected : input);
	}

	Tests.run(function testGenerateHtmlCoverage() {
		const result=Compiler.parseJavascript("sourceId", "1;");
		Assertions.assertEqual(result.statementTrees.length, 1);
		const generator=Compiler.newHtmlGenerator({ getCoverageFor:function(line) { return "coverage"; } });
		result.statementTrees[0].generate(generator);
		Assertions.assertEqual(
			generator.build().innerHTML,
			"<span class=\"number\" coverage=\"coverage\">1</span><span class=\"punctuator\" coverage=\"coverage\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlBlock() {
		assertGenerateHtmlStatement(
			" { }",
			" <span class=\"punctuator\">{</span> <span class=\"punctuator\">}</span>"
		);
		assertGenerateHtmlStatement(
			" label1: label2: { }",
			" <span class=\"identifier\">label1</span><span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span><span class=\"punctuator\">:</span>"
			+" <span class=\"punctuator\">{</span> <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlEmpty() {
		assertGenerateHtmlStatement(" ;", " <span class=\"punctuator\">;</span>");
		assertGenerateHtmlStatement(
			" label1: label2: ;",
			" <span class=\"identifier\">label1</span><span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span><span class=\"punctuator\">:</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionArrayAccess() {
		assertGenerateHtmlStatement(
			" a [ b ] ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">[</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">]</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionArrayLiteral() {
		assertGenerateHtmlStatement(
			" [ ] ;",
			" <span class=\"punctuator\">[</span>"
			+" <span class=\"punctuator\">]</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" [ a , b ] ;",
			" <span class=\"punctuator\">[</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">]</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionAssign() {
		assertGenerateHtmlStatement(
			" a = b ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionClass() {
		assertGenerateHtmlStatement(
			" ( class { } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">class</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( class Class extends Base { } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"keyword\">extends</span>"
			+" <span class=\"identifier\">Base</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionFunction() {
		assertGenerateHtmlStatement(
			" ( function ( ) { } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">function</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( function f ( a , b ) { } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">function</span>"
			+" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionInfix() {
		assertGenerateHtmlStatement(
			" a | b ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">|</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionInvocation() {
		assertGenerateHtmlStatement(
			" f ( ) ;",
			" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" f ( a , b ) ;",
			" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionLambda() {
		assertGenerateHtmlStatement(
			" f => 0 ;",
			" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">=&gt;</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( ) => 0 ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">=&gt;</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( a , b ) => { } ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">=&gt;</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionLiteral() {
		assertGenerateHtmlStatement(
			" 0 ;",
			" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" 'character' ;",
			" <span class=\"character\">'character'</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" \"string\" ;",
			" <span class=\"string\">\"string\"</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" /regex/ ;",
			" <span class=\"regex\">/regex/</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionMemberAccess() {
		assertGenerateHtmlStatement(
			" a . b ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">.</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionObjectLiteral() {
		assertGenerateHtmlStatement(
			" ( { a : value1 , b : value2 } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value1</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value2</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( { 0 : value1 , 1 : value2 } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value1</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"number\">1</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value2</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( { [ e1 ] : value1 , [ e2 ] : value2 } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">[</span>"
			+" <span class=\"identifier\">e1</span>"
			+" <span class=\"punctuator\">]</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value1</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"punctuator\">[</span>"
			+" <span class=\"identifier\">e2</span>"
			+" <span class=\"punctuator\">]</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">value2</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" ( { method1 ( ) { } , method2 ( a , b ) { } } ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"identifier\">method1</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">method2</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionParenthesized() {
		assertGenerateHtmlStatement(
			" ( a ) ;",
			" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionPostfix() {
		assertGenerateHtmlStatement(
			" a ++ ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">++</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionPrefix() {
		assertGenerateHtmlStatement(
			" ++ a ;",
			" <span class=\"punctuator\">++</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionScopeAccess() {
		assertGenerateHtmlStatement(
			" a ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlExpressionTernary() {
		assertGenerateHtmlStatement(
			" a ? b : c ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">?</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">c</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlMethod() {
		assertGenerateHtmlStatement(
			" class Class { method ( ) { } }",
			" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"identifier\">method</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">}</span>"
		);
		assertGenerateHtmlStatement(
			" class Class { @ annotation1 @ annotation2 static method ( a , b ) { } }",
			" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">annotation1</span>"
			+" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">annotation2</span>"
			+" <span class=\"keyword\">static</span>"
			+" <span class=\"identifier\">method</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlSource() {
		const result=Compiler.parseJavascript("sourceId", " ");
		Assertions.assertEqual(result.statementTrees.length, 0);
		const generator=Compiler.newJavascriptGenerator();
		result.generate(generator);
		Assertions.assertEqual(generator.build(), " ");
	});

	Tests.run(function testGenerateHtmlStatementBreak() {
		assertGenerateHtmlStatement(
			" break ;",
			" <span class=\"keyword\">break</span> <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : break label ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">break</span>"
			+" <span class=\"identifier\">label</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementClass() {
		assertGenerateHtmlStatement(
			" class Class { }",
			" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);

		assertGenerateHtmlStatement(
			" @ native class Class { }",
			" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">native</span>"
			+" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);

		assertGenerateHtmlStatement(
			" @ annotation class Class extends Base { }",
			" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">annotation</span>"
			+" <span class=\"keyword\">class</span>"
			+" <span class=\"identifier\">Class</span>"
			+" <span class=\"keyword\">extends</span>"
			+" <span class=\"identifier\">Base</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementContinue() {
		assertGenerateHtmlStatement(
			" continue ;",
			" <span class=\"keyword\">continue</span> <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : continue label ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">continue</span>"
			+" <span class=\"identifier\">label</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementDo() {
		assertGenerateHtmlStatement(
			" do a ; while ( condition ) ;",
			" <span class=\"keyword\">do</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"keyword\">while</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : do a ; while ( condition ) ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">do</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"keyword\">while</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementExpression() {
		assertGenerateHtmlStatement(
			" a ;",
			" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : a ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementFor() {
		assertGenerateHtmlStatement(
			" for ( initializer ; condition ; increment ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">initializer</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">increment</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" for ( const initializer = 0 ; condition ; increment ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">const</span>"
			+" <span class=\"identifier\">initializer</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">increment</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" for ( let initializer = 0 ; condition ; increment ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">let</span>"
			+" <span class=\"identifier\">initializer</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">increment</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" for ( var initializer = 0 ; condition ; increment ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">var</span>"
			+" <span class=\"identifier\">initializer</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"number\">0</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"identifier\">increment</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : for ( ; ; ) ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementForEach() {
		assertGenerateHtmlStatement(
			" for ( const a in object ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">const</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"keyword\">in</span>"
			+" <span class=\"identifier\">object</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" for ( let a in object ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">let</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"keyword\">in</span>"
			+" <span class=\"identifier\">object</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" for ( var a in object ) ;",
			" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"keyword\">var</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"keyword\">in</span>"
			+" <span class=\"identifier\">object</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : for ( a of iterable ) ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">for</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"keyword\">of</span>"
			+" <span class=\"identifier\">iterable</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementFunction() {
		assertGenerateHtmlStatement(
			" function f ( ) { }",
			" <span class=\"keyword\">function</span>"
			+" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
		assertGenerateHtmlStatement(
			" @ native function f ( ) { }",
			" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">native</span>"
			+" <span class=\"keyword\">function</span>"
			+" <span class=\"identifier\">f</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementIf() {
		assertGenerateHtmlStatement(
			" if ( condition ) a ;",
			" <span class=\"keyword\">if</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : if ( condition ) a ; else b ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">if</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"keyword\">else</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementReturn() {
		assertGenerateHtmlStatement(
			" return ;",
			" <span class=\"keyword\">return</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" return expression ;",
			" <span class=\"keyword\">return</span>"
			+" <span class=\"identifier\">expression</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementSwitch() {
		assertGenerateHtmlStatement(
			" label1 : label2 : switch ( condition ) { case a : expression1 ; default : expression2 ; }",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">switch</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"keyword\">case</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">expression1</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"keyword\">default</span>"
			+" <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">expression2</span>"
			+" <span class=\"punctuator\">;</span>"
			+" <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementThrow() {
		assertGenerateHtmlStatement(
			" throw expression ;",
			" <span class=\"keyword\">throw</span>"
			+" <span class=\"identifier\">expression</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementTry() {
		assertGenerateHtmlStatement(
			" label1 : label2 : try { }",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">try</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
		assertGenerateHtmlStatement(
			" try { } catch ( e ) { }",
			" <span class=\"keyword\">try</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"keyword\">catch</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">e</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
		assertGenerateHtmlStatement(
			" try { } finally { }",
			" <span class=\"keyword\">try</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
			+" <span class=\"keyword\">finally</span>"
			+" <span class=\"punctuator\">{</span>"
			+" <span class=\"punctuator\">}</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementWhile() {
		assertGenerateHtmlStatement(
			" while ( condition ) expression ;",
			" <span class=\"keyword\">while</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"identifier\">expression</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" label1 : label2 : while ( condition ) expression ;",
			" <span class=\"identifier\">label1</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"identifier\">label2</span> <span class=\"punctuator\">:</span>"
			+" <span class=\"keyword\">while</span>"
			+" <span class=\"punctuator\">(</span>"
			+" <span class=\"identifier\">condition</span>"
			+" <span class=\"punctuator\">)</span>"
			+" <span class=\"identifier\">expression</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	Tests.run(function testGenerateHtmlStatementVar() {
		assertGenerateHtmlStatement(
			" var a , b = 1 ;",
			" <span class=\"keyword\">var</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"number\">1</span>"
			+" <span class=\"punctuator\">;</span>"
		);
		assertGenerateHtmlStatement(
			" @ native var a , b = 1 ;",
			" <span class=\"punctuator\">@</span>"
			+" <span class=\"identifier\">native</span>"
			+" <span class=\"keyword\">var</span>"
			+" <span class=\"identifier\">a</span>"
			+" <span class=\"punctuator\">,</span>"
			+" <span class=\"identifier\">b</span>"
			+" <span class=\"punctuator\">=</span>"
			+" <span class=\"number\">1</span>"
			+" <span class=\"punctuator\">;</span>"
		);
	});

	function assertGenerateCoverageStatement(input, expected) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		const generator=Compiler.newCoverageGenerator(0);
		result.statementTrees[0].generate(generator, true);
		Assertions.assertEqual(generator.build(), expected!==undefined ? expected : input);
	}

	Tests.run(function testGenerateCoverageBlock() {
		assertGenerateCoverageStatement(" { }");
		assertGenerateCoverageStatement("label1: label2: { }");
	});

	Tests.run(function testGenerateCoverageEmpty() {
		assertGenerateCoverageStatement(" ;");
		assertGenerateCoverageStatement("label1: label2: ;");
	});

	Tests.run(function testGenerateCoverageExpressionArrayAccess() {
		assertGenerateCoverageStatement(" a [ b ] ;", " window[\"##oct##e\"](0,  a [ b ]) ;");
	});

	Tests.run(function testGenerateCoverageExpressionArrayLiteral() {
		assertGenerateCoverageStatement(" [ ] ;", " window[\"##oct##e\"](0,  [ ]) ;");
		assertGenerateCoverageStatement(" [ a , b ] ;", " window[\"##oct##e\"](0,  [ a , b ]) ;");
	});

	Tests.run(function testGenerateCoverageExpressionAssign() {
		assertGenerateCoverageStatement(" a = b ;", " window[\"##oct##e\"](0,  a = b) ;");
	});

	Tests.run(function testGenerateCoverageExpressionClass() {
		assertGenerateCoverageStatement(" ( class { } ) ;", " window[\"##oct##e\"](0,  ( class { } )) ;");
		assertGenerateCoverageStatement(" ( class Class extends Base { } ) ;", " window[\"##oct##e\"](0,  ( class Class extends Base { } )) ;");
	});

	Tests.run(function testGenerateCoverageExpressionFunction() {
		assertGenerateCoverageStatement(" ( function() { } ) ;", " window[\"##oct##e\"](0,  ( function() { } )) ;");
		assertGenerateCoverageStatement(" ( function f ( a , b ) { } ) ;", " window[\"##oct##e\"](0,  ( function f ( a , b ) { } )) ;");
	});

	Tests.run(function testGenerateCoverageExpressionInfix() {
		assertGenerateCoverageStatement(" a | b ;", " window[\"##oct##e\"](0,  a | b) ;");
	});

	Tests.run(function testGenerateCoverageExpressionInfixLogicalAnd() {
		assertGenerateCoverageStatement(" a && b ;", " window[\"##oct##e\"](0,  a && window[\"##oct##e\"](1,  b)) ;");
	});

	Tests.run(function testGenerateCoverageExpressionInfix() {
		assertGenerateCoverageStatement(" a || b ;", " window[\"##oct##e\"](0,  a || window[\"##oct##e\"](1,  b)) ;");
	});

	Tests.run(function testGenerateCoverageExpressionInvocation() {
		assertGenerateCoverageStatement(" ( f ( ) ) ;", " window[\"##oct##e\"](0,  ( f ( ) )) ;");
		assertGenerateCoverageStatement(" ( f ( a , b ) ) ;", " window[\"##oct##e\"](0,  ( f ( a , b ) )) ;");
	});

	Tests.run(function testGenerateCoverageExpressionLambda() {
		assertGenerateCoverageStatement(
			" f => 0 ;",
			" window[\"##oct##e\"](0,  f => 0) ;"
		);
		assertGenerateCoverageStatement(
			" ( ) => 0 ;",
			" window[\"##oct##e\"](0,  ( ) => 0) ;"
		);
		assertGenerateCoverageStatement(
			" ( a , b ) => { } ;",
			" window[\"##oct##e\"](0,  ( a , b ) => { }) ;"
		);
	});

	Tests.run(function testGenerateCoverageExpressionLiteral() {
		assertGenerateCoverageStatement(" 0 ;", " window[\"##oct##e\"](0,  0) ;");
		assertGenerateCoverageStatement(" 'character' ;", " window[\"##oct##e\"](0,  'character') ;");
		assertGenerateCoverageStatement(" \"string\" ;", " window[\"##oct##e\"](0,  \"string\") ;");
		assertGenerateCoverageStatement(" /regex/ ;", " window[\"##oct##e\"](0,  /regex/) ;");
	});

	Tests.run(function testGenerateCoverageExpressionMemberAccess() {
		assertGenerateCoverageStatement(" a . b ;", " window[\"##oct##e\"](0,  a . b) ;");
	});

	Tests.run(function testGenerateCoverageExpressionObjectLiteral() {
		assertGenerateCoverageStatement(
			" ( { a : value1 , b : value2 } ) ;",
			" window[\"##oct##e\"](0,  ( { a : window[\"##oct##e\"](1,  value1) , b : window[\"##oct##e\"](2,  value2) } )) ;"
		);
		assertGenerateCoverageStatement(
			" ( { 0 : value1 , 1 : value2 } ) ;",
			" window[\"##oct##e\"](0,  ( { 0 : window[\"##oct##e\"](1,  value1) , 1 : window[\"##oct##e\"](2,  value2) } )) ;"
		);
		assertGenerateCoverageStatement(
			" ( { [ e1 ] : value1 , [ e2 ] : value2 } ) ;",
			" window[\"##oct##e\"](0,  ( {"
				+" [ window[\"##oct##e\"](1,  e1) ] : window[\"##oct##e\"](2,  value1) ,"
				+" [ window[\"##oct##e\"](3,  e2) ] : window[\"##oct##e\"](4,  value2)"
			+" } )) ;"
		);
		assertGenerateCoverageStatement(
			" ( { method1 ( ) { } , method2 ( a, b ) { } } ) ;",
			" window[\"##oct##e\"](0,  ( { method1 ( ) { } , method2 ( a, b ) { } } )) ;"
		);
	});

	Tests.run(function testGenerateCoverageExpressionParenthesized() {
		assertGenerateCoverageStatement(" ( a ) ;", " window[\"##oct##e\"](0,  ( a )) ;");
	});

	Tests.run(function testGenerateCoverageExpressionPostfix() {
		assertGenerateCoverageStatement(" a ++ ; ", " window[\"##oct##e\"](0,  a ++) ;");
	});

	Tests.run(function testGenerateCoverageExpressionPrefix() {
		assertGenerateCoverageStatement(" ++ a ;", " window[\"##oct##e\"](0,  ++ a) ;");
	});

	Tests.run(function testGenerateCoverageExpressionScopeAccess() {
		assertGenerateCoverageStatement(" a ;", " window[\"##oct##e\"](0,  a) ;");
	});

	Tests.run(function testGenerateCoverageExpressionTernary() {
		assertGenerateCoverageStatement(
			" a ? b : c ;",
			" window[\"##oct##e\"](0,  a ? window[\"##oct##e\"](1,  b) : window[\"##oct##e\"](2,  c)) ;"
		);
	});

	Tests.run(function testGenerateCoverageMethod() {
		assertGenerateCoverageStatement(" class Class { method ( ) { } }");
		assertGenerateCoverageStatement(
			" class Class { @ annotation1 @ annotation2 static method ( a , b ) { } }",
			" class Class {/*  @ annotation1 @ annotation2 */ static method ( a , b ) { } }"
		);
	});

	Tests.run(function testGenerateCoverageSource() {
		const result=Compiler.parseJavascript("sourceId", " ");
		Assertions.assertEqual(result.statementTrees.length, 0);
		const generator=Compiler.newCoverageGenerator(0);
		result.generate(generator, true);
		Assertions.assertEqual(generator.build(), " ");
	});

	Tests.run(function testGenerateCoverageStatementBreak() {
		assertGenerateCoverageStatement(" break ;");
		assertGenerateCoverageStatement(" label1 : label2 : break label ;");
	});

	Tests.run(function testGenerateCoverageStatementClass() {
		assertGenerateCoverageStatement(" class Class { }");
		assertGenerateCoverageStatement(" @native class Class { }", "/*  @native class Class { } */");

		assertGenerateCoverageStatement(
			" @annotation class Class extends Base { }",
			"/*  @annotation */ class Class extends Base { }"
		);
	});

	Tests.run(function testGenerateCoverageStatementContinue() {
		assertGenerateCoverageStatement(" continue ;");
		assertGenerateCoverageStatement(" label1 : label2 : continue label ;");
	});

	Tests.run(function testGenerateCoverageStatementDo() {
		assertGenerateCoverageStatement(
			" do a ; while ( condition ) ;",
			" do window[\"##oct##e\"](0,  a) ; while ( window[\"##oct##c\"](1,  condition) ) ;"
		);
		assertGenerateCoverageStatement(
			" label1 : label2 : do a ; while ( condition ) ;",
			" label1 : label2 : do window[\"##oct##e\"](0,  a) ; while ( window[\"##oct##c\"](1,  condition) ) ;"
		);
	});

	Tests.run(function testGenerateCoverageStatementExpression() {
		assertGenerateCoverageStatement(" a ;", " window[\"##oct##e\"](0,  a) ;");
		assertGenerateCoverageStatement(" label1 : label2 : a ;", " label1 : label2 : window[\"##oct##e\"](0,  a) ;");
	});

	Tests.run(function testGenerateCoverageStatementFor() {
		assertGenerateCoverageStatement(
			" for ( initializer ; condition ; increment) ;",
			" for ( window[\"##oct##e\"](0,  initializer) ; window[\"##oct##c\"](1,  condition) ; window[\"##oct##e\"](2,  increment)) ;"
		);
		assertGenerateCoverageStatement(
			" for ( const initializer = 0 ; condition ; increment) ;",
			" for ( const initializer = window[\"##oct##e\"](0,  0) ; window[\"##oct##c\"](1,  condition) ; window[\"##oct##e\"](2,  increment)) ;"
		);
		assertGenerateCoverageStatement(
			" for ( let initializer = 0 ; condition ; increment) ;",
			" for ( let initializer = window[\"##oct##e\"](0,  0) ; window[\"##oct##c\"](1,  condition) ; window[\"##oct##e\"](2,  increment)) ;"
		);
		assertGenerateCoverageStatement(
			" for ( var initializer = 0 ; condition ; increment) ;",
			" for ( var initializer = window[\"##oct##e\"](0,  0) ; window[\"##oct##c\"](1,  condition) ; window[\"##oct##e\"](2,  increment)) ;"
		);
		assertGenerateCoverageStatement(" label1 : label2 : for ( ; ; ) ;");
	});

	Tests.run(function testGenerateCoverageStatementForEach() {
		assertGenerateCoverageStatement(" for ( const a in object ) ;", " for ( const a in window[\"##oct##e\"](0,  object) ) ;");
		assertGenerateCoverageStatement(" for ( let a in object ) ;", " for ( let a in window[\"##oct##e\"](0,  object) ) ;");
		assertGenerateCoverageStatement(" for ( var a in object ) ;", " for ( var a in window[\"##oct##e\"](0,  object) ) ;");
		assertGenerateCoverageStatement(" label1 : label2 : for ( a of iterable ) ;", " label1 : label2 : for ( a of window[\"##oct##e\"](0,  iterable) ) ;");
	});

	Tests.run(function testGenerateCoverageStatementFunction() {
		assertGenerateCoverageStatement(" function f ( ) { }");
		assertGenerateCoverageStatement(" @native function f ( ) { }", "/*  @native function f ( ) { } */");
	});

	Tests.run(function testGenerateCoverageStatementIf() {
		assertGenerateCoverageStatement(
			" if ( condition ) a ;",
			" if ( window[\"##oct##c\"](0,  condition) ) window[\"##oct##e\"](1,  a) ;"
		);
		assertGenerateCoverageStatement(
			" label1 : label2 : if ( condition ) a ; else b ;",
			" label1 : label2 : if ( window[\"##oct##c\"](0,  condition) ) window[\"##oct##e\"](1,  a) ; else window[\"##oct##e\"](2,  b) ;"
		);
	});

	Tests.run(function testGenerateCoverageStatementReturn() {
		assertGenerateCoverageStatement(" return ;");
		assertGenerateCoverageStatement(" return expression ;", " return window[\"##oct##e\"](0,  expression) ;");
	});

	Tests.run(function testGenerateCoverageStatementSwitch() {
		assertGenerateCoverageStatement(
			" label1 : label2 : switch ( condition ) { case a : expression1; default : expression2; }",
			" label1 : label2 : switch ( window[\"##oct##e\"](0,  condition) ) {"
			+" case window[\"##oct##e\"](1,  a) : window[\"##oct##e\"](2,  expression1);"
			+" default : window[\"##oct##e\"](3,  expression2);"
			+" }"
		);
	});

	Tests.run(function testGenerateCoverageStatementThrow() {
		assertGenerateCoverageStatement(" throw expression ;", " throw window[\"##oct##e\"](0,  expression) ;");
	});

	Tests.run(function testGenerateCoverageStatementTry() {
		assertGenerateCoverageStatement(" label1 : label2 : try { }");
		assertGenerateCoverageStatement(" try { } catch ( e ) { }");
		assertGenerateCoverageStatement(" try { } finally { }");
	});

	Tests.run(function testGenerateCoverageStatementWhile() {
		assertGenerateCoverageStatement(
			" while ( condition ) expression ;",
			" while ( window[\"##oct##c\"](0,  condition) ) window[\"##oct##e\"](1,  expression) ;"
		);
		assertGenerateCoverageStatement(
			" label1 : label2 : while ( condition ) expression ;",
			" label1 : label2 : while ( window[\"##oct##c\"](0,  condition) ) window[\"##oct##e\"](1,  expression) ;"
		);
	});

	Tests.run(function testGenerateCoverageStatementVar() {
		assertGenerateCoverageStatement(" var a , b = 1 ;", " var a , b = window[\"##oct##e\"](0,  1) ;");
		assertGenerateCoverageStatement(" @native var a , b = 1 ;", "/*  @native var a , b = 1 ; */");
	});

})();

(function testAnalyze() {

	const Scope={ resolveScopeAccess:function(memberName) { return memberName==="Object" ? { members:new Map() } : undefined; } };

	function parseSingleStatement(input) {
		const result=Compiler.parseJavascript("sourceId", input).buildScope(Scope);
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);
		return result.statementTrees[0];
	}

	function parseSingleStatementWithDiagnostics(input) {
		const result=Compiler.parseJavascript("sourceId", input).buildScope(Scope);
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
			const result=Compiler.parseJavascript("sourceId", input).buildScope(Compiler.Javascript.Scope.Empty);
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

	Tests.run(function testClassMembersRegistration() {
		const tree=parseSingleStatement("class C {\n"
			+"f() {}\n"
			+"static f() {}\n"
		+"}").classTree;

		Assertions.assertEqual(tree.members.size, 1);
		Assertions.assertEqual(tree.members.get("f"), tree.memberTrees[0]);
		Assertions.assertEqual(tree.statics.size, 1);
		Assertions.assertEqual(tree.statics.get("f"), tree.memberTrees[1]);


		parseSingleStatementWithDiagnostics("class C {\n"
			+"f() {}\n"
			+"f() {}\n"
		+"}")
		.assertDiagnostic(17, 18, "redefinition of 'f'")
		.assertNoMoreDiagnostic();


		parseSingleStatementWithDiagnostics("class C {\n"
			+"static f() {}\n"
			+"static f() {}\n"
		+"}")
		.assertDiagnostic(31, 32, "redefinition of static 'f'")
		.assertNoMoreDiagnostic();
	});

	Tests.run(function testClassMembersResolution() {
		const tree1=parseSingleStatement("{ class C { f() {} } new C().f(); }");
		Assertions.assertEqual(tree1.statementTrees[1].expressionTree.operand, tree1.statementTrees[0].classTree.members.get("f"));

		const tree2=parseSingleStatement("{ class C { f() {} } class D extends C {} new D().f(); }");
		Assertions.assertEqual(tree2.statementTrees[2].expressionTree.operand, tree2.statementTrees[0].classTree.members.get("f"));

		parseSingleStatementWithDiagnostics("{ class C {} new C().f(); }")
		.assertDiagnostic(21, 22, "cannot resolve 'f'")
		.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(new class C {}.f());")
		.assertDiagnostic(16, 17, "cannot resolve 'f'")
		.assertNoMoreDiagnostic();
	});

	Tests.run(function testClassStaticsResolution() {
		const tree=parseSingleStatement("{ class C { static f() {} } C.f(); }");
		Assertions.assertEqual(tree.statementTrees[1].expressionTree.operand, tree.statementTrees[0].classTree.statics.get("f"));

		parseSingleStatementWithDiagnostics("{ class C {} C.f(); }")
		.assertDiagnostic(15, 16, "cannot resolve 'f'")
		.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(class C {}.f());")
		.assertDiagnostic(12, 13, "cannot resolve 'f'")
		.assertNoMoreDiagnostic();
	});

	Tests.run(function testCircularClassReference() {
		parseSingleStatementWithDiagnostics("class C extends C {}")
			.assertDiagnostic(8, 15, "circular hierarchy")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C extends D {} class D extends C {} }")
			.assertDiagnostic(31, 38, "circular hierarchy")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testResolutions() {
		const result=Compiler.parseJavascript("sourceId", [
			"function f(arg) {",
				"let let1;",
				"var var1;",
				"{ arg, let1, var1; }",
				"unresolved;",
			"}"
		].join("\n")).buildScope(Compiler.Javascript.Scope.Empty);
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
		Assertions.assertEqual(result.references[0], scopeAccessTree);
	});

	Tests.run(function testArgumentsResolutionInMethod() {
		const constructorTree=parseSingleStatement("class Class { constructor() { arguments; } }").classTree.memberTrees[0];
		Assertions.assertEqual(constructorTree.blockTree.statementTrees[0].expressionTree.declaration, constructorTree.vars.get("arguments"));
	});

	Tests.run(function testSuperResolutionInClass() {
		const constructorTree=parseSingleStatement("class Class { constructor() { super; } }").classTree.memberTrees[0];
		Assertions.assertEqual(constructorTree.blockTree.statementTrees[0].expressionTree.declaration, constructorTree.vars.get("super"));
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

(function testAnalyzeExpression() {

	const Scope={ resolveScopeAccess:function(memberName) { return memberName==="Object" ? {} : undefined; } };

	function parseSingleStatementWithDiagnostics(input) {
		const result=Compiler.parseJavascript("sourceId", input).buildScope(Scope);
		Assertions.assertEqual(result.statementTrees.length, 1);
		return assertDiagnostics(result);
	}

	Tests.run(function testAssignArrayAccessExpression() {
		parseSingleStatementWithDiagnostics("[][0]=0;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignArrayLiteralExpression() {
		parseSingleStatementWithDiagnostics("[]=0;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; a=a=0; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; (a=a)=0; }")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignClassExpression() {
		parseSingleStatementWithDiagnostics("(class {})=0;")
			.assertDiagnostic(10, 11, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignFunctionExpression() {
		parseSingleStatementWithDiagnostics("(function() {})=0;")
			.assertDiagnostic(15, 16, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignInfixExpression() {
		parseSingleStatementWithDiagnostics("(1+1)=0;")
			.assertDiagnostic(5, 6, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignLambdaExpression() {
		parseSingleStatementWithDiagnostics("(_=>undefined)=0;")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined)=0;")
			.assertDiagnostic(15, 16, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignLiteralExpression() {
		parseSingleStatementWithDiagnostics("0=0;")
			.assertDiagnostic(1, 2, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("(0).member=0;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("({})=0;")
			.assertDiagnostic(4, 5, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; a++=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; a--=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; ++a=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; --a=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} C=0; }")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) a=0;")
			.assertDiagnostic(20, 21, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) a=0;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) a=0;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { arguments=0; }")
			.assertDiagnostic(24, 25, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { parameter=0; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} f=0; }")
			.assertDiagnostic(19, 20, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; f=0; }")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; f=0; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; f=0; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testAssignTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testExtendsArrayAccessExpression() {
		parseSingleStatementWithDiagnostics("class C extends [][0] {}")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsArrayLiteralExpression() {
		parseSingleStatementWithDiagnostics("class C extends [] {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; class C extends a=0 {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsClassExpression() {
		parseSingleStatementWithDiagnostics("class C extends class {} {}")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsClassMethod() {
		parseSingleStatementWithDiagnostics("class C extends class { static method() {} }.method {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsFunctionExpression() {
		parseSingleStatementWithDiagnostics("class C extends function() {} {}")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsInfixExpression() {
		parseSingleStatementWithDiagnostics("class C extends 1+1 {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsLambdaExpression() {
		parseSingleStatementWithDiagnostics("class C extends _=>undefined {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("class C extends ()=>undefined {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsLiteralExpression() {
		parseSingleStatementWithDiagnostics("{ var a; class C extends 0 {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("class C extends (0).member {}")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsNull() {
		parseSingleStatementWithDiagnostics("class C extends null {}")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("class C extends {} {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsObjectMethod() {
		parseSingleStatementWithDiagnostics("class C extends { method() {} }.method {}")
			.assertDiagnostic(8, 15, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; class C extends a++ {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; class C extends a-- {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; class C extends ++a {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; class C extends --a {} }")
			.assertDiagnostic(17, 24, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} class D extends C {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) class C extends a {};")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) class C extends a {};")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) class C extends a {};")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { class C extends arguments {} }")
			.assertDiagnostic(23, 30, "extends expression is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { class C extends parameter {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} class C extends f {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; class C extends f {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; class C extends f {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; class C extends f {} }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testExtendsTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testInvocationArrayAccessExpression() {
		parseSingleStatementWithDiagnostics("[][0]();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationArrayLiteralExpression() {
		parseSingleStatementWithDiagnostics("[]();")
			.assertDiagnostic(2, 3, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; (a=function() {})(0); }")
			.assertDiagnostic(26, 27, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; (a=[])(); }")
			.assertDiagnostic(15, 16, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationClassExpression() {
		parseSingleStatementWithDiagnostics("(class {})();")
			.assertDiagnostic(10, 11, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationFunctionExpression() {
		parseSingleStatementWithDiagnostics("(function() {})(0);")
			.assertDiagnostic(15, 16, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(function(a) {})(0);")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(function(a, ...) {})();")
			.assertDiagnostic(21, 22, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationInfixExpression() {
		parseSingleStatementWithDiagnostics("(1+1)();")
			.assertDiagnostic(5, 6, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationLambdaExpression() {
		parseSingleStatementWithDiagnostics("(_=>undefined)();")
			.assertDiagnostic(14, 15, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined)(0);")
			.assertDiagnostic(15, 16, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("((a)=>undefined)(0);")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("((a)=>undefined)();")
			.assertDiagnostic(16, 17, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationLiteralExpression() {
		parseSingleStatementWithDiagnostics("0();")
			.assertDiagnostic(1, 2, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("(0).member();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("({})();")
			.assertDiagnostic(4, 5, "cannot invoke operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("({ member:0 }.member)();")
			.assertDiagnostic(21, 22, "cannot invoke operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("({ member:function() {} }.member)(0);")
			.assertDiagnostic(33, 34, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationPostfixExpression() {
		parseSingleStatementWithDiagnostics("a++();")
			.assertDiagnostic(3, 4, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("a--();")
			.assertDiagnostic(3, 4, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationPrefixExpression() {
		parseSingleStatementWithDiagnostics("(++a)();")
			.assertDiagnostic(5, 6, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(--a)();")
			.assertDiagnostic(5, 6, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} C(0); }")
			.assertDiagnostic(14, 15, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { arguments(); }")
			.assertDiagnostic(24, 25, "cannot invoke operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { parameter(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} f(0); }")
			.assertDiagnostic(19, 20, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; f(0); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; f(0); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; f(0); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testInvocationTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testMemberAccessArrayAccessExpression() {
		parseSingleStatementWithDiagnostics("{ [][0].member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessArrayLiteralExpression() {
		parseSingleStatementWithDiagnostics("{ [].member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; (a=0).member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessClassExpression() {
		parseSingleStatementWithDiagnostics("(class {}).member;")
			.assertDiagnostic(11, 17, "cannot resolve 'member'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessFunctionExpression() {
		parseSingleStatementWithDiagnostics("(function() {}).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessInfixExpression() {
		parseSingleStatementWithDiagnostics("(1+1).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessLambdaExpression() {
		parseSingleStatementWithDiagnostics("(_=>undefined).member;")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessLiteralExpression() {
		parseSingleStatementWithDiagnostics("(1).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("{ var a; a.member.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("({}).member;")
			.assertDiagnostic(5, 11, "cannot resolve 'member'")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("({ member:0 }).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; a++.member; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; a--.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; ++a.member; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; --a.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} C.member; }")
			.assertDiagnostic(15, 21, "cannot resolve 'member'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) a.member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) a.member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) a.member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { arguments.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { parameter.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} f.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; f.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; f.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; f.member; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testMemberAccessTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testNewArrayLiteralExpression() {
		parseSingleStatementWithDiagnostics("new [];")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new []();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; new (a=0); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new (a=0)(); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a, b; new (a=b); }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a, b; new (a=b)(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewClassExpression() {
		parseSingleStatementWithDiagnostics("new class {};")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new class { constructor(parameter) {} };")
			.assertDiagnostic(0, 3, "expected arguments")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new class {}();")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new class {}(0);")
			.assertDiagnostic(0, 3, "expected 0 argument")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new class { constructor(parameter) {} }();")
			.assertDiagnostic(0, 3, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewFunctionExpression() {
		parseSingleStatementWithDiagnostics("new function() {};")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new function(parameter) {};")
			.assertDiagnostic(0, 3, "expected arguments")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new function() {}();")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new function() {}(0);")
			.assertDiagnostic(0, 3, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new function(parameter) {}();")
			.assertDiagnostic(0, 3, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewInfixExpression() {
		parseSingleStatementWithDiagnostics("new (1+1);")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new (1+1)();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewLambdaExpression() {
		parseSingleStatementWithDiagnostics("new _=>undefined;")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new (_=>undefined)();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("new ()=>undefined;")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new (()=>undefined)();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewLiteralExpression() {
		parseSingleStatementWithDiagnostics("new 1;")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new 1();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("{ var a; new a.member; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new a.member(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("new {};")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("new {}();")
			.assertDiagnostic(0, 3, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; new (a++); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new (a++)(); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; new (a--); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new (a--)(); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; new (++a); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new (++a)(); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; new (--a); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; new (--a)(); }")
			.assertDiagnostic(9, 12, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} new C; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ class C { constructor(parameter) {} } new C; }")
			.assertDiagnostic(40, 43, "expected arguments")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ class C {} new C(); }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ class C {} new C(0); }")
			.assertDiagnostic(13, 16, "expected 0 argument")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ class C { constructor(parameter) {} } new C(); }")
			.assertDiagnostic(40, 43, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) new a;")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("for(const a of {}) new a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) new a;")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("for(let a of {}) new a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) new a;")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("for(var a of {}) new a();")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { new arguments; }")
			.assertDiagnostic(15, 18, "operand is not a class")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("function f() { new arguments(); }")
			.assertDiagnostic(15, 18, "operand is not a class")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { new parameter; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("function f(parameter) { new parameter(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} new f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ function f(parameter) {} new f; }")
			.assertDiagnostic(27, 30, "expected arguments")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ function f() {} new f(); }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ function f() {} new f(0); }")
			.assertDiagnostic(18, 21, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ function f(parameter) {} new f(); }")
			.assertDiagnostic(27, 30, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; new f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ const f=0; new f(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; new f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ let f; new f(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; new f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var f; new f(); }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testNewTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testPostfixArrayAccess() {
		parseSingleStatementWithDiagnostics("[][0]++;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("[][0]--;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixArrayLiteral() {
		// FIXME: this should report an error
		parseSingleStatementWithDiagnostics("[]++;")
			.assertNoMoreDiagnostic();

		// FIXME: this should report an error
		parseSingleStatementWithDiagnostics("[]--;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; (a=a)++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; (a=a)--; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixClassExpression() {
		parseSingleStatementWithDiagnostics("(class {})++;")
			.assertDiagnostic(10, 12, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(class {})--;")
			.assertDiagnostic(10, 12, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixFunctionExpression() {
		parseSingleStatementWithDiagnostics("(function() {})++;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})--;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixInfixExpression() {
		parseSingleStatementWithDiagnostics("(1+1)++;")
			.assertDiagnostic(5, 7, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(1+1)--;")
			.assertDiagnostic(5, 7, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixLambdaExpression() {
		parseSingleStatementWithDiagnostics("(_=>undefined)++;")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined)++;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(_=>undefined)--;")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined)--;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixLiteralExpression() {
		parseSingleStatementWithDiagnostics("0++;")
			.assertDiagnostic(1, 3, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("0--;")
			.assertDiagnostic(1, 3, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("[][0]++;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("[][0]--;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("({})++;")
			.assertDiagnostic(4, 6, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("({})--;")
			.assertDiagnostic(4, 6, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; a++++; }")
			.assertDiagnostic(12, 14, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; a----; }")
			.assertDiagnostic(12, 14, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; (++a)++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; (--a)--; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} C++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} C--; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) a++;")
			.assertDiagnostic(20, 22, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("for(const a of {}) a--;")
			.assertDiagnostic(20, 22, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) a++;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("for(let a of {}) a--;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) a++;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("for(var a of {}) a--;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { arguments++; }")
			.assertDiagnostic(24, 26, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { arguments--; }")
			.assertDiagnostic(24, 26, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { parameter++; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f(parameter) { parameter--; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} f++; }")
			.assertDiagnostic(19, 21, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} f--; }")
			.assertDiagnostic(19, 21, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; f++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ const f=0; f--; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; f++; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ let f; f--; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; f++; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; f--; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPostfixTernaryExpression() {
		// FIXME: add ternary
	});

	Tests.run(function testPrefixArrayAccessExpression() {
		parseSingleStatementWithDiagnostics("++[][0];")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--[][0];")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixArrayLiteralExpression() {
		// FIXME: this should report an error
		parseSingleStatementWithDiagnostics("++[];")
			.assertNoMoreDiagnostic();

		// FIXME: this should report an error
		parseSingleStatementWithDiagnostics("--[];")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixAssignExpression() {
		parseSingleStatementWithDiagnostics("{ var a; ++(a=a); }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; --(a=a); }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixClassExpression() {
		parseSingleStatementWithDiagnostics("++(class {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(class {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixFunctionExpression() {
		parseSingleStatementWithDiagnostics("++(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixInfixExpression() {
		parseSingleStatementWithDiagnostics("++(1+1);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(1+1);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixLambdaExpression() {
		parseSingleStatementWithDiagnostics("++(_=>undefined);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(_=>undefined);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixLiteralExpression() {
		parseSingleStatementWithDiagnostics("++0;")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--0;")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixMemberAccessExpression() {
		parseSingleStatementWithDiagnostics("++(0).member;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(0).member;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixObjectLiteralExpression() {
		parseSingleStatementWithDiagnostics("++{};")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--{};")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixPostfixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; ++++a; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; ----a; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixPrefixExpression() {
		parseSingleStatementWithDiagnostics("{ var a; ++a++; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; --a--; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessClassStatement() {
		parseSingleStatementWithDiagnostics("{ class C {} ++C; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ class C {} --C; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessForEachConst() {
		parseSingleStatementWithDiagnostics("for(const a of {}) ++a;")
			.assertDiagnostic(19, 21, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("for(const a of {}) --a;")
			.assertDiagnostic(19, 21, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessForEachLet() {
		parseSingleStatementWithDiagnostics("for(let a of {}) ++a;")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("for(let a of {}) --a;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessForEachVar() {
		parseSingleStatementWithDiagnostics("for(var a of {}) ++a;")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("for(var a of {}) --a;")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessFunctionArguments() {
		parseSingleStatementWithDiagnostics("function f() { ++arguments; }")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("function f() { --arguments; }")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessFunctionParameter() {
		parseSingleStatementWithDiagnostics("function f(parameter) { ++parameter; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("function f(parameter) { --parameter; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessFunctionStatement() {
		parseSingleStatementWithDiagnostics("{ function f() {} ++f; }")
			.assertDiagnostic(18, 20, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ function f() {} --f; }")
			.assertDiagnostic(18, 20, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessVariablesConst() {
		parseSingleStatementWithDiagnostics("{ const f=0; ++f; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ const f=0; --f; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessVariablesLet() {
		parseSingleStatementWithDiagnostics("{ let f; ++f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ let f; --f; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixScopeAccessVariablesVar() {
		parseSingleStatementWithDiagnostics("{ var f; ++f; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var f; --f; }")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testPrefixTernaryExpression() {
		// FIXME: add ternary
	});

})();