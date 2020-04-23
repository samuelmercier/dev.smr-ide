"use strict";

const Compiler=function() {

	const Compiler={};
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

	Compiler.newToken=Object.freeze(function(source, trivias, line, offset, text, value) {
		return Object.freeze({
			line:line,
			offset:offset,
			source:source,
			text:text,
			trivias:trivias,
			value:value,

			generate:function(generator) { generator.generate(this); }
		});
	});

	/** generator used to build a source back from a tree. */
	Compiler.newJavascriptGenerator=Object.freeze(function() {
		let commentLevel=0;
		const probes=new Map();
		const result=[];
		return Object.freeze({
			append:function(text) { return result.push(text), this; },
			build:function() { return result.join(""); },
			commentIn:function() { return commentLevel+=1, this; },
			commentOut:function() { return commentLevel-=1, this; },
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
			probe:function(expressionTree) {
				if(commentLevel===0) {
					this.append("probe(").append(probes.size()).append(", ");
					expressionTree.generate(this, true);
					this.append(")");
					probes.set(expressionTree, probes.size());
				}
				else
					expressionTree.generate(this, false);
			}
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
					newDiagnostic(declaration[1], "redefinition of '"+declaration[0]+"'");
				else
					declarations.set(declaration[0], declaration[1]);
		}
		for(const sourceTree of sourceTrees)
			for(const reference of sourceTree.references) {
				const tree=reference.tree;
				const nameToken=tree.nameToken;
				if(declarations.get(nameToken.text)===undefined&&(scope===undefined||scope.resolve(nameToken.text)===undefined))
					newDiagnostic(nameToken, "cannot resolve '"+nameToken.text+"'");
			}
		return Object.freeze({
			declarations:declarations,
			diagnostics:diagnostics,
			sourceTrees:sourceTrees,
			resolve:function(name) {
				const result=this.declarations.get(name);
				if(result!==undefined)
					return result;
				return scope!==undefined ? scope.resolve(name) : undefined;
			}
		});
	});

	Compiler.parseJavascript=JavascriptParser.parse;

	return Object.freeze(Compiler);

}();
