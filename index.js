/**
 * @author afmika
 */

"use strict";

const fs = require("fs");

module.exports = class afTemplate {

    /**
     * Using afTemplate as an Express middleware
     * @param {JSON} alias
     * @returns {Function} express middleware callback function
     */
    static adaptor( alias ) {
        const instance = new afTemplate( alias );
        return (req, res, next) => {
            res.rendererEngine = instance;

            res.render = async (path, params, headers) => {
                res.writeHead(200, headers || { 
                    'Content-Type': 'text/html' 
                });
                await res.rendererEngine.render(res, path, params);
                res.end();
            };

            res.renderPages = async (pages_array, headers) => {
                res.writeHead(200, headers || { 
                    'Content-Type': 'text/html' 
                });
                await res.rendererEngine.renderPages(res, pages_array);
                res.end();              
            }

            next();
        }
    }

    /**
     * @param {JSON} alias
     */
	constructor( alias ) {
        this.alias = {};
		this.fn = null;
        this.core = {
            writeFunctionName : 'write'
        };
        // this.templates_map = {};
        if ( alias ) {
            this.setAlias( alias );
        }
    }

    /**
     * Includes a view inside another one
     * @param {*} response the server's response ( from express )
     * @param {string} html_path Path of the template file to load
     * @param {JSON} argument Args of the template
     * @param {JSON} is_included
     * @param {boolean} no_repeat enable / disable include_once
     */
	async includePartial( response, html_path, argument, is_included, no_repeat) {
		try {
			let can_not_include = no_repeat && is_included[ html_path ];
			if( ! can_not_include ) {
				if( no_repeat ) {
					// no need to repeat it anymore
					is_included[ html_path ] = true;
				}
				await this.render(response, html_path, argument, true);
			}
		} catch(e) {
			throw e;
		}
    }
    
	/**
     * Renders multiple template files
     * @param {*} response the server's response ( from express )
     * @param {JSON[]} array  [{ path : '...', argument : { .... }}, ... ]
     */
    async renderPages(response, array) {
        try {
			if ( this.fn )
				this.fn();
            for(let i = 0; i < array.length; i++) {
                const page = array[i];


                await this.render(response, page.path, page.argument, true);
            }
            return array;
        } catch (e) {
			// do something
            throw e;
        }
    }

    /**
     * Renders a single page
     * @param {*} response the server's response ( from express )
     * @param {string} html_path Path of the template file to load
     * @param {JSON} argument Args of the template
	 * @param {boolean} block_fn allows or not uses of this.fn() if defined
     */
    async render(response, html_path, argument, block_fn ) {
        const writeFuncName = this.core.writeFunctionName || 'write';
		if ( block_fn == undefined || block_fn === false ) {
			if ( this.fn )
				this.fn();
		}

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
        let code_part = []; // contains the position of each couple <%, %>
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
                            // occurs when the content starts with a code
                            text = [];
                        }

                        code.push( i );
						if(i + 2 < content.length)
							if( content[i+2] == "=" ) {
								code_write_part[ code_part.length ] = true;
							}
                    } else if(content[i] == "%" && content[i+1] == ">") {
                        text.push( i + 2 ); // +2 : we start after %> (since i represents %  's index)

                        code.push(i + 2);
                        code_part.push( code );
                        code = [];
                    }
            }
            if(text.length == 1 && i + 1 >= content.length) {
                text.push( content.length );
                text_part.push( text );
            }
        }

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
						content_to_eval += "response[ writeFuncName ](''+(" + temp + ")\);";
					} else {
						content_to_eval += content.substring(code_before[0] + 2, code_before[1] - 2);
					}
                    return;
                }
            });

			const temp = content.substring(text_start, text_end+1);
            content_to_eval += "response[ writeFuncName ](`" + temp + "`);";

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
							content_to_eval += "response[ writeFuncName ](''+(" + temp + "));";
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

				// arg alias
				// eg: $.some_variable == argument.some_variable : true
				let [$, page, props] = new Array(3).fill( argument );

				// includes
				let is_included = {};
				const include = function(html_path) {
					that.includePartial(response, html_path, argument, is_included, false);
				}
				const include_once = function(html_path) {
					that.includePartial(response, html_path, argument, is_included, true);
				}

				// direct uses of a variable
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

        // response.write( content );
        response[ writeFuncName ] ( content );
        return {
            content: content,
            path : html_path
        };
    }

    /**
     * Stores 'alias' to the current instance
     * @param {string} alias
     * @param {string} path
     */
    addAlias(alias, path) {
        if (typeof alias != 'string' || typeof path != 'string' ) {
            throw new Error('Invalid path/alias, alias/path must be a string');
        }
        if ( alias.match(/^([A-Za-z0-9_-]+)$/gi) == null) {
            throw new Error("Invalid alias, alias should not contain symbols except '_' and '-' ");
        }
        this.alias[ alias ] = path;
    }

    /**
     * Stores everything from alias_cfg inside the current instance
     * @param {JSON} alias_cfg
     */
    setAlias(alias_cfg) {
        for (let alias in alias_cfg) {
            this.addAlias(alias, alias_cfg[ alias ] );
        }
    }

    /**
     * Returns the path associated with 'alias_name'
     * @param {string} alias_name
     * @returns {string} path of the given alias
     */
    path( alias_name ) {
        if ( this.alias[ alias_name ] ) {
            return this.alias[ alias_name ];
        }
        return null;
    }

    /**
     * Setups the template referenced by alias_name.
     * Can be helpful with 'renderPages'
     * @param {string} alias_name
     * @param {JSON} args argument of the template referenced by 'alias_name'
     */
    setup( alias_name, args) {
        let config = {};
		config.path = this.path( alias_name )
        if ( args )
            config.argument = args;
        return config;
    }

    /**
     * Defines a function which will be called before each page rendering
     * @param {string} alias_name
     * @param {JSON} args argument of the template referenced by 'alias_name'
     */
	use( fn ) {
		if ( typeof fn != 'function' )
			throw new Error("fn must be a function!");
		this.fn = fn;
	}
}
