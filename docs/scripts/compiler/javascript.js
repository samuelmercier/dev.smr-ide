"use strict";

function defineJavascript() {

	function defineElement() {

		const Element={};

		Element.Declaration=class Declaration {

			isAssignable() { return undefined; }

			isClass() { return undefined; }

			isFunction() { return undefined; }

			resolveMemberAccess(nameToken) { return undefined; }

		};

		Element.Declaration.Arguments=Object.freeze(class Arguments extends Element.Declaration {

			constructor() { super(); }

			kind() { return "function-arguments"; }

			isAssignable() { return false; }

			isClass() { return false; }

			isFunction() { return false; }

			resolveMemberAccess(nameToken) { return undefined; }

			getName() { return "arguments"; }

		});

		Element.Declaration.Invalid=Object.freeze({

			kind() { return "invalid"; },

			getName() { return "<invalid>"; },

			isAssignable() { return undefined; },

			isFunction() { return undefined; },

			resolveMemberAccess(nameToken) { return undefined; }

		});

		Object.freeze(Element.Declaration);

		Element.Expression={};

		Element.Expression.InstanceReference=Object.freeze(class InstanceReference {

			constructor(classTree) { this.classTree=classTree; }

			kind() { return "instance-reference"; }

			isAssignable() { return false; }

			isClass() { return false; }

			isFunction() { return false; }

			resolveMemberAccess(analyzer, nameToken) {
				const result=this.classTree.resolveInstanceMember(analyzer, nameToken.text);
				if(result!==undefined)
					return result;
				analyzer.newDiagnostic(nameToken, "cannot resolve '"+nameToken.text+"'");
				return undefined;
			}

		});

		Object.freeze(Element.Expression);

		return Object.freeze(Element);

	}

	function defineScope() {

		const Scope=class Scope {

			constructor(parentScope) { this.parentScope=parentScope; }

			resolveBreak(breakToken, nameToken) { return this.parentScope.resolveBreak(breakToken, nameToken); }

			resolveContinue(continueToken, nameToken) { return this.parentScope.resolveContinue(continueToken, nameToken); }

			newDiagnostic(nameToken, message) { this.parentScope.newDiagnostic(nameToken, message); }

			resolveScopeAccess(name) { return this.parentScope.resolveScopeAccess(name); }

			registerVar(nameToken, declaration) { this.parentScope.registerVar(nameToken, declaration); }

		};

		Scope.Block=Object.freeze(class BlockScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken===undefined||!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(breakToken, nameToken) {
				if(nameToken===undefined||!this.statement.labels.has(nameToken.text))
					return this.parentScope.resolveContinue(breakToken, nameToken);
				this.parentScope.newDiagnostic(nameToken, "continue must be inside loop");
				return undefined;
			}

			registerDeclaration(nameToken, declaration) {
				if(this.statement.declarations.has(nameToken.text))
					this.parentScope.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
				else
					this.statement.declarations.set(nameToken.text, declaration);
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

			resolveScopeAccess(name) {
				const declaration=this.statement.declarations.get(name);
				return declaration!==undefined ? declaration : this.parentScope.resolveScopeAccess(name);
			}

		});

		Scope.Catch=Object.freeze(class CatchScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			containsLabel(name) { return this.parentScope.containsLabel(name); }

			resolveScopeAccess(name) {
				return name===this.statement.nameToken.text
					? this.statement
					: this.parentScope.resolveScopeAccess(name);
			}

		});

		Scope.Empty=Object.freeze({

			resolveScopeAccess:function(name) { return undefined; }

		});

		Scope.For=Object.freeze(class ForScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(continueToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveContinue(continueToken, nameToken)
					: this.statement;
			}

			registerDeclaration(nameToken, declaration) {
				if(this.statement.declarations.has(nameToken.text))
					this.parentScope.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
				else
					this.statement.declarations.set(nameToken.text, declaration);
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

			resolveScopeAccess(name) {
				const declaration=this.statement.declarations.get(name);
				return declaration!==undefined ? declaration : this.parentScope.resolveScopeAccess(name);
			}

		});

		Scope.ForEach=Object.freeze(class ForEachScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(continueToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveContinue(continueToken, nameToken)
					: this.statement;
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

			resolveScopeAccess(name) {
				return this.statement.declaration!==undefined&&this.statement.nameToken.text===name
					? this.statement.declaration
					: this.parentScope.resolveScopeAccess(name);
			}

		});

		Scope.Function=Object.freeze(class FunctionScope extends Scope {

			constructor(parentScope, definition) {
				super(parentScope);
				this.definition=definition;
			}

			resolveBreak(breakToken, nameToken) {
				if(nameToken===undefined)
					this.parentScope.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
				else
					this.parentScope.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
				return undefined;
			}

			resolveContinue(continueToken, nameToken) {
				if(nameToken===undefined)
					this.parentScope.newDiagnostic(continueToken, "continue must be inside loop");
				else
					this.parentScope.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
				return undefined;
			}

			containsLabel(name) { return undefined; }

			resolveScopeAccess(name) {
				let declaration;
				if(this.definition.vars.has(name))
					return this.definition.vars.get(name);
				if((declaration=this.definition.parameters.get(name))!==undefined)
					return declaration;
				return this.parentScope.resolveScopeAccess(name);
			}

			registerVar(nameToken, declaration) {
				if(nameToken.text==="arguments")
					this.parentScope.newDiagnostic(nameToken, "'arguments' can't be defined or assigned to");
				if(this.definition.parameters.has(nameToken.text))
					this.parentScope.newDiagnostic(nameToken, "redefinition of parameter '"+nameToken.text+"'");
				else if(this.definition.vars.has(nameToken.text))
					this.parentScope.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
				else
					this.definition.vars.set(nameToken.text, declaration);
			}

		});

		Scope.Global=Object.freeze(class Global {

			constructor(declarations) { this.declarations=declarations; }

			resolveScopeAccess(name) { return this.declarations.get(name); }

		});

		Scope.If=Object.freeze(class IfScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken===undefined||!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(breakToken, nameToken) {
				if(nameToken===undefined||!this.statement.labels.has(nameToken.text))
					return this.parentScope.resolveContinue(breakToken, nameToken);
				this.parentScope.newDiagnostic(nameToken, "continue must be inside loop");
				return undefined;
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

		});

		Scope.Loop=Object.freeze(class LoopScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(continueToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveContinue(continueToken, nameToken)
					: this.statement;
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

		});

		Scope.Source=Object.freeze(class SourceScope extends Scope {

			constructor(parentScope, source) {
				super(parentScope);
				this.source=source;
			}

			resolveBreak(breakToken, nameToken) {
				if(nameToken===undefined)
					this.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
				else
					this.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
				return undefined;
			}

			resolveContinue(continueToken, nameToken) {
				if(nameToken===undefined)
					this.newDiagnostic(continueToken, "continue must be inside loop");
				else
					this.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
				return undefined;
			}

			registerDeclaration(nameToken, declaration) {
				if(this.source.declarations.has(nameToken.text))
					this.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
				else
					this.source.declarations.set(nameToken.text, declaration);
			}

			newDiagnostic(token, message) {
				this.source.diagnostics.push(Compiler.newDiagnostic(
					token.source.id, token.line, token.offset, token.offset+token.text.length, message
				));
			}

			containsLabel(name) { return false; }

			registerScopeAccess(tree) { this.source.references.push(tree); }

			resolveScopeAccess(name) {
				const declaration=this.source.declarations.get(name);
				return declaration!==undefined ? declaration : this.parentScope.resolveScopeAccess(name);
			}

			registerVar(nameToken, declaration) { return this.registerDeclaration(nameToken, declaration); }

		});

		Scope.Switch=Object.freeze(class SwitchScope extends Scope {

			constructor(parentScope, statement) {
				super(parentScope);
				this.statement=statement;
			}

			resolveBreak(breakToken, nameToken) {
				return nameToken!==undefined&&!this.statement.labels.has(nameToken.text)
					? this.parentScope.resolveBreak(breakToken, nameToken)
					: this.statement;
			}

			resolveContinue(breakToken, nameToken) {
				if(nameToken===undefined||!this.statement.labels.has(nameToken.text))
					return this.parentScope.resolveContinue(breakToken, nameToken);
				this.parentScope.newDiagnostic(nameToken, "continue must be inside loop");
				return undefined;
			}

			registerDeclaration(nameToken, declaration) {
				if(this.statement.declarations.has(nameToken.text))
					this.parentScope.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
				else
					this.statement.declarations.set(nameToken.text, declaration);
			}

			containsLabel(name) { return this.statement.labels.has(name)||this.parentScope.containsLabel(name); }

			resolveScopeAccess(name) {
				const declaration=this.statement.declarations.get(name);
				return declaration!==undefined ? declaration : this.parentScope.resolveScopeAccess(name);
			}

		});

		return Object.freeze(Scope);

	}

	const Javascript={};
	Javascript.Element=defineElement();
	Javascript.Scope=defineScope();
	return Object.freeze(Javascript);

}
