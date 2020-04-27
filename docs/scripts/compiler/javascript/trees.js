"use strict";

function defineJavascriptTrees(Compiler) {

	const Trees={};

	Trees.Annotation=Object.freeze(class Annotation {

		constructor(atToken, nameToken) {
			this.atToken=atToken;
			this.nameToken=nameToken;
			Object.freeze(this);
		}

		kind() { return "annotation"; }

	});

	Trees.Annotations=Object.freeze(class Annotations {

		constructor(annotationTrees) {
			this.annotationTrees=annotationTrees;
			Object.freeze(this);
		}

		generate(generator) {
			generator.commentIn();
			for(const annotationTree of this.annotationTrees) {
				generator.generate(annotationTree.atToken);
				generator.generate(annotationTree.nameToken);
			}
			generator.commentOut();
		}

	});

	Trees.Block=Object.freeze(class Block {

		constructor(labelsTree, openCurlyToken, statementTrees, closeCurlyToken) {
			this.labelsTree=labelsTree;
			this.openCurlyToken=openCurlyToken;
			this.statementTrees=statementTrees;
			this.closeCurlyToken=closeCurlyToken;
		}

		kind() { return "block"; }

		lastToken() { return this.closeCurlyToken; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			for(const statementTree of this.statementTrees)
				statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			for(const statementTree of this.statementTrees)
				statementTree.resolve(analyzer, this);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.openCurlyToken);
			for(const statementTree of this.statementTrees)
				statementTree.generate(generator);
			generator.generate(this.closeCurlyToken);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined||!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			return this.scope.resolveContinue(analyzer, continueToken, nameToken);
		}

		registerDeclaration(analyzer, nameToken) {
			if(this.declarations.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.declarations.set(nameToken.text, nameToken);
		}

		resolveDeclaration(name) {
			let declaration=this.declarations.get(name);
			return declaration!==undefined ? declaration : this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

	}),

	Trees.CaseClause=Object.freeze(class CaseClause {

		constructor(keywordToken, expressionTree, colonToken, statementTrees) {
			this.keywordToken=keywordToken;
			this.expressionTree=expressionTree;
			this.colonToken=colonToken;
			this.statementTrees=statementTrees;
			Object.freeze(this);
		}

	}),

	Trees.CatchClause=Object.freeze(class CatchClause {

		constructor(catchToken, openParenthesisToken, nameToken, typeTree, closeParenthesisToken, blockTree) {
			this.catchToken=catchToken;
			this.openParenthesisToken=openParenthesisToken;
			this.nameToken=nameToken;
			this.typeTree=typeTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.blockTree=blockTree;
		}

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.scope=parentScope;
			this.blockTree.buildScope(analyzer, sourceOrFunctionScope, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.blockTree.resolve(analyzer, this); }

		resolveBreak(analyzer, breakToken, nameToken) {
			return this.scope.resolveBreak(analyzer, breakToken, nameToken);
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			return this.scope.resolveContinue(analyzer, continueToken, nameToken);
		}

		resolveDeclaration(name) {
			if(name===this.nameToken.text)
				return this.nameToken;
			return this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return this.scope.containsLabel(name); }

	}),

	Trees.Class=Object.freeze(class Class {

		constructor(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken) {
			this.classToken=classToken;
			this.nameToken=nameToken;
			this.extendsClauseTree=extendsClauseTree;
			this.openCurlyToken=openCurlyToken;
			this.memberTrees=memberTrees;
			this.closeCurlyToken=closeCurlyToken;
		}

		buildScope(analyzer, parentScope) {
			this.members=new Map();
			this.scope=parentScope;
			for(const memberTree of this.memberTrees)
				memberTree.buildScope(analyzer, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			for(const memberTree of this.memberTrees)
				memberTree.resolve(analyzer, this);
		}

		generate(generator) {
			generator.generate(this.classToken);
			if(this.nameToken!==undefined)
				generator.generate(this.nameToken);
			if(this.extendsClauseTree!==undefined) {
				generator.generate(this.extendsClauseTree.extendsToken);
				this.extendsClauseTree.baseClassExpressionTree.generate(generator);
			}
			generator.generate(this.openCurlyToken);
			for(const memberTree of this.memberTrees)
				memberTree.generate(generator);
			generator.generate(this.closeCurlyToken);
		}

		resolveDeclaration(name) { return this.scope.resolveDeclaration(name); }

	}),

	Trees.Empty=Object.freeze(class Empty {

		constructor(labelsTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "empty"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
		}

		resolve(analyzer, parentScope) {}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Expression={};

	Trees.Expression.ArrayAccess=Object.freeze(class ArrayAccessExpression {

		constructor(operandTree, openSquareToken, indexTree, closeSquareToken) {
			this.operandTree=operandTree;
			this.openSquareToken=openSquareToken;
			this.indexTree=indexTree;
			this.closeSquareToken=closeSquareToken;
			Object.freeze(this);
		}

		kind() { return "array-access"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.closeSquareToken; }

		buildScope(analyzer, parentScope) {
			this.operandTree.buildScope(analyzer, parentScope);
			this.indexTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.operandTree.resolve(analyzer, parentScope);
			this.indexTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.openSquareToken);
			this.indexTree.generate(generator);
			generator.generate(this.closeSquareToken);
		}

	}),

	Trees.Expression.ArrayLiteral=Object.freeze(class ArrayLiteralExpression {

		constructor(openSquareToken, initializersTree, closeSquareToken) {
			this.openSquareToken=openSquareToken;
			this.initializersTree=initializersTree;
			this.closeSquareToken=closeSquareToken;
			Object.freeze(this);
		}

		kind() { return "array-literal"; }

		firstToken() { return this.openSquareToken; }

		lastToken() { return this.closeSquareToken; }

		buildScope(analyzer, parentScope) {
			if(this.initializersTree!==undefined)
				this.initializersTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			if(this.initializersTree!==undefined)
				this.initializersTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			generator.generate(this.openSquareToken);
			if(this.initializersTree!==undefined)
				this.initializersTree.generate(generator);
			generator.generate(this.closeSquareToken);
		}

	});

	Trees.Expression.Assign=Object.freeze(class AssignExpression {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			this.leftOperandTree=leftOperandTree;
			this.operatorToken=operatorToken;
			this.rightOperandTree=rightOperandTree;
			Object.freeze(this);
		}

		kind() { return "assign"; }

		firstToken() { return this.leftOperandTree.firstToken(); }

		lastToken() { return this.rightOperandTree.lastToken(); }

		buildScope(analyzer, parentScope) {
			this.leftOperandTree.buildScope(analyzer, parentScope);
			this.rightOperandTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.leftOperandTree.resolve(analyzer, parentScope);
			this.rightOperandTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			this.rightOperandTree.generate(generator);
		}

	});

	Trees.Expression.Class=Object.freeze(class ClassExpression {

		constructor(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken) {
			this.classTree=new Trees.Class(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken);
			Object.freeze(this);
		}

		kind() { return "class"; }

		firstToken() { return this.classTree.classToken; }

		lastToken() { return this.classTree.closeCurlyToken; }

		buildScope(analyzer, parentScope) { this.classTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.classTree.resolve(analyzer, parentScope); }

		generate(generator) { this.classTree.generate(generator); }

	});

	Trees.Expression.Function=Object.freeze(class FunctionExpression {

		constructor(functionToken, nameToken, parametersTree, blockTree) {
			this.functionTree=new Trees.Function(functionToken, nameToken, parametersTree, blockTree);
			Object.freeze(this);
		}

		kind() { return "function"; }

		firstToken() { return this.functionTree.functionToken; }

		lastToken() { return this.functionTree.blockTree.lastToken(); }

		buildScope(analyzer, parentScope) { this.functionTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.functionTree.resolve(analyzer, parentScope); }

		generate(generator) { this.functionTree.generate(generator); }

	});

	Trees.Expression.Infix=Object.freeze(class InfixExpression {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			this.leftOperandTree=leftOperandTree;
			this.operatorToken=operatorToken;
			this.rightOperandTree=rightOperandTree;
			Object.freeze(this);
		}

		kind() { return "infix"; }

		firstToken() { return this.leftOperandTree.firstToken(); }

		lastToken() { return this.rightOperandTree.lastToken(); }

		buildScope(analyzer, parentScope) {
			this.leftOperandTree.buildScope(analyzer, parentScope);
			this.rightOperandTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.leftOperandTree.resolve(analyzer, parentScope);
			this.rightOperandTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			if(this.operatorToken.text==="&&"||this.operatorToken.text==="||")
				generator.probeExpression(this.rightOperandTree);
			else
				this.rightOperandTree.generate(generator);
		}

	});

	Trees.Expression.Invocation=Object.freeze(class InvocationExpression {

		constructor(operandTree, openParenthesisToken, argumentsTree, closeParenthesisToken) {
			this.operandTree=operandTree;
			this.openParenthesisToken=openParenthesisToken;
			this.argumentsTree=argumentsTree;
			this.closeParenthesisToken=closeParenthesisToken;
			Object.freeze(this);
		}

		kind() { return "invocation"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.closeParenthesisToken; }

		buildScope(analyzer, parentScope) {
			this.operandTree.buildScope(analyzer, parentScope);
			if(this.argumentsTree!==undefined)
				this.argumentsTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.operandTree.resolve(analyzer, parentScope);
			if(this.argumentsTree!==undefined)
				this.argumentsTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.openParenthesisToken);
			if(this.argumentsTree!==undefined)
				this.argumentsTree.generate(generator);
			generator.generate(this.closeParenthesisToken);
		}

	});

	Trees.Expression.Lambda=Object.freeze(class LambdaExpression {

		constructor(parametersTree, operatorToken, bodyTree) {
			this.parametersTree=parametersTree;
			this.operatorToken=operatorToken;
			this.bodyTree=bodyTree;
		}

		kind() { return "lambda-function"; }

		firstToken() { return this.parametersTree.firstToken(); }

		lastToken() { return this.bodyTree.lastToken(); }

		buildScope(analyzer, parentScope) {
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.scope=parentScope;
			this.vars=new Map();
			this.bodyTree.buildScope(analyzer, this, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.bodyTree.resolve(analyzer, this); }

		generate(generator) {
			this.parametersTree.generate(generator);
			generator.generate(this.operatorToken);
			this.bodyTree.generate(generator);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(continueToken, "continue must be inside loop");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveDeclaration(name) {
			if(name==="this")
				return this;
			if(name==="arguments")
				return this.arguments;
			let declaration;
			if((declaration=this.vars.get(name))!==undefined)
				return declaration;
			if((declaration=this.parameters.get(name))!==undefined)
				return declaration;
			return this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return undefined; }

		registerVar(analyzer, nameToken) {
			if(this.parameters.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of parameter '"+nameToken.text+"'");
			else if(this.vars.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.vars.set(nameToken.text, nameToken);
		}

	});

	Trees.Expression.Literal=Object.freeze(class LiteralExpression {

		constructor(token, value) {
			this.token=token;
			this.value=value;
			Object.freeze(this);
		}

		kind() { return "literal"; }

		firstToken() { return this.token; }

		lastToken() { return this.token; }

		buildScope(analyzer, parentScope) {}

		resolve(analyzer, parentScope) {}

		generate(generator) { generator.generate(this.token); }

	});

	Trees.Expression.MemberAccess=Object.freeze(class MemberAccessExpression {

		constructor(operandTree, dotToken, nameToken) {
			this.operandTree=operandTree;
			this.dotToken=dotToken;
			this.nameToken=nameToken;
			Object.freeze(this);
		}

		kind() { return "member-access"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.nameToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.operandTree.resolve(analyzer, parentScope); }

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.dotToken);
			generator.generate(this.nameToken);
		}

	});

	Trees.Expression.ObjectLiteral=Object.freeze(class ObjectLiteralExpression {

		constructor(openCurlyToken, memberTrees, closeCurlyToken) {
			this.openCurlyToken=openCurlyToken;
			this.memberTrees=memberTrees;
			this.closeCurlyToken=closeCurlyToken;
		}

		kind() { return "object-literal"; }

		firstToken() { return this.openCurlyToken; }

		lastToken() { return this.closeCurlyToken; }

		buildScope(analyzer, parentScope) {
			this.members=new Map();
			for(const memberTree of this.memberTrees)
				memberTree.buildScope(analyzer, parentScope, this.members);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			for(const memberTree of this.memberTrees)
				memberTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			generator.generate(this.openCurlyToken);
			for(const memberTree of this.memberTrees)
				memberTree.generate(generator);
			generator.generate(this.closeCurlyToken);
		}

	});

	Trees.Expression.Parenthesized=Object.freeze(class ParenthesizedExpression {

		constructor(openParenthesisToken, operandTree, closeParenthesisToken) {
			this.openParenthesisToken=openParenthesisToken;
			this.operandTree=operandTree;
			this.closeParenthesisToken=closeParenthesisToken;
			Object.freeze(this);
		}

		kind() { return "parenthesized"; }

		firstToken() { return this.openParenthesisToken; }

		lastToken() { return this.closeParenthesisToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.operandTree.resolve(analyzer, parentScope); }

		generate(generator) {
			generator.generate(this.openParenthesisToken);
			this.operandTree.generate(generator);
			generator.generate(this.closeParenthesisToken);
		}

	});

	Trees.Expression.Postfix=Object.freeze(class PostfixExpression {

		constructor(operandTree, operatorToken) {
			this.operandTree=operandTree;
			this.operatorToken=operatorToken;
			Object.freeze(this);
		}

		kind() { return "postfix"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.operatorToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.operandTree.resolve(analyzer, parentScope); }

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.operatorToken);
		}

	});

	Trees.Expression.Prefix=Object.freeze(class PrefixExpression {

		constructor(operatorToken, operandTree) {
			this.operatorToken=operatorToken;
			this.operandTree=operandTree;
			Object.freeze(this);
		}

		kind() { return "prefix"; }

		firstToken() { return this.operatorToken; }

		lastToken() { return this.operandTree.lastToken(); }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer, parentScope) { this.operandTree.resolve(analyzer, parentScope); }

		generate(generator) {
			generator.generate(this.operatorToken);
			this.operandTree.generate(generator);
		}

	});

	Trees.Expression.ScopeAccess=Object.freeze(class ScopeAccessExpression {

		constructor(nameToken) { this.nameToken=nameToken; }

		kind() { return "scope-access"; }

		firstToken() { return this.nameToken; }

		lastToken() { return this.nameToken; }

		buildScope(analyzer, parentScope) {}

		resolve(analyzer, parentScope) {
			this.declaration=parentScope.resolveDeclaration(this.nameToken.text);
			if(this.declaration===undefined)
				analyzer.registerScopeAccess(parentScope, this);
			Object.freeze(this);
		}

		generate(generator) { generator.generate(this.nameToken); }

	});

	Trees.Expression.Ternary=Object.freeze(class TernaryExpression {

		constructor(conditionTree, questionToken, trueExpressionTree, colonToken, falseExpressionTree) {
			this.conditionTree=conditionTree;
			this.questionToken=questionToken;
			this.trueExpressionTree=trueExpressionTree;
			this.colonToken=colonToken;
			this.falseExpressionTree=falseExpressionTree;
			Object.freeze(this);
		}

		kind() { return "ternary"; }

		firstToken() { return this.conditionTree.firstToken; }

		lastToken() { return this.falseExpressionTree.lastToken; }

		buildScope(analyzer, parentScope) {
			this.conditionTree.buildScope(analyzer, parentScope);
			this.trueExpressionTree.buildScope(analyzer, parentScope);
			this.falseExpressionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.conditionTree.resolve(analyzer, parentScope);
			this.trueExpressionTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			this.conditionTree.generate(generator);
			generator.generate(this.questionToken);
			generator.probeExpression(this.trueExpressionTree);
			generator.generate(this.colonToken);
			generator.probeExpression(this.falseExpressionTree);
		}

	});

	Object.freeze(Trees.Expression);

	Trees.ExtendsClause=Object.freeze(class ExtendsClause {

		constructor(extendsToken, baseClassExpressionTree) {
			this.extendsToken=extendsToken;
			this.baseClassExpressionTree=baseClassExpressionTree;
			Object.freeze(this);
		}

	});

	Trees.Function=Object.freeze(class Function {

		constructor(functionToken, nameToken, parametersTree, blockTree) {
			this.functionToken=functionToken;
			this.nameToken=nameToken;
			this.parametersTree=parametersTree;
			this.blockTree=blockTree;
		}

		buildScope(analyzer, parentScope) {
			this.arguments=this.functionToken; // FIXME:
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.scope=parentScope;
			this.vars=new Map();
			this.blockTree.buildScope(analyzer, this, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.blockTree.resolve(analyzer, this); }

		generate(generator) {
			generator.generate(this.functionToken);
			if(this.nameToken!==undefined)
				generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(continueToken, "continue must be inside loop");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveDeclaration(name) {
			if(name===this.name||name==="this")
				return this;
			if(name==="arguments")
				return this.arguments;
			let declaration;
			if((declaration=this.vars.get(name))!==undefined)
				return declaration;
			if((declaration=this.parameters.get(name))!==undefined)
				return declaration;
			return this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return undefined; }

		registerVar(analyzer, nameToken) {
			if(this.parameters.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of parameter '"+nameToken.text+"'");
			else if(this.vars.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.vars.set(nameToken.text, nameToken);
		}

	});

	Trees.FunctionParameters=Object.freeze(class FunctionParameters {

		constructor(openParenthesisToken, parameterTrees, closeParenthesisToken) {
			this.openParenthesisToken=openParenthesisToken;
			this.parameterTrees=parameterTrees;
			this.closeParenthesisToken=closeParenthesisToken;
			Object.freeze(this);
		}

		kind() { return "function-parameters"; }

		firstToken() { return this.openParenthesisToken; }

		buildParameters(analyzer) {
			const parameters=new Map();
			for(const parameterTree of this.parameterTrees) {
				const parameterNameToken=parameterTree.nameToken;
				const parameterName=parameterNameToken.text;
				if(parameterName==="arguments")
					analyzer.newDiagnostic(parameterNameToken, "'arguments' can't be defined or assigned to");
				else if(parameters.has(parameterName))
					analyzer.newDiagnostic(parameterNameToken, "redefinition of parameter '"+parameterName+"'");
				else
					parameters.set(parameterName, parameterTree);
			}
			return Object.freeze(parameters);
		}

		generate(generator) {
			generator.generate(this.openParenthesisToken);
			for(const parameterTree of this.parameterTrees) {
				if(parameterTree.precedingCommaToken!==undefined)
					generator.generate(parameterTree.precedingCommaToken);
				generator.generate(parameterTree.nameToken);
			}
			generator.generate(this.closeParenthesisToken);
		}

	});

	Trees.Initializer=Object.freeze(class InitializerTree {

		constructor(assignToken, expressionTree) {
			this.assignToken=assignToken;
			this.expressionTree=expressionTree;
			Object.freeze(this);
		}

	});

	Trees.Label=Object.freeze(class Label {

		constructor(nameToken, colonToken) {
			this.nameToken=nameToken;
			this.colonToken=colonToken;
			Object.freeze(this);
		}

	});

	Trees.newLabels=Object.freeze(function newLabels(labelTrees) {
		return labelTrees!==undefined ? new Trees.Labels(labelTrees) : undefined;
	});

	Trees.Labels=Object.freeze(class Labels {

		constructor(labelTrees) {
			this.labelTrees=labelTrees;
			Object.freeze(this);
		}

		analyze(analyzer, scope) {
			const labels=new Set();
			for(const labelTree of this.labelTrees) {
				const nameToken=labelTree.nameToken;
				const name=nameToken.text;
				if(labels.has(name)||scope.containsLabel(name))
					analyzer.newDiagnostic(nameToken, "redefinition of label '"+name+"'");
				else
					labels.add(name);
			}
			return labels;
		}

		generate(generator) {
			for(const labelTree of this.labelTrees) {
				generator.generate(labelTree.nameToken);
				generator.generate(labelTree.colonToken);
			}
		}

	});

	Trees.LambdaParameter=Object.freeze(class LambdaParameter {

		constructor(nameToken) {
			this.nameToken=nameToken;
			Object.freeze(this);
		}

		kind() { return "lambda-parameter"; }

		firstToken() { return this.nameToken; }

		buildParameters(analyzer) {
			const parameters=new Map();
			const name=this.nameToken.text;
			if(name==="arguments")
				analyzer.newDiagnostic(this.nameToken, "'arguments' can't be defined or assigned to");
			else
				parameters.set(name, this.nameToken);
			return Object.freeze(parameters);
		}

		generate(generator) { generator.generate(this.nameToken); }

	});

	Trees.Method=Object.freeze(class Method {

		constructor(annotationsTree, staticToken, nameToken, parametersTree, blockTree) {
			this.annotationsTree=annotationsTree;
			this.staticToken=staticToken;
			this.nameToken=nameToken;
			this.parametersTree=parametersTree;
			this.blockTree=blockTree;
		}

		buildScope(analyzer, classTree) {
			this.arguments=this.nameToken; // FIXME:
			this.scope=classTree;
			if(classTree.members.has(this.nameToken.text))
				analyzer.newDiagnostic(this.nameToken, "redefinition of '"+this.nameToken.text+"'");
			else
				classTree.members.set(this.nameToken.text, this.nameToken);
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.vars=new Map();
			this.blockTree.buildScope(analyzer, this, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.blockTree.resolve(analyzer, this); }

		generate(generator) {
			if(this.annotationsTree!==undefined)
				this.annotationsTree.generate(generator);
			if(this.staticToken!==undefined)
				generator.generate(this.staticToken);
			generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(continueToken, "continue must be inside loop");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveDeclaration(name) {
			if(name===this.name||name==="this")
				return this.nameToken;
			if(name==="super")
				return this.nameToken;
			if(name==="arguments")
				return this.arguments;
			let declaration;
			if((declaration=this.vars.get(name))!==undefined)
				return declaration;
			if((declaration=this.parameters.get(name))!==undefined)
				return declaration;
			return this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return undefined; }

		registerVar(analyzer, nameToken) {
			if(this.parameters.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of parameter '"+nameToken.text+"'");
			else if(this.vars.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.vars.set(nameToken.text, nameToken);
		}

	});

	Trees.ObjectLiteralExpressionComputedKeyPair=Object.freeze(class ObjectLiteralExpressionComputedKey {

		constructor(precedingCommaToken, openSquareToken, keyTree, closeSquareToken, colonToken, valueTree) {
			this.precedingCommaToken=precedingCommaToken;
			this.openSquareToken=openSquareToken;
			this.keyTree=keyTree;
			this.closeSquareToken=closeSquareToken;
			this.colonToken=colonToken;
			this.valueTree=valueTree;
			Object.freeze(this);
		}

		kind() { return "object-literal-computed-key"; }

		buildScope(analyzer, parentScope) {
			this.keyTree.buildScope(analyzer, parentScope);
			this.valueTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			this.keyTree.resolve(analyzer, parentScope);
			this.valueTree.buildScope(analyzer, parentScope);
		}

		generate(generator) {
			if(this.precedingCommaToken!==undefined)
				generator.generate(this.precedingCommaToken);
			generator.generate(this.openSquareToken);
			generator.probeExpression(this.keyTree);
			generator.generate(this.closeSquareToken);
			generator.generate(this.colonToken);
			generator.probeExpression(this.valueTree);
		}

	});

	Trees.newObjectLiteralExpressionIdentifierKeyPair=function(precedingCommaToken, keyToken, colonToken, valueTree) {
		return new Trees.ObjectLiteralExpressionLiteralKeyPair(precedingCommaToken, keyToken, colonToken, valueTree, keyToken.text);
	};

	Trees.newObjectLiteralExpressionNumberKeyPair=function(precedingCommaToken, keyToken, colonToken, valueTree) {
		return new Trees.ObjectLiteralExpressionLiteralKeyPair(precedingCommaToken, keyToken, colonToken, valueTree, keyToken.text);
	};

	Trees.newObjectLiteralExpressionStringKeyPair=function(precedingCommaToken, keyToken, colonToken, valueTree) {
		return new Trees.ObjectLiteralExpressionLiteralKeyPair(precedingCommaToken, keyToken, colonToken, valueTree, keyToken.value);
	};

	Trees.ObjectLiteralExpressionLiteralKeyPair=Object.freeze(class ObjectLiteralExpressionLiteralKey {

		constructor(precedingCommaToken, keyToken, colonToken, valueTree, key) {
			this.precedingCommaToken=precedingCommaToken;
			this.keyToken=keyToken;
			this.colonToken=colonToken;
			this.valueTree=valueTree;
			this.key=key;
			Object.freeze(this);
		}

		kind() { return "object-literal-literal-key"; }

		buildScope(analyzer, parentScope, names) {
			if(!names.set(this.keyToken.text))
				analyzer.newDiagnostic(this.keyToken, "redefinition of "+this.keyToken.text+"'");
			this.valueTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) { this.valueTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.precedingCommaToken!==undefined)
				generator.generate(this.precedingCommaToken);
			generator.generate(this.keyToken);
			generator.generate(this.colonToken);
			generator.probeExpression(this.valueTree);
		}

	});

	Trees.ObjectLiteralExpressionMethod=Object.freeze(class ObjectLiteralExpressionMethod {

		constructor(precedingCommaToken, nameToken, parametersTree, blockTree) {
			this.precedingCommaToken=precedingCommaToken;
			this.nameToken=nameToken;
			this.parametersTree=parametersTree;
			this.blockTree=blockTree;
		}

		kind() { return "object-literal-method"; }

		buildScope(analyzer, parentScope) {
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.scope=parentScope;
			this.vars=new Map();
			this.blockTree.buildScope(analyzer, this, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.blockTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.precedingCommaToken!==undefined)
				generator.generate(this.precedingCommaToken);
			generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(continueToken, "continue must be inside loop");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveDeclaration(name) {
			if(name===this.name||name==="this")
				return this;
			if(name==="arguments")
				return this.arguments;
			let declaration;
			if((declaration=this.vars.get(name))!==undefined)
				return declaration;
			if((declaration=this.parameters.get(name))!==undefined)
				return declaration;
			return this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return undefined; }

		registerVar(analyzer, nameToken) {
			if(this.parameters.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of parameter '"+nameToken.text+"'");
			else if(this.vars.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.vars.set(nameToken.text, nameToken);
		}

		analyze(analyzer, scope, names) {
			if(!names.set(this.nameToken.text))
				analyzer.newDiagnostic(this.nameToken, "redefinition of "+this.keyToken.text+"'");
			// FIXME:
			return { build:function() {} };
		}

	});

	Trees.Source=Object.freeze(class Source {

		constructor(id, diagnostics, lines, statementTrees) {
			this.declarations=new Map();
			this.diagnostics=diagnostics;
			this.id=id;
			this.lines=lines;
			this.statementTrees=statementTrees;
		}

		kind() { return "source"; }

		buildScope() {
			for(const statementTree of this.statementTrees)
				statementTree.buildScope(this, this, this);
		}

		resolve() {
			for(const statementTree of this.statementTrees)
				statementTree.resolve(this, this);
		}

		generate(generator) {
			for(const statementTree of this.statementTrees)
				statementTree.generate(generator);
			if(this.endOfInputToken!==undefined)
				generator.generate(this.endOfInputToken);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(breakToken, "unlabeled break must be inside loop or switch");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken===undefined)
				analyzer.newDiagnostic(continueToken, "continue must be inside loop");
			else
				analyzer.newDiagnostic(nameToken, "cannot resolve label '"+nameToken.text+"'");
			return undefined;
		}

		registerDeclaration(analyzer, nameToken) {
			if(this.declarations.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.declarations.set(nameToken.text, nameToken);
		}

		resolveDeclaration(name) { return this.declarations.get(name); }

		newDiagnostic(token, message) {
			this.diagnostics.push(Compiler.newDiagnostic(token.source.id, token.line, token.offset, token.offset+token.text.length, message));
		}

		containsLabel(name) { return false; }

		registerScopeAccess(scope, tree) { this.references.push({ scope:scope, tree:tree }); }

		registerVar(analyzer, nameToken) { return this.registerDeclaration(analyzer, nameToken); }

		line(offset) {
			let i=0;
			for(; i<this.lines.length&&this.lines[i]<offset; i+=1);
			return i+1;
		}

	});

	Trees.Statement={};

	Trees.Statement.Break=Object.freeze(class BreakStatement {

		constructor(labelsTree, breakToken, labelToken, semicolonToken) {
			this.labelsTree=labelsTree;
			this.breakToken=breakToken;
			this.labelToken=labelToken;
			this.semicolonToken=semicolonToken;
		}

		kind() { return "break"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.statementTree=parentScope.resolveBreak(analyzer, this.breakToken, this.labelToken);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.breakToken);
			if(this.labelToken!==undefined)
				generator.generate(this.labelToken);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.Class=Object.freeze(class ClassStatement {

		constructor(annotationsTree, classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken) {
			this.annotationsTree=annotationsTree;
			this.classTree=new Trees.Class(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken);
			Object.freeze(this);
		}

		kind() { return "class"; }

		buildScope(analyzer, parentScope) {
			parentScope.registerDeclaration(analyzer, this.classTree.nameToken);
			this.classTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) { this.classTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.annotationsTree!==undefined) {
				for(const annotationTree of this.annotationsTree.annotationTrees)
					if(annotationTree.nameToken.text==="native") {
						generator.commentIn();
						this.annotationsTree.generate(generator);
						this.classTree.generate(generator);
						generator.commentOut();
						return;
					}
				this.annotationsTree.generate(generator);
			}
			this.classTree.generate(generator);
		}

	});

	Trees.Statement.Continue=Object.freeze(class ContinueStatement {

		constructor(labelsTree, continueToken, labelToken, semicolonToken) {
			this.labelsTree=labelsTree;
			this.continueToken=continueToken;
			this.labelToken=labelToken;
			this.semicolonToken=semicolonToken;
		}

		kind() { return "continue"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.statementTree=parentScope.resolveContinue(analyzer, this.continueToken, this.labelToken);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.continueToken);
			if(this.labelToken!==undefined)
				generator.generate(this.labelToken);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.Do=Object.freeze(class DoStatement {

		constructor(
			labelsTree,
			doToken,
			statementTree,
			whileToken,
			openParenthesisToken,
			conditionTree,
			closeParenthesisToken,
			semicolonToken
		) {
			this.labelsTree=labelsTree;
			this.doToken=doToken;
			this.statementTree=statementTree;
			this.whileToken=whileToken;
			this.openParenthesisToken=openParenthesisToken;
			this.conditionTree=conditionTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.semicolonToken=semicolonToken;
		}

		kind() { return "do"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			this.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			this.conditionTree.buildScope(analyzer, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.statementTree.resolve(analyzer, this);
			this.conditionTree.resolve(analyzer, this);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveContinue(analyzer, continueToken, nameToken);
			return this;
		}

		resolveDeclaration(name) { return this.scope.resolveDeclaration(name); }

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.doToken);
			this.statementTree.generate(generator);
			generator.generate(this.whileToken);
			generator.generate(this.openParenthesisToken);
			generator.probeCondition(this.conditionTree);
			generator.generate(this.closeParenthesisToken);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.Expression=Object.freeze(class ExpressionStatement{

		constructor(labelsTree, expressionTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.expressionTree=expressionTree;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "expression"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.expressionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) { this.expressionTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.probeExpression(this.expressionTree);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.For=Object.freeze(class ForStatement {

		constructor(
			labelsTree,
			forToken,
			openParenthesisToken,
			initializerTree,
			conditionTree,
			semicolonToken,
			incrementTree,
			closeParenthesisToken,
			statementTree
		) {
			this.labelsTree=labelsTree;
			this.forToken=forToken;
			this.openParenthesisToken=openParenthesisToken;
			this.initializerTree=initializerTree;
			this.conditionTree=conditionTree;
			this.semicolonToken=semicolonToken;
			this.incrementTree=incrementTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.statementTree=statementTree;
		}

		kind() { return "for"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			this.initializerTree.buildScope(analyzer, sourceOrFunctionScope, this);
			if(this.conditionTree!==undefined)
				this.conditionTree.buildScope(analyzer, this);
			this.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			if(this.incrementTree!==undefined)
				this.incrementTree.buildScope(analyzer, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.initializerTree.resolve(analyzer, this);
			if(this.conditionTree!==undefined)
				this.conditionTree.resolve(analyzer, this);
			this.statementTree.resolve(analyzer, this);
			if(this.incrementTree!==undefined)
				this.incrementTree.resolve(analyzer, this);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveContinue(analyzer, continueToken, nameToken);
			return this;
		}

		registerDeclaration(analyzer, nameToken) {
			if(this.declarations.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.declarations.set(nameToken.text, nameToken);
		}

		resolveDeclaration(name) {
			let declaration=this.declarations.get(name);
			return declaration!==undefined ? declaration : this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.forToken);
			generator.generate(this.openParenthesisToken);
			this.initializerTree.generate(generator);
			if(this.conditionTree!==undefined)
				generator.probeCondition(this.conditionTree);
			generator.generate(this.semicolonToken);
			if(this.incrementTree!==undefined)
				generator.probeExpression(this.incrementTree);
			generator.generate(this.closeParenthesisToken);
			this.statementTree.generate(generator);
		}

	});

	Trees.Statement.ForEach=Object.freeze(class ForEachStatement {

		constructor(
			labelsTree,
			forToken,
			openParenthesisToken,
			declarationKeywordToken,
			nameToken,
			operatorToken,
			iterableTree,
			closeParenthesisToken,
			statementTree
		) {
			this.labelsTree=labelsTree;
			this.forToken=forToken;
			this.openParenthesisToken=openParenthesisToken;
			this.declarationKeywordToken=declarationKeywordToken;
			this.nameToken=nameToken;
			this.operatorToken=operatorToken;
			this.iterableTree=iterableTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.statementTree=statementTree;
		}

		kind() { return "for-each"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			if(this.declarationKeywordToken!==undefined)
				switch(this.declarationKeywordToken.text) {
				case "var":
					sourceOrFunctionScope.registerVar(analyzer, this.nameToken);
					break;
				case "const":
				case "let":
					this.declaration=this.nameToken;
					break;
				}
			this.iterableTree.buildScope(analyzer, this);
			this.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.iterableTree.resolve(analyzer, this);
			this.statementTree.resolve(analyzer, this);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveContinue(analyzer, continueToken, nameToken);
			return this;
		}

		resolveDeclaration(name) {
			return this.declaration!==undefined&&this.declaration.text===name
				? this.declaration
				: this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.forToken);
			generator.generate(this.openParenthesisToken);
			if(this.declarationKeywordToken!==undefined)
				generator.generate(this.declarationKeywordToken);
			generator.generate(this.nameToken);
			generator.generate(this.operatorToken);
			generator.probeExpression(this.iterableTree);
			generator.generate(this.closeParenthesisToken);
			this.statementTree.generate(generator);
		}

	});

	Trees.Statement.Function=Object.freeze(class FunctionStatement {

		constructor(annotationsTree, functionToken, nameToken, parametersTree, blockTree) {
			this.annotationsTree=annotationsTree;
			this.functionTree=new Trees.Function(functionToken, nameToken, parametersTree, blockTree);
			Object.freeze(this);
		}

		kind() { return "function"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			parentScope.registerDeclaration(analyzer, this.functionTree.nameToken);
			this.functionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) { this.functionTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.annotationsTree!==undefined) {
				for(const annotationTree of this.annotationsTree.annotationTrees)
					if(annotationTree.nameToken.text==="native") {
						generator.commentIn();
						this.annotationsTree.generate(generator);
						this.functionTree.generate(generator);
						generator.commentOut();
						return;
					}
				this.annotationsTree.generate(generator);
			}
			this.functionTree.generate(generator);
		}

	});

	Trees.Statement.If=Object.freeze(class IfStatement {

		constructor(
			labelsTree,
			ifToken,
			openParenthesisToken,
			conditionTree,
			closeParenthesisToken,
			statementTree,
			elseClauseTree
		) {
			this.labelsTree=labelsTree;
			this.ifToken=ifToken;
			this.openParenthesisToken=openParenthesisToken;
			this.conditionTree=conditionTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.statementTree=statementTree;
			this.elseClauseTree=elseClauseTree;
		}

		kind() { return "if"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			this.conditionTree.buildScope(analyzer, this);
			this.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			if(this.elseClauseTree!==undefined)
				this.elseClauseTree.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.conditionTree.resolve(analyzer, parentScope);
			this.statementTree.resolve(analyzer, parentScope);
			if(this.elseClauseTree!==undefined)
				this.elseClauseTree.statementTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.ifToken);
			generator.generate(this.openParenthesisToken);
			generator.probeCondition(this.conditionTree);
			generator.generate(this.closeParenthesisToken);
			this.statementTree.generate(generator);
			if(this.elseClauseTree!==undefined) {
				generator.generate(this.elseClauseTree.elseToken);
				this.elseClauseTree.statementTree.generate(generator);
			}
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken===undefined||!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			return this.scope.resolveContinue(analyzer, continueToken, nameToken);
		}

		resolveDeclaration(name) { return this.scope.resolveDeclaration(name); }

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

	});

	Trees.Statement.Return=Object.freeze(class ReturnStatement {

		constructor(labelsTree, returnToken, expressionTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.returnToken=returnToken;
			this.expressionTree=expressionTree;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "return"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			if(this.expressionTree!==undefined)
				this.expressionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer, parentScope) {
			if(this.expressionTree!==undefined)
				this.expressionTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.returnToken);
			if(this.expressionTree!==undefined)
				generator.probeExpression(this.expressionTree);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.Switch=Object.freeze(class SwitchStatement {

		constructor(
			labelsTree,
			switchToken,
			openParenthesisToken,
			conditionTree,
			closeParenthesisToken,
			openCurlyToken,
			caseTrees,
			closeCurlyToken
		) {
			this.labelsTree=labelsTree;
			this.switchToken=switchToken;
			this.openParenthesisToken=openParenthesisToken;
			this.conditionTree=conditionTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.openCurlyToken=openCurlyToken;
			this.caseTrees=caseTrees;
			this.closeCurlyToken=closeCurlyToken;
		}

		kind() { return "switch"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			for(const caseTree of this.caseTrees) {
				if(caseTree.expressionTree!==undefined)
					caseTree.expressionTree.buildScope(analyzer, this);
				for(const statementTree of caseTree.statementTrees)
					statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			}
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			for(const caseTree of this.caseTrees) {
				if(caseTree.expressionTree!==undefined)
					caseTree.expressionTree.resolve(analyzer, this);
				for(const statementTree of caseTree.statementTrees)
					statementTree.resolve(analyzer, this);
			}
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.switchToken);
			generator.generate(this.openParenthesisToken);
			generator.probeExpression(this.conditionTree);
			generator.generate(this.closeParenthesisToken);
			generator.generate(this.openCurlyToken);
			for(const caseTree of this.caseTrees) {
				generator.generate(caseTree.keywordToken);
				if(caseTree.expressionTree!==undefined)
					generator.probeExpression(caseTree.expressionTree);
				generator.generate(caseTree.colonToken);
				for(const statementTree of caseTree.statementTrees)
					statementTree.generate(generator);
			}
			generator.generate(this.closeCurlyToken);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			return this.scope.resolveContinue(analyzer, continueToken, nameToken);
		}

		registerDeclaration(analyzer, nameToken) {
			if(this.declarations.has(nameToken.text))
				analyzer.newDiagnostic(nameToken, "redefinition of '"+nameToken.text+"'");
			else
				this.declarations.set(nameToken.text, nameToken);
		}

		resolveDeclaration(name) {
			let declaration=this.declarations.get(name);
			return declaration!==undefined ? declaration : this.scope.resolveDeclaration(name);
		}

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

	});

	Trees.Statement.Throw=Object.freeze(class ThrowStatement {

		constructor(labelsTree, throwToken, expressionTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.throwToken=throwToken;
			this.expressionTree=expressionTree;
			this.semicolonToken=semicolonToken;
		}

		kind() { return "throw"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.expressionTree.buildScope(analyzer, parentScope);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) { this.expressionTree.resolve(analyzer, parentScope); }

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.throwToken);
			generator.probeExpression(this.expressionTree);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Statement.Try=Object.freeze(class TryStatement {

		constructor(labelsTree, tryToken, blockTree, catchClauseTree, finallyClauseTree) {
			this.labelsTree=labelsTree;
			this.tryToken=tryToken;
			this.blockTree=blockTree;
			this.catchClauseTree=catchClauseTree;
			this.finallyClauseTree=finallyClauseTree;
		}

		kind() { return "try"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.blockTree.buildScope(analyzer, sourceOrFunctionScope, parentScope);
			if(this.catchClauseTree!==undefined)
				this.catchClauseTree.buildScope(analyzer, sourceOrFunctionScope, parentScope);
			if(this.finallyClauseTree!==undefined)
				this.finallyClauseTree.blockTree.buildScope(analyzer, sourceOrFunctionScope, parentScope);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.blockTree.resolve(analyzer, parentScope);
			if(this.catchClauseTree!==undefined)
				this.catchClauseTree.resolve(analyzer, parentScope);
			if(this.finallyClauseTree!==undefined)
				this.finallyClauseTree.blockTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.tryToken);
			this.blockTree.generate(generator);
			if(this.catchClauseTree!==undefined) {
				generator.generate(this.catchClauseTree.catchToken);
				generator.generate(this.catchClauseTree.openParenthesisToken);
				generator.generate(this.catchClauseTree.nameToken);
				generator.generate(this.catchClauseTree.closeParenthesisToken);
				this.catchClauseTree.blockTree.generate(generator);
			}
			if(this.finallyClauseTree!==undefined) {
				generator.generate(this.finallyClauseTree.finallyToken);
				this.finallyClauseTree.blockTree.generate(generator);
			}
		}

	});

	Trees.Statement.While=Object.freeze(class WhileStatement {

		constructor(
			labelsTree,
			whileToken,
			openParenthesisToken,
			conditionTree,
			closeParenthesisToken,
			statementTree
		) {
			this.labelsTree=labelsTree;
			this.whileToken=whileToken;
			this.openParenthesisToken=openParenthesisToken;
			this.conditionTree=conditionTree;
			this.closeParenthesisToken=closeParenthesisToken;
			this.statementTree=statementTree;
		}

		kind() { return "while"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.scope=parentScope;
			this.conditionTree.buildScope(analyzer, parentScope);
			this.statementTree.buildScope(analyzer, sourceOrFunctionScope, this);
			Object.freeze(this);
		}

		resolve(analyzer, parentScope) {
			this.conditionTree.resolve(analyzer, parentScope);
			this.statementTree.resolve(analyzer, this);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.whileToken);
			generator.generate(this.openParenthesisToken);
			generator.probeCondition(this.conditionTree);
			generator.generate(this.closeParenthesisToken);
			this.statementTree.generate(generator);
		}

		resolveBreak(analyzer, breakToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveBreak(analyzer, breakToken, nameToken);
			return this;
		}

		resolveContinue(analyzer, continueToken, nameToken) {
			if(nameToken!==undefined&&!this.labels.has(nameToken.text))
				return this.scope.resolveContinue(analyzer, continueToken, nameToken);
			return this;
		}

		resolveDeclaration(name) { return this.scope.resolveDeclaration(name); }

		containsLabel(name) { return this.labels.has(name)||this.scope.containsLabel(name); }

	});

	Object.freeze(Trees.Statement);

	Trees.Token=class Token {

		constructor(source, trivias, line, offset, text, value) {
			this.source=source;
			this.trivias=trivias;
			this.line=line;
			this.offset=offset;
			this.text=text;
			this.value=value;
		}

	};

	Trees.Token.Character=Object.freeze(class Character extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "character"; }

	});

	Trees.Token.EndOfInput=Object.freeze(class EndOfInput extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "end-of-input"; }

	});

	Trees.Token.Identifier=Object.freeze(class Identifier extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "identifier"; }

	});

	Trees.Token.Keyword=Object.freeze(class Keyword extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "keyword"; }

	});

	Trees.Token.Number=Object.freeze(class Number extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "number"; }

	});

	Trees.Token.Punctuator=Object.freeze(class Punctuator extends Trees.Token {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "punctuator"; }

	});

	Trees.Token.Regex=Object.freeze(class Regex extends Trees.Token  {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "regex"; }

	});

	Trees.Token.String=Object.freeze(class String extends Trees.Token  {

		constructor(source, trivias, line, offset, text, value) {
			super(source, trivias, line, offset, text, value);
		}

		kind() { return "string"; }

	});

	Object.freeze(Trees.Token);

	Trees.Type=Object.freeze(class Type {

		constructor(colonToken, identifierToken) {
			this.colonToken=colonToken;
			this.identifierToken=identifierToken;
			Object.freeze(this);
		}

	});

	Trees.Var=Object.freeze(class Var {

		constructor(annotationsTree, keywordToken, declaratorTrees, semicolonToken) {
			this.annotationsTree=annotationsTree;
			this.keywordToken=keywordToken;
			this.declaratorTrees=declaratorTrees;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "var"; }

		buildScope(analyzer, sourceOrFunctionScope, parentScope) {
			for(const declaratorTree of this.declaratorTrees) {
				switch(this.keywordToken.text) {
				case "const":
					parentScope.registerDeclaration(analyzer, declaratorTree.nameToken);
					break;
				case "let":
					parentScope.registerDeclaration(analyzer, declaratorTree.nameToken);
					break;
				case "var":
					sourceOrFunctionScope.registerVar(analyzer, declaratorTree.nameToken);
					break;
				default:
					analyzer.newDiagnostic(this.keywordToken, "internal error: invalid keyword '"+this.keywordToken.text+"'");
				}
				if(declaratorTree.initializerTree!==undefined)
					declaratorTree.initializerTree.expressionTree.buildScope(analyzer, parentScope);
			}
		}

		resolve(analyzer, parentScope) {
			for(const declaratorTree of this.declaratorTrees)
				if(declaratorTree.initializerTree!==undefined)
					declaratorTree.initializerTree.expressionTree.resolve(analyzer, parentScope);
		}

		generate(generator) {
			let comment=false;
			if(this.annotationsTree!==undefined) {
				for(const annotationTree of this.annotationsTree.annotationTrees)
					if(annotationTree.nameToken.text==="native")
						comment=true;
				if(comment)
					generator.commentIn();
				this.annotationsTree.generate(generator);
			}
			generator.generate(this.keywordToken);
			for(const declaratorTree of this.declaratorTrees) {
				if(declaratorTree.precedingCommaToken!==undefined)
					generator.generate(declaratorTree.precedingCommaToken);
				generator.generate(declaratorTree.nameToken);
				if(declaratorTree.initializerTree!==undefined) {
					generator.generate(declaratorTree.initializerTree.assignToken);
					generator.probeExpression(declaratorTree.initializerTree.expressionTree)
				}
			}
			generator.generate(this.semicolonToken);
			if(comment)
				generator.commentOut();
		}

	});

	return Object.freeze(Trees);

};
