"use strict";

/* parser and first pass analyzer tests. */
(function() {

	function parseSingleExpression(kind, input) {
		const tree=parseSingleStatement("expression", "("+input+");");
		Assertions.assertEqual(tree.expressionTree.kind(), "parenthesized");
		Assertions.assertEqual(tree.expressionTree.operandTree.kind(), kind);
		assertPunctuator(tree.semicolonToken, ";");
		return tree.expressionTree.operandTree;
	}

	function parseSingleStatement(kind, input) {
		const result=Compiler.parseJavascript("sourceId", input);
		assertDiagnostics(result).assertNoMoreDiagnostic();
		Assertions.assertEqual(result.statementTrees.length, 1);
		Assertions.assertEqual(result.statementTrees[0].kind(), kind);
		return result.statementTrees[0];
	}

	function parseSingleStatementIgnoreDiagnostics(kind, input) {
		const result=Compiler.parseJavascript("sourceId", input);
		Assertions.assertEqual(result.statementTrees.length, 1);
		Assertions.assertEqual(result.statementTrees[0].kind(), kind);
		return result.statementTrees[0];
	}

	function parseSingleStatementWithDiagnostics(input) {
		return assertDiagnostics(Compiler.parseJavascript("sourceId", input));
	}

	function assertIdentifier(token, text) { assertToken(token, "identifier", text, undefined); }

	function assertKeyword(token, text) { assertToken(token, "keyword", text, undefined); }

	function assertNumber(token, text) { assertToken(token, "number", text, undefined); }

	function assertPunctuator(token, text) { assertToken(token, "punctuator", text, undefined); }

	function assertString(token, text) { assertToken(token, "string", text, undefined); }

	function assertScopeAccessExpression(tree, memberName) {
		Assertions.assertEqual(tree.kind(), "scope-access");
		assertIdentifier(tree.nameToken, memberName);
	}

	function assertScopeAccessStatement(tree, memberName) {
		Assertions.assertEqual(tree.kind(), "expression");
		Assertions.assertEqual(tree.expressionTree.kind(), "scope-access");
		assertIdentifier(tree.expressionTree.nameToken, memberName);
		assertPunctuator(tree.semicolonToken, ";");
	}

	function assertToken(token, kind, text, value) {
		Assertions.assertEqual(token.text, text);
		if(value!==undefined)
			Assertions.assertEqual(token.value, value);
	}

	Tests.run(function testParseDeclaration() {
		const tree=parseSingleStatement("var", "var a, b=expression;");
		assertKeyword(tree.keywordToken, "var");

		Assertions.assertEqual(tree.declaratorTrees.length, 2);

		Assertions.assertUndefined(tree.declaratorTrees[0].precedingCommaToken);
		assertIdentifier(tree.declaratorTrees[0].nameToken, "a");
		Assertions.assertUndefined(tree.declaratorTrees[0].initializerTree);

		assertPunctuator(tree.declaratorTrees[1].precedingCommaToken, ",");
		assertIdentifier(tree.declaratorTrees[1].nameToken, "b");
		assertPunctuator(tree.declaratorTrees[1].initializerTree.assignToken, "=");
		assertScopeAccessExpression(tree.declaratorTrees[1].initializerTree.expressionTree, "expression");

		assertPunctuator(tree.semicolonToken, ";");
	});

	Tests.run(function testParseExpressionArrayAccess() {
		const tree=parseSingleExpression("array-access", "expression[index]");

		Assertions.assertEqual(tree.firstToken(), tree.operandTree.nameToken);
		Assertions.assertEqual(tree.lastToken(), tree.closeSquareToken);

		assertScopeAccessExpression(tree.operandTree, "expression");
		assertPunctuator(tree.openSquareToken, "[");
		assertScopeAccessExpression(tree.indexTree, "index");
		assertPunctuator(tree.closeSquareToken, "]");
	});

	Tests.run(function testParseExpressionArrayLiteral() {
		const tree=parseSingleExpression("array-literal", "[ initializers ]");

		Assertions.assertEqual(tree.firstToken(), tree.openSquareToken);
		Assertions.assertEqual(tree.lastToken(), tree.closeSquareToken);

		assertPunctuator(tree.openSquareToken, "[");
		assertScopeAccessExpression(tree.initializersTree, "initializers");
		assertPunctuator(tree.closeSquareToken, "]");

		Assertions.assertUndefined(parseSingleExpression("array-literal", "[ ]").initializersTree);
	});

	Tests.run(function testParseExpressionClass() {
		const tree=parseSingleExpression("class", "class MyClass extends BaseClass { @annotation static staticFunction() {} method() {} }");

		Assertions.assertEqual(tree.firstToken(), tree.classTree.classToken);
		Assertions.assertEqual(tree.lastToken(), tree.classTree.closeCurlyToken);

		assertKeyword(tree.classTree.classToken, "class");
		assertKeyword(tree.classTree.extendsClauseTree.extendsToken, "extends");
		assertScopeAccessExpression(tree.classTree.extendsClauseTree.baseClassExpressionTree, "BaseClass");
		assertPunctuator(tree.classTree.openCurlyToken, "{");
		assertPunctuator(tree.classTree.closeCurlyToken, "}");

		Assertions.assertEqual(tree.classTree.memberTrees.length, 2);
		Assertions.assertEqual(tree.classTree.memberTrees[0].annotationsTree.annotationTrees.length, 1);
		assertPunctuator(tree.classTree.memberTrees[0].annotationsTree.annotationTrees[0].atToken, "@");
		assertPunctuator(tree.classTree.memberTrees[0].annotationsTree.annotationTrees[0].nameToken, "annotation");
		assertKeyword(tree.classTree.memberTrees[0].staticToken, "static");
		assertIdentifier(tree.classTree.memberTrees[0].nameToken, "staticFunction");
		Assertions.assertEqual(tree.classTree.memberTrees[0].parametersTree.parameterTrees.length, 0);
		Assertions.assertEqual(tree.classTree.memberTrees[0].blockTree.statementTrees.length, 0);

		Assertions.assertUndefined(tree.classTree.memberTrees[1].staticToken, "static");
		assertIdentifier(tree.classTree.memberTrees[1].nameToken, "method");
		Assertions.assertEqual(tree.classTree.memberTrees[1].parametersTree.parameterTrees.length, 0);
		Assertions.assertEqual(tree.classTree.memberTrees[1].blockTree.statementTrees.length, 0);

		Assertions.assertUndefined(parseSingleExpression("class", "class {}").classTree.nameToken);

		Assertions.assertUndefined(parseSingleExpression("class", "class MyClass {}").classTree.extendsClauseTree);
	});

	Tests.run(function testParseExpressionFunction() {
		const tree=parseSingleExpression("function", "function f(a, b) { }");

		Assertions.assertEqual(tree.firstToken(), tree.functionTree.functionToken);
		Assertions.assertEqual(tree.lastToken(), tree.functionTree.blockTree.closeCurlyToken);

		assertKeyword(tree.functionTree.functionToken, "function");
		assertIdentifier(tree.functionTree.nameToken, "f");
		assertPunctuator(tree.functionTree.parametersTree.openParenthesisToken, "(");
		Assertions.assertEqual(tree.functionTree.parametersTree.parameterTrees.length, 2);
		Assertions.assertUndefined(tree.functionTree.parametersTree.parameterTrees[0].precedingCommaToken);
		assertIdentifier(tree.functionTree.parametersTree.parameterTrees[0].nameToken, "a");
		assertPunctuator(tree.functionTree.parametersTree.parameterTrees[1].precedingCommaToken, ",");
		assertIdentifier(tree.functionTree.parametersTree.parameterTrees[1].nameToken, "b");
		assertPunctuator(tree.functionTree.parametersTree.closeParenthesisToken, ")");
		Assertions.assertEqual(tree.functionTree.blockTree.kind(), "block");

		Assertions.assertUndefined(parseSingleExpression("function", "function() {}").functionTree.nameToken);
	});

	Tests.run(function testParseExpressionInvocation() {
		const tree=parseSingleExpression("invocation", "expression(arguments)");

		Assertions.assertEqual(tree.firstToken(), tree.operandTree.nameToken);
		Assertions.assertEqual(tree.lastToken(), tree.closeParenthesisToken);

		assertScopeAccessExpression(tree.operandTree, "expression");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.argumentsTree, "arguments");
		assertPunctuator(tree.closeParenthesisToken, ")");

		Assertions.assertUndefined(parseSingleExpression("invocation", "expression()").argumentsTree);
	});

	Tests.run(function testParseExpressionLambda() {
		const tree1=parseSingleExpression("lambda-function", "_=>{}");

		Assertions.assertEqual(tree1.firstToken(), tree1.parametersTree.nameToken);
		Assertions.assertEqual(tree1.lastToken(), tree1.bodyTree.closeCurlyToken);

		Assertions.assertEqual(tree1.parametersTree.kind(), "lambda-parameter");
		assertIdentifier(tree1.parametersTree.nameToken, "_");
		assertPunctuator(tree1.operatorToken, "=>");
		Assertions.assertEqual(tree1.bodyTree.kind(), "block");


		const tree2=parseSingleExpression("lambda-function", "()=>expression");

		Assertions.assertEqual(tree2.firstToken(), tree2.parametersTree.openParenthesisToken);
		Assertions.assertEqual(tree2.lastToken(), tree2.bodyTree.nameToken);

		Assertions.assertEqual(tree2.parametersTree.kind(), "function-parameters");
		assertPunctuator(tree2.parametersTree.openParenthesisToken, "(");
		Assertions.assertEqual(tree2.parametersTree.parameterTrees.length, 0);
		assertPunctuator(tree2.parametersTree.closeParenthesisToken, ")");


		const tree3=parseSingleExpression("lambda-function", "(a, b)=>expression");

		Assertions.assertEqual(tree3.firstToken(), tree3.parametersTree.openParenthesisToken);
		Assertions.assertEqual(tree3.lastToken(), tree3.bodyTree.nameToken);

		Assertions.assertEqual(tree3.parametersTree.kind(), "function-parameters");
		assertPunctuator(tree3.parametersTree.openParenthesisToken, "(");
		Assertions.assertEqual(tree3.parametersTree.parameterTrees.length, 2);
		assertPunctuator(tree3.parametersTree.closeParenthesisToken, ")");

		Assertions.assertUndefined(tree3.parametersTree.parameterTrees[0].precedingCommaToken);
		assertIdentifier(tree3.parametersTree.parameterTrees[0].nameToken, "a");

		assertPunctuator(tree3.parametersTree.parameterTrees[1].precedingCommaToken, ",");
		assertIdentifier(tree3.parametersTree.parameterTrees[1].nameToken, "b");
	});

	Tests.run(function testParseExpressionLiteral() {
		assertScopeAccessExpression(parseSingleExpression("scope-access", "expression"), "expression");
		assertKeyword(parseSingleExpression("scope-access", "this").nameToken, "this");

		Assertions.assertEqual(parseSingleExpression("literal", "'character'").token.text, "'character'");
		Assertions.assertEqual(parseSingleExpression("literal", "'character'").token.value, "character");
		Assertions.assertEqual(parseSingleExpression("literal", "1234.56").token.text, "1234.56");
		Assertions.assertEqual(parseSingleExpression("literal", "1234.56").token.value, 1234.56);
		Assertions.assertEqual(parseSingleExpression("literal", "/regex/").token.text, "/regex/");
		Assertions.assertEqual(parseSingleExpression("literal", "\"string\"").token.text, "\"string\"");
		Assertions.assertEqual(parseSingleExpression("literal", "\"string\"").token.value, "string");

		assertKeyword(parseSingleExpression("literal", "false").token, "false");
		assertKeyword(parseSingleExpression("literal", "null").token, "null");
		assertKeyword(parseSingleExpression("literal", "true").token, "true");
		assertKeyword(parseSingleExpression("literal", "false").token, "false");
	});

	Tests.run(function testParseExpressionMemberAccess() {
		const tree=parseSingleExpression("member-access", "expression.memberName");

		Assertions.assertEqual(tree.firstToken(), tree.operandTree.nameToken);
		Assertions.assertEqual(tree.lastToken(), tree.nameToken);

		assertScopeAccessExpression(tree.operandTree, "expression");
		assertPunctuator(tree.dotToken, ".");
		assertIdentifier(tree.nameToken, "memberName");

		assertIdentifier(parseSingleExpression("member-access", "expression.return").nameToken, "return");
		assertIdentifier(parseSingleExpression("member-access", "expression.this").nameToken, "this");
		assertIdentifier(parseSingleExpression("member-access", "expression.throw").nameToken, "throw");
	});

	Tests.run(function testParseExpressionParenthesized() {
		const tree=parseSingleExpression("parenthesized", "(expression)");

		Assertions.assertEqual(tree.firstToken(), tree.openParenthesisToken);
		Assertions.assertEqual(tree.lastToken(), tree.closeParenthesisToken);

		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.operandTree, "expression");
		assertPunctuator(tree.closeParenthesisToken, ")");
	});

	Tests.run(function testParseExpressionPostfix() {

		function parsePostfixExpression(input) {
			const tree=parseSingleExpression("postfix", input);
			Assertions.assertEqual(tree.firstToken(), tree.operandTree.nameToken);
			Assertions.assertEqual(tree.lastToken(), tree.operatorToken);
			assertScopeAccessExpression(tree.operandTree, "expression");
			return tree;
		}

		assertPunctuator(parsePostfixExpression("expression++").operatorToken, "++");
		assertPunctuator(parsePostfixExpression("expression--").operatorToken, "--");
	});

	Tests.run(function testParseExpressionPrefix() {

		function parsePrefixExpression(input) {
			const tree=parseSingleExpression("prefix", input);
			Assertions.assertEqual(tree.firstToken(), tree.operatorToken);
			Assertions.assertEqual(tree.lastToken(), tree.operandTree.nameToken);
			assertScopeAccessExpression(tree.operandTree, "expression");
			return tree;
		}

		assertPunctuator(parsePrefixExpression("! expression").operatorToken, "!");
		assertPunctuator(parsePrefixExpression("+ expression").operatorToken, "+");
		assertPunctuator(parsePrefixExpression("++ expression").operatorToken, "++");
		assertPunctuator(parsePrefixExpression("- expression").operatorToken, "-");
		assertPunctuator(parsePrefixExpression("-- expression").operatorToken, "--");
		assertPunctuator(parsePrefixExpression("... expression").operatorToken, "...");
		assertPunctuator(parsePrefixExpression("~ expression").operatorToken, "~");
		assertKeyword(parsePrefixExpression("delete expression").operatorToken, "delete");
		assertKeyword(parsePrefixExpression("new expression").operatorToken, "new");
		assertKeyword(parsePrefixExpression("typeof expression").operatorToken, "typeof");
		assertKeyword(parsePrefixExpression("void expression").operatorToken, "void");
	});

	Tests.run(function testParseExpressionObjectLiteral() {
		Assertions.assertEqual(parseSingleExpression("object-literal", "{}").memberTrees.length, 0);

		const tree=parseSingleExpression("object-literal", "{ 1:expression1, key:expression2, \"key\":expression3, [computed]:expression4, method() {} }");

		Assertions.assertEqual(tree.firstToken(), tree.openCurlyToken);
		Assertions.assertEqual(tree.lastToken(), tree.closeCurlyToken);

		assertPunctuator(tree.openCurlyToken, "{");
		Assertions.assertEqual(tree.memberTrees.length, 5);
		assertPunctuator(tree.closeCurlyToken, "}");

		Assertions.assertUndefined(tree.memberTrees[0].precedingCommaToken);
		Assertions.assertEqual(tree.memberTrees[0].kind(), "object-literal-literal-key");
		assertNumber(tree.memberTrees[0].keyToken, "1");
		assertPunctuator(tree.memberTrees[0].colonToken, ":");
		assertScopeAccessExpression(tree.memberTrees[0].valueTree, "expression1");
		Assertions.assertEqual(tree.memberTrees[0].key, "1");

		assertPunctuator(tree.memberTrees[1].precedingCommaToken, ",");
		Assertions.assertEqual(tree.memberTrees[1].kind(), "object-literal-literal-key");
		assertIdentifier(tree.memberTrees[1].keyToken, "key");
		assertPunctuator(tree.memberTrees[1].colonToken, ":");
		assertScopeAccessExpression(tree.memberTrees[1].valueTree, "expression2");
		Assertions.assertEqual(tree.memberTrees[1].key, "key");

		assertPunctuator(tree.memberTrees[2].precedingCommaToken, ",");
		Assertions.assertEqual(tree.memberTrees[2].kind(), "object-literal-literal-key");
		assertString(tree.memberTrees[2].keyToken, "\"key\"");
		assertPunctuator(tree.memberTrees[2].colonToken, ":");
		assertScopeAccessExpression(tree.memberTrees[2].valueTree, "expression3");
		Assertions.assertEqual(tree.memberTrees[2].key, "key");

		assertPunctuator(tree.memberTrees[3].precedingCommaToken, ",");
		Assertions.assertEqual(tree.memberTrees[3].kind(), "object-literal-computed-key");
		assertPunctuator(tree.memberTrees[3].openSquareToken, "[");
		assertScopeAccessExpression(tree.memberTrees[3].keyTree, "computed");
		assertPunctuator(tree.memberTrees[3].closeSquareToken, "]");
		assertPunctuator(tree.memberTrees[3].colonToken, ":");
		assertScopeAccessExpression(tree.memberTrees[3].valueTree, "expression4");

		assertPunctuator(tree.memberTrees[4].precedingCommaToken, ",");
		Assertions.assertEqual(tree.memberTrees[4].kind(), "object-literal-method");
		assertIdentifier(tree.memberTrees[4].nameToken, "method");
		Assertions.assertEqual(tree.memberTrees[4].parametersTree.parameterTrees.length, 0);
		Assertions.assertEqual(tree.memberTrees[4].blockTree.statementTrees.length, 0);
	});

	Tests.run(function testParseLabel() {

		function assertSingleLabel(tree) {
			Assertions.assertEqual(tree.labelsTree.labelTrees.length, 1);
			assertIdentifier(tree.labelsTree.labelTrees[0].nameToken, "label");
			assertPunctuator(tree.labelsTree.labelTrees[0].colonToken, ":");
		}

		const tree=parseSingleStatement("block", "label1: label2: {}");
		Assertions.assertEqual(tree.labelsTree.labelTrees.length, 2);
		assertIdentifier(tree.labelsTree.labelTrees[0].nameToken, "label1");
		assertPunctuator(tree.labelsTree.labelTrees[0].colonToken, ":");
		assertIdentifier(tree.labelsTree.labelTrees[1].nameToken, "label2");
		assertPunctuator(tree.labelsTree.labelTrees[1].colonToken, ":");

		assertSingleLabel(parseSingleStatement("block", "label: {}"), "label");
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("break", "label: break;"));
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("continue", "label: continue;"));
		assertSingleLabel(parseSingleStatement("do", "label: do statement; while(condition);"));
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("empty", "label: ;"));
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("expression", "label: expr;"));
		assertSingleLabel(parseSingleStatement("for-each", "label: for(name in iterable);"));
		assertSingleLabel(parseSingleStatement("for", "label: for(; ; );"));
		assertSingleLabel(parseSingleStatement("if", "label: if(condition);"));
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("return", "label: return;"));
		assertSingleLabel(parseSingleStatement("switch", "label: switch(condition) {}"));
		assertSingleLabel(parseSingleStatementIgnoreDiagnostics("throw", "label: throw 0;"));
		assertSingleLabel(parseSingleStatement("try", "label: try {}"), "label");
		assertSingleLabel(parseSingleStatement("while", "label: while(true);"));

		parseSingleStatementWithDiagnostics("(expression):")
			.assertDiagnostic(12, 13, "syntax error: expected ';'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testParseSource() {
		const source=Compiler.parseJavascript("sourceId", "/*\n*/\nvar a/*\n*/\n = /*\n*/\n 1 /*\n*/\n;/*\n*/\n");
		const statement=source.statementTrees[0];

		Assertions.assertEqual(source.id, "sourceId");

		Assertions.assertEqual(source.lines.length, 11);
		Assertions.assertEqual(source.lines[0], 0);
		Assertions.assertEqual(source.lines[1], 3);
		Assertions.assertEqual(source.lines[2], 6);
		Assertions.assertEqual(source.lines[3], 14);
		Assertions.assertEqual(source.lines[4], 17);
		Assertions.assertEqual(source.lines[5], 23);
		Assertions.assertEqual(source.lines[6], 26);
		Assertions.assertEqual(source.lines[7], 32);
		Assertions.assertEqual(source.lines[8], 35);
		Assertions.assertEqual(source.lines[9], 39);
		Assertions.assertEqual(source.lines[10], 42);

		Assertions.assertEqual(statement.keywordToken.offset, 6);
		Assertions.assertEqual(statement.declaratorTrees[0].nameToken.offset, 10);
		Assertions.assertEqual(statement.declaratorTrees[0].initializerTree.assignToken.offset, 18);
		Assertions.assertEqual(statement.declaratorTrees[0].initializerTree.expressionTree.token.offset, 27);
		Assertions.assertEqual(statement.semicolonToken.offset, 35);
		Assertions.assertEqual(source.endOfInputToken.offset, 42);

		Assertions.assertEqual(statement.keywordToken.line, 3);
		Assertions.assertEqual(statement.declaratorTrees[0].nameToken.line, 3);
		Assertions.assertEqual(statement.declaratorTrees[0].initializerTree.assignToken.line, 5);
		Assertions.assertEqual(statement.declaratorTrees[0].initializerTree.expressionTree.token.line, 7);
		Assertions.assertEqual(statement.semicolonToken.line, 9);
		Assertions.assertEqual(source.endOfInputToken.line, 11);
	});

	Tests.run(function testParseStatementBlock() {
		const tree=parseSingleStatement("block", "{ ; }");
		Assertions.assertUndefined(tree.labelTrees);
		assertPunctuator(tree.openCurlyToken, "{");
		Assertions.assertEqual(tree.statementTrees.length, 1);
		Assertions.assertEqual(tree.statementTrees[0].kind(), "empty");
		assertPunctuator(tree.closeCurlyToken, "}");
	});

	Tests.run(function testParseStatementBreak() {
		const tree=parseSingleStatementIgnoreDiagnostics("break", "break;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.breakToken, "break");
		Assertions.assertUndefined(tree.labelToken);
		assertPunctuator(tree.semicolonToken, ";");
	});

	Tests.run(function testParseStatementBreakLabeled() {
		assertIdentifier(parseSingleStatementIgnoreDiagnostics("break", "break label;").labelToken, "label");
	});

	Tests.run(function testParseStatementClass() {
		const tree=parseSingleStatement("class", "@annotation class MyClass extends BaseClass { static staticFunction() {} method() {} }");
		Assertions.assertEqual(tree.annotationsTree.annotationTrees.length, 1);
		assertPunctuator(tree.annotationsTree.annotationTrees[0].atToken, "@");
		assertPunctuator(tree.annotationsTree.annotationTrees[0].nameToken, "annotation");
		assertKeyword(tree.classTree.classToken, "class");
		assertKeyword(tree.classTree.extendsClauseTree.extendsToken, "extends");
		assertScopeAccessExpression(tree.classTree.extendsClauseTree.baseClassExpressionTree, "BaseClass");
		assertPunctuator(tree.classTree.openCurlyToken, "{");
		assertPunctuator(tree.classTree.closeCurlyToken, "}");

		Assertions.assertEqual(tree.classTree.memberTrees.length, 2);

		assertKeyword(tree.classTree.memberTrees[0].staticToken, "static");
		assertIdentifier(tree.classTree.memberTrees[0].nameToken, "staticFunction");
		Assertions.assertEqual(tree.classTree.memberTrees[0].parametersTree.parameterTrees.length, 0);
		Assertions.assertEqual(tree.classTree.memberTrees[0].blockTree.statementTrees.length, 0);

		Assertions.assertUndefined(tree.classTree.memberTrees[1].staticToken, "static");
		assertIdentifier(tree.classTree.memberTrees[1].nameToken, "method");
		Assertions.assertEqual(tree.classTree.memberTrees[1].parametersTree.parameterTrees.length, 0);
		Assertions.assertEqual(tree.classTree.memberTrees[1].blockTree.statementTrees.length, 0);

		Assertions.assertUndefined(parseSingleStatement("class", "class MyClass {}").classTree.extendsClauseTree);

		Assertions.assertEqual(parseSingleStatement("class", "class MyClass { throw() {} }").classTree.memberTrees[0].nameToken.text, "throw");
	});

	Tests.run(function testParseStatementContinue() {
		const tree=parseSingleStatementIgnoreDiagnostics("continue", "continue;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.continueToken, "continue");
		Assertions.assertUndefined(tree.labelToken);
		assertPunctuator(tree.semicolonToken, ";");
	});

	Tests.run(function testParseStatementContinueLabeled() {
		assertIdentifier(parseSingleStatementIgnoreDiagnostics("continue", "continue label;").labelToken, "label");
	});

	Tests.run(function testParseStatementDo() {
		const tree=parseSingleStatement("do", "do statement; while(condition);");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.doToken, "do");
		assertScopeAccessStatement(tree.statementTree, "statement");
		assertKeyword(tree.whileToken, "while");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.conditionTree, "condition");
		assertPunctuator(tree.closeParenthesisToken, ")");
	});

	Tests.run(function testParseStatementEmpty() {
		assertPunctuator(parseSingleStatement("empty", ";").semicolonToken, ";");
	});

	Tests.run(function testParseStatementExpression() {
		const tree=parseSingleStatement("expression", "expr;");
		Assertions.assertUndefined(tree.labelTrees);
		assertScopeAccessExpression(tree.expressionTree, "expr");
		assertPunctuator(tree.semicolonToken, ";");
	});

	Tests.run(function testParseStatementForEach() {
		const tree=parseSingleStatement("for-each", "for(name of iterable) statement;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.forToken, "for");
		assertPunctuator(tree.openParenthesisToken, "(");
		Assertions.assertUndefined(tree.declarationKeywordToken);
		assertIdentifier(tree.nameToken, "name");
		assertKeyword(tree.operatorToken, "of");
		assertPunctuator(tree.closeParenthesisToken, ")");
		assertScopeAccessStatement(tree.statementTree, "statement");

		assertKeyword(parseSingleStatement("for-each", "for(const name of iterable) ;").declarationKeywordToken, "const");
		assertKeyword(parseSingleStatement("for-each", "for(let name of iterable) ;").declarationKeywordToken, "let");
		assertKeyword(parseSingleStatement("for-each", "for(var name of iterable) ;").declarationKeywordToken, "var");

		assertKeyword(parseSingleStatement("for-each", "for(const name in iterable) ;").operatorToken, "in");
	});

	Tests.run(function testParseStatementFor() {
		const tree=parseSingleStatement("for", "for(initializer; condition; increment) statement;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.forToken, "for");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessStatement(tree.initializerTree, "initializer");
		assertScopeAccessExpression(tree.conditionTree, "condition");
		assertPunctuator(tree.semicolonToken, ";");
		assertScopeAccessExpression(tree.incrementTree, "increment");
		assertPunctuator(tree.closeParenthesisToken, ")");
		assertScopeAccessStatement(tree.statementTree, "statement");

		Assertions.assertEqual(parseSingleStatement("for", "for(; condition; increment) statement;").initializerTree.kind(), "empty");
		Assertions.assertUndefined(parseSingleStatement("for", "for(initializer; ; increment) statement;").conditionTree);
		Assertions.assertUndefined(parseSingleStatement("for", "for(initializer; condition; ) statement;").incrementTree);

		Assertions.assertEqual(parseSingleStatement("for", "for(const a; condition; increment) statement;").initializerTree.kind(), "var");
		Assertions.assertEqual(parseSingleStatement("for", "for(let a; condition; increment) statement;").initializerTree.kind(), "var");
		Assertions.assertEqual(parseSingleStatement("for", "for(var a; condition; increment) statement;").initializerTree.kind(), "var");
	});

	Tests.run(function testParseStatementFunction() {
		const tree=parseSingleStatement("function", "@annotation function f(a, b) {}");
		Assertions.assertEqual(tree.annotationsTree.annotationTrees.length, 1);
		assertPunctuator(tree.annotationsTree.annotationTrees[0].atToken, "@");
		assertIdentifier(tree.annotationsTree.annotationTrees[0].nameToken, "annotation");
		assertKeyword(tree.functionTree.functionToken, "function");
		assertIdentifier(tree.functionTree.nameToken, "f");
		assertPunctuator(tree.functionTree.parametersTree.openParenthesisToken, "(");
		Assertions.assertEqual(tree.functionTree.parametersTree.parameterTrees.length, 2);
		Assertions.assertUndefined(tree.functionTree.parametersTree.parameterTrees[0].precedingCommaToken);
		assertIdentifier(tree.functionTree.parametersTree.parameterTrees[0].nameToken, "a");
		assertPunctuator(tree.functionTree.parametersTree.parameterTrees[1].precedingCommaToken, ",");
		assertIdentifier(tree.functionTree.parametersTree.parameterTrees[1].nameToken, "b");
		assertPunctuator(tree.functionTree.parametersTree.closeParenthesisToken, ")");
	});

	Tests.run(function testParseStatementIf() {
		const tree=parseSingleStatement("if", "if(condition) expression1; else expression2;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.ifToken, "if");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.conditionTree, "condition");
		assertPunctuator(tree.closeParenthesisToken, ")");
		assertScopeAccessStatement(tree.statementTree, "expression1");
		assertKeyword(tree.elseClauseTree.elseToken, "else");
		assertScopeAccessStatement(tree.elseClauseTree.statementTree, "expression2");

		Assertions.assertUndefined(parseSingleStatement("if", "if(condition) expression;").elseClauseTree);
	});

	Tests.run(function testParseStatementReturn() {
		const tree=parseSingleStatement("return", "return expression;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.returnToken, "return");
		assertScopeAccessExpression(tree.expressionTree, "expression");
		assertPunctuator(tree.semicolonToken, ";");

		Assertions.assertUndefined(parseSingleStatement("return", "return;").expressionTree);
	});

	Tests.run(function testParseStatementSwitch() {
		const tree=parseSingleStatement("switch", "switch(condition) { case expression1: statement1; default: statement; }");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.switchToken, "switch");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.conditionTree, "condition");
		assertPunctuator(tree.closeParenthesisToken, ")");
		assertPunctuator(tree.openCurlyToken, "{");
		Assertions.assertEqual(tree.caseTrees.length, 2);

		assertKeyword(tree.caseTrees[0].keywordToken, "case");
		assertScopeAccessExpression(tree.caseTrees[0].expressionTree, "expression1");
		assertPunctuator(tree.caseTrees[0].colonToken, ":");
		Assertions.assertEqual(tree.caseTrees[0].statementTrees.length, 1);
		assertScopeAccessStatement(tree.caseTrees[0].statementTrees[0], "statement1");

		assertKeyword(tree.caseTrees[1].keywordToken, "default");
		Assertions.assertUndefined(tree.caseTrees[1].expressionTree);
		assertPunctuator(tree.caseTrees[1].colonToken, ":");
		Assertions.assertEqual(tree.caseTrees[1].statementTrees.length, 1);
		assertScopeAccessStatement(tree.caseTrees[1].statementTrees[0], "statement");

		assertPunctuator(tree.closeCurlyToken, "}");
	});

	Tests.run(function testParseStatementThrow() {
		const tree=parseSingleStatement("throw", "throw expression;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.throwToken, "throw");
		assertScopeAccessExpression(tree.expressionTree, "expression");
		assertPunctuator(tree.semicolonToken, ";");
	});

	Tests.run(function testParseStatementTry() {
		const tree=parseSingleStatement("try", "try { statement1; } catch(e) { statement2; } finally { statement3; }");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.tryToken, "try");
		assertPunctuator(tree.blockTree.openCurlyToken, "{");
		Assertions.assertEqual(tree.blockTree.statementTrees.length, 1);
		assertScopeAccessStatement(tree.blockTree.statementTrees[0], "statement1");
		assertPunctuator(tree.blockTree.closeCurlyToken, "}");
		assertKeyword(tree.catchClauseTree.catchToken, "catch");
		assertPunctuator(tree.catchClauseTree.openParenthesisToken, "(");
		assertIdentifier(tree.catchClauseTree.nameToken, "e");
		assertPunctuator(tree.catchClauseTree.closeParenthesisToken, ")");
		assertPunctuator(tree.catchClauseTree.blockTree.openCurlyToken, "{");
		Assertions.assertEqual(tree.catchClauseTree.blockTree.statementTrees.length, 1);
		assertScopeAccessStatement(tree.catchClauseTree.blockTree.statementTrees[0], "statement2");
		assertPunctuator(tree.catchClauseTree.blockTree.closeCurlyToken, "}");
		assertKeyword(tree.finallyClauseTree.finallyToken, "finally");
		assertPunctuator(tree.finallyClauseTree.blockTree.openCurlyToken, "{");
		Assertions.assertEqual(tree.finallyClauseTree.blockTree.statementTrees.length, 1);
		assertScopeAccessStatement(tree.finallyClauseTree.blockTree.statementTrees[0], "statement3");
		assertPunctuator(tree.finallyClauseTree.blockTree.closeCurlyToken, "}");

		Assertions.assertUndefined(parseSingleStatement("try", "try { } finally { }").catchClauseTree);

		Assertions.assertUndefined(parseSingleStatement("try", "try { } catch(e) { }").finallyClauseTree);
	});

	Tests.run(function testParseStatementWhile() {
		const tree=parseSingleStatement("while", "while(condition) statement;");
		Assertions.assertUndefined(tree.labelTrees);
		assertKeyword(tree.whileToken, "while");
		assertPunctuator(tree.openParenthesisToken, "(");
		assertScopeAccessExpression(tree.conditionTree, "condition");
		assertPunctuator(tree.closeParenthesisToken, ")");
		assertScopeAccessStatement(tree.statementTree, "statement");
	});

	Tests.run(function testScanUnterminatedCharacterConstantMustFail() {
		assertDiagnostics(Compiler.parseJavascript("sourceId", " ' \n;"))
			.assertDiagnostic(1, 3, "syntax error: unterminated character constant")
			.assertNoMoreDiagnostic();

		assertDiagnostics(Compiler.parseJavascript("sourceId", " ' ;"))
			.assertDiagnostic(1, 4, "syntax error: unterminated character constant")
			.assertDiagnostic(4, 4, "syntax error: expected ';'")
			.assertNoMoreDiagnostic();
	});

	Tests.run(function testScanUnterminatedStringConstantMustFail() {
		assertDiagnostics(Compiler.parseJavascript("sourceId", " \" \n;"))
			.assertDiagnostic(1, 3, "syntax error: unterminated string constant")
			.assertNoMoreDiagnostic();

		assertDiagnostics(Compiler.parseJavascript("sourceId", " \" ;"))
			.assertDiagnostic(1, 4, "syntax error: unterminated string constant")
			.assertDiagnostic(4, 4, "syntax error: expected ';'")
			.assertNoMoreDiagnostic();
	});

})();
