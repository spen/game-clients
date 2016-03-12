'use strict';

var ViewExtension = require('../../../extensions/view'),
	DismissView = require('./dismissbutton'),
	template = require('../../templates/modal/modal.hbs'),

	ModalView = ViewExtension.extend({

		acceptedParams: ['dismissable'],

		dismissable: true,

		template: template,

		events: {
			'click .modal__button--dismiss': 'hide'
		},

		views: function () {
			var views = {};
			if (this.dismissable) {
				views['.modal__button--dismiss'] = {
					view: DismissView
				};
			}

			return views;
		},

		setContent: function (viewDefinition) {
			var contentEl = '.modal__content';

			this.removeSubviewInstance(contentEl);
			this._renderSubview(viewDefinition, '.modal__content');

			return this;
		},

		show: function () {
			this.$el.fadeIn(100);
		},

		hide: function () {
			var height = this.$el.height(),
				$el = this.$el,
				$container = $el.find('.modal__container'),
				$shader = $el.find('.modal__shader');

			$shader.fadeOut(300);
			$container.animate({bottom: -(height * 1.2)},{duration: 300,
				specialEasing: {
				  bottom: 'easeInBack'
				},
				complete: function(){
					$shader.show();
					$container.css({bottom: 'initial'});
					$el.hide();
				}
			});
		},

		serialize: function () {
			return {
				dismissable: this.dismissable
			};
		}

	});

module.exports = ModalView;
