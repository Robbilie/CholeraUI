
	"use strict";

	class RealSphere {

		constructor (renderer, wsurl) {
			this.wsurl 		= wsurl;
			this.renderer 	= renderer;

			this.ws 		= null;
			this.authWin 	= null;

			this.popup 		= this.createPopup();
			this.profile 	= this.createProfile();
			this.settings 	= this.createSettings();
			this.stream 	= this.createStream();

			// init popup
			this.setPopup({
				heading: "Welcome to",
				title: "<b>the</b>real<b>sphere</b>",
				buttons: []
			}).show();
			setTimeout(this.getPopup().fadeIn.bind(this), 0);
		}

		connect () {
			this.setPopup({
				loading: true,
				heading: "Connecting to",
				buttons: []
			});
			this.ws = new WebSocket(this.wsurl);
			this.ws.onopen 		= this.onOpen.bind(this);
			this.ws.onmessage 	= this.onMessage.bind(this);
			this.ws.onerror 	= this.onError.bind(this);
		}

		onOpen () {
			this.setPopup({
				loading: false,
				heading: "Connected to",
				buttons: []
			});

			// TODO : remove once lucias ws responds
			this.ws.send(JSON.stringify({ meta: { type: "login" }, payload: { url: "https://playground.eneticum.de/therealsphere/" } }));
		}

		onMessage (e) {
			try {
				var data = JSON.parse(e.data);
				switch (data.meta.type) {
					case "login":
						this.onLogin.call(this, data);
						break;
					case "authentication":
						this.onAuthentication.call(this, data);
						break;
					default:
						this.getStream().add(data);
						break;
				}
			} catch (e) {

			}
		}

		onLogin (data) {
			this.setPopup({
				loading: false,
				heading: "Connected to",
				buttons: [new xEl("button", { innerHTML: "Authorize" }).on("click", this.authorize.bind(this, data.payload.url))]
			});
		}

		onAuthentication (data) {
			this.getPopup().fadeOut();
			setTimeout(() => {
				this.setPopup({
					heading: "Initializing sphere for",
					title: '<h8 class="s">' + data.payload.name + '</h8>',
					buttons: []
				}).fadeIn();
				this.setProfile({
					id: data.payload.id,
					name: data.payload.name
				}).show();
				setTimeout(() => {
					this.getProfile().fadeIn();
					setTimeout(() => {
						this.getPopup().fadeOut();
						setTimeout(() => {
							this.getPopup().hide();
							this.getStream().show();
							setTimeout(() => {
								this.getStream().fadeIn();
								this.getSettings().show();
								setTimeout(this.getSettings().fadeIn.bind(this), 0);
							}, 0);
						}, 500);
					}, 1000);
				}, 0);
			}, 500);
		}

		onError (e) {
			console.log("WS Error:", e);
			this.setPopup({
				loading: false,
				heading: "Error connecting to",
				buttons: [new xEl("button", { innerHTML: "Retry" }).on("click", this.connect.bind(this))]
			});
		}

		authorize (url) {
			this.authWin = window.open(url, "Authorize", "toolbar=0,menubar=0");

			// TODO : remove once lucias ws responds
			setTimeout(() => {
				this.authWin.close();
				this.ws.send(JSON.stringify({ meta: { type: "authentication" }, payload: { id: 92095466, name: "Vincent Eneticum" } }));
			}, 1000);
		}

		createPopup () {
			var loadingCheck = new xEl("input", { type: "checkbox" }).hide();
			var heading = new xEl("h2");
			var title = new xEl("h3");
			/*
			var contentArea = new xEl("div", { className: "contentArea" })
				.appendChildren([
					new xEl("div", { className: "left" })
						.appendChildren([
							new xEl("div", { className: "left-ar" })
								.appendChildren([
									new xEl("div", { className: "loader-circle" }),
									new xEl("div", { className: "loader-line-mask" })
										.appendChildren([new xEl("div", { className: "loader-line" })])
								])
						]),
					new xEl("div", { className: "right" })
						.appendChildren([
							new xEl("div", { className: "right-am" })
								.appendChildren([
									heading,
									title
								])
						])
				]);
				*/
			var contentArea = xEl.genHTML(
				["div", { className: "contentArea" }, [
					["div", { className: "left" }, [
						["div", { className: "left-ar" }, [
							["div", { className: "loader-circle" }],
							["div", { className: "loader-line-mask" }, [
								["div", { className: "loader-line" }]
							]],
						]]
					]],
					["div", { className: "right" }, [
						["div", { className: "right-am" }, [
							heading,
							title
						]]
					]]
				]]
			);
			var buttonArea = new xEl("div", { className: "buttonArea" });

			var el = new xEl("div", { className: "popup", style: { opacity: 0 } })
				.appendChildren([
					loadingCheck,
					contentArea,
					buttonArea
				]).hide();
			new xEl(document.body).append(el);
			return {
				setLoading: 	p => { loadingCheck.set("checked", p); },
				setHeading: 	p => { heading.set("innerHTML", p); },
				setTitle: 		p => { title.set("innerHTML", p); },
				setButtons: 	p => { buttonArea.clr(); buttonArea.appendChildren(p); },
				show: 			el.show.bind(el),
				hide: 			el.hide.bind(el),
				fadeIn: 		el.fadeIn.bind(el),
				fadeOut: 		el.fadeOut.bind(el)
			};
		}

		setPopup (conf) {
			let config 		= conf || {};
			Object.entries(config).map(([k, v]) => this.popup["set" + k.capitalizeFirstLetter()](v));
			return this.popup;
		}

		getPopup () {
			return this.popup;
		}

		destroyPopups () {
			Array.from($$(".popup")).map(el => el.destroy());
		}

		createProfile () {
			var el = new xEl("div", { className: "profile" });
			var pic = new xEl("img");
			var name = new xEl("span");
				el.appendChildren([pic, name]);
				el.hide();
				el.fadeOut();
			new xEl(document.body).append(el);
			return {
				setName: 	p => { name.set("innerHTML", p); },
				setId: 		p => { pic.set("src", `https://image.eveonline.com/Character/${p}_32.jpg`); },
				show: 		el.show.bind(el),
				hide: 		el.hide.bind(el),
				fadeIn: 	el.fadeIn.bind(el),
				fadeOut: 	el.fadeOut.bind(el)
			};
		}

		setProfile (conf) {
			var config 		= conf || {};
			Object.keys(config).map(k => this.profile["set" + k.capitalizeFirstLetter()](config[k]));
			return this.profile;
		}

		getProfile () {
			return this.profile;
		}

		createSettings () {
			var el = new xEl("div", { className: "settings" });
				el.hide();
				el.fadeOut();
			new xEl(document.body).append(el);
			var toggles = {

			};
			return {
				addToggle: 		p => {
					toggles[p] 	= true;
					var toggle 	= new xEl("input", { id: "toggle-check-" + p, type: "checkbox", checked: true });
						toggle.hide();
					var label 	= new xEl("label", { id: "toggle-label-" + p, htmlFor: "toggle-check-" + p, innerHTML: p.capitalizeFirstLetter() });
					var style 	= new xEl("style", { id: "toggle-style-" + p, innerHTML: 
						[
							"#toggle-check-" + p + ":not(:checked) ~ .stream .toggle-class-" + p + " { display: none; }",
							"#toggle-check-" + p + ":not(:checked) ~ .settings #toggle-label-" + p + " { background-color: rgba(255,0,0,.2); }"
						].join("\n")
					});
					el.append(label);
					el.before(toggle);
					toggle.before(style);
				},
				getToggles: 	() => toggles,
				getToggle: 		p => toggles[p],
				show: 			el.show.bind(el),
				hide: 			el.hide.bind(el),
				fadeIn: 		el.fadeIn.bind(el),
				fadeOut: 		el.fadeOut.bind(el)
			};
		}

		getSettings () {
			return this.settings;
		}

		createStream () {
			var el = new xEl("div", { className: "stream" }).append(new xEl("div"));
				el.hide();
				el.fadeOut();
			new xEl(document.body).append(el);
			var queue = [];
			return {
				add: 		data => { 
					// add to queue
					queue.push(data);

					// add to settings
					if(this.getSettings().getToggle(data.meta.type) === undefined)
						this.getSettings().addToggle(data.meta.type);

					// add to visual stream
					var tmpel = this.renderer.render(data);
					if(tmpel) {
						var wrap = new xEl("div", { className: "card toggle-class-" + data.meta.type }).append(tmpel);
						new xEl(el.firstChild).before(wrap);
					}
				},
				show: 		el.show.bind(el),
				hide: 		el.hide.bind(el),
				fadeIn: 	el.fadeIn.bind(el),
				fadeOut: 	el.fadeOut.bind(el)
			};
		}

		getStream () {
			return this.stream;
		}

	}