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
		Assertions.assertEqual(result.references[0], scopeAccessTree);
	});

	Tests.run(function testArgumentsResolutionInMethod() {
		const result=Compiler.parseJavascript("sourceId", "class Class { constructor() { arguments; } }");
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);

		const constructorTree=result.statementTrees[0].classTree.memberTrees[0];
		Assertions.assertEqual(constructorTree.blockTree.statementTrees[0].expressionTree.declaration, constructorTree.vars.get("arguments"));
	});

	Tests.run(function testSuperResolutionInClass() {
		const result=Compiler.parseJavascript("sourceId", "class Class { constructor() { super; } }");
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);

		const constructorTree=result.statementTrees[0].classTree.memberTrees[0];
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

	function parseSingleStatementWithDiagnostics(input) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		return assertDiagnostics(result);
	}

	Tests.run(function testAssign() {
		// FIXME: add array-access

		// FIXME: array literal

		// FIXME: better test
		parseSingleStatementWithDiagnostics("{ var a; a=a=0; }")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; (a=a)=0; }")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(class {})=0;")
			.assertDiagnostic(10, 11, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})=0;")
			.assertDiagnostic(15, 16, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(1+1)=0;")
			.assertDiagnostic(5, 6, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})=0;")
			.assertDiagnostic(15, 16, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(_=>undefined)=0;")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(()=>undefined)=0;")
			.assertDiagnostic(15, 16, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("0=0;")
			.assertDiagnostic(1, 2, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		// FIXME: add member-access

		parseSingleStatementWithDiagnostics("{ var a; a++=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; ++a=0; }")
			.assertDiagnostic(12, 13, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} f=0; }")
			.assertDiagnostic(19, 20, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; f=0; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { arguments=0; }")
			.assertDiagnostic(24, 25, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} C=0; }")
			.assertDiagnostic(14, 15, "left operand is not assignable")
			.assertNoMoreDiagnostic();

		// FIXME: add ternary
	});

	Tests.run(function testInvocation() {
		// FIXME: add array-access

		parseSingleStatementWithDiagnostics("[]();")
			.assertDiagnostic(2, 3, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; (a=function() {})(0); }")
			.assertDiagnostic(26, 27, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("{ var a; (a=[])(); }")
			.assertDiagnostic(15, 16, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(class {})();")
			.assertDiagnostic(10, 11, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})(0);")
			.assertDiagnostic(15, 16, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(function(a) {})(0);")
			.assertNoMoreDiagnostic();
		parseSingleStatementWithDiagnostics("(function(a, ...) {})();")
			.assertDiagnostic(21, 22, "expected at least 1 argument(s); got 0")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(1+1)();")
			.assertDiagnostic(5, 6, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		// FIXME: add invocation

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

		parseSingleStatementWithDiagnostics("0();")
			.assertDiagnostic(1, 2, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		// FIXME: add member-access

		parseSingleStatementWithDiagnostics("a++();")
			.assertDiagnostic(3, 4, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(++a)();")
			.assertDiagnostic(5, 6, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} f(0); }")
			.assertDiagnostic(19, 20, "expected at most 0 argument(s); got 1")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; f(0); }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { arguments(); }")
			.assertDiagnostic(24, 25, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} C(0); }")
			.assertDiagnostic(14, 15, "cannot invoke operand")
			.assertNoMoreDiagnostic();

		// FIXME: add ternary
	});

	Tests.run(function testPostfix() {
		// FIXME: add array-access

		// FIXME: add array-literal

		parseSingleStatementWithDiagnostics("{ var a; (a=a)++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(class {})++;")
			.assertDiagnostic(10, 12, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})++;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(1+1)++;")
			.assertDiagnostic(5, 7, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(function() {})++;")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("(_=>undefined)++;")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("0++;")
			.assertDiagnostic(1, 3, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add member-access

		parseSingleStatementWithDiagnostics("{ var a; a++++; }")
			.assertDiagnostic(12, 14, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; (++a)++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} f++; }")
			.assertDiagnostic(19, 21, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; f++; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { arguments++; }")
			.assertDiagnostic(24, 26, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} C++; }")
			.assertDiagnostic(14, 16, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add ternary
	});

	Tests.run(function testPrefixDecrement() {
		// FIXME: add array-access

		// FIXME: add array-literal

		parseSingleStatementWithDiagnostics("{ var a; --(a=a); }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(class {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(1+1);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--(_=>undefined);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("--0;")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add member-access

		parseSingleStatementWithDiagnostics("{ var a; ----a; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; --a--; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} --f; }")
			.assertDiagnostic(18, 20, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; --f; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { --arguments; }")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} --C; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add ternary
	});

	Tests.run(function testPrefixIncrement() {
		// FIXME: add array-access

		// FIXME: add array-literal

		parseSingleStatementWithDiagnostics("{ var a; ++(a=a); }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++(class {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++(1+1);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++(function() {});")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++(_=>undefined);")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("++0;")
			.assertDiagnostic(0, 2, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add member-access

		parseSingleStatementWithDiagnostics("{ var a; ++++a; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var a; ++a++; }")
			.assertDiagnostic(9, 11, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ function f() {} ++f; }")
			.assertDiagnostic(18, 20, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ var f; ++f; }")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("function f() { ++arguments; }")
			.assertDiagnostic(15, 17, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		parseSingleStatementWithDiagnostics("{ class C {} ++C; }")
			.assertDiagnostic(13, 15, "invalid increment/decrement operand")
			.assertNoMoreDiagnostic();

		// FIXME: add ternary
	});

})();