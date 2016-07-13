YUI.add('moodle-enrol_simplesco-choiseenrolment', function(Y) {

    var UEP = {
        NAME : 'Enrolment Choise Manager',
        /** Properties **/
        BASE2 : 'base',
        BASE0 : 'base0',
        REQUIREREFRESH : 'requiresRefresh'
    };
    /** CSS classes for nodes in structure **/
    var CSS = {
        PANEL : 'user-choiseenroller-panel',
        WRAP : 'uep-wrap',
        HEADER : 'uep-header',
        CONTENT : 'uep-content',
        FOOTER : 'uep-footer',
        HIDDEN : 'hidden',
        CLOSE : 'close',
        BTNUSER : 'btn-user',
        BTNCOHORT : 'btn-cohorte'
    };
    var create = Y.Node.create;

    var USERCHOICEENROLLER = function(config) {
        USERCHOICEENROLLER.superclass.constructor.apply(this, arguments);
    };
    Y.extend(USERCHOICEENROLLER, Y.Base, {
        _searchTimeout : null,
        _loadingNode : null,
        _escCloseEvent : null,
        initializer : function(config) {
        	this.set(UEP.BASE0, create('<div id="overlay2" class="hidden"></div>'));
            this.set(UEP.BASE2, create('<div class="'+CSS.PANEL+' '+CSS.HIDDEN+'"></div>')
                .append(create('<div class="'+CSS.WRAP+'"></div>')
                    .append(create('<div class="'+CSS.HEADER+' header"></div>')
                        .append(create('<div class="'+CSS.CLOSE+'"></div>'))
                        .append(create('<h2>'+M.str.enrol_simplesco.choisetitle+'</h2>')))
                    .append(create('<div class="'+CSS.CONTENT+'"></div>')
                            )
                    .append(create('<div class="'+CSS.FOOTER+'"></div>')
                        .append(create('<div class="'+CSS.BTNUSER+'"></div>')
                            //.append(create('<input type="button" value="'+M.str.enrol_simplesco.btnenroluser+'" />'))
                        	.append(create('<button>'+M.str.enrol_simplesco.btnenroluser+'</button>'))
                        )
                        .append(create('<div class="'+CSS.BTNCOHORT+'"></div>')
                        		.append(create('<button>'+M.str.enrol_simplesco.btnenrolcohort+'</button>'))
                        )
                    )
                )
            )
            ;

            Y.all('.enrol_simplesco_plugin input').each(function(node){
                if (node.getAttribute('type')=='submit') {
                	if(node.getAttribute('value')==M.str.enrol_simplesco.enrolusers) {
                		node.on('click', this.show, this);
                	}
                }
            }, this);
            this.get(UEP.BASE2).one('.'+CSS.HEADER+' .'+CSS.CLOSE).on('click', this.hide, this);
            this.get(UEP.BASE2).one('.'+CSS.FOOTER+' .'+CSS.BTNUSER+' button').on('click', this.show1, this);
            this.get(UEP.BASE2).one('.'+CSS.FOOTER+' .'+CSS.BTNCOHORT+' button').on('click', this.show1, this);

            Y.one(document.body).append(this.get(UEP.BASE0));
            Y.one(document.body).append(this.get(UEP.BASE2));

            var base = this.get(UEP.BASE2);
            base.plug(Y.Plugin.Drag);
            base.dd.addHandle('.'+CSS.HEADER+' h2');
            base.one('.'+CSS.HEADER+' h2').setStyle('cursor', 'move');
        },
        show : function(e) {
            e.preventDefault();
            e.halt();

            var base = this.get(UEP.BASE2);
            var base0 = this.get(UEP.BASE0);
            base0.removeClass(CSS.HIDDEN);
            base.removeClass(CSS.HIDDEN);
            var x = (base.get('winWidth') - 400)/2;
            var y = (parseInt(base.get('winHeight'))-base.get('offsetHeight'))/2 + parseInt(base.get('docScrollY'));
            if (y < parseInt(base.get('winHeight'))*0.1) {
                y = parseInt(base.get('winHeight'))*0.1;
            }
            if(base.get('winWidth') < 400) {
            	x = 6;
            }
            base.setXY([x,y]);

            this._escCloseEvent = Y.on('key', this.hide, document.body, 'down:27', this);
            
        },
        show1 : function(e) {
        	if (this._escCloseEvent) {
                this._escCloseEvent.detach();
                this._escCloseEvent = null;
            }
            this.get(UEP.BASE2).addClass(CSS.HIDDEN);
            if (this.get(UEP.REQUIREREFRESH)) {
                window.location = this.get(UEP.URL);
            }
        },
        hide : function(e) {
            if (this._escCloseEvent) {
                this._escCloseEvent.detach();
                this._escCloseEvent = null;
            }
            this.get(UEP.BASE2).addClass(CSS.HIDDEN);
            this.get(UEP.BASE0).addClass(CSS.HIDDEN);
            if (this.get(UEP.REQUIREREFRESH)) {
                window.location = this.get(UEP.URL);
            }
        },
    }, {
        NAME : UEP.NAME,
        ATTRS : {}
    });
    Y.augment(USERCHOICEENROLLER, Y.EventTarget);

    M.enrol_simplesco = M.enrol_simplesco || {};
    M.enrol_simplesco.choiseenrolment = {
        init : function(cfg) {
            new USERCHOICEENROLLER(cfg);
        }
    }

}, '@VERSION@', {requires:['base','node', 'overlay', 'io-base', 'test', 'json-parse', 'event-delegate', 'dd-plugin', 'event-key', 'moodle-core-notification']});
