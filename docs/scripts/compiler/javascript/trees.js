"use strict";

function defineJavascriptTrees(Compiler) {

	function validateClassHierarchy(classTree, baseClass) {
		for(const bases=new Set([ classTree ]); baseClass!==undefined; baseClass=baseClass.baseClass) {
			if(bases.has(baseClass))
				return false;
			bases.add(baseClass);
		}
		return true;
	}

	const Scope=Compiler.Javascript.Scope;

	function isParameterTreeOptional(parameterTree) {
		if(parameterTree.annotationTrees!==undefined)
			for(const annotationTree of parameterTree.annotationTrees)
			if(annotationTree.nameToken.text==="optional")
				return true;
		return false;
	}

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

		buildScope(analyzer, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.Block(parentScope, this);
			for(const statementTree of this.statementTrees)
				statementTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			for(const statementTree of this.statementTrees)
				statementTree.resolve(analyzer);
		}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.openCurlyToken);
			for(const statementTree of this.statementTrees)
				statementTree.generate(generator);
			generator.generate(this.closeCurlyToken);
		}

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

		buildScope(analyzer, parentScope) {
			this.blockTree.buildScope(analyzer, new Scope.Catch(parentScope, this));
			Object.freeze(this);
		}

		resolve(analyzer) { this.blockTree.resolve(analyzer); }

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

		kind() { return "class-definition"; }

		buildScope(analyzer, parentScope) {
			if(this.extendsClauseTree!==undefined)
				this.extendsClauseTree.baseClassExpressionTree.buildScope(analyzer, parentScope);
			this.members=new Map();
			this.statics=new Map();
			for(const memberTree of this.memberTrees)
				memberTree.buildScope(analyzer, parentScope, this);
		}

		resolve(analyzer) {
			if(this.extendsClauseTree===undefined) {
				this.baseClass=analyzer.resolveScopeAccess("Object");
				if(this.baseClass===undefined)
					analyzer.newDiagnostic(this.classToken, "cannot resolve 'Object'");
			}
			else {
				const extendsClause=this.extendsClauseTree.baseClassExpressionTree.resolve(analyzer);
				if(extendsClause!==undefined&&(extendsClause.kind()!=="literal"||extendsClause.token.text!=="null"))
					if(extendsClause.isClass()===false)
						analyzer.newDiagnostic(this.extendsClauseTree.extendsToken, "extends expression is not a class");
					else if(validateClassHierarchy(this, extendsClause))
						this.baseClass=extendsClause;
					else
						analyzer.newDiagnostic(this.extendsClauseTree.extendsToken, "circular hierarchy");
			}
			Object.freeze(this);
			for(const memberTree of this.memberTrees)
				memberTree.resolve(analyzer);
			return this;
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

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return true; }

		getConstructor() { return this.initializer; }

		isFunction() { return false; }

		resolveMemberAccess(analyzer, nameToken) {
			const member=this.statics.get(nameToken.text);
			if(member===undefined)
				analyzer.newDiagnostic(nameToken, "cannot resolve '"+nameToken.text+"'");
			return member;
		}

	}),

	Trees.Declarator=class Declarator {

		constructor(precedingCommaToken, nameToken, initializerTree) {
			this.precedingCommaToken=precedingCommaToken;
			this.nameToken=nameToken;
			this.initializerTree=initializerTree;
		}

		/* *** semantic part. *** */

		isClass() { return undefined; }

		isFunction() { return undefined; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

	};

	Trees.Declarator.Const=Object.freeze(class Const extends Trees.Declarator {

		constructor(precedingCommaToken, nameToken, initializerTree) {
			super(precedingCommaToken, nameToken, initializerTree);
		}

		kind() { return "const"; }

		buildScope(analyzer, parentScope) {
			parentScope.registerDeclaration(declaratorTree.nameToken, declaratorTree);
			if(this.initializerTree===undefined)
				analyzer.newDiagnostic(this.nameToken, "missing initializer");
			else
				declaratorTree.initializerTree.expressionTree.buildScope(analyzer, parentScope);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

	});

	Trees.Declarator.Let=Object.freeze(class Let extends Trees.Declarator {

		constructor(precedingCommaToken, nameToken, initializerTree) {
			super(precedingCommaToken, nameToken, initializerTree);
		}

		kind() { return "let"; }

		buildScope(analyzer, parentScope) {
			parentScope.registerDeclaration(declaratorTree.nameToken, declaratorTree);
			if(this.initializerTree!==undefined)
				declaratorTree.initializerTree.expressionTree.buildScope(analyzer, parentScope);
		}

		/* *** semantic part. *** */

		isAssignable() { return true; }

	});

	Trees.Declarator.Var=Object.freeze(class Var extends Trees.Declarator {

		constructor(precedingCommaToken, nameToken, initializerTree) {
			super(precedingCommaToken, nameToken, initializerTree);
		}

		kind() { return "var"; }

		buildScope(analyzer, parentScope) {
			parentScope.registerVar(declaratorTree.nameToken, declaratorTree);
			if(this.initializerTree!==undefined)
				declaratorTree.initializerTree.expressionTree.buildScope(analyzer, parentScope);
		}

		/* *** semantic part. *** */

		isAssignable() { return true; }

	});

	Object.freeze(Trees.Declarator);

	Trees.Empty=Object.freeze(class Empty {

		constructor(labelsTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "empty"; }

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
		}

		resolve(analyzer) {}

		generate(generator) {
			if(this.labelsTree!==undefined)
				this.labelsTree.generate(generator);
			generator.generate(this.semicolonToken);
		}

	});

	Trees.Expression=class Expression {

		/* *** semantic part. *** */

		isAssignable() { return undefined; }

		isClass() { return undefined; }

		isFunction() { return undefined; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

	};

	Trees.Expression.ArrayAccess=Object.freeze(class ArrayAccessExpression extends Trees.Expression {

		constructor(operandTree, openSquareToken, indexTree, closeSquareToken) {
			super();
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

		resolve(analyzer) {
			this.operandTree.resolve(analyzer);
			this.indexTree.resolve(analyzer);
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.openSquareToken);
			this.indexTree.generate(generator);
			generator.generate(this.closeSquareToken);
		}

	}),

	Trees.Expression.ArrayLiteral=Object.freeze(class ArrayLiteralExpression extends Trees.Expression {

		constructor(openSquareToken, initializersTree, closeSquareToken) {
			super();
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

		resolve(analyzer) {
			if(this.initializersTree!==undefined)
				this.initializersTree.resolve(analyzer);
			return this;
		}

		generate(generator) {
			generator.generate(this.openSquareToken);
			if(this.initializersTree!==undefined)
				this.initializersTree.generate(generator);
			generator.generate(this.closeSquareToken);
		}

		/* *** semantic part. *** */

		isClass() { return false; }

		isFunction() { return false; }

	});

	Trees.Expression.Assign=Object.freeze(class AssignExpression extends Trees.Expression {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			super();
			this.leftOperandTree=leftOperandTree;
			this.operatorToken=operatorToken;
			this.rightOperandTree=rightOperandTree;
		}

		kind() { return "assign"; }

		firstToken() { return this.leftOperandTree.firstToken(); }

		lastToken() { return this.rightOperandTree.lastToken(); }

		buildScope(analyzer, parentScope) {
			this.leftOperandTree.buildScope(analyzer, parentScope);
			this.rightOperandTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) {
			this.leftOperand=this.leftOperandTree.resolve(analyzer);
			this.rightOperand=this.rightOperandTree.resolve(analyzer);
			if(this.leftOperand!==undefined&&this.leftOperand.isAssignable()===false)
				analyzer.newDiagnostic(this.operatorToken, "left operand is not assignable");
			Object.freeze(this);
			return this;
		}

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			this.rightOperandTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return this.rightOperand.isClass(); }

		getConstructor() { return this.rightOperand.getConstructor(); }

		getFunction() { return this.rightOperand.getFunction(); }

		isFunction() { return this.rightOperand.isFunction(); }

	});

	Trees.Expression.Class=Object.freeze(class ClassExpression extends Trees.Expression {

		constructor(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken) {
			super();
			this.classTree=new Trees.Class(classToken, nameToken, extendsClauseTree, openCurlyToken, memberTrees, closeCurlyToken);
			Object.freeze(this);
		}

		kind() { return "class"; }

		firstToken() { return this.classTree.classToken; }

		lastToken() { return this.classTree.closeCurlyToken; }

		buildScope(analyzer, parentScope) { this.classTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) { return this.classTree.resolve(analyzer); }

		generate(generator) { this.classTree.generate(generator); }

	});

	Trees.Expression.Function=Object.freeze(class FunctionExpression extends Trees.Expression {

		constructor(functionToken, nameToken, parametersTree, blockTree) {
			super();
			this.functionTree=new Trees.Function(functionToken, nameToken, parametersTree, blockTree);
			Object.freeze(this);
		}

		kind() { return "function"; }

		firstToken() { return this.functionTree.functionToken; }

		lastToken() { return this.functionTree.blockTree.lastToken(); }

		buildScope(analyzer, parentScope) { this.functionTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) {
			this.functionTree.resolve(analyzer);
			return this;
		}

		generate(generator) { this.functionTree.generate(generator); }

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return true; }

		getConstructor() { return this.functionTree; }

		getFunction() { return this.functionTree; }

		isFunction() { return true; }

	});

	Trees.Expression.Infix=Object.freeze(class InfixExpression extends Trees.Expression {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			super();
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

		resolve(analyzer) {
			this.leftOperandTree.resolve(analyzer);
			this.rightOperandTree.resolve(analyzer);
			return this;
		}

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			this.rightOperandTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return false; }

	});

	Trees.Expression.InfixLogicalAnd=Object.freeze(class InfixLogicalAndExpression extends Trees.Expression.Infix {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			super(leftOperandTree, operatorToken, rightOperandTree);
		}

		kind() { return "infix-logical-and"; }

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			generator.probeExpression(this.rightOperandTree);
		}

		/* *** semantic part. *** */

		isAssignable() { return undefined; }

		isClass() { return undefined; }

		isFunction() { return undefined; }

	});

	Trees.Expression.InfixLogicalOr=Object.freeze(class InfixLogicalOrExpression extends Trees.Expression.Infix {

		constructor(leftOperandTree, operatorToken, rightOperandTree) {
			super(leftOperandTree, operatorToken, rightOperandTree);
		}

		kind() { return "infix-logical-or"; }

		generate(generator) {
			this.leftOperandTree.generate(generator);
			generator.generate(this.operatorToken);
			generator.probeExpression(this.rightOperandTree);
		}

		/* *** semantic part. *** */

		isAssignable() { return undefined; }

		isClass() { return undefined; }

		isFunction() { return undefined; }

	});

	Trees.Expression.Invocation=Object.freeze(class InvocationExpression extends Trees.Expression {

		constructor(operandTree, openParenthesisToken, argumentsTree, closeParenthesisToken) {
			super();
			this.operandTree=operandTree;
			this.openParenthesisToken=openParenthesisToken;
			this.argumentsTree=argumentsTree;
			this.closeParenthesisToken=closeParenthesisToken;
		}

		kind() { return "invocation"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.closeParenthesisToken; }

		buildScope(analyzer, parentScope) {
			this.operandTree.buildScope(analyzer, parentScope);
			if(this.argumentsTree!==undefined)
				this.argumentsTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			this.arguments=[];
			if(this.argumentsTree!==undefined) {
				let argumentTree=this.argumentsTree;
				while(argumentTree.kind()==="infix"&&argumentTree.operatorToken.text===",") {
					this.arguments.push(argumentTree.leftOperandTree.resolve(analyzer));
					argumentTree=argumentTree.rightOperandTree;
				}
				this.arguments.push(argumentTree.resolve(analyzer));
			}
			if(this.operand===undefined)
				return undefined;
			Object.freeze(this);
			if(this.operand.isFunction()===false)
				analyzer.newDiagnostic(this.openParenthesisToken, "cannot invoke operand");
			if(this.operand.isFunction()===true) {
				const definition=this.operand.getFunction();
				const minParameterCount=definition.parametersTree.getMinParameterCount();
				if(this.arguments.length<minParameterCount)
					analyzer.newDiagnostic(this.openParenthesisToken, "expected at least "+minParameterCount+" argument(s); got "+this.arguments.length);
				const maxParameterCount=definition.parametersTree.getMaxParameterCount();
				if(maxParameterCount!==undefined&&this.arguments.length>maxParameterCount)
					analyzer.newDiagnostic(this.openParenthesisToken, "expected at most "+maxParameterCount+" argument(s); got "+this.arguments.length);
			}
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.openParenthesisToken);
			if(this.argumentsTree!==undefined)
				this.argumentsTree.generate(generator);
			generator.generate(this.closeParenthesisToken);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

	});

	Trees.Expression.Lambda=Object.freeze(class LambdaExpression extends Trees.Expression {

		constructor(parametersTree, operatorToken, bodyTree) {
			super();
			this.parametersTree=parametersTree;
			this.operatorToken=operatorToken;
			this.bodyTree=bodyTree;
		}

		kind() { return "lambda-function"; }

		firstToken() { return this.parametersTree.firstToken(); }

		lastToken() { return this.bodyTree.lastToken(); }

		buildScope(analyzer, parentScope) {
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.vars=new Map();
			this.vars.set("arguments", new Compiler.Javascript.Element.Declaration.Arguments());
			this.vars.set("this", Compiler.Javascript.Element.Declaration.Invalid);
			this.bodyTree.buildScope(analyzer, new Scope.Function(parentScope, this));
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.bodyTree.resolve(analyzer);
			return this;
		}

		generate(generator) {
			this.parametersTree.generate(generator);
			generator.generate(this.operatorToken);
			this.bodyTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		getFunction() { return this; }

		isFunction() { return true; }

	});

	Trees.Expression.Literal=Object.freeze(class LiteralExpression extends Trees.Expression {

		constructor(token, value) {
			super();
			this.token=token;
			this.value=value;
			Object.freeze(this);
		}

		kind() { return "literal"; }

		firstToken() { return this.token; }

		lastToken() { return this.token; }

		buildScope(analyzer, parentScope) {}

		resolve(analyzer) { return this; }

		generate(generator) { generator.generate(this.token); }

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return false; }

	});

	Trees.Expression.MemberAccess=Object.freeze(class MemberAccessExpression extends Trees.Expression {

		constructor(operandTree, dotToken, nameToken) {
			super();
			this.operandTree=operandTree;
			this.dotToken=dotToken;
			this.nameToken=nameToken;
		}

		kind() { return "member-access"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.nameToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			if(this.operand!==undefined)
				this.element=this.operand.resolveMemberAccess(analyzer, this.nameToken);
			Object.freeze(this);
			return this.element;
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.dotToken);
			generator.generate(this.nameToken);
		}

	});

	Trees.Expression.ObjectLiteral=Object.freeze(class ObjectLiteralExpression extends Trees.Expression {

		constructor(openCurlyToken, memberTrees, closeCurlyToken) {
			super();
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
				memberTree.buildScope(analyzer, parentScope, this);
			Object.freeze(this);
		}

		resolve(analyzer) {
			for(const memberTree of this.memberTrees)
				memberTree.resolve(analyzer);
			return this;
		}

		generate(generator) {
			generator.generate(this.openCurlyToken);
			for(const memberTree of this.memberTrees)
				memberTree.generate(generator);
			generator.generate(this.closeCurlyToken);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return false; }

		resolveMemberAccess(analyzer, nameToken) {
			const result=this.members.get(nameToken.text);
			if(result===undefined)
				analyzer.newDiagnostic(nameToken, "cannot resolve '"+nameToken.text+"'");
			return result;
		}

	});

	Trees.Expression.Parenthesized=Object.freeze(class ParenthesizedExpression extends Trees.Expression {

		constructor(openParenthesisToken, operandTree, closeParenthesisToken) {
			super();
			this.openParenthesisToken=openParenthesisToken;
			this.operandTree=operandTree;
			this.closeParenthesisToken=closeParenthesisToken;
			Object.freeze(this);
		}

		kind() { return "parenthesized"; }

		firstToken() { return this.openParenthesisToken; }

		lastToken() { return this.closeParenthesisToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) { return this.operandTree.resolve(analyzer); }

		generate(generator) {
			generator.generate(this.openParenthesisToken);
			this.operandTree.generate(generator);
			generator.generate(this.closeParenthesisToken);
		}

		/* *** semantic part. *** */

		isAssignable() { throw new Error("unsupported operation"); }

		isFunction() { throw new Error("unsupported operation"); }

	});

	Trees.Expression.Postfix=Object.freeze(class PostfixExpression extends Trees.Expression {

		constructor(operandTree, operatorToken) {
			super();
			this.operandTree=operandTree;
			this.operatorToken=operatorToken;
		}

		kind() { return "postfix"; }

		firstToken() { return this.operandTree.firstToken(); }

		lastToken() { return this.operatorToken; }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			Object.freeze(this);
			if(this.operand!==undefined&&this.operand.isAssignable()===false)
				analyzer.newDiagnostic(this.operatorToken, "invalid increment/decrement operand");
			return this;
		}

		generate(generator) {
			this.operandTree.generate(generator);
			generator.generate(this.operatorToken);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return false; }

	});

	Trees.Expression.Prefix=Object.freeze(class PrefixExpression extends Trees.Expression {

		constructor(operatorToken, operandTree) {
			super();
			this.operatorToken=operatorToken;
			this.operandTree=operandTree;
		}

		firstToken() { return this.operatorToken; }

		lastToken() { return this.operandTree.lastToken(); }

		buildScope(analyzer, parentScope) { this.operandTree.buildScope(analyzer, parentScope); }

		resolve(analyzer) {
			this.operandTree.resolve(analyzer);
			return Object.freeze(this);
		}

		generate(generator) {
			generator.generate(this.operatorToken);
			this.operandTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return false; }

	});

	Trees.Expression.PrefixBitwiseNot=Object.freeze(class PrefixBitwiseNotExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-bitwise-not"; }

	});

	Trees.Expression.PrefixDecrement=Object.freeze(class PrefixDecrementExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-decrement"; }

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			Object.freeze(this);
			if(this.operand!==undefined&&this.operand.isAssignable()===false)
				analyzer.newDiagnostic(this.operatorToken, "invalid increment/decrement operand");
			return this;
		}

	});

	Trees.Expression.PrefixDelete=Object.freeze(class PrefixDeleteExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-delete"; }

	});

	Trees.Expression.PrefixIdentity=Object.freeze(class PrefixIdentityExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-identity"; }

	});

	Trees.Expression.PrefixIncrement=Object.freeze(class PrefixIncrementExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-increment"; }

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			Object.freeze(this);
			if(this.operand!==undefined&&this.operand.isAssignable()===false)
				analyzer.newDiagnostic(this.operatorToken, "invalid increment/decrement operand");
			return this;
		}

	});

	Trees.Expression.PrefixLogicalNot=Object.freeze(class PrefixLogicalNotExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-logical-not"; }

	});

	Trees.Expression.PrefixNegate=Object.freeze(class PrefixNegateExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-negate"; }

	});

	Trees.Expression.PrefixNew=Object.freeze(class PrefixNewExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-new"; }

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			Object.freeze(this);
			if(this.operand===undefined)
				return undefined;
			switch(this.operand.isClass()) {
			case false:
				analyzer.newDiagnostic(this.operatorToken, "operand is not a class");
				return undefined;
			case true:
				const constructor=this.operand.getConstructor();
				if(constructor!==undefined&&constructor.parametersTree.getMinParameterCount()!==0)
					analyzer.newDiagnostic(this.operatorToken, "expected arguments");
				return new Compiler.Javascript.Element.Expression.InstanceReference(this.operand);
			default:
				return undefined;
			}
		}

	});

	Trees.Expression.PrefixNewInvocation=Object.freeze(class PrefixNewInvocationExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree, openParenthesisToken, argumentsTree, closeParenthesisToken) {
			super(operatorToken, operandTree);
			this.openParenthesisToken=openParenthesisToken;
			this.argumentsTree=argumentsTree;
			this.closeParenthesisToken=closeParenthesisToken;
		}

		kind() { return "prefix-new-invocation"; }

		buildScope(analyzer, parentScope) {
			this.operandTree.buildScope(analyzer, parentScope);
			if(this.argumentsTree!==undefined)
			this.argumentsTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) {
			this.operand=this.operandTree.resolve(analyzer);
			this.arguments=[];
			if(this.argumentsTree!==undefined) {
				let argumentTree=this.argumentsTree;
				while(argumentTree.kind()==="infix"&&argumentTree.operatorToken.text===",") {
					this.arguments.push(argumentTree.leftOperandTree.resolve(analyzer));
					argumentTree=argumentTree.rightOperandTree;
				}
				this.arguments.push(argumentTree.resolve(analyzer));
			}
			Object.freeze(this);
			if(this.operand===undefined)
				return undefined;
			switch(this.operand.isClass()) {
			case false:
				analyzer.newDiagnostic(this.operatorToken, "operand is not a class");
				return undefined;
			case true:
				const constructor=this.operand.getConstructor();
				if(constructor!==undefined) {
					const minParameterCount=constructor.parametersTree.getMinParameterCount();
					if(this.arguments.length<minParameterCount)
						analyzer.newDiagnostic(this.operatorToken, "expected at least "+minParameterCount+" argument(s); got "+this.arguments.length);
					const maxParameterCount=constructor.parametersTree.getMaxParameterCount();
					if(maxParameterCount!==undefined&&this.arguments.length>maxParameterCount)
						analyzer.newDiagnostic(this.operatorToken, "expected at most "+maxParameterCount+" argument(s); got "+this.arguments.length);
				}
				else if(this.arguments.length!==0)
					analyzer.newDiagnostic(this.operatorToken, "expected 0 argument");
				return new Compiler.Javascript.Element.Expression.InstanceReference(this.operand);
			case undefined:
				return undefined;
			}
		}

	});

	Trees.Expression.PrefixSpread=Object.freeze(class PrefixSpreadExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-spread"; }

	});

	Trees.Expression.PrefixTypeOf=Object.freeze(class PrefixTypeOfExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-typeof"; }

	});

	Trees.Expression.PrefixVoid=Object.freeze(class PrefixVoidExpression extends Trees.Expression.Prefix {

		constructor(operatorToken, operandTree) { super(operatorToken, operandTree); }

		kind() { return "prefix-void"; }

	});

	Trees.Expression.ScopeAccess=Object.freeze(class ScopeAccessExpression extends Trees.Expression {

		constructor(nameToken) {
			super();
			this.nameToken=nameToken;
		}

		kind() { return "scope-access"; }

		firstToken() { return this.nameToken; }

		lastToken() { return this.nameToken; }

		buildScope(analyzer, parentScope) { this.parentScope=parentScope; }

		resolve(analyzer) {
			this.declaration=this.parentScope.resolveScopeAccess(this.nameToken.text);
			if(this.declaration===undefined)
				analyzer.registerScopeAccess(this);
			Object.freeze(this);
			return this.declaration;
		}

		generate(generator) { generator.generate(this.nameToken); }

	});

	Trees.Expression.Ternary=Object.freeze(class TernaryExpression extends Trees.Expression {

		constructor(conditionTree, questionToken, trueExpressionTree, colonToken, falseExpressionTree) {
			super();
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

		resolve(analyzer) {
			this.conditionTree.resolve(analyzer);
			this.trueExpressionTree.resolve(analyzer);
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

		kind() { return "function-definition"; }

		buildScope(analyzer, parentScope) {
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.vars=new Map();
			this.vars.set("arguments", new Compiler.Javascript.Element.Declaration.Arguments());
			this.vars.set("this", Compiler.Javascript.Element.Declaration.Invalid);
			if(this.nameToken!==undefined)
				this.vars.set(this.nameToken.text, Compiler.Javascript.Element.Declaration.Invalid);
			this.blockTree.buildScope(analyzer, new Scope.Function(parentScope, this));
			Object.freeze(this);
		}

		resolve(analyzer) { this.blockTree.resolve(analyzer); }

		generate(generator) {
			generator.generate(this.functionToken);
			if(this.nameToken!==undefined)
				generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return true; }

		getConstructor() { return this; }

		getFunction() { return this; }

		isFunction() { return true; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

	});

	Trees.FunctionParameter=Object.freeze(class FunctionParameter {

		constructor(precedingCommaToken, annotationTrees, nameToken) {
			this.precedingCommaToken=precedingCommaToken;
			this.annotationTrees=annotationTrees;
			this.nameToken=nameToken;
		}

		kind() { return "function-parameter"; }

		/* *** semantic part. *** */

		isAssignable() { return true; }

		isClass() { return undefined; }

		isFunction() { return undefined; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

	});

	Trees.FunctionParameters=Object.freeze(class FunctionParameters {

		constructor(openParenthesisToken, parameterTrees, variadicTree, closeParenthesisToken) {
			this.openParenthesisToken=openParenthesisToken;
			this.parameterTrees=parameterTrees;
			this.variadicTree=variadicTree;
			this.closeParenthesisToken=closeParenthesisToken;
		}

		kind() { return "function-parameters"; }

		firstToken() { return this.openParenthesisToken; }

		buildParameters(analyzer) {
			const parameters=new Map();
			this.maxParameterCount=0;
			this.minParameterCount=0;
			for(const parameterTree of this.parameterTrees) {
				const parameterNameToken=parameterTree.nameToken;
				const parameterName=parameterNameToken.text;
				if(parameterName==="arguments")
					analyzer.newDiagnostic(parameterNameToken, "'arguments' can't be defined or assigned to");
				else if(parameters.has(parameterName))
					analyzer.newDiagnostic(parameterNameToken, "redefinition of parameter '"+parameterName+"'");
				else {
					parameters.set(parameterName, parameterTree);
					this.maxParameterCount+=1;
					if(!isParameterTreeOptional(parameterTree))
						this.minParameterCount+=1;
				}
			}
			if(this.variadicTree!==undefined)
				this.maxParameterCount=undefined;
			Object.freeze(this);
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

		/*** semantic part. *** */

		getMaxParameterCount() { return this.maxParameterCount; }

		getMinParameterCount() { return this.minParameterCount; }

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

		/*** semantic part. *** */

		getMaxParameterCount() { return 1; }

		getMinParameterCount() { return 1; }

	});

	Trees.Method=Object.freeze(class Method {

		constructor(annotationsTree, staticToken, nameToken, parametersTree, blockTree) {
			this.annotationsTree=annotationsTree;
			this.staticToken=staticToken;
			this.nameToken=nameToken;
			this.parametersTree=parametersTree;
			this.blockTree=blockTree;
		}

		kind() { return "method-definition"; }

		buildScope(analyzer, parentScope, classTree) {
			this.classTree=classTree;
			if(this.staticToken===undefined)
				if(this.nameToken.text==="constructor")
					if(classTree.initializer!==undefined)
						analyzer.newDiagnostic(this.nameToken, "redefinition of 'constructor'");
					else
						classTree.initializer=this;
				else if(classTree.members.has(this.nameToken.text))
					analyzer.newDiagnostic(this.nameToken, "redefinition of '"+this.nameToken.text+"'");
				else
					classTree.members.set(this.nameToken.text, this);
			else
				if(classTree.statics.has(this.nameToken.text))
					analyzer.newDiagnostic(this.nameToken, "redefinition of static '"+this.nameToken.text+"'");
				else
					classTree.statics.set(this.nameToken.text, this);
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.vars=new Map();
			Object.freeze(this);
			this.blockTree.buildScope(analyzer, new Scope.Function(parentScope, this));
		}

		resolve(analyzer) {
			this.vars.set("arguments", new Compiler.Javascript.Element.Declaration.Arguments());
			if(this.classTree.baseClass!==undefined)
				this.vars.set("super", new Compiler.Javascript.Element.Expression.InstanceReference(this.classTree.baseClass));
			this.vars.set("this",new Compiler.Javascript.Element.Expression.InstanceReference(this.classTree));
			this.vars.set(this.nameToken.text, this);
			this.blockTree.resolve(analyzer);
		}

		generate(generator) {
			if(this.annotationsTree!==undefined)
				this.annotationsTree.generate(generator);
			if(this.staticToken!==undefined)
				generator.generate(this.staticToken);
			generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		getFunction() { return this; }

		isFunction() { return true; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

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

		buildScope(analyzer, parentScope, literal) {
			this.keyTree.buildScope(analyzer, parentScope);
			this.valueTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) {
			this.keyTree.resolve(analyzer);
			this.valueTree.resolve(analyzer);
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

		buildScope(analyzer, parentScope, literal) {
			if(literal.members.has(this.keyToken.text))
				analyzer.newDiagnostic(this.keyToken, "redefinition of "+this.keyToken.text+"'");
			else
				literal.members.set(this.keyToken.text, this.valueTree);
			this.valueTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) { this.valueTree.resolve(analyzer); }

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

		buildScope(analyzer, parentScope, literal) {
			this.literal=literal;
			if(literal.members.has(this.nameToken.text))
				analyzer.newDiagnostic(this.nameToken, "redefinition of "+this.nameToken.text+"'");
			else
				literal.members.set(this.nameToken.text, this);
			this.parameters=this.parametersTree.buildParameters(analyzer);
			this.vars=new Map();
			Object.freeze(this);
			this.blockTree.buildScope(analyzer, new Scope.Function(parentScope, this));
		}

		resolve(analyzer) {
			this.vars.set("arguments", new Compiler.Javascript.Element.Declaration.Arguments());
			this.vars.set("this", this.literal);
			this.blockTree.resolve(analyzer);
		}

		generate(generator) {
			if(this.precedingCommaToken!==undefined)
				generator.generate(this.precedingCommaToken);
			generator.generate(this.nameToken);
			this.parametersTree.generate(generator);
			this.blockTree.generate(generator);
		}

		/* *** semantic part. *** */

		isAssignable() { return false; }

		isClass() { return false; }

		isFunction() { return true; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

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

		buildScope(parentScope) {
			this.references=[];
			const scope=new Scope.Source(parentScope, this);
			for(const statementTree of this.statementTrees)
				statementTree.buildScope(scope, scope);
			for(const statementTree of this.statementTrees)
				statementTree.resolve(scope);
			return Object.freeze(this);
		}

		generate(generator) {
			for(const statementTree of this.statementTrees)
				statementTree.generate(generator);
			if(this.endOfInputToken!==undefined)
				generator.generate(this.endOfInputToken);
		}

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

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.statementTree=parentScope.resolveBreak(this.breakToken, this.labelToken);
			Object.freeze(this);
		}

		resolve(analyzer) {}

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
			parentScope.registerDeclaration(this.classTree.nameToken, this.classTree);
			this.classTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) { return this.classTree.resolve(analyzer); }

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

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.statementTree=parentScope.resolveContinue(this.continueToken, this.labelToken);
			Object.freeze(this);
		}

		resolve(analyzer) {}

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

		buildScope(analyzer, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.Loop(parentScope, this);
			this.statementTree.buildScope(analyzer, scope);
			this.conditionTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.statementTree.resolve(analyzer);
			this.conditionTree.resolve(analyzer);
		}

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

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.expressionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) { this.expressionTree.resolve(analyzer); }

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

		buildScope(analyzer, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.For(parentScope, this);
			this.initializerTree.buildScope(analyzer, scope);
			if(this.conditionTree!==undefined)
				this.conditionTree.buildScope(analyzer, scope);
			this.statementTree.buildScope(analyzer, scope);
			if(this.incrementTree!==undefined)
				this.incrementTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.initializerTree.resolve(analyzer);
			if(this.conditionTree!==undefined)
				this.conditionTree.resolve(analyzer);
			this.statementTree.resolve(analyzer);
			if(this.incrementTree!==undefined)
				this.incrementTree.resolve(analyzer);
		}

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

		buildScope(analyzer, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			if(this.declarationKeywordToken!==undefined)
				switch(this.declarationKeywordToken.text) {
				case "var":
					parentScope.registerVar(this.nameToken, this);
					break;
				case "const":
				case "let":
					this.declaration=this;
					break;
				}
			const scope=new Scope.ForEach(parentScope, this);
			this.iterableTree.buildScope(analyzer, scope);
			this.statementTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.iterableTree.resolve(analyzer);
			this.statementTree.resolve(analyzer);
		}

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

		isAssignable() { return this.declarationKeywordToken.text!=="const"; }

		isClass() { return undefined; }

		isFunction() { return undefined; }

		resolveMemberAccess(analyzer, nameToken) { return undefined; }

	});

	Trees.Statement.Function=Object.freeze(class FunctionStatement {

		constructor(annotationsTree, functionToken, nameToken, parametersTree, blockTree) {
			this.annotationsTree=annotationsTree;
			this.functionTree=new Trees.Function(functionToken, nameToken, parametersTree, blockTree);
			Object.freeze(this);
		}

		kind() { return "function"; }

		buildScope(analyzer, parentScope) {
			parentScope.registerDeclaration(this.functionTree.nameToken, this.functionTree);
			this.functionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) { this.functionTree.resolve(analyzer); }

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

		buildScope(analyzer, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.If(parentScope, this);
			this.conditionTree.buildScope(analyzer, scope);
			this.statementTree.buildScope(analyzer, scope);
			if(this.elseClauseTree!==undefined)
				this.elseClauseTree.statementTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.conditionTree.resolve(analyzer);
			this.statementTree.resolve(analyzer);
			if(this.elseClauseTree!==undefined)
				this.elseClauseTree.statementTree.resolve(analyzer);
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

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			if(this.expressionTree!==undefined)
				this.expressionTree.buildScope(analyzer, parentScope);
		}

		resolve(analyzer) {
			if(this.expressionTree!==undefined)
				this.expressionTree.resolve(analyzer);
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

		buildScope(analyzer, parentScope) {
			this.declarations=new Map();
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.Switch(parentScope, this);
			for(const caseTree of this.caseTrees) {
				if(caseTree.expressionTree!==undefined)
					caseTree.expressionTree.buildScope(analyzer, scope);
				for(const statementTree of caseTree.statementTrees)
					statementTree.buildScope(analyzer, scope);
			}
			Object.freeze(this);
		}

		resolve(analyzer) {
			for(const caseTree of this.caseTrees) {
				if(caseTree.expressionTree!==undefined)
					caseTree.expressionTree.resolve(analyzer);
				for(const statementTree of caseTree.statementTrees)
					statementTree.resolve(analyzer);
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

	});

	Trees.Statement.Throw=Object.freeze(class ThrowStatement {

		constructor(labelsTree, throwToken, expressionTree, semicolonToken) {
			this.labelsTree=labelsTree;
			this.throwToken=throwToken;
			this.expressionTree=expressionTree;
			this.semicolonToken=semicolonToken;
		}

		kind() { return "throw"; }

		buildScope(analyzer, parentScope) {
			if(this.labelsTree!==undefined)
				for(const labelTree of this.labelsTree.labelTrees)
					analyzer.newDiagnostic(labelTree.nameToken, "label cannot be referenced");
			this.expressionTree.buildScope(analyzer, parentScope);
			Object.freeze(this);
		}

		resolve(analyzer) { this.expressionTree.resolve(analyzer); }

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

		buildScope(analyzer, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			this.blockTree.buildScope(analyzer, parentScope);
			if(this.catchClauseTree!==undefined)
				this.catchClauseTree.buildScope(analyzer, parentScope);
			if(this.finallyClauseTree!==undefined)
				this.finallyClauseTree.blockTree.buildScope(analyzer, parentScope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.blockTree.resolve(analyzer);
			if(this.catchClauseTree!==undefined)
				this.catchClauseTree.resolve(analyzer);
			if(this.finallyClauseTree!==undefined)
				this.finallyClauseTree.blockTree.resolve(analyzer);
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

		buildScope(analyzer, parentScope) {
			this.labels=this.labelsTree!==undefined ? this.labelsTree.analyze(analyzer, parentScope) : new Set();
			const scope=new Scope.Loop(parentScope, this);
			this.conditionTree.buildScope(analyzer, scope);
			this.statementTree.buildScope(analyzer, scope);
			Object.freeze(this);
		}

		resolve(analyzer) {
			this.conditionTree.resolve(analyzer);
			this.statementTree.resolve(analyzer);
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

	Trees.Variables=Object.freeze(class Variables {

		constructor(annotationsTree, keywordToken, declaratorTrees, semicolonToken) {
			this.annotationsTree=annotationsTree;
			this.keywordToken=keywordToken;
			this.declaratorTrees=declaratorTrees;
			this.semicolonToken=semicolonToken;
			Object.freeze(this);
		}

		kind() { return "variables"; }

		buildScope(analyzer, parentScope) {
			for(const declaratorTree of this.declaratorTrees) {
				switch(this.keywordToken.text) {
				case "const":
					parentScope.registerDeclaration(declaratorTree.nameToken, declaratorTree);
					break;
				case "let":
					parentScope.registerDeclaration(declaratorTree.nameToken, declaratorTree);
					break;
				case "var":
					parentScope.registerVar(declaratorTree.nameToken, declaratorTree);
					break;
				default:
					analyzer.newDiagnostic(this.keywordToken, "internal error: invalid keyword '"+this.keywordToken.text+"'");
				}
				if(declaratorTree.initializerTree!==undefined)
					declaratorTree.initializerTree.expressionTree.buildScope(analyzer, parentScope);
			}
		}

		resolve(analyzer) {
			for(const declaratorTree of this.declaratorTrees)
				if(declaratorTree.initializerTree!==undefined)
					declaratorTree.initializerTree.expressionTree.resolve(analyzer);
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
