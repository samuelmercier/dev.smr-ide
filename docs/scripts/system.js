"use strict";

function defineSystem(entrypoint) {

	window.onclick=function(event) {
		if(popup!==undefined) {
			document.body.removeChild(popup);
			popup=undefined;
		}
	};
	window.onkeydown=function(event) {
		/* prevents default behavior for ctrl+s */
		if(event.ctrlKey&&(event.which===83||event.which===115)) {
			event.preventDefault();
			return false;
		}
	};
	window.onload=function(event) { entrypoint(); };

	let entry=undefined;
	let popup=undefined;
	const System={
		gui:{
			components:{
				newTable:function(descriptor) {

					function refresh() {
						for(let i=0; i<values.length; i+=1) {
							const entry=values[i];
							let rowElement=elements.container.childNodes[i];
							if(rowElement===undefined) {
								rowElement=System.gui.createElement("div", "row");
								elements.container.appendChild(rowElement);
							}
							rowElement.onclick=function(event) {
								if(descriptor.onselect)
									descriptor.onselect(entry);
							};
							for(let j=0; j<descriptor.columns.length; j+=1) {
								let cellElement=rowElement.childNodes[j];
								if(cellElement===undefined) {
									cellElement=System.gui.createElement("div", "cell");
									cellElement.style.width=elements.header.childNodes[j].offsetWidth+"px";
									rowElement.appendChild(cellElement);
								}
								cellElement.textContent=descriptor.columns[j].initializer(entry);
							}
						}
						while(elements.container.childNodes.length>values.length)
							elements.container.removeChild(elements.container.lastChild);
					}

					const elements={};
					let values=[];
					let selectedIndex=-1;
					elements.element=System.gui.createElement("div", "UITable", undefined,
						elements.header=System.gui.createElement("div", "header"),
						elements.container=System.gui.createElement("div", "container")
					);
					elements.element.oncontextmenu=function(event) { return false; };
					elements.container.onscroll=function() { elements.header.scrollLeft=elements.container.scrollLeft; };
					return {
						refresh:function(values2) {
							values=values2;
							if(elements.element.parentElement!==null)
								refresh();
						},
						setParentElement:function(parentElement) {
							if(parentElement!==null) {
								parentElement.appendChild(elements.element);
								for(const column of descriptor.columns) {
									const columnElement=System.gui.createElement("div", "column", undefined,
										document.createTextNode(column.title)
									);
									columnElement.style.width=column.width;
									elements.header.appendChild(columnElement);
								}
								elements.element.style.paddingTop=elements.header.offsetHeight+"px";
								refresh(values);
								return;
							}
							while(elements.header.lastChild!==null)
								elements.header.removeChild(elements.header.lastChild);
							elements.element.parentElement.removeChild(elements.element);
						},
						setSelectedIndex:function(index) {
							const oldRow=elements.container.childNodes[selectedIndex];
							if(oldRow!==undefined)
								oldRow.removeAttribute("selected");
							selectedIndex=index;
							const newRow=elements.container.childNodes[selectedIndex];
							if(newRow!==undefined)
								newRow.setAttribute("selected", "selected");
						}
					};
				},
				newTree:function() {

					function newItems(parent, indent, parentElement) {
						const items=[];
						const result={
							add:function() {
								const item=newTreeItem(parent, indent, parentElement);
								items.push(item);
								if(parent!==null&&parent.getExpanded()===undefined)
									parent.setExpanded(false);
								return item;
							},
							get:function(index) { return items[index]; },
							refresh:function(values, initializer) {
								for(let i=0; i<values.length; i+=1)
									initializer(values[i], items.length<=i ? result.add() : items[i]);
								while(items.length>values.length)
									result.remove(items.length-1);
								return result;
							},
							remove:function(index) {
								if(index>=0&&index<items.length) {
									items.splice(index, 1);
									parentElement.removeChild(parentElement.childNodes[index]);
								}
								return result;
							},
							size:function() { return items.length; }
						};
						return result;
					}

					function newTreeItem(parent, indent, parentElement) {
						const elements={};
						let expanded=undefined;
						parentElement.appendChild(elements.element=System.gui.createElement("div", "UITreeItem", undefined,
							elements.header=System.gui.createElement("div", "header", undefined,
								System.gui.createElement("div", "button", {
									onclick:function(event) { result.setExpanded(!result.getExpanded()); }
								}),
								elements.title=System.gui.createElement("div", "title", {
									ondblclick:function(event) { result.setExpanded(!result.getExpanded()); }
								})
							),
							elements.container=System.gui.createElement("div", "container")
						));
						elements.header.style.paddingLeft=indent+"em";
						const result={
							initialize:function(descriptor) {
								elements.title.textContent=descriptor.text;
								elements.header.onclick=descriptor.onclick;
								elements.header.oncontextmenu=descriptor.oncontextmenu;
								return result;
							},
							getExpanded:function() { return expanded; },
							setExpanded:function(value) {
								if(items.size()===0) {
									expanded=undefined;
									elements.element.removeAttribute("expanded");
									return;
								}
								if(expanded!==value) {
									expanded=value;
									elements.element.setAttribute("expanded", expanded ? "true" : "false");
								}
								if(parent!==null&&expanded)
									parent.setExpanded(true);
							},
							getItems:function() { return items; },
							setSelected:function(value) {
								if(value===true) {
									if(parent!==null)
										parent.setExpanded(true);
									elements.element.setAttribute("selected", "selected");
									selection.add(result);
								}
								else {
									elements.element.removeAttribute("selected");
									selection.delete(result);
								}
								return this;
							},
							setText:function(value) { return elements.title.textContent=value, this; },
							onclick:function(handler) { return elements.header.onclick=handler, this; },
							oncontextmenu:function(handler) { return elements.header.oncontextmenu=handler, this; }
						};
						const items=newItems(result, indent+1, elements.container);
						return result;
					}

					const elements={};
					elements.element=System.gui.createElement("div", "UITree", undefined,
						System.gui.createElement("div", "table", undefined,
							System.gui.createElement("div", "row", undefined,
								elements.cell=System.gui.createElement("div", "cell")
							)
						)
					);
					elements.element.oncontextmenu=function(event) { return false; };
					const items=newItems(null, 0, elements.cell);
					const selectedItem=undefined;
					const selection=new Set();
					return {
						getItems:function() { return items; },
						setParentElement:function(parentElement) {
							if(parentElement!==null)
								parentElement.appendChild(elements.element);
							else
								elements.element.parentElement.removeChild(elements.element);
						},
						clearSelection:function() {
							for(const item of selection)
								item.setSelected(false);
						}
					};
				}
			},
			createElement:function(tagName, className, attributes, childNodes) {
				const result=document.createElement(tagName);
				if(className!==undefined)
					result.className=className;
				if(attributes!==undefined)
					for(const n in attributes)
						result[n]=attributes[n];
				for(let i=3; i<arguments.length; i+=1)
					result.appendChild(arguments[i]);
				return result;
			},
			openContextMenu:function(descriptor) {
				if(popup!==undefined)
					document.body.removeChild(popup);
				popup=System.gui.createElement("div", "UIContextMenu", { oncontextmenu:function(event) { return false; } });
				for(const item of descriptor.items)
					popup.appendChild(System.gui.createElement("div", "item", {
						onclick:function(event) {
							item.onclick(event);
							event.stopPropagation();
							return false;
						}
					}, document.createTextNode(item.text)));
				document.body.appendChild(popup);
				return {
					close:function() {
						document.body.removeChild(popup);
						popup=undefined;
					},
					addItem:function(item) {
					},
					setPosition:function(left, top) {
						if(left!==undefined)
							popup.style.left=left;
						if(top!==undefined)
							popup.style.top=top;
						if(popup.offsetTop+popup.offsetHeight>document.body.clientHeight)
							popup.style.top=(document.body.clientHeight-popup.offsetHeight)+"px";
						return this;
					}
				};
			},
			openPopupDialog:function(descriptor) {
				let controlIndex=0;
				const elements={};
				elements.element=System.gui.createElement("div", "UIPopupDialog", { tabIndex:0 },
					System.gui.createElement("div", "curtain"),
					elements.dialog=System.gui.createElement("div", "dialog", undefined,
						elements.header=System.gui.createElement("div", "header", undefined,
							document.createTextNode(descriptor.title)
						),
						elements.container=System.gui.createElement("div", "container", undefined,
							descriptor.content
						),
						elements.footer=System.gui.createElement("div", "footer")
					)
				);
				for(const button of descriptor.buttons)
					elements.footer.appendChild(System.gui.createElement("div", "container", undefined, button));
				elements.element.onkeydown=function(event) {
					if(event.which===9) {
						controlIndex=event.shiftKey
							? (controlIndex+descriptor.controls.length-1)%descriptor.controls.length
							: (controlIndex+1)%descriptor.controls.length;
						descriptor.controls[controlIndex].focus();
						event.preventDefault();
						return false;
					}
				};
				elements.dialog.style.top=descriptor.top;
				elements.dialog.style.left=descriptor.left;
				elements.dialog.style.width=descriptor.width;
				if(descriptor.height!==undefined)
					elements.dialog.style.height=descriptor.height;
				document.body.appendChild(elements.element);
				elements.dialog.style.padding=elements.header.offsetHeight+"px 0 "+elements.footer.offsetHeight+"px 0";
				descriptor.controls[0].focus();
				return {
					close:function() { document.body.removeChild(elements.element); }
				};
			}
		},
		io:{
			asyncRequest:function(method, path, payload, onsuccess, onerror) {
				const request=new XMLHttpRequest();
				request.open(method, path);
				request.onreadystatechange=function() {
					if(request.readyState!==4)
						return;
					if(request.status>=200&&request.status<=299)
						onsuccess(request);
					else
						onerror(request);
				};
				request.send(payload);
			}
		},
		lang:{
			Error:function(message) {
				const error=new Error();
				this.message=message;
				this.stack=error.stack;
			},
			defineClass:function(constructor, base, members) {
				const values={ constructor: constructor };
				for(const name in members)
					values[name]={ value:members[name] };
				constructor.prototype=Object.freeze(Object.create(base!==undefined ? base.prototype : null, values));
				return Object.freeze(constructor);
			},
			resolveClass:function(className) { return window[className]; }
		},
		util:{
			newNotifyingDataset:function(key) {
				const listeners=new Set();
				const map=new Map();
				function notify(added, removed) {
					for(const listener of listeners)
						listener(added, removed);
					return result;
				}
				const result={
					registerListener:function(listener) {
						listeners.add(listener);
						listener(Array.from(map.values), []);
						return result;
					},
					removeListener:function(listener) { return listeners.remove(listener), result; },
					delete:function(value) { return map.delete(key(value)) ? notify([], [value]) : result; },
					get:function(key) { return map.get(key); },
					has:function(key) { return map.has(key); },
					map:function(mapper) {
						const result=[];
						for(const entry of map.values())
							result.push(mapper(entry));
						return result;
					},
					replace:function(iterable) {
						const added=Array.from(iterable), removed=Array.from(map.values);
						map.clear();
						for(const value of iterable)
							map.set(key(value), value);
						return notify(added, removed);
					},
					set:function(value) { return map.set(key(value), value), notify([value], []); },
					size:function() { return map.size; }
				};
				result[Symbol.iterator]=function() { return map.values(); };
				return result;
			},
			newNotifyingList:function(key) {
				const array=[];
				const listeners=new Set();
				const result={
					registerListener:function(listener) {
						listeners.add(listener);
						listener(array, []);
						return result;
					},
					removeListener:function(listener) { return listeners.remove(listener), result; },
					at:function(index) { return array[index]; },
					delete:function(index) { return result.splice(index, 1); },
					indexOf:function(id, start) {
						for(let i=start!==undefined ? start : 0; i<array.length; i+=1)
							if(key(array[i])===id)
								return i;
						return -1;
					},
					replace:function(values) { return result.splice(0, array.length, ...values); },
					set:function(index, value) { return result.splice(index, 1, [value]); },
					size:function() { return array.length; },
					splice:function(index, count, values) {
						const removed=array.splice.apply(array, arguments);
						for(const listener of listeners)
							listener(values, removed);
						return result;
					}
				};
				result[Symbol.iterator]=function() { return array[Symbol.iterator](); };
				return result;
			},
			randomUUID:function() {
				return ("xxxxxxxx-xxxx-4xxx-"+(4*Math.random()|8)+"xxx-xxxxxxxxxxxx").replace(new RegExp("[x]", "g"), (x)=>16*Math.random()|0);
			}
		}
	};
	return System;
}
