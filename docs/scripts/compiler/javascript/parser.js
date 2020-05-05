"use strict";

/** javascript scanner/parser.

As a consumer you should only call the Compiler.parseJavascript(sourceId, input) function
to parse a javascript source file with:
	* sourceId: a unique identifier for the source file.
	* input: a string representation of the source file.
*/
function defineJavascriptParser(Compiler) {

	/* instantiates a punctuator structure. */
	function newPunctuators() {
		const result={ entries:new Map() };
		for(const punctuator of arguments) {
			let punctuators=result;
			for(let i=0; i<punctuator.length-1; i+=1) {
				const character=punctuator.charCodeAt(i);
				let temp=punctuators.entries.get(character);
				if(temp==null)
					punctuators.entries.set(character, temp={ entries:new Map() });
				punctuators=temp;
			}
			const character=punctuator.charCodeAt(punctuator.length-1);
			let temp=punctuators.entries.get(character);
			if(temp==null)
				punctuators.entries.set(character, temp={ entries:new Map() });
			if(temp.value===undefined)
				temp.value=punctuator;
			else
				throw "redefinition of punctuator '"+punctuator+"'";
		}
		return Object.freeze(result);
	}

	/** (infix) assignment operators. */
	const assigns=new Set([ "%=", "&=", "*=", "+=", "-=", "/=", "<<=", "=", ">>=", ">>>=", "^=", "|=" ]);

	/** case or default keywords, used to parse switch statements. */
	const caseOrDefaultKeywords=new Set([ "case", "default" ]);

	/** class, const, function, let or var keywords, used to parse a declaration. */
	const classConstFunctionLetOrVarKeywords=new Set([ "class", "const", "function", "let", "var" ]);

	/** const, let or var keywords, used to parse a for loop initializer. */
	const constLetOrVarKeywords=new Set([ "const", "let", "var" ]);

	/** infix operators. */
	const infixes6=new Set([ "!=", "!==", "==", "===" ]);
	const infixes7keywords=new Set([ "in", "instanceof" ]);
	const infixes7operators=new Set([ "<", "<=", ">", ">=" ]);
	const infixes8=new Set([ "<<", ">>", ">>>" ]);
	const infixes9=new Set([ "+", "-" ]);
	const infixes10=new Set([ "%", "*", "/" ]);

	/** in or of keywords, used to parse for each loop. */
	const inOrOfKeywords=new Set([ "in", "of" ]);

	/** checks if a character is an alpha [A..Z] or underscore or [a..z]. */
	function isalpha(c) { return c===36||c>=65&&c<=90||c===95||c>=97&&c<=122; }

	/** checks if a character is a digit [0..9]. */
	function isdigit(c) { return c>=48&&c<=57; }

	/** checks if a character is a valid member of an identifier (alpha or digit). */
	function isident(c) { return isalpha(c)||isdigit(c); }

	/** checks if a character is a whitespace (tab, newline, space). */
	function iswhite(c) { return c===9||c===10||c===32; }

	/* keywords, used in checkIdentifier to distinguish identifiers from keywords. */
	const keywords=new Set([
		"abstract", "boolean", "break", "byte",
		"case", "char", "class", "const", "continue",
		"debugger", "default", "do", "double",
		"else", "eval", "false", "finally", "float", "for", "function",
		"goto",
		"if", "implements", "in", "instanceof", "int", "interface",
		"let", "long",
		"new", "null",
		"package", "private", "protected", "public",
		"return", "short", "static", "switch", "synchronized",
		"this", "throw", "transient", "true", "try", "typeof",
		"var", "void", "volatile", "while", "with",
		"yield"
	]);

	/** keywords allowed as member name (after a dot). */
	const memberNameKeywords=new Set([ "for", "return", "this", "throw" ]);

	/** operands. */
	const operandKeywords=new Set([ "class", "false", "function", "null", "this", "true" ]);
	const operandPunctuators=new Set([ "[", "(", "{" ]);

	/** javascript operators. */
	const operators=newPunctuators(
		"!", "!=", "!==",
		"%", "%=",
		"&", "&&", "&=",
		"(", ")",
		"*", "**", "*=",
		"+", "++", "+=",
		",",
		"-", "--", "-=",
		".", "...",
		"/", "/=",
		":",
		";",
		"<", "<=", "<<", "<<=",
		"=", "==", "===", "=>",
		">", ">=", ">>", ">>=", ">>>", ">>>=",
		"?",
		"@",
		"[", "]",
		"^", "^=",
		"|", "|=", "||",
		"{", "}",
		"~"
	);

	/** postfix operators. */
	const postfixes=new Set([ "++", "--", "[", "(", "." ]);

	/** javascript punctuators. */
	const punctuators=newPunctuators(
		"!", "%", "&", "(", ")", "*", "+", ",", "-", ".", "...", "/", ":",
		";", "<", "=", ">", "?", "@", "[", "]", "^", "|", "{", "}", "~"
	);

	/** prefix operators. */
	const prefixKeywords=new Set([ "delete", "new", "typeof", "void" ]);
	const prefixOperators=new Set([ "!", "+", "++", "-", "--", "...", "~" ]);

	/** statements. */
	const statementsPunctuators=new Set([ ";", "{" ]);
	const statementsKeywords=new Set([ "break", "continue", "do", "for", "if", "return", "switch", "throw", "try", "while" ]);

	function unescapeString(string) {
		return string.replace(/\\"/g, "\"").replace(/\\'/g, "'").replace(/\\n/g, "\n").replace(/\\t/g, "\t");
	}

	const JavascriptParser={};

	JavascriptParser.parse=Object.freeze(function(sourceId, input) {

		const diagnostics=[];
		const lines=[ 0 ];
		let offset=0;
		const source=new Compiler.JavascriptTrees.Source(sourceId, diagnostics, lines, []);
		let trivias;

		try {
			scanTrivia();
			while((source.endOfInputToken=checkEndOfInput())===undefined)
				source.statementTrees.push(parseStatementOrDeclaration());
		} catch(e) {
			if(!(e instanceof JavascriptParser.SyntaxError))
				throw e;
			diagnostics.push(e.diagnostic);
		}
		return source;

		/*** helper functions. *** */

		function raise(expected) {
			throw new JavascriptParser.SyntaxError(new Compiler.newDiagnostic(sourceId, lines.length, offset, offset, "syntax error: expected "+expected));
		}

		/* instantiates and registers a new diagnostic. */
		function newDiagnostic(positionStart, positionEnd, message) {
			diagnostics.push(Compiler.newDiagnostic(sourceId, lines.length, positionStart, positionEnd, message));
		}

		/* *** scanner part. *** */

		function checkCharacter() {
			if(input.charCodeAt(offset)!==39) // '
				return undefined;
			for(const start=offset++; ; offset+=input.charCodeAt(offset)===92&&offset+1<input.length ? 2 : 1)
				if(offset>=input.length||input.charCodeAt(offset)===10) {
					newDiagnostic(start, offset, "syntax error: unterminated character constant");
					const text=input.substring(start, offset);
					const result=new Compiler.JavascriptTrees.Token.Character(source, trivias, lines.length, start, text, unescapeString(text.substring(1)));
					scanTrivia();
					return result;
				}
				else if(input.charCodeAt(offset)===39) { // '
					const text=input.substring(start, ++offset);
					const result=new Compiler.JavascriptTrees.Token.Character(source, trivias, lines.length, start, text, unescapeString(text.substring(1, text.length-1)));
					scanTrivia();
					return result;
				}
		}

		function checkEndOfInput() {
			if(offset<input.length)
				return undefined;
			return new Compiler.JavascriptTrees.Token.EndOfInput(source, trivias, lines.length, input.length, "", undefined);
		}

		function checkIdentifier() {
			if(!isalpha(input.charCodeAt(offset)))
				return undefined;
			let end=offset;
			while(isident(input.charCodeAt(++end)));
			const identifier=input.substring(offset, end);
			if(keywords.has(identifier))
				return undefined;
			const result=new Compiler.JavascriptTrees.Token.Identifier(source, trivias, lines.length, offset, identifier, undefined);
			offset=end;
			scanTrivia();
			return result;
		}

		function expectIdentifier() {
			const result=checkIdentifier();
			if(result!==undefined)
				return result;
			throw raise("<identifier>");
		}

		function checkKeyword(keyword) {
			if(!isalpha(input.charCodeAt(offset)))
				return undefined;
			let end=offset;
			while(isident(input.charCodeAt(++end)));
			if(keyword!==input.substring(end, offset))
				return undefined;
			const result=new Compiler.JavascriptTrees.Token.Keyword(source, trivias, lines.length, offset, keyword, undefined);
			offset=end;
			scanTrivia();
			return result;
		}

		function expectKeyword(value) {
			const result=checkKeyword(value);
			if(result!==undefined)
				return result;
			throw raise("'"+value+"'");
		}

		function checkKeywords(keywords) {
			if(!isalpha(input.charCodeAt(offset)))
				return undefined;
			let end=offset;
			while(isident(input.charCodeAt(++end)));
			const keyword=input.substring(end, offset);
			if(!keywords.has(keyword))
				return undefined;
			const result=new Compiler.JavascriptTrees.Token.Keyword(source, trivias, lines.length, offset, keyword, undefined);
			offset=end;
			scanTrivia();
			return result;
		}

		function checkNumber() {
			if(!isdigit(input.charCodeAt(offset)))
				return undefined;
			const start=offset;
			while(isident(input.charCodeAt(++offset)));
			if(input.charCodeAt(offset)===46) // .
				if(isalpha(input.charCodeAt(offset+1)))
					newDiagnostic(offset, offset, "syntax error: identifier starts immediately after numeric literal");
				else
					while(isident(input.charCodeAt(++offset)));
			const text=input.substring(start, offset);
			let value=undefined;
			try {
				value=JSON.parse(text);
			} catch(e) {
				newDiagnostic(start, offset, "invalid number");
			}
			const result=new Compiler.JavascriptTrees.Token.Number(source, trivias, lines.length, start, text, value);
			scanTrivia();
			return result;
		}

		function checkOperatorOrPunctuator(punctuators, value) {
			let index=0;
			for(; index<value.length; index+=1) {
				const c=input.charCodeAt(offset+index);
				if(c!==value.charCodeAt(index))
					return undefined;
				punctuators=punctuators.entries.get(c);
				if(punctuators===undefined)
					return undefined;
			}
			if(punctuators.value===undefined)
				return undefined;
			if(punctuators.entries.get(input.charCodeAt(offset+index))!==undefined)
				return undefined;
			const result=new Compiler.JavascriptTrees.Token.Punctuator(source, trivias, lines.length, offset, punctuators.value);
			offset+=index;
			scanTrivia();
			return result;
		}

		function checkOperatorsOrPunctuators(punctuators, values) {
			let entry=undefined;
			let index=0;
			for(; punctuators!==undefined; index+=1) {
				const c=input.charCodeAt(offset+index);
				if(punctuators.value!==undefined)
					entry=punctuators;
				punctuators=punctuators.entries.get(c);
			}
			if(entry===undefined||!values.has(entry.value))
				return undefined;
			const result=new Compiler.JavascriptTrees.Token.Punctuator(source, trivias, lines.length, offset, entry.value);
			offset+=entry.value.length;
			scanTrivia();
			return result;
		}

		function checkOperator(value) { return checkOperatorOrPunctuator(operators, value); }

		function expectOperator(value) {
			const result=checkOperatorOrPunctuator(operators, value);
			if(result!==undefined)
				return result;
			throw raise("'"+value+"'");
		}

		function checkOperators(values) { return checkOperatorsOrPunctuators(operators, values); }

		function checkPunctuator(value) { return checkOperatorOrPunctuator(punctuators, value); }

		function expectPunctuator(value) {
			const result=checkOperatorOrPunctuator(punctuators, value);
			if(result!==undefined)
				return result;
			throw raise("'"+value+"'");
		}

		function checkPunctuators(values) { return checkOperatorsOrPunctuators(punctuators, values); }

		function checkRegex() {
			if(input.charCodeAt(offset)!==47) // '
				return undefined;
			for(const start=offset++; ; offset+=input.charCodeAt(offset)===92&&offset+1<input.length ? 2 : 1)
				if(offset>input.length||input.charCodeAt(offset)===10) {
					newDiagnostic(start, input.length, "syntax error: unterminated regex constant");
					const result=new Compiler.JavascriptTrees.Token.Regex(source, trivias, lines.length, start, input.substring(start), undefined);
					scanTrivia();
					return result;
				}
				else if(input.charCodeAt(offset)===47) {
					const flags=offset;
					for(; input.charCodeAt(++offset)===103||input.charCodeAt(offset)===105||input.charCodeAt(offset)===109; ); // g or i or m
					let regex=undefined;
					try {
						regex=new RegExp(unescapeString(input.substring(start+1, flags)), unescapeString(input.substring(flags+1, offset)));
					} catch(e) {
						newDiagnostic(start, offset, e.message);
					}
					const result=new Compiler.JavascriptTrees.Token.Regex(source, trivias, lines.length, start, input.substring(start, offset), regex);
					scanTrivia();
					return result;
				}
		}

		function checkString() {
			if(input.charCodeAt(offset)!==34) // "
				return undefined;
			for(const start=offset++; ; offset+=input.charCodeAt(offset)===92&&offset+1<input.length ? 2 : 1)
				if(offset>=input.length||input.charCodeAt(offset)===10) {
					newDiagnostic(start, offset, "syntax error: unterminated string constant");
					const text=input.substring(start, offset);
					const result=new Compiler.JavascriptTrees.Token.String(source, trivias, lines.length, start, text, unescapeString(input.substring(start+1, offset)));
					scanTrivia();
					return result;
				}
				else if(input.charCodeAt(offset)===34) {
					const text=input.substring(start, ++offset);
					const result=new Compiler.JavascriptTrees.Token.String(source, trivias, lines.length, start, text, unescapeString(input.substring(start+1, offset-1)));
					scanTrivia();
					return result;
				}
		}

		function scanTrivia() {
			trivias=[];
			trivia: while(offset<input.length) {
				const start=offset;
				white: while(offset<input.length)
					switch(input.charCodeAt(offset)) {
					case 10: // newline
						lines.push(++offset);
						continue white;
					case 9: // tab
					case 32: // space
						offset+=1;
						continue white;
					default:
						break white;
					}
				if(start!==offset)
					trivias.push({ kind:"white", text:input.substring(start, offset) });
				switch(input.charCodeAt(offset)) {
				case 47: // /
					switch(input.charCodeAt(offset+1)) {
					case 42: // *
						const startn=offset+=2;
						for(; offset<input.length; offset+=1)
							if(input.charCodeAt(offset)===42&&input.charCodeAt(offset+1)===47) {
								trivias.push({ kind:"comment-n", text:input.substring(startn, offset) });
								offset+=2;
								continue trivia;
							}
							else if(input.charCodeAt(offset)===10)
								lines.push(offset+1);
						newDiagnostic(startn, offset, "syntax error: unterminated comment");
						trivias.push({ kind:"comment-n", text:input.substring(startn, offset) });
						continue trivia;
					case 47: // /
						const start1=offset+=2;
						for(; offset<input.length&&input.charCodeAt(offset)!==10; offset+=1);
						trivias.push({ kind:"comment-1", text:input.substring(start1, offset) });
						continue trivia;
					}
				default:
					return;
				}
			}
		}

		/* *** parser part. *** */

		function parseAnnotations() {
			const annotationTrees=[];
			for(let atToken; (atToken=checkPunctuator("@"))!==undefined; )
				annotationTrees.push(new Compiler.JavascriptTrees.Annotation(atToken, expectIdentifier()));
			return Object.freeze(annotationTrees);
		}

		function parseBlock(labelTrees, openCurlyToken) {
			const statementTrees=[];
			let closeCurlyToken;
			while((closeCurlyToken=checkPunctuator("}"))===undefined)
				statementTrees.push(parseStatementOrDeclaration());
			return new Compiler.JavascriptTrees.Block(labelTrees, openCurlyToken, statementTrees, closeCurlyToken);
		}

		function parseClassExtendsClause() {
			const extendsToken=checkKeyword("extends");
			return extendsToken!==undefined ? new Compiler.JavascriptTrees.ExtendsClause(extendsToken, parseExpression()) : undefined;
		}

		function parseClassMembers() {
			const memberTrees=[];
			while(true) {
				const annotationTrees=parseAnnotations();
				const annotationsTree=annotationTrees.length!==0 ? new Compiler.JavascriptTrees.Annotations(annotationTrees) : undefined;
				const staticToken=checkKeyword("static");
				let keywordToken=checkKeywords(memberNameKeywords);
				const nameToken=keywordToken!==undefined ? keywordToken : annotationsTree!==undefined||staticToken!==undefined ? expectIdentifier() : checkIdentifier();
				if(nameToken===undefined)
					return memberTrees;
				memberTrees.push(new Compiler.JavascriptTrees.Method(
					annotationsTree,
					staticToken,
					nameToken,
					parseFunctionParameters(expectPunctuator("(")),
					parseBlock(undefined, expectPunctuator("{"))
				));
			}
		}

		function parseConstDeclarators(annotationsTree, keywordToken, nameToken) {
			const result=[];
			result.push(new Compiler.JavascriptTrees.Declarator.Const(undefined, nameToken, parseDeclaratorInitializer()));
			for(let precedingCommaToken; (precedingCommaToken=checkPunctuator(","))!==undefined; )
				result.push(new Compiler.JavascriptTrees.Declarator.Const(precedingCommaToken, expectIdentifier(), parseDeclaratorInitializer()));
			return new Compiler.JavascriptTrees.Variables(annotationsTree, keywordToken, Object.freeze(result), expectPunctuator(";"))
		}

		function parseLetDeclarators(annotationsTree, keywordToken, nameToken) {
			const result=[];
			result.push(new Compiler.JavascriptTrees.Declarator.Let(undefined, nameToken, parseDeclaratorInitializer()));
			for(let precedingCommaToken; (precedingCommaToken=checkPunctuator(","))!==undefined; )
				result.push(new Compiler.JavascriptTrees.Declarator.Let(precedingCommaToken, expectIdentifier(), parseDeclaratorInitializer()));
			return new Compiler.JavascriptTrees.Variables(annotationsTree, keywordToken, Object.freeze(result), expectPunctuator(";"))
		}

		function parseVarDeclarators(annotationsTree, keywordToken, nameToken) {
			const result=[];
			result.push(new Compiler.JavascriptTrees.Declarator.Var(undefined, nameToken, parseDeclaratorInitializer()));
			for(let precedingCommaToken; (precedingCommaToken=checkPunctuator(","))!==undefined; )
				result.push(new Compiler.JavascriptTrees.Declarator.Var(precedingCommaToken, expectIdentifier(), parseDeclaratorInitializer()));
			return new Compiler.JavascriptTrees.Variables(annotationsTree, keywordToken, Object.freeze(result), expectPunctuator(";"))
		}

		function parseDeclaratorInitializer() {
			const assignToken=checkPunctuator("=");
			return assignToken!==undefined ? new Compiler.JavascriptTrees.Initializer(assignToken, parseExpressionAssign()) : undefined;
		}

		function parseExpression(operand) {
			const tree=parseExpressionAssign(operand);
			const operatorToken=checkPunctuator(",");
			return operatorToken===undefined ? tree : new Compiler.JavascriptTrees.Expression.Infix(tree, operatorToken, parseExpression());
		}

		function parseExpressionAssign(operand) {
			let result=parseExpressionTernary(operand);
			const token=checkOperators(assigns);
			return token===undefined ? result : new Compiler.JavascriptTrees.Expression.Assign(result, token, parseExpressionAssign());
		}

		function parseExpressionTernary(operand) {
			const conditionTree=parseExpressionInfix1(operand);
			const token=checkPunctuator("?");
			return token==undefined
				? conditionTree
				: new Compiler.JavascriptTrees.Expression.Ternary(conditionTree, token, parseExpressionTernary(), expectPunctuator(":"), parseExpressionTernary());
		}

		function parseExpressionInfix1(operand) {
			let tree=parseExpressionInfix2(operand);
			for(let operatorToken; (operatorToken=checkOperator("||"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.InfixLogicalOr(tree, operatorToken, parseExpressionInfix2());
			return tree;
		}

		function parseExpressionInfix2(operand) {
			let tree=parseExpressionInfix3(operand);
			for(let operatorToken; (operatorToken=checkOperator("&&"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.InfixLogicalAnd(tree, operatorToken, parseExpressionInfix3());
			return tree;
		}

		function parseExpressionInfix3(operand) {
			let tree=parseExpressionInfix4(operand);
			for(let operatorToken; (operatorToken=checkOperator("|"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, operatorToken, parseExpressionInfix4());
			return tree;
		}

		function parseExpressionInfix4(operand) {
			let tree=parseExpressionInfix5(operand);
			for(let operatorToken; (operatorToken=checkOperator("^"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, operatorToken, parseExpressionInfix5());
			return tree;
		}

		function parseExpressionInfix5(operand) {
			let tree=parseExpressionInfix6(operand);
			for(let operatorToken; (operatorToken=checkOperator("&"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, operatorToken, parseExpressionInfix6());
			return tree;
		}

		function parseExpressionInfix6(operand) {
			let tree=parseExpressionInfix7(operand);
			for(let token; (token=checkOperators(infixes6))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix7());
			return tree;
		}

		function parseExpressionInfix7(operand) {
			let tree=parseExpressionInfix8(operand);
			for(let token; ; )
				if((token=checkOperators(infixes7operators))!==undefined)
					tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix8());
				else if((token=checkKeywords(infixes7keywords))!==undefined)
					tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix8());
				else
					return tree;
		}

		function parseExpressionInfix8(operand) {
			let tree=parseExpressionInfix9(operand);
			for(let token; (token=checkOperators(infixes8))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix9());
			return tree;
		}

		function parseExpressionInfix9(operand) {
			let tree=parseExpressionInfix10(operand);
			for(let token; (token=checkOperators(infixes9))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix10());
			return tree;
		}

		function parseExpressionInfix10(operand) {
			let tree=parseExpressionInfix11(operand);
			for(let token; (token=checkOperators(infixes10))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, token, parseExpressionInfix11());
			return tree;
		}

		function parseExpressionInfix11(operand) {
			let tree=operand!==undefined ? operand : parseExpressionPrefix();
			for(let operatorToken; (operatorToken=checkOperator("**"))!==undefined; )
				tree=new Compiler.JavascriptTrees.Expression.Infix(tree, operatorToken, parseExpressionPrefix());
			return tree;
		}

		function parseExpressionPrefix() {
			let token;
			if((token=checkOperators(prefixOperators))!==undefined)
				switch(token.text) {
				case "!":
					return new Compiler.JavascriptTrees.Expression.PrefixLogicalNot(token, parseExpressionPrefix());
				case "+":
					return new Compiler.JavascriptTrees.Expression.PrefixIdentity(token, parseExpressionPrefix());
				case "-":
					return new Compiler.JavascriptTrees.Expression.PrefixNegate(token, parseExpressionPrefix());
				case "...":
					return new Compiler.JavascriptTrees.Expression.PrefixSpread(token, parseExpressionPrefix());
				case "~":
					return new Compiler.JavascriptTrees.Expression.PrefixBitwiseNot(token, parseExpressionPrefix());
				case "++":
					return new Compiler.JavascriptTrees.Expression.PrefixIncrement(token, parseExpressionPrefix());
				case "--":
					return new Compiler.JavascriptTrees.Expression.PrefixDecrement(token, parseExpressionPrefix());
			}
			if((token=checkKeywords(prefixKeywords))!==undefined)
				switch(token.text) {
				case "delete":
					return new Compiler.JavascriptTrees.Expression.PrefixDelete(token, parseExpressionPrefix());
				case "new":
					let operand=parseExpressionOperand();
					for(let dotToken; (dotToken=checkPunctuator("."))!==undefined; ) {
						let keywordToken=checkKeywords(memberNameKeywords);
						operand=keywordToken!==undefined
							? new Compiler.JavascriptTrees.Expression.MemberAccess(operand, dotToken, keywordToken)
							: new Compiler.JavascriptTrees.Expression.MemberAccess(operand, dotToken, expectIdentifier());
					}
					const openParenthesisToken=checkPunctuator("(");
					if(openParenthesisToken===undefined)
						return parseExpressionPostfix(new Compiler.JavascriptTrees.Expression.PrefixNew(token, operand));
					const closeParenthesisToken=checkPunctuator(")");
					operand=closeParenthesisToken!==undefined
						? new Compiler.JavascriptTrees.Expression.PrefixNewInvocation(token, operand, openParenthesisToken, undefined, closeParenthesisToken)
						: new Compiler.JavascriptTrees.Expression.PrefixNewInvocation(token, operand, openParenthesisToken, parseExpression(), expectPunctuator(")"));
					return parseExpressionPostfix(operand);
				case "typeof":
					return new Compiler.JavascriptTrees.Expression.PrefixTypeOf(token, parseExpressionPrefix());
				case "void":
					return new Compiler.JavascriptTrees.Expression.PrefixVoid(token, parseExpressionPrefix());
				}
			return parseExpressionPostfix(parseExpressionOperand());
		}

		function parseExpressionPostfix(result) {
			for(let token; ; ) {
				if((token=checkOperators(postfixes))!==undefined)
					switch(token.text) {
					default:
					case "++":
						result=new Compiler.JavascriptTrees.Expression.Postfix(result, token);
						continue;
					case "--":
						result=new Compiler.JavascriptTrees.Expression.Postfix(result, token);
						continue;
					case "[":
						result=new Compiler.JavascriptTrees.Expression.ArrayAccess(result, token, parseExpression(), expectPunctuator("]"));
						continue;
					case "(":
						const closeParenthesisToken=checkPunctuator(")");
						result=closeParenthesisToken!==undefined
							? new Compiler.JavascriptTrees.Expression.Invocation(result, token, undefined, closeParenthesisToken)
							: new Compiler.JavascriptTrees.Expression.Invocation(result, token, parseExpression(), expectPunctuator(")"));
						continue;
					case ".":
						let keywordToken=checkKeywords(memberNameKeywords);
						result=keywordToken!==undefined
							? new Compiler.JavascriptTrees.Expression.MemberAccess(result, token, keywordToken)
							: new Compiler.JavascriptTrees.Expression.MemberAccess(result, token, expectIdentifier());
						continue;
					}
				return result;
			}
		}

		function parseExpressionLambdaBody() {
			const openCurlyToken=checkPunctuator("{");
			return openCurlyToken!==undefined ? parseBlock(undefined, openCurlyToken) : parseExpressionAssign();
		}

		function parseExpressionOperand() {
			let token;
			if((token=checkCharacter())!==undefined)
				return new Compiler.JavascriptTrees.Expression.Literal(token, token.value);
			if((token=checkIdentifier())!==undefined)
				return parseExpressionLambdaOrScopeAccess(token);
			if((token=checkNumber())!==undefined)
				return new Compiler.JavascriptTrees.Expression.Literal(token, token.value);
			if((token=checkRegex())!==undefined)
				return new Compiler.JavascriptTrees.Expression.Literal(token, token.value);
			if((token=checkString())!==undefined)
				return new Compiler.JavascriptTrees.Expression.Literal(token, token.value);
			if((token=checkPunctuators(operandPunctuators))!==undefined)
				switch(token.text) {
				case "[":
					return parseExpressionArrayLiteral(token);
				case "(":
					return parseExpressionLambdaOrParenthesized(token);
				case "{":
					return parseExpressionObjectLiteral(token);
				}
			if((token=checkKeywords(operandKeywords))!==undefined)
				switch(token.text) {
				case "class":
					return new Compiler.JavascriptTrees.Expression.Class(
						token,
						checkIdentifier(),
						parseClassExtendsClause(),
						expectPunctuator("{"),
						parseClassMembers(),
						expectPunctuator("}")
					);
				case "false":
					return new Compiler.JavascriptTrees.Expression.Literal(token, false);
				case "function":
					return new Compiler.JavascriptTrees.Expression.Function(
						token,
						checkIdentifier(),
						parseFunctionParameters(expectPunctuator("(")),
						parseBlock(undefined, expectPunctuator("{"))
					);
				case "null":
					return new Compiler.JavascriptTrees.Expression.Literal(token, null);
				case "this":
					return new Compiler.JavascriptTrees.Expression.ScopeAccess(token);
				case "true":
					return new Compiler.JavascriptTrees.Expression.Literal(token, true);
				}
			raise("<operand>");
		}

		function parseExpressionArrayLiteral(token) {
			let closeSquareToken=checkPunctuator("]");
			return closeSquareToken!==undefined
				? new Compiler.JavascriptTrees.Expression.ArrayLiteral(token, undefined, closeSquareToken)
				: new Compiler.JavascriptTrees.Expression.ArrayLiteral(token, parseExpression(), expectPunctuator("]"));
		}

		function parseExpressionLambdaOrParenthesized(token) {
			let closeParenthesisToken;
			if((closeParenthesisToken=checkPunctuator(")"))!==undefined)
				return new Compiler.JavascriptTrees.Expression.Lambda(
					new Compiler.JavascriptTrees.FunctionParameters(token, [], undefined, closeParenthesisToken),
					expectOperator("=>"),
					parseExpressionLambdaBody()
				);
			const expressionTree=parseExpression();
			closeParenthesisToken=expectPunctuator(")");
			const arrowToken=checkOperator("=>");
			return arrowToken!==undefined
				? new Compiler.JavascriptTrees.Expression.Lambda(
					new Compiler.JavascriptTrees.FunctionParameters(token, parseExpressionLambdaParameters(expressionTree, arrowToken), undefined, closeParenthesisToken),
					arrowToken,
					parseExpressionLambdaBody()
				)
				: new Compiler.JavascriptTrees.Expression.Parenthesized(token, expressionTree, closeParenthesisToken);
		}

		function parseExpressionLambdaOrScopeAccess(identifierToken) {
			const arrowToken=checkOperator("=>");
			if(arrowToken!==undefined)
				return new Compiler.JavascriptTrees.Expression.Lambda(
					new Compiler.JavascriptTrees.LambdaParameter(identifierToken),
					arrowToken,
					parseExpressionLambdaBody()
				);
			return new Compiler.JavascriptTrees.Expression.ScopeAccess(identifierToken);
		}

		function parseExpressionLambdaParameters(expressionTree, arrowToken) {
			const parameterTrees=[];
			let precedingCommaToken=undefined;
			while(expressionTree.kind()==="infix"&&expressionTree.operatorToken.text===",") {
				if(expressionTree.leftOperandTree.kind()!=="scope-access") {
					const offset=arrowToken.offset;
					throw new JavascriptParser.SyntaxError(Compiler.newDiagnostic(
						source, lines.length, offset, offset+arrowToken.text.length, "syntax error: invalid lambda parameters"
					));
				}
				parameterTrees.push(new Compiler.JavascriptTrees.FunctionParameter(
					precedingCommaToken, undefined, expressionTree.leftOperandTree.nameToken
				));
				precedingCommaToken=expressionTree.operatorToken;
				expressionTree=expressionTree.rightOperandTree;
			}
			if(expressionTree.kind()!=="scope-access") {
				const offset=arrowToken.offset;
				throw new JavascriptParser.SyntaxError(Compiler.newDiagnostic(
					source, lines.length, offset, offset+arrowToken.text.length, "syntax error: invalid lambda parameters"
				));
			}
			parameterTrees.push(new Compiler.JavascriptTrees.FunctionParameter(
				precedingCommaToken, undefined, expressionTree.nameToken
			));
			return parameterTrees;
		}

		function parseExpressionObjectLiteral(token) {
			const closeCurlyToken=checkPunctuator("}");
			if(closeCurlyToken!==undefined)
				return new Compiler.JavascriptTrees.Expression.ObjectLiteral(token, [], closeCurlyToken);
			const memberTrees=[];
			let precedingCommaToken=undefined;
			do
				memberTrees.push(parseExpressionObjectLiteralMember(precedingCommaToken));
			while((precedingCommaToken=checkPunctuator(","))!==undefined);
			return new Compiler.JavascriptTrees.Expression.ObjectLiteral(token, memberTrees, expectPunctuator("}"));
		}

		function parseExpressionObjectLiteralMember(precedingCommaToken) {
			let token;
			if((token=checkIdentifier())!==undefined) {
				const openParenthesisToken=checkPunctuator("(");
				return openParenthesisToken!==undefined
					? new Compiler.JavascriptTrees.ObjectLiteralExpressionMethod(
						precedingCommaToken,
						token,
						parseFunctionParameters(openParenthesisToken),
						parseBlock(undefined, expectPunctuator("{"))
					)
					: Compiler.JavascriptTrees.newObjectLiteralExpressionIdentifierKeyPair(precedingCommaToken, token, expectPunctuator(":"), parseExpressionAssign());
			}
			if((token=checkNumber())!==undefined)
				return Compiler.JavascriptTrees.newObjectLiteralExpressionNumberKeyPair(precedingCommaToken, token, expectPunctuator(":"), parseExpressionAssign());
			if((token=checkString())!==undefined)
				return Compiler.JavascriptTrees.newObjectLiteralExpressionStringKeyPair(precedingCommaToken, token, expectPunctuator(":"), parseExpressionAssign());
			if((token=checkPunctuator("["))!==undefined)
				return new Compiler.JavascriptTrees.ObjectLiteralExpressionComputedKeyPair(
					precedingCommaToken,
					token,
					parseExpression(),
					expectPunctuator("]"),
					expectPunctuator(":"),
					parseExpressionAssign()
				);
			raise("<identifier>, <number>, <string> or '['");
		}

		function parseFunctionParameters(openParenthesisToken) {
			const parameterTrees=[];
			let variadicTree=undefined;
			let closeParenthesisToken=checkPunctuator(")");
			if(closeParenthesisToken===undefined) {
				let precedingCommaToken=undefined;
				do {
					const variadicToken=checkPunctuator("...");
					if(variadicToken!==undefined) {
						variadicTree={
							precedingCommaToken:precedingCommaToken,
							variadicToken:variadicToken,
							typeTree:parseType()
						};
						break;
					}
					parameterTrees.push(new Compiler.JavascriptTrees.FunctionParameter(
						precedingCommaToken, parseAnnotations(), expectIdentifier()
					));
				} while((precedingCommaToken=checkPunctuator(","))!==undefined);
				closeParenthesisToken=expectPunctuator(")");
			}
			return new Compiler.JavascriptTrees.FunctionParameters(openParenthesisToken, parameterTrees, variadicTree, closeParenthesisToken);
		}

		function parseStatement() {
			let labelTrees=undefined;
			for(let token; ; ) {
				if((token=checkPunctuators(statementsPunctuators))!==undefined)
					switch(token.text) {
					case ";":
						return new Compiler.JavascriptTrees.Empty(Compiler.JavascriptTrees.newLabels(labelTrees), token);
					case "{":
						return parseBlock(Compiler.JavascriptTrees.newLabels(labelTrees), token);
					}
				if((token=checkKeywords(statementsKeywords))!==undefined)
					switch(token.text) {
					case "break":
						return new Compiler.JavascriptTrees.Statement.Break(Compiler.JavascriptTrees.newLabels(labelTrees), token, checkIdentifier(), expectPunctuator(";"));
					case "continue":
						return new Compiler.JavascriptTrees.Statement.Continue(Compiler.JavascriptTrees.newLabels(labelTrees), token, checkIdentifier(), expectPunctuator(";"));
					case "do":
						return new Compiler.JavascriptTrees.Statement.Do(
							Compiler.JavascriptTrees.newLabels(labelTrees),
							token,
							parseStatement(),
							expectKeyword("while"),
							expectPunctuator("("),
							parseExpression(),
							expectPunctuator(")"),
							expectPunctuator(";")
						);
					case "for":
						return parseStatementForOrForEach(Compiler.JavascriptTrees.newLabels(labelTrees), token, expectPunctuator("("));
					case "if":
						return new Compiler.JavascriptTrees.Statement.If(
							Compiler.JavascriptTrees.newLabels(labelTrees),
							token,
							expectPunctuator("("),
							parseExpression(),
							expectPunctuator(")"),
							parseStatement(),
							parseStatementIfElseClause()
						);
					case "return":
						return parseStatementReturn(Compiler.JavascriptTrees.newLabels(labelTrees), token);
					case "switch":
						return parseStatementSwitch(Compiler.JavascriptTrees.newLabels(labelTrees), token);
					case "throw":
						return new Compiler.JavascriptTrees.Statement.Throw(Compiler.JavascriptTrees.newLabels(labelTrees), token, parseExpression(), expectPunctuator(";"));
					case "try":
						return parseStatementTry(Compiler.JavascriptTrees.newLabels(labelTrees), token);
					case "while":
						return new Compiler.JavascriptTrees.Statement.While(
							Compiler.JavascriptTrees.newLabels(labelTrees),
							token,
							expectPunctuator("("),
							parseExpression(),
							expectPunctuator(")"),
							parseStatement()
						);
					}
				const expression=parseExpression();
				const colonToken=checkPunctuator(":");
				if(colonToken===undefined)
					return new Compiler.JavascriptTrees.Statement.Expression(Compiler.JavascriptTrees.newLabels(labelTrees), expression, expectPunctuator(";"));
				if(expression.kind()==="scope-access") {
					if(labelTrees===undefined)
						labelTrees=[];
					labelTrees.push(new Compiler.JavascriptTrees.Label(expression.nameToken, colonToken));
					continue;
				}
				throw new JavascriptParser.SyntaxError(Compiler.newDiagnostic(
					sourceId, lines.length, colonToken.offset, colonToken.offset+1, "syntax error: expected ';'"
				));
			}
		}

		function parseStatementFor(labelTrees, forToken, openParenthesisToken, initializerTree) {
			let conditionTree;
			let semicolonToken=checkPunctuator(";");
			if(semicolonToken===undefined) {
				conditionTree=parseExpression();
				semicolonToken=expectPunctuator(";");
			}
			let incrementTree;
			let closeParenthesisToken=checkPunctuator(")");
			if(closeParenthesisToken===undefined) {
				incrementTree=parseExpression();
				closeParenthesisToken=expectPunctuator(")");
			}
			return new Compiler.JavascriptTrees.Statement.For(
				labelTrees,
				forToken,
				openParenthesisToken,
				initializerTree,
				conditionTree,
				semicolonToken,
				incrementTree,
				closeParenthesisToken,
				parseStatement()
			);
		}

		function parseStatementForOrForEach(labelTrees, forToken, openParenthesisToken) {
			let token;
			if((token=checkPunctuator(";"))!==undefined)
				return parseStatementFor(labelTrees, forToken, openParenthesisToken, new Compiler.JavascriptTrees.Empty(undefined, token));
			if((token=checkKeywords(constLetOrVarKeywords))!==undefined) {
				const nameToken=expectIdentifier();
				const operatorToken=checkKeywords(inOrOfKeywords);
				if(operatorToken!==undefined)
					return new Compiler.JavascriptTrees.Statement.ForEach(
						labelTrees,
						forToken,
						openParenthesisToken,
						token,
						nameToken,
						operatorToken,
						parseExpression(),
						expectPunctuator(")"),
						parseStatement()
					);
				switch(token.text) {
				case "const":
					return parseStatementFor(
						labelTrees,
						forToken,
						openParenthesisToken,
						parseConstDeclarators(undefined, token, nameToken)
					);
				case "let":
					return parseStatementFor(
						labelTrees,
						forToken,
						openParenthesisToken,
						parseLetDeclarators(undefined, token, nameToken)
					);
				case "var":
					return parseStatementFor(
						labelTrees,
						forToken,
						openParenthesisToken,
						parseVarDeclarators(undefined, token, nameToken)
					);
				}
			}
			const identifierToken=checkIdentifier();
			if((token=checkKeywords(inOrOfKeywords))!==undefined)
				return new Compiler.JavascriptTrees.Statement.ForEach(
					labelTrees,
					forToken,
					openParenthesisToken,
					undefined,
					identifierToken,
					token,
					parseExpression(),
					expectPunctuator(")"),
					parseStatement()
				);
			return parseStatementFor(
				labelTrees,
				forToken,
				openParenthesisToken,
				new Compiler.JavascriptTrees.Statement.Expression(
					undefined,
					parseExpression(new Compiler.JavascriptTrees.Expression.ScopeAccess(identifierToken)),
					expectPunctuator(";")
				)
			);
		}

		function parseStatementIfElseClause() {
			const token=checkKeyword("else");
			return token===undefined ? undefined : { elseToken:token, statementTree:parseStatement() };
		}

		function parseStatementReturn(labelTrees, token) {
			const semicolonToken=checkPunctuator(";");
			return semicolonToken!==undefined
				? new Compiler.JavascriptTrees.Statement.Return(labelTrees, token, undefined, semicolonToken)
				: new Compiler.JavascriptTrees.Statement.Return(labelTrees, token, parseExpression(), expectPunctuator(";"));
		}

		function parseStatementOrDeclaration() {
			const annotationTrees=parseAnnotations();
			const annotationsTree=annotationTrees.length!==0 ? new Compiler.JavascriptTrees.Annotations(annotationTrees) : undefined;
			const token=checkKeywords(classConstFunctionLetOrVarKeywords);
			if(token!==undefined)
				switch(token.text) {
				case "class":
					return new Compiler.JavascriptTrees.Statement.Class(
						annotationsTree,
						token,
						expectIdentifier(),
						parseClassExtendsClause(),
						expectPunctuator("{"),
						parseClassMembers(),
						expectPunctuator("}")
					);
				case "const":
					return parseConstDeclarators(annotationsTree, token, expectIdentifier());
				case "function":
					return new Compiler.JavascriptTrees.Statement.Function(
						annotationsTree,
						token,
						expectIdentifier(),
						parseFunctionParameters(expectPunctuator("(")),
						parseBlock(undefined, expectPunctuator("{"))
					);
				case "let":
					return parseLetDeclarators(annotationsTree, token, expectIdentifier());
				case "var":
					return parseVarDeclarators(annotationsTree, token, expectIdentifier());
				}
			return parseStatement();
		}

		function parseStatementSwitch(labelTrees, switchToken) {
			const openParenthesisToken=expectPunctuator("(");
			const conditionTree=parseExpression();
			const closeParenthesisToken=expectPunctuator(")");
			const openCurlyToken=expectPunctuator("{");
			const caseTrees=[];
			let closeCurlyToken;
			for(let currentCaseTree=undefined; (closeCurlyToken=checkPunctuator("}"))===undefined; ) {
				const keywordToken=checkKeywords(caseOrDefaultKeywords);
				if(keywordToken!==undefined)
					switch(keywordToken.text) {
					case "case":
						caseTrees.push(currentCaseTree=new Compiler.JavascriptTrees.CaseClause(
							keywordToken, parseExpression(), expectPunctuator(":"), []
						));
						continue;
					case "default":
						caseTrees.push(currentCaseTree=new Compiler.JavascriptTrees.CaseClause(
							keywordToken, undefined, expectPunctuator(":"), []
						));
						continue;
					}
				if(currentCaseTree===undefined)
					throw "illegal statement outside 'case' or 'default'";
				currentCaseTree.statementTrees.push(parseStatementOrDeclaration());
			}
			return new Compiler.JavascriptTrees.Statement.Switch(
				labelTrees,
				switchToken,
				openParenthesisToken,
				conditionTree,
				closeParenthesisToken,
				openCurlyToken,
				caseTrees,
				closeCurlyToken
			);
		}

		function parseStatementTry(labelTrees, token) {
			const blockTree=parseBlock(undefined, expectPunctuator("{"));
			const catchToken=checkKeyword("catch");
			const catchClauseTree=catchToken!==undefined
				? new Compiler.JavascriptTrees.CatchClause(
					catchToken,
					expectPunctuator("("),
					expectIdentifier(),
					parseType(),
					expectPunctuator(")"),
					parseBlock(undefined, expectPunctuator("{"))
				)
				: undefined;
			const finallyToken=checkKeyword("finally");
			const finallyClauseTree=finallyToken!==undefined
				? { finallyToken:finallyToken, blockTree:parseBlock(undefined, expectPunctuator("{")) }
				: undefined;
			return new Compiler.JavascriptTrees.Statement.Try(labelTrees, token, blockTree, catchClauseTree, finallyClauseTree);
		}

		function parseType() {
			const colonToken=checkPunctuator(":");
			return colonToken===undefined ? undefined : new Compiler.JavascriptTrees.Type(colonToken, expectIdentifier());
		}

	});

	JavascriptParser.SyntaxError=Object.freeze(class SyntaxError extends Error {

		constructor(diagnostic) {
			super(diagnostic.message);
			this.diagnostic=diagnostic;
		}

	});

	return Object.freeze(JavascriptParser);

}
