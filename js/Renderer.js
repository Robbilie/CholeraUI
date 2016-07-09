
	"use strict";

	class Renderer {

		constructor () {
			this.renderTypes = {
				default: this.defaultRenderer
			};
		}

		defaultRenderer (payload) {
			return xEl("ul")
				.appendChildren(
					Object.entries(payload)
						.map(([k, v]) => xEl("li", { innerHTML: `<b>${k}:</b>${v}` }))
				);
		}

		register (type, fn) {
			this.renderTypes[type] = fn;
		}

		render (msg) {
			return this.renderTypes[this.renderTypes[msg.meta.type] ? msg.meta.type : "default"](msg.payload);
		}

	}