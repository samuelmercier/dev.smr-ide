"use strict";

(function testScope() {

	function newIdentifier(name) { return new Compiler.JavascriptTrees.Token.Identifier({ id:"sourceId" }, [], null, 0, name, undefined); }

	const breakToken=newIdentifier("name");
	const continueToken=newIdentifier("name");
	const labelToken=newIdentifier("label");
	const nameToken=newIdentifier("name");
	const unresolvableToken=newIdentifier("unresolvable");
	const parentScope={
		resolveBreak:function() { return "parentBreak"; },
		resolveContinue:function() { return "parentContinue"; },
		newDiagnostic:function(token, message) { diagnostic={ message:message, token:token }; },
		containsLabel:function() { return "parentContainsLabel"; },
		resolveScopeAccess:function() { return "parentScopeAccess"; },
		registerVar:function(nameToken, declaration) { diagnostic={ message:declaration, token:nameToken }; }
	};

	let diagnostic;

	function assertDiagnostic(token, message) {
		Assertions.assertEqual(diagnostic.token, token);
		Assertions.assertEqual(diagnostic.message, message);
		diagnostic=undefined;
	}

	Tests.run(function testBlockScope() {
		const statement={ declarations:new Map(), labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.Block(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), undefined);
		assertDiagnostic(labelToken, "continue must be inside loop");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");
		scope.registerDeclaration(nameToken, "declaration");
		Assertions.assertEqual(scope.resolveScopeAccess("name"), "declaration");
		scope.registerDeclaration(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testCatchScope() {
		const statement={ nameToken:newIdentifier("name") };
		const scope=new Compiler.Javascript.Scope.Catch(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");

		Assertions.assertEqual(scope.containsLabel("label"), "parentContainsLabel");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), statement);
		Assertions.assertEqual(scope.resolveScopeAccess("unresolvable"), "parentScopeAccess");

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testForScope() {
		const statement={ declarations:new Map(), labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.For(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), statement);
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), statement);
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");
		scope.registerDeclaration(nameToken, "declaration");
		Assertions.assertEqual(scope.resolveScopeAccess("name"), "declaration");
		scope.registerDeclaration(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testForEachScope() {
		const statement={ labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.ForEach(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), statement);
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), statement);
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");

		const namedScope=new Compiler.Javascript.Scope.ForEach(parentScope, { nameToken:nameToken, declaration:"declaration" });
		Assertions.assertEqual(namedScope.resolveScopeAccess("name"), "declaration");
		Assertions.assertEqual(namedScope.resolveScopeAccess("unresolvable"), "parentScopeAccess");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testFunctionScope() {
		const definition={ arguments:"arguments", parameters:new Map([ [ "parameter", "parameter" ] ]), vars:new Map() };
		const scope=new Compiler.Javascript.Scope.Function(parentScope, definition);

		scope.resolveBreak(breakToken, undefined);
		assertDiagnostic(breakToken, "unlabeled break must be inside loop or switch");

		scope.resolveBreak(breakToken, nameToken);
		assertDiagnostic(nameToken, "cannot resolve label 'name'");

		scope.resolveContinue(continueToken, undefined);
		assertDiagnostic(continueToken, "continue must be inside loop");

		scope.resolveContinue(continueToken, nameToken);
		assertDiagnostic(nameToken, "cannot resolve label 'name'");

		Assertions.assertUndefined(scope.containsLabel("name"));

		const argumentsToken=newIdentifier("arguments");
		scope.registerVar(argumentsToken, "declaration");
		assertDiagnostic(argumentsToken, "'arguments' can't be defined or assigned to");

		Assertions.assertEqual(scope.resolveScopeAccess("parameter"), "parameter");
		const parameterToken=newIdentifier("parameter");
		scope.registerVar(parameterToken, "declaration");
		assertDiagnostic(parameterToken, "redefinition of parameter 'parameter'");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");
		scope.registerVar(nameToken, "declaration");
		Assertions.assertEqual(scope.resolveScopeAccess("name"), "declaration");
		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");
	});

	Tests.run(function testIfScope() {
		const statement={ labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.If(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), undefined);
		assertDiagnostic(labelToken, "continue must be inside loop");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testLoopScope() {
		const statement={ declarations:new Map(), labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.Loop(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), statement);
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), statement);
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

	Tests.run(function testSourceScope() {

		function assertDiagnostic(token, message) {
			Assertions.assertEqual(source.diagnostics[0].message, message);
			source.diagnostics.pop();
		}

		const source={ declarations:new Map(), diagnostics:[], vars:new Map() };
		const scope=new Compiler.Javascript.Scope.Source(parentScope, source);

		Assertions.assertUndefined(scope.resolveBreak(breakToken, undefined));
		assertDiagnostic(labelToken, "unlabeled break must be inside loop or switch");
		Assertions.assertUndefined(scope.resolveBreak(breakToken, unresolvableToken));
		assertDiagnostic(labelToken, "cannot resolve label 'unresolvable'");

		Assertions.assertUndefined(scope.resolveContinue(continueToken, undefined));
		assertDiagnostic(labelToken, "continue must be inside loop");
		Assertions.assertUndefined(scope.resolveContinue(continueToken, unresolvableToken));
		assertDiagnostic(labelToken, "cannot resolve label 'unresolvable'");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");
		scope.registerDeclaration(nameToken, "declaration");
		Assertions.assertEqual(scope.resolveScopeAccess("name"), "declaration");
		scope.registerDeclaration(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");

		Assertions.assertFalse(scope.containsLabel("unresolvable"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");
	});

	Tests.run(function testSwitchScope() {
		const statement={ declarations:new Map(), labels:new Set([ "label" ]) };
		const scope=new Compiler.Javascript.Scope.Switch(parentScope, statement);

		Assertions.assertEqual(scope.resolveBreak(breakToken, undefined), statement);
		Assertions.assertEqual(scope.resolveBreak(breakToken, unresolvableToken), "parentBreak");
		Assertions.assertEqual(scope.resolveBreak(breakToken, labelToken), statement);

		Assertions.assertEqual(scope.resolveContinue(continueToken, undefined), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, unresolvableToken), "parentContinue");
		Assertions.assertEqual(scope.resolveContinue(continueToken, labelToken), undefined);
		assertDiagnostic(labelToken, "continue must be inside loop");

		Assertions.assertEqual(scope.resolveScopeAccess("name"), "parentScopeAccess");
		scope.registerDeclaration(nameToken, "declaration");
		Assertions.assertEqual(scope.resolveScopeAccess("name"), "declaration");
		scope.registerDeclaration(nameToken, "declaration");
		assertDiagnostic(nameToken, "redefinition of 'name'");

		Assertions.assertEqual(scope.containsLabel("unresolvable"), "parentContainsLabel");
		Assertions.assertTrue(scope.containsLabel("label"));

		scope.registerVar(nameToken, "declaration");
		assertDiagnostic(nameToken, "declaration");
	});

})();
