"use strict";

const Compiler=function() {

	const Compiler={};
	Compiler.Javascript=defineJavascript();
	const JavascriptParser=defineJavascriptParser(Compiler);
	Compiler.JavascriptTrees=defineJavascriptTrees(Compiler);

	Compiler.newDiagnostic=Object.freeze(function newDiagnostic(sourceId, lineIndex, positionStart, positionEnd, message) {
		return {
			lineIndex:lineIndex,
			message:message,
			positionStart:positionStart,
			positionEnd:positionEnd,
			sourceId:sourceId
		};
	});

	/** generator used to build a coverage source from a tree. */
	Compiler.newCoverageGenerator=Object.freeze(function(firstProbeIndex) {
		let commentLevel=0;
		const probes=[];
		const result=[];
		return Object.freeze({
			append:function(text) { return result.push(text), this; },
			build:function() { return result.join(""); },
			commentIn:function() {
				if(commentLevel===0)
					this.append("/* ");
				return commentLevel+=1, this;
			},
			commentOut:function() {
				if(commentLevel===1)
					this.append(" */");
				return commentLevel-=1, this;
			},
			generate:function(token) {
				if(commentLevel===0)
					for(const trivia of token.trivias)
						switch(trivia.kind) {
						case "comment-1":
							this.append("//").append(trivia.text);
							continue;
						case "comment-n":
							this.append("/*").append(trivia.text).append("*/");
							continue;
						default:
							this.append(trivia.text);
						}
				else
					for(const trivia of token.trivias)
						this.append(trivia.text);
				this.append(token.text);
			},
			probeCondition:function(expressionTree) {
				if(commentLevel===0) {
					const index=firstProbeIndex+probes.length;
					probes.push({ index:index, tree:expressionTree });
					this.append(" window[\"##oct##c\"](").append(index).append(", ");
					expressionTree.generate(this, true);
					this.append(")");
				}
				else
					expressionTree.generate(this);
			},
			probeExpression:function(expressionTree) {
				if(commentLevel===0) {
					const index=firstProbeIndex+probes.length;
					probes.push({ index:index, tree:expressionTree });
					this.append(" window[\"##oct##e\"](").append(index).append(", ");
					expressionTree.generate(this, true);
					this.append(")");
				}
				else
					expressionTree.generate(this);
			},
			probes:function() { return probes; }
		});
	});

	/** generator used to build a colored html from a tree. */
	Compiler.newHtmlGenerator=Object.freeze(function(lines) {
		const element=System.gui.createElement("div");
		return Object.freeze({
			append:function(text) { return result.push(text), this; },
			build:function() { return element; },
			commentIn:function() { return this; },
			commentOut:function() { return this; },
			generate:function(token) {
				for(const trivia of token.trivias)
					switch(trivia.kind) {
					case "comment-1":
						element.appendChild(document.createTextNode("//"+trivia.text));
						continue;
					case "comment-n":
						element.appendChild(document.createTextNode("/*"+trivia.text+"*/"));
						continue;
					default:
						element.appendChild(document.createTextNode(trivia.text));
					}
				const span=System.gui.createElement("span", token.kind(), undefined, document.createTextNode(token.text));
				const coverage=lines.getCoverageFor(token.line);
				if(coverage!==undefined)
					span.setAttribute("coverage", coverage);
				element.appendChild(span);
			},
			probeCondition:function(expressionTree) { expressionTree.generate(this); },
			probeExpression:function(expressionTree) { expressionTree.generate(this); }
		});
	});

	/** generator used to build a coverage source from a tree. */
	Compiler.newJavascriptGenerator=Object.freeze(function() {
		let commentLevel=0;
		const result=[];
		return Object.freeze({
			append:function(text) { return result.push(text), this; },
			build:function() { return result.join(""); },
			commentIn:function() {
				if(commentLevel===0)
					this.append("/* ");
				return commentLevel+=1, this;
			},
			commentOut:function() {
				if(commentLevel===1)
					this.append(" */");
				return commentLevel-=1, this;
			},
			generate:function(token) {
				if(commentLevel===0)
					for(const trivia of token.trivias)
						switch(trivia.kind) {
						case "comment-1":
							this.append("//").append(trivia.text);
							continue;
						case "comment-n":
							this.append("/*").append(trivia.text).append("*/");
							continue;
						default:
							this.append(trivia.text);
						}
				else
					for(const trivia of token.trivias)
						this.append(trivia.text);
				this.append(token.text);
			},
			probeCondition:function(expressionTree) { expressionTree.generate(this); },
			probeExpression:function(expressionTree) { expressionTree.generate(this); }
		});
	});

	Compiler.analyzeJavascript=Object.freeze(function(scope, sourceTrees) {

		function newDiagnostic(token, message) {
			diagnostics.push(Compiler.newDiagnostic(token.source.id, token.line, token.offset, token.offset+token.text.length, message));
		}

		const diagnostics=[];
		const declarations=new Map();
		for(const sourceTree of sourceTrees) {
			diagnostics.push(...sourceTree.diagnostics);
			for(const declaration of sourceTree.declarations.entries())
				if(declarations.has(declaration[0])||scope!==undefined&&scope.declarations.has(declaration[0]))
					newDiagnostic(declaration[1].nameToken, "redefinition of '"+declaration[0]+"'");
				else
					declarations.set(declaration[0], declaration[1]);
		}
		for(const sourceTree of sourceTrees)
			for(const tree of sourceTree.references) {
				const nameToken=tree.nameToken;
				if(declarations.get(nameToken.text)===undefined&&(scope===undefined||scope.resolveScopeAccess(nameToken.text)===undefined))
					newDiagnostic(nameToken, "cannot resolve '"+nameToken.text+"'");
			}
		return Object.freeze({
			declarations:declarations,
			diagnostics:diagnostics,
			sourceTrees:sourceTrees,
			resolveScopeAccess:function(name) {
				const result=this.declarations.get(name);
				if(result!==undefined)
					return result;
				return scope!==undefined ? scope.resolveScopeAccess(name) : undefined;
			}
		});
	});

	Compiler.parseJavascript=JavascriptParser.parse;

	return Object.freeze(Compiler);

}();
