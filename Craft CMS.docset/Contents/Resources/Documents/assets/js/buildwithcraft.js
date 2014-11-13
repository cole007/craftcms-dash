(function($) {


var $menuBtns = $('.menubtn');
for (var i = 0; i < $menuBtns.length; i++)
{
	new Garnish.MenuBtn($menuBtns[i]);
}


var $downloadBtns = $('.btn.download'),
	hud, $form, $label, $checkbox;

$downloadBtns.on('click', function(ev) {
	ev.stopPropagation();

	var $btn = $(ev.currentTarget);
	$btn.addClass('active');

	if (!$btn.data('hud'))
	{
		if (craftDownloadUrl)
		{
			var $form = $('<form class="download-hud">' +
			                   '<hr/>' +
			                   '<input class="btn" type="submit" value="OK, download!"/>' +
			                   '<hr/>' +
			                   '<div class="requirements">' +
			                       '<p>PHP 5.3+ and MySQL 5.1+ w/ InnoDB are required.</p>' +
			                       '<p>Craft’s CP runs best on modern browsers.</p>' +
			                       '<p><a href="/docs/requirements">See the full server requirements</a></p>' +
			                   '</div>' +
			               '</form>');
			var $label = $('<label> &nbsp;I agree to the <a href="/license">terms and conditions</a></label>').prependTo($form);
			var $checkbox = $('<input type="checkbox"/>').prependTo($label);

			$form.on('submit', function(ev) {
				ev.preventDefault();

				if ($checkbox.prop('checked'))
				{
					document.location.href = craftDownloadUrl;
					hud.hide();
					$checkbox.prop('checked', false);

					// Track it
					if (typeof ga != 'undefined')
					{
						ga('send', 'event', 'Website', 'DownloadCraft');
					}
				}
				else
				{
					Garnish.shake(hud.$hud);
				}
			});
		}
		else
		{
			var $form = $('<p>Sorry, downloading Craft is temporarily disabled.<br/>Please try again soon.</p>');
		}

		var hud = new Garnish.HUD($btn, $form, {
			hudClass: 'hud',
			triggerSpacing: 20,
			tipWidth: 30,
			onHide: function() {
				$btn.removeClass('active');
			}
		});

		$btn.data('hud', hud);
	}
	else
	{
		$btn.data('hud').show();
	}
});



var $subscribeForm = $('#subscribe'),
	$subscribeEmailInput = $subscribeForm.find('input[type=text]'),
	$subscribeBtn = $subscribeForm.find('input[type=submit]'),
	$subscribeSpinner = $subscribeForm.find('.spinner'),
	$subscribeSuccess = $subscribeForm.find('.success'),
	subscribing = false;

$subscribeForm.on('submit', function(ev)
{
	ev.preventDefault();

	if (subscribing)
	{
		return;
	}

	subscribing = true;

	$subscribeBtn.addClass('active');
	$subscribeSpinner.show();
	$subscribeSuccess.hide();;

	var data = $subscribeForm.serialize();

	$.post('/actions/campaignMonitor/subscribe', data, function(response) {
		subscribing = false;
		$subscribeBtn.removeClass('active');
		$subscribeSpinner.hide();

		if (response.success)
		{
			$subscribeSuccess.show();
			$subscribeEmailInput.val('');
		}
		else if (response.error)
		{
			alert(response.error);
		}
	});
});



// Set external links to open in new windows
var externalLinkRegex = new RegExp('^https?://(?!'+document.location.hostname.replace('.', '\\.')+')'),
	links = document.getElementsByTagName('a');

for (var i = 0; i < links.length; i++)
{
	if (links[i].href.match(externalLinkRegex))
	{
		links[i].target = '_blank';
	}
}



/**
 * Info icon class
 */
var InfoIcon = Garnish.Base.extend(
{
	$icon: null,
	label: null,
	contents: null,
	hud: null,

	init: function(icon)
	{
		this.$icon = $(icon);
		this.contents = this.$icon.html();
		this.$icon.html('');
		this.label = this.$icon.parent().text().trim();

		this.addListener(this.$icon, 'click', 'showHud');
	},

	showHud: function()
	{
		if (!this.hud)
		{
			this.hud = new Garnish.HUD(this.$icon, this.contents, {
				hudClass: 'hud info-hud',
				triggerSpacing: 20,
				tipWidth: 30,
			});
		}
		else
		{
			this.hud.show();
		}

		// Track it
		if (typeof ga != 'undefined')
		{
			ga('send', 'event', 'Website', 'ViewInfo', this.label);
		}
	}
});

$.each($('.info'), function(i, icon)
{
	new InfoIcon(icon);
});


/**
 * Reference summary tables
 */
var ReferenceSummaryTable = Garnish.Base.extend(
{
	$container: null,
	$checkbox: null,
	$table: null,
	$inherited: null,

	init: function(container)
	{
		this.$container = $(container);
		this.$checkbox = this.$container.children('.inherited-toggle').find('input');
		this.$table = this.$container.children('table');

		this.$checkbox.prop('checked', true);
		this.addListener(this.$checkbox, 'click', 'toggle');
	},

	toggle: function()
	{
		if (this.$checkbox.prop('checked'))
		{
			this.showInherited();
		}
		else
		{
			this.hideInherited();
		}
	},

	showInherited: function()
	{
		this.getInherited().css('display', 'table-row');
	},

	hideInherited: function()
	{
		this.getInherited().css('display', 'none');
	},

	getInherited: function()
	{
		if (!this.$inherited)
		{
			this.$inherited = this.$table.find('tr.inherited');
		}

		return this.$inherited;
	}
});

$('.summary-table').each(function()
{
	new ReferenceSummaryTable(this);
});



/**
 * Class reference source code toggling
 */
var SourceCode = Garnish.Base.extend(
{
	$container: null,
	$pre: null,
	$toggle: null,

	init: function(container)
	{
		this.$container = $(container);
		this.$pre = this.$container.children('pre');
		this.$toggle = $('<a class="toggle" title="Expand code"></a>').appendTo(this.$container);
		this.expanded = false;

		this.addListener(this.$toggle, 'click', 'toggle');
	},

	toggle: function()
	{
		if (this.expanded)
		{
			this.collapse();
		}
		else
		{
			this.expand();
		}
	},

	collapse: function()
	{
		this.expanded = false;
		this.$toggle.removeClass('expanded').attr('title', 'Expand code');
		this.$pre.css('overflow', 'hidden').scrollTop(0).scrollLeft(0).stop().animate({ height: '1.4em' }, 'fast');
	},

	expand: function()
	{
		this.expanded = true;
		this.$toggle.addClass('expanded').attr('title', 'Collapse code');
		this.$pre.stop();
		var currentHeight = this.$pre.height();
		var expandedHeight = this.$pre.height('auto').height();
		this.$pre.height(currentHeight).animate({ height: expandedHeight }, 'fast', $.proxy(function()
		{
			this.$pre.css({
				height: 'auto',
				overflow: 'auto'
			});
		}, this));
	}
});

$('.source-code.has-body').each(function()
{
	new SourceCode(this);
});



})(jQuery)
