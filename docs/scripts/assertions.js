"use strict";

const Assertions=Object.freeze({
	assertError:function(expression, expected) {
		try {
			expression();
		} catch(e) {
			Assertions.assertEqual(e.message, expected);
			return;
		}
		throw new Error("expected '"+expected+"'; got no exception");
	},
	assertEqual:function(actual, expected) {
		if(actual!==expected)
			throw new Error("expected '"+expected+"'; got '"+actual+"'");
	},
	assertFalse:function(actual) {
		if(actual!==false)
			throw new Error("expected 'false'; got '"+actual+"'");
	},
	assertTrue:function(actual) {
		if(actual!==true)
			throw new Error("expected 'true'; got '"+actual+"'");
	},
	assertUndefined:function(actual) {
		if(actual!==undefined)
			throw new Error("expected 'undefined'; got '"+actual+"'");
	},
	fail:function(message) { throw new Error(message); }
});

const Tests=function() {
	let errors=0;
	const tests=[];
	return Object.freeze({
		run:function(testFunction) {
			const start=performance.now();
			try {
				testFunction();
				tests.push({ name:testFunction.name, duration:performance.now()-start, status:"pass" });
			} catch(e) {
				tests.push({ name:testFunction.name, duration:performance.now()-start, status:"fail", cause:e });
				errors+=1;
				console.log("in test "+testFunction.name+": "+e);
				console.log(e);
			}
		},
		result:function() {
			console.log("ran "+tests.length+" test(s) and terminated with "+errors+" error(s)");
		}
	});
}();

function assertDiagnostics(result) {
	const diagnostics=result.diagnostics;
	let index=0;
	return {
		assertDiagnostic:function(offsetStart, offsetEnd, message) {
			if(index>=diagnostics.length)
				throw new Error("diagnostic was not reported");
			Assertions.assertEqual(diagnostics[index].sourceId, "sourceId");
			if(offsetStart!==undefined)
				Assertions.assertEqual(diagnostics[index].positionStart, offsetStart);
			if(offsetEnd!==undefined)
				Assertions.assertEqual(diagnostics[index].positionEnd, offsetEnd);
			Assertions.assertEqual(diagnostics[index++].message, message);
			return this;
		},
		assertNoMoreDiagnostic:function() {
			if(diagnostics.length!==index)
				throw new Error("expected at least '"+diagnostics[index].message+"'");
			return result;
		}
	};
}
