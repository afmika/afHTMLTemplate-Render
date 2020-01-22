/**
 * @author afmika
 * @mail afmichael73@gmail.com
 */
 
"use strict";

const fs = require("fs");

module.exports = class afTemplate {
    
	constructor(config) {
		this.setConfig(config);
	}
	
	setConfig(config) {
		this.config = config || {};
	}
	
	async includePartial( response, html_path, argument, is_included, no_repeat) {
		try {
			let can_not_include = no_repeat && is_included[ html_path ];
			if( ! can_not_include ) {
				if( no_repeat ) {
					// no need to repeat it anymore 
					is_included[ html_path ] = true;					
				}
				await this.render(response, html_path, argument);				
			}		
		} catch(e) {
			throw e;
		}
	}
	
    async renderPages(response, array) {
        try {
            for(let i = 0; i < array.length; i++) {
                const page = array[i];
                await this.render(response, page.path, page.argument);
            }
            return array;
        } catch (e) {
			// do something
            throw e;
        }
    }

    async render(response, html_path, argument) {
        let content = fs.readFileSync( html_path ).toString();
        if( argument ) {
            // replaces all single variables defined in 'argument' : eg {{ a_single_variable }}
            const spaces = "([\n\t ]+)";
            for(let variable in argument) {
                const value = argument[ variable ];
                let exp = new RegExp("{{" + spaces + "("+variable+")" + spaces + "}}", "g");
                content = content.replace(exp, value);
            }
        }
		
		// we need to deal with some weird stuff like putting "`" inside the content (eg: <b>L`arbre</b>)
		// if we don't escape it, a parsing error will be triggered
		content = content.replace(/`/gi, "\\`");
		
        // replaces all expressions 
        let code_part = []; // contains the position of each couple {%, %}
        let text_part = []; // contains the position of each text
		let code_write_part = {};
        for(let i = 0, code = [], text = [0]; i < content.length; i++) {
            if(i + 1 < content.length) {
                    if(content[i] == "<" && content[i+1] == "%" ) {
                        if(i - 1 > 0){
                            text.push(i - 1);
                            text_part.push(text);
                            text = [];
                        } else {
                            // it means that the content starts with a code
                            text = [];
                        }

                        code.push( i );
						if(i + 2 < content.length)
							if( content[i+2] == "=" ) {
								code_write_part[ code_part.length ] = true;
							}
                    } else if(content[i] == "%" && content[i+1] == ">") {
                        text.push( i + 2 ); // +2 because we start after %} (since i represents %  's index) 

                        code.push(i + 2);
                        code_part.push( code );
                        code = [];
                    }
            }
            if(text.length == 1 && i + 1 >= content.length) {
                text.push( content.length );
                text_part.push(text);
            }
        }
        
        /*
        eg: Something here {% some_code %} Something else
        will do :
            response.write("Something here");
            some_code;
            response.write("Something else");
        */
        // console.log(code_part);
        // console.log(text_part);
        // console.log(code_write_part);

        let content_to_eval = "";
        let index_used = {};

        for (let i = 0; i < text_part.length; i++) {
			const text_start = text_part[i][0],
					text_end = text_part[i][1];

            code_part.forEach((code, index) => {
                let printed = false;
                if( index_used[ index ] ) {
                    printed = true;
                }
                if( code[1] == text_start && ! printed) {
                    index_used[ index ] = true;
                    let code_before = code;
					
					if(code_write_part[ index ]) {
						const ctn = content.substring(code_before[0] + 3, code_before[1] - 2);
						const temp = ctn.replace("`", "\\`");
						// console.log(temp);
						content_to_eval += "response.write(''+(" + temp + ")\);";
					} else {
						content_to_eval += content.substring(code_before[0] + 2, code_before[1] - 2);
					}
                    return;
                }
            });
			
			const temp = content.substring(text_start, text_end+1);
            content_to_eval += "response.write(`" + temp + "`);";  

            code_part.forEach((code, index) => {
                let printed = false;
                if( index_used[ index ] ) {
                    printed = true;
                }
                if(code[0] == text_end + 1 && ! printed) {
                        index_used[ index ] = true;
                        let code_after = code;
						if(code_write_part[ index ]) {
							let ctn = content.substring(code_after[0] + 3, code_after[1] - 2);
							const temp = ctn.replace("`", "\\`");
							// console.log(temp);
							content_to_eval += "response.write(''+(" + temp + "));";
						} else {
							content_to_eval += content.substring(code_after[0] + 2, code_after[1] - 2);
						}
                        return;
                };
            });
        }
        
        if(code_part.length > 0) {
            // response.write(content_to_eval);

			// the javascript server-side code inside the html
			// will run inside this function
			const that = this;
			const run_protected_context = function(response, argument) {
				
				// argument alias
				// eg: $.some_variable == argument.some_variable // true
				let [$, page, props] = new Array(3).fill( argument );
				
				// includes
				let is_included = {};
				const include = function(html_path) {
					that.includePartial(response, html_path, argument, is_included, false);
				}
				const include_once = function(html_path) {
					that.includePartial(response, html_path, argument, is_included, true);
				}
				
				// or use directly the variable
				let arr = [], values = [];
				for(let variable in argument) {
					arr.push( variable );
					values.push( `argument['${ variable }']` );
				}
				let str = `let [${ arr.join(',') }] = [${ values.join(',') }];`;
				// console.log(str);
				content_to_eval = str + content_to_eval;
				eval(content_to_eval);				
			}
			
			run_protected_context(response, argument);
			
            return {
                content: content_to_eval,
                path : html_path
            };
        }
        response.write(content);
        return {
            content: content,
            path : html_path
        };
    }
}