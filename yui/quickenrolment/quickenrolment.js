YUI.add('moodle-enrol_simplesco-quickenrolment', function(Y) {

    var UEP = {
        NAME : 'Enrolment Manager',
        /** Properties **/
        BASE : 'base',
        SEARCH : 'search',
        SEARCHBTN : 'searchbtn',
        PARAMS : 'params',
        URL : 'url',
        AJAXURL : 'ajaxurl',
        MULTIPLE : 'multiple',
        PAGE : 'page',
        COURSEID : 'courseid',
        USERS : 'users',
        USERCOUNT : 'userCount',
        REQUIREREFRESH : 'requiresRefresh',
        LASTSEARCH : 'lastPreSearchValue',
        INSTANCES : 'instances',
        OPTIONSTARTDATE : 'optionsStartDate',
        DEFAULTROLE : 'defaultRole',
        DEFAULTSTARTDATE : 'defaultStartDate',
        DEFAULTDURATION : 'defaultDuration',
        ASSIGNABLEROLES : 'assignableRoles',
        SEARCHLISTE1 : 'SEARCHLISTE1',
        SEARCHLISTE2 : 'SEARCHLISTE2',
        SEARCHLISTE3 : 'SEARCHLISTE3',
        SEARCHLISTE4 : 'SEARCHLISTE4',
        SEARCHLISTES : 'SEARCHLISTES',
        DISABLEGRADEHISTORY : 'disableGradeHistory',
        RECOVERGRADESDEFAULT : 'recoverGradesDefault',
        ENROLCOUNT : 'enrolCount',
        PERPAGE : 'perPage',
        COHORTSAVAILABLE : 'cohortsAvailable',
        COHORTCOUNT : 'cohortCount'
    };
    /** CSS classes for nodes in structure **/
    var CSS = {
        PANEL : 'user-enroller-panel2',
        WRAP : 'uep-wrap',
        HEADER : 'uep-header',
        CONTENT : 'uep-content',
        AJAXCONTENT : 'uep-ajax-content',
        SEARCHRESULTS : 'uep-search-results',
        TOTALUSERS : 'totalusers',
        USERS : 'users',
        USER : 'user',
        MORERESULTS : 'uep-more-results',
        LIGHTBOX : 'uep-loading-lightbox',
        LOADINGICON : 'loading-icon',
        FOOTER : 'uep-footer',
        ENROL : 'enrol',
        ENROLLED : 'enrolled',
        COUNT : 'count',
        PICTURE : 'picture',
        DETAILS : 'details',
        FULLNAME : 'fullname',
        EXTRAFIELDS : 'extrafields',
        OPTIONS : 'options',
        ODD  : 'odd',
        EVEN : 'even',
        HIDDEN : 'hidden',
        RECOVERGRADES : 'recovergrades',
        RECOVERGRADESTITLE : 'recovergradestitle',
        SEARCHOPTIONS : 'uep-searchoptions',
        SEARCHOPTIONS2 : 'uep-searchoptions2',
        COLLAPSIBLEHEADING : 'collapsibleheading',
        COLLAPSIBLEAREA : 'collapsiblearea',
        ENROLMENTOPTION : 'uep-enrolment-option',
        SEARCHCONTROLS : 'uep-controls',
        ROLE : 'role',
        STARTDATE : 'startdate',
        DURATION : 'duration',
        DURATION2 : 'duration',
        ACTIVE : 'active',
        SEARCH : 'uep-search',
        SEARCHBTN : 'uep-search-btn',
        CLOSE : 'close',
        CLOSEBTN : 'close-button',
        ENTITYSELECTOR : 'uep-entity-selector',
        COHORTS : 'cohorts',
        COHORT : 'cohort',
        COHORTNAME : 'cohortname',
        TOTALCOHORTS : 'totalcohorts'
    };
    var create = Y.Node.create;

    var USERENROLLER = function(config) {
        USERENROLLER.superclass.constructor.apply(this, arguments);
    };
    Y.extend(USERENROLLER, Y.Base, {
        _searchTimeout : null,
        _loadingNode : null,
        _escCloseEvent : null,
        initializer : function(config) {
            var recovergrades = null;
            if (this.get(UEP.DISABLEGRADEHISTORY) != true) {
                recovergrades = create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.RECOVERGRADES+'"></div>')
                    .append(create('<label class="'+CSS.RECOVERGRADESTITLE+'" for="'+CSS.RECOVERGRADES+'">'+M.str.enrol.recovergrades+'</label>'))
                    .append(create('<input type="checkbox" id="'+CSS.RECOVERGRADES+'" name="'+CSS.RECOVERGRADES+'"'+ this.get(UEP.RECOVERGRADESDEFAULT) +' />'))
            }

            this.set(UEP.BASE, create('<div class="'+CSS.PANEL+' '+CSS.HIDDEN+'"></div>')
                .append(create('<div class="'+CSS.WRAP+'"></div>')
                    .append(create('<div class="'+CSS.HEADER+' header"></div>')
                        .append(create('<div class="'+CSS.CLOSE+'"></div>'))
                        .append(create('<h2>'+M.str.enrol.enrolusers+'</h2>')))
                    .append(create('<div class="'+CSS.CONTENT+'"></div>')
                        .append(create('<div class="'+CSS.SEARCHCONTROLS+'"></div>')
                            .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.ROLE+'"><label for="id_enrol_simplesco_assignable_roles">'+M.str.role.assignroles+'</label></div>')
                                    .append(create('<select id="id_enrol_simplesco_assignable_roles"><option value="">'+M.str.enrol.none+'</option></select>'))
                            )
                            .append(create('<div class="'+CSS.ENTITYSELECTOR+'"></div>'))
                            .append(create('<div class="'+CSS.SEARCHOPTIONS+'"></div>')
                                .append(create('<div class="'+CSS.COLLAPSIBLEHEADING+'"><img alt="" />'+M.str.enrol.enrolmentoptions+'</div>'))
                                .append(create('<div class="'+CSS.COLLAPSIBLEAREA+' '+CSS.HIDDEN+'"></div>')
                                    .append(recovergrades)
                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.STARTDATE+'">'+M.str.moodle.startingfrom+' : </div>')
                                        .append(create('<select></select>')))
                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION2+'">'+M.str.enrol.enrolperiod+' : </div>')
                                        .append(create('<select><option value="0" selected="selected">'+M.str.enrol.unlimitedduration+'</option></select>')))
                                )
                            )
                            .append(create('<div class="'+CSS.SEARCHOPTIONS2+'"></div>')
                                .append(create('<div class="'+CSS.COLLAPSIBLEHEADING+'"><img alt="" />'+M.str.enrol_simplesco.searchoption+'</div>'))
                                .append(create('<div class="'+CSS.COLLAPSIBLEAREA+'"></div>')
                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.STARTDATE+'"></div>')
                                        .append(create('<input type="radio" id="id_enrol_simplesco_typesearch_classe" name="enrol_simplesco_typesearch" value="classe" checked="checked"/>'))
                                        .append(create('<label for="id_enrol_simplesco_typesearch_classe">'+M.str.enrol_simplesco.frommyclass+'</label>'))
                                        .append(create('<br><input type="radio" id="id_enrol_simplesco_typesearch_ent" name="enrol_simplesco_typesearch" value="ent"/>'))
                                        .append(create('<label for="id_enrol_simplesco_typesearch_ent">'+M.str.enrol_simplesco.fromnetocentre+'</label>'))
                                        .append(create('<br><input type="radio" id="id_enrol_simplesco_typesearch_nom" name="enrol_simplesco_typesearch" value="nom"/>'))
                                        .append(create('<label for="id_enrol_simplesco_typesearch_nom">'+M.str.enrol_simplesco.byname+'</label>'))
                                    )
                                    .append(create('<div id="id_enrol_simplesco_selects"></div>')
	                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'"><label for="id_enrol_simplesco_liste1">'+M.str.enrol_simplesco.fitre1name+' :</label></div>')
	                                        .append(create('<select id="id_enrol_simplesco_liste1" name="code1" STYLE="max-width: 300px; width:100%;"></select>')))
	                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'"><label for="id_enrol_simplesco_liste2">'+M.str.enrol_simplesco.fitre2name+' :</label></div>')
	                                        .append(create('<select id="id_enrol_simplesco_liste2" name="code2" STYLE="max-width: 300px; width:100%;"></select>')))
	                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'"><label for="id_enrol_simplesco_liste3">'+M.str.enrol_simplesco.fitre3name+' :</label></div>')
	                                        .append(create('<select id="id_enrol_simplesco_liste3" name="code3" STYLE="max-width: 300px; width:100%;"></select>')))
	                                    .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'"><label for="id_enrol_simplesco_liste4">'+M.str.enrol_simplesco.fitre4name+' :</label></div>')
	                                        .append(create('<select id="id_enrol_simplesco_liste4" name="code4" STYLE="max-width: 300px; width:100%;"></select>')))
	                                    .append(create('<div id="id_enrol_simplesco_select_ent" class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'" style="display:none;"><label for="id_enrol_simplesco_liste5">'+M.str.enrol_simplesco.fitre5name+'</label></div>')
	                                        .append(create('<select id="id_enrol_simplesco_liste5" name="code5" STYLE="max-width: 300px; width:100%;"></select>')))
                                        )
                                    .append(create('<div id="id_enrol_simplesco_input" class="'+CSS.SEARCH+'"></div>')
                                        .append(create('<div class="'+CSS.ENROLMENTOPTION+' '+CSS.DURATION+'"><label for="enrolusersearch">'+M.str.enrol_simplesco.fitre6name+' :</label><input type="text" id="enrolusersearch" value="" /></div>'))
                                        
                                    )
                                    .append(create('<div style="text-align:center"><input type="button" id="searchbtn" class="'+CSS.SEARCHBTN+'" value="'+M.str.enrol.usersearch+'" /></div>'))
                                )
                            )
                        )
                        
                        .append(create('<div class="'+CSS.AJAXCONTENT+'"></div>'))
                        .append(create('<div class="'+CSS.LIGHTBOX+' '+CSS.HIDDEN+'"></div>')
                            .append(create('<img alt="loading" class="'+CSS.LOADINGICON+'" />')
                                .setAttribute('src', M.util.image_url('i/loading', 'moodle')))
                            .setStyle('opacity', 0.5)))
                    .append(create('<div class="'+CSS.FOOTER+'"></div>')
                        .append(create('<div class="'+CSS.CLOSEBTN+'"></div>')
                            .append(create('<input type="button" value="'+M.str.enrol.finishenrollingusers+'" />'))
                        )
                    )
                )
            );
            this.get(UEP.BASE).one('#id_enrol_simplesco_typesearch_classe').on('change', this.afficheListes, this);
            this.get(UEP.BASE).one('#id_enrol_simplesco_typesearch_ent').on('change', this.afficheListes, this);
            this.get(UEP.BASE).one('#id_enrol_simplesco_typesearch_nom').on('change', this.afficheListes, this);
            
            this.set(UEP.SEARCH, this.get(UEP.BASE).one('#enrolusersearch'));
            this.set(UEP.SEARCHBTN, this.get(UEP.BASE).one('#searchbtn'));
            
            /*Y.all('.enrol_simplesco_plugin input').each(function(node){
                if (node.getAttribute('type')=='submit') {
                	
                    if(node.getAttribute('value')==M.str.enrol_simplesco.unenrolusers) {
                    	node.on('click', this.show, this);
                    }
                	
                }
            }, this);*/
            Y.all('.user-choiseenroller-panel .btn-user button').each(function(node){
                //if (node.getAttribute('type')=='button') {
                    node.on('click', this.show, this);
                //}
            }, this);
            
            this.get(UEP.BASE).one('.'+CSS.HEADER+' .'+CSS.CLOSE).on('click', this.hide, this);
            this.get(UEP.BASE).one('.'+CSS.FOOTER+' .'+CSS.CLOSEBTN+' input').on('click', this.hide, this);
            this._loadingNode = this.get(UEP.BASE).one('.'+CSS.CONTENT+' .'+CSS.LIGHTBOX);
            var params = this.get(UEP.PARAMS);
            params['id'] = this.get(UEP.COURSEID);
            this.set(UEP.PARAMS, params);

            Y.on('key', this.preSearch, this.get(UEP.SEARCH), 'down:13', this);
            this.get(UEP.SEARCHBTN).on('click', this.preSearch, this);

            if (this.get(UEP.COHORTSAVAILABLE)) {
                this.get(UEP.BASE).one('.'+CSS.ENTITYSELECTOR)
                    .append(create('<input type="radio" id="id_enrol_simplesco_entity_users" name="enrol_simplesco_entity" value="users" checked="checked"/>'))
                    .append(create('<label for="id_enrol_simplesco_entity_users">'+ M.str.enrol_simplesco.browseusers+'</label>'))
                    .append(create('<input type="radio" id="id_enrol_simplesco_entity_cohorts" name="enrol_simplesco_entity" value="cohorts"/>'))
                    .append(create('<label for="id_enrol_simplesco_entity_cohorts">'+M.str.enrol_simplesco.browsecohorts+'</label>'));
                this.get(UEP.BASE).one('#id_enrol_simplesco_entity_cohorts').on('change', this.search, this);
                this.get(UEP.BASE).one('#id_enrol_simplesco_entity_users').on('change', this.search, this);
            } else {
                this.get(UEP.BASE).one('.'+CSS.ENTITYSELECTOR)
                    .append(create('<input type="hidden" name="enrol_simplesco_entity" value="users"/>'));
            }

            this.get(UEP.BASE).one('#id_enrol_simplesco_liste1').on('change', this.getNListes, this);
            Y.one(document.body).append(this.get(UEP.BASE));

            var base = this.get(UEP.BASE);
            base.plug(Y.Plugin.Drag);
            base.dd.addHandle('.'+CSS.HEADER+' h2');
            base.one('.'+CSS.HEADER+' h2').setStyle('cursor', 'move');

            var collapsedimage = 't/collapsed'; // ltr mode
            if ( Y.one(document.body).hasClass('dir-rtl') ) {
                collapsedimage = 't/collapsed_rtl';
            } else {
                collapsedimage = 't/collapsed';
            }

            this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url(collapsedimage, 'moodle'));
            this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url(collapsedimage, 'moodle'));
            this.populateStartDates();
            this.populateDuration();
            this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEHEADING).on('click', function(){
                this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEHEADING).toggleClass(CSS.ACTIVE);
                this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEAREA).toggleClass(CSS.HIDDEN);
                if (this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEAREA).hasClass(CSS.HIDDEN)) {
                    this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url(collapsedimage, 'moodle'));
                } else {
                    this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url('t/expanded', 'moodle'));
                }
            }, this);
            this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEHEADING).on('click', function(){
                this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEHEADING).toggleClass(CSS.ACTIVE);
                this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEAREA).toggleClass(CSS.HIDDEN);
                if (this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEAREA).hasClass(CSS.HIDDEN)) {
                    this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url(collapsedimage, 'moodle'));
                } else {
                    this.get(UEP.BASE).one('.'+CSS.SEARCHOPTIONS2+' .'+CSS.COLLAPSIBLEHEADING).one('img').setAttribute('src', M.util.image_url('t/expanded', 'moodle'));
                }
            }, this);
            this.populateAssignableRoles();
            this.getNListes('12345');
        },
        populateAssignableRoles : function() {
            this.on('assignablerolesloaded', function(){
                var roles = this.get(UEP.ASSIGNABLEROLES);
                var s = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.ROLE+' select');
                var v = this.get(UEP.DEFAULTROLE);
                var index = 0, count = 0;
                for (var i in roles) {
                    count++;
                    var option = create('<option value="'+i+'">'+roles[i]+'</option>');
                    if (i == v) {
                        index = count;
                    }
                    s.append(option);
                }
                s.set('selectedIndex', index);
                Y.one('#id_enrol_simplesco_assignable_roles').focus();
            }, this);
            this.getAssignableRoles();
        },
        afficheListes : function() {
        	//alert('affichelistes_radio');
        	if(document.getElementById("id_enrol_simplesco_typesearch_classe").checked) {
        		document.getElementById("id_enrol_simplesco_liste1").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste2").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste3").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste4").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste5").enalbled=true;
        		document.getElementById("id_enrol_simplesco_selects").style.display='inline';
        		document.getElementById("id_enrol_simplesco_select_ent").style.display='none';
                this.getNListes('12345');
        	}
        	if(document.getElementById("id_enrol_simplesco_typesearch_ent").checked) {
        		document.getElementById("id_enrol_simplesco_liste1").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste2").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste3").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste4").enalbled=false;
        		document.getElementById("id_enrol_simplesco_liste5").enalbled=false;
        		document.getElementById("id_enrol_simplesco_selects").style.display='inline';
        		document.getElementById("id_enrol_simplesco_select_ent").style.display='block';
                this.getNListes('12345');
        	}
        	if(document.getElementById("id_enrol_simplesco_typesearch_nom").checked) {
        		document.getElementById("id_enrol_simplesco_liste1").enalbled=true;
        		document.getElementById("id_enrol_simplesco_liste2").enalbled=true;
        		document.getElementById("id_enrol_simplesco_liste3").enalbled=true;
        		document.getElementById("id_enrol_simplesco_liste4").enalbled=true;
        		document.getElementById("id_enrol_simplesco_liste5").enalbled=true;
        		document.getElementById("id_enrol_simplesco_selects").style.display='none';
        	}
        },
        populateStartDates : function() {
            var select = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.STARTDATE+' select');
            var defaultvalue = this.get(UEP.DEFAULTSTARTDATE);
            var options = this.get(UEP.OPTIONSTARTDATE);
            var index = 0, count = 0;
            for (var i in options) {
                count++;
                var option = create('<option value="'+i+'">'+options[i]+'</option>');
                if (i == defaultvalue) {
                    index = count;
                }
                select.append(option);
            }
            select.set('selectedIndex', index);
        },
        populateDuration : function() {
            var select = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.DURATION+' select');
            var defaultvalue = this.get(UEP.DEFAULTDURATION);
            var index = 0, count = 0;
            var durationdays = M.util.get_string('durationdays', 'enrol', '{a}');
            for (var i = 1; i <= 365; i++) {
                count++;
                var option = create('<option value="'+i+'">'+durationdays.replace('{a}', i)+'</option>');
                if (i == defaultvalue) {
                    index = count;
                }
                select.append(option);
            }
            select.set('selectedIndex', index);
        },
        getAssignableRoles : function(){
            Y.io(M.cfg.wwwroot+'/enrol/ajax.php', {
                method:'POST',
                data:'id='+this.get(UEP.COURSEID)+'&action=getassignable&sesskey='+M.cfg.sesskey,
                on: {
                    complete: function(tid, outcome, args) {
                        try {
                            var roles = Y.JSON.parse(outcome.responseText);
                            this.set(UEP.ASSIGNABLEROLES, roles.response);
                        } catch (e) {
                            new M.core.exception(e);
                        }
                        this.getAssignableRoles = function() {
                            this.fire('assignablerolesloaded');
                        };
                        this.getAssignableRoles();
                    }
                },
                context:this
            });
        },
        getNListes : function(numListes){
        	var params2;
        	params2 = this.get(UEP.PARAMS);
        	params2['id']=this.get(UEP.COURSEID);
        	params2['action']='getListes';	
        	params2['sesskey']=M.cfg.sesskey;
        	params2['code1']=document.getElementById("id_enrol_simplesco_liste1").value;
        	
        	toto='classe';
        	if(document.getElementById("id_enrol_simplesco_typesearch_ent").checked) {
        		toto='ent';
        	}
        	if (typeof(numListes) == 'object') {
        		numListes = '345';
        	}

        	params2['numliste']=numListes;
        	params2['option']=toto;
        	
        	Y.io(M.cfg.wwwroot+this.get(UEP.AJAXURL), {
                method:'POST',
                data:build_querystring(params2),
                on: {
                	start : this.displayLoading,
                    complete: function(tid, outcome, args) {
                        try {
                            var res = Y.JSON.parse(outcome.responseText);
                            var resListe = res.response;
                            
                            for (j=0; j<numListes.length; j++) {
                    			numListe=numListes.charAt(j);
                    			idListe='id_enrol_simplesco_liste'+numListe;
                    			if (!document.getElementById(idListe).enalbled) {
                	                var s = Y.one('#'+idListe);
                	                var v = resListe['defaut'+numListe];
                	                var index = 0, count = 0;
                	                document.getElementById(idListe).innerHTML='';
                	                if (numListe != 1) {
                	                	s.append('<option value="">'+M.str.enrol_simplesco.allresultliste+'</option>');
                	                }
                	                for (var i in resListe[numListe]) {
                	                    
                	                    if (i != '') {
                	                    	var option = create('<option value="'+i+'">'+resListe[numListe][i]+'</option>');
                    	                    if (i == v) {
                    	                        index = count;
                    	                    }
                    	                    s.append(option);
                    	                    count++;
                	                    }
                	                    
                	                }
                	                s.set('selectedIndex', index);
                	                if (count == 0) {
                	                	document.getElementById(idListe).innerHTML='<option value="">'+M.str.enrol_simplesco.noresultliste+'</option>';
                	                }
                                }
                    		}
                        } catch (e) {
                            new M.core.exception(e);
                        }
                    },
                    end : this.removeLoading
                },
                context:this
            });
            
        },
  
        preSearch : function(e) {
            this.search(null, false);
            /*preSearch
            var value = this.get(UEP.SEARCH).get('value');
            if (value.length < 3 || value == this.get(UEP.LASTSEARCH)) {
                return;
            }
            this.set(UEP.LASTSEARCH, value);
            if (this._searchTimeout) {
                clearTimeout(this._searchTimeout);
                this._searchTimeout = null;
            }
            var self = this;
            this._searchTimeout = setTimeout(function(){
                self._searchTimeout = null;
                self.search(null, false);
            }, 300);
            */
        },
        show : function(e) {
            e.preventDefault();
            e.halt();

            var base = this.get(UEP.BASE);
            base.removeClass(CSS.HIDDEN);
            var x = (base.get('winWidth') - 550)/2;
            var y = (parseInt(base.get('winHeight'))-base.get('offsetHeight'))/2 + parseInt(base.get('docScrollY'));
            if (y < parseInt(base.get('winHeight'))*0.1) {
                y = parseInt(base.get('winHeight'))*0.1;
            }
            y = 45;
            if(base.get('winWidth') < 600) {
            	//base.set('offsetWidth', 400);
            	//x = (base.get('winWidth') - 400)/2;
            	x = 6;
            }
            if(base.get('winWidth') < 400) {
            	x = 6;
            	
            }
            base.setXY([x,y]);
            if (this.get(UEP.USERS)===null) {
                //this.search(e, false);
            }

            this._escCloseEvent = Y.on('key', this.hide, document.body, 'down:27', this);
            var rolesselect = Y.one('#id_enrol_simplesco_assignable_roles');
            if (rolesselect) {
                rolesselect.focus();
            }
        },
        hide : function(e) {
            if (this._escCloseEvent) {
                this._escCloseEvent.detach();
                this._escCloseEvent = null;
            }
            this.get(UEP.BASE).addClass(CSS.HIDDEN);
            document.getElementById('overlay2').className += "hidden";
            if (this.get(UEP.REQUIREREFRESH)) {
                window.location = this.get(UEP.URL);
            }
        },
        currentEntity : function() {
            var entity = CSS.USER;
            var cohortsinput = Y.one('#id_enrol_simplesco_entity_cohorts');
            if (cohortsinput && cohortsinput.get('checked')) {
                entity = CSS.COHORT;
            }
            return entity;
        },
        search : function(e, append) {
            var entity = this.currentEntity();

            if (e) {
                e.halt();
                e.preventDefault();
            }
            var on, params;
            if (append) {
                this.set(UEP.PAGE, this.get(UEP.PAGE)+1);
            } else {
                this.set(UEP.USERCOUNT, 0);
                this.set(UEP.COHORTCOUNT, 0);
                this.set(UEP.PAGE, 0);
            }
            var type;
            if(document.getElementById("id_enrol_simplesco_typesearch_ent").checked || document.getElementById("id_enrol_simplesco_typesearch_classe").checked) {
        		type='ldap';
        	}
            params = this.get(UEP.PARAMS);
            params['sesskey'] = M.cfg.sesskey;
            params['action'] = (entity === CSS.USER) ? 'searchusers' : 'searchcohorts';
            params['search'] = this.get(UEP.SEARCH).get('value');
            params['page'] = this.get(UEP.PAGE);
            params['enrolcount'] = this.get(UEP.ENROLCOUNT);
            params['perpage'] = this.get(UEP.PERPAGE);
            params['type']=type;
            params['code1']=document.getElementById("id_enrol_simplesco_liste1").value;
            params['code2']=document.getElementById("id_enrol_simplesco_liste2").value;
            params['code3']=document.getElementById("id_enrol_simplesco_liste3").value;
            params['code4']=document.getElementById("id_enrol_simplesco_liste4").value;
            params['code5']=document.getElementById("id_enrol_simplesco_liste5").value;

            if (this.get(UEP.MULTIPLE)) {
                alert('oh no there are multiple');
            } else {
                var instance = this.get(UEP.INSTANCES)[0];
                params['enrolid'] = instance.id;
            }
            Y.io(M.cfg.wwwroot+this.get(UEP.AJAXURL), {
                method:'POST',
                data:build_querystring(params),
                on : {
                    start : this.displayLoading,
                    complete: ((entity === CSS.USER) ? this.processSearchResults : this.processCohortsSearchResults),
                    end : this.removeLoading
                },
                context:this,
                arguments:{
                    append:append,
                    enrolid:params['enrolid']
                }
            });
        },
        displayLoading : function() {
            this._loadingNode.removeClass(CSS.HIDDEN);
        },
        removeLoading : function() {
            this._loadingNode.addClass(CSS.HIDDEN);
        },
        processSearchResults : function(tid, outcome, args) {
            try {
                var result = Y.JSON.parse(outcome.responseText);
                if (result.error) {
                    return new M.core.ajaxException(result);
                }
            } catch (e) {
                new M.core.exception(e);
            }
            if (!result.success) {
                this.setContent = M.str.enrol.errajaxsearch;
            }
            var users;
            if (!args.append) {
                users = create('<div class="'+CSS.USERS+'"></div>');
            } else {
                users = this.get(UEP.BASE).one('.'+CSS.SEARCHRESULTS+' .'+CSS.USERS);
            }
            var count = this.get(UEP.USERCOUNT);
            for (var i in result.response.users) {
                count++;
                var user = result.response.users[i];
                users.append(create('<div class="'+CSS.USER+' clearfix" rel="'+user.id+'"></div>')
                    .addClass((count%2)?CSS.ODD:CSS.EVEN)
                    .append(create('<div class="'+CSS.COUNT+'">'+count+'</div>'))
                    .append(create('<div class="'+CSS.PICTURE+'"></div>')
                        .append(create(user.picture)))
                    .append(create('<div class="'+CSS.DETAILS+'"></div>')
                        .append(create('<div class="'+CSS.FULLNAME+'">'+user.fullname+'</div>'))
                        .append(create('<div class="'+CSS.EXTRAFIELDS+'">'+user.extrafields+'</div>')))
                    .append(create('<div class="'+CSS.OPTIONS+'"></div>')
                        .append(create('<input type="button" class="'+CSS.ENROL+'" value="'+M.str.enrol.enrol+'" />')))
                );
            }
            this.set(UEP.USERCOUNT, count);
            if (!args.append) {
                var usersstr = (result.response.totalusers == '1')?M.str.enrol.ajaxoneuserfound:M.util.get_string('ajaxxusersfound','enrol', result.response.totalusers);
                var content = create('<div class="'+CSS.SEARCHRESULTS+'"></div>')
                    .append(create('<div class="'+CSS.TOTALUSERS+'">'+usersstr+'</div>'))
                    .append(users);
                if (result.response.totalusers > (this.get(UEP.PAGE)+1)*this.get(UEP.PERPAGE)) {
                    var fetchmore = create('<div class="'+CSS.MORERESULTS+'"><a href="#">'+M.str.enrol.ajaxnext25+'</a></div>');
                    fetchmore.on('click', this.search, this, true);
                    content.append(fetchmore)
                }
                this.setContent(content);
                Y.delegate("click", this.enrolUser, users, '.'+CSS.USER+' .'+CSS.ENROL, this, args);
            } else {
                if (result.response.totalusers <= (this.get(UEP.PAGE)+1)*this.get(UEP.PERPAGE)) {
                    this.get(UEP.BASE).one('.'+CSS.MORERESULTS).remove();
                }
            }
        },
        processCohortsSearchResults : function(tid, outcome, args) {
            try {
                var result = Y.JSON.parse(outcome.responseText);
                if (result.error) {
                    return new M.core.ajaxException(result);
                }
            } catch (e) {
                new M.core.exception(e);
            }
            if (!result.success) {
                this.setContent = M.str.enrol.errajaxsearch;
            }
            var cohorts;
            if (!args.append) {
                cohorts = create('<div class="'+CSS.COHORTS+'"></div>');
            } else {
                cohorts = this.get(UEP.BASE).one('.'+CSS.SEARCHRESULTS+' .'+CSS.COHORTS);
            }
            var count = this.get(UEP.COHORTCOUNT);
            for (var i in result.response.cohorts) {
                count++;
                var cohort = result.response.cohorts[i];
                cohorts.append(create('<div class="'+CSS.COHORT+' clearfix" rel="'+cohort.id+'"></div>')
                    .addClass((count%2)?CSS.ODD:CSS.EVEN)
                    .append(create('<div class="'+CSS.COUNT+'">'+count+'</div>'))
                    .append(create('<div class="'+CSS.DETAILS+'"></div>')
                        .append(create('<div class="'+CSS.COHORTNAME+'">'+cohort.name+'</div>')))
                    .append(create('<div class="'+CSS.OPTIONS+'"></div>')
                        .append(create('<input type="button" class="'+CSS.ENROL+'" value="'+'Enrol '+cohort.cnt+' users'+'" />'))) // TODO string
                );
            }
            this.set(UEP.COHORTCOUNT, count);
            if (!args.append) {
                //var usersstr = (result.response.totalusers == '1')?M.str.enrol.ajaxoneuserfound:M.util.get_string('ajaxxusersfound','enrol', result.response.totalusers);
                var cohortsstr = 'Found '+result.response.totalcohorts+' cohorts'; // TODO
                var content = create('<div class="'+CSS.SEARCHRESULTS+'"></div>')
                    .append(create('<div class="'+CSS.TOTALCOHORTS+'">'+cohortsstr+'</div>'))
                    .append(cohorts);
                if (result.response.totalcohorts > (this.get(UEP.PAGE)+1)*this.get(UEP.PERPAGE)) {
                    var fetchmore = create('<div class="'+CSS.MORERESULTS+'"><a href="#">'+M.str.enrol.ajaxnext25+'</a></div>');
                    fetchmore.on('click', this.search, this, true);
                    content.append(fetchmore)
                }
                this.setContent(content);
                Y.delegate("click", this.enrolUser, cohorts, '.'+CSS.COHORT+' .'+CSS.ENROL, this, args);
            } else {
                if (result.response.totalcohorts <= (this.get(UEP.PAGE)+1)*this.get(UEP.PERPAGE)) {
                    this.get(UEP.BASE).one('.'+CSS.MORERESULTS).remove();
                }
            }
        },
        enrolUser : function(e, args) {
            var entityname = this.currentEntity();

            var entity = e.currentTarget.ancestor('.'+entityname);
            var params = [];
            params['id'] = this.get(UEP.COURSEID);
            if (entityname === CSS.USER) {
                params['userid'] = entity.getAttribute("rel");
            } else {
                params['cohortid'] = entity.getAttribute("rel");
            }
            params['enrolid'] = args.enrolid;
            params['sesskey'] = M.cfg.sesskey;
            params['action'] = 'enrol';
            params['role'] = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.ROLE+' select').get('value');
            params['startdate'] = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.STARTDATE+' select').get('value');
            params['duration'] = this.get(UEP.BASE).one('.'+CSS.ENROLMENTOPTION+'.'+CSS.DURATION+' select').get('value');
            if (this.get(UEP.DISABLEGRADEHISTORY) != true) {
                params['recovergrades'] = this.get(UEP.BASE).one('#'+CSS.RECOVERGRADES).get('checked')?1:0;
            } else {
                params['recovergrades'] = 0;
            }

            Y.io(M.cfg.wwwroot+this.get(UEP.AJAXURL), {
                method:'POST',
                data:build_querystring(params),
                on: {
                    start : this.displayLoading,
                    complete : function(tid, outcome, args) {
                        try {
                            var result = Y.JSON.parse(outcome.responseText);
                            if (result.error) {
                                return new M.core.ajaxException(result);
                            } else {
                                args.entityNode.addClass(CSS.ENROLLED);
                                args.entityNode.one('.'+CSS.ENROL).remove();
                                this.set(UEP.REQUIREREFRESH, true);
                                var countenrol = this.get(UEP.ENROLCOUNT)+1;
                                this.set(UEP.ENROLCOUNT, countenrol);
                            }
                        } catch (e) {
                            new M.core.exception(e);
                        }
                    },
                    end : this.removeLoading
                },
                context:this,
                arguments:{
                    params : params,
                    entityNode : entity
                }
            });

        },
        setContent: function(content) {
            this.get(UEP.BASE).one('.'+CSS.CONTENT+' .'+CSS.AJAXCONTENT).setContent(content);
        }
    }, {
        NAME : UEP.NAME,
        ATTRS : {
            url : {
                validator : Y.Lang.isString
            },
            ajaxurl : {
                validator : Y.Lang.isString
            },
            base : {
                setter : function(node) {
                    var n = Y.one(node);
                    if (!n) {
                        Y.fail(UEP.NAME+': invalid base node set');
                    }
                    return n;
                }
            },
            users : {
                validator : Y.Lang.isArray,
                value : null
            },
            courseid : {
                value : null
            },
            params : {
                validator : Y.Lang.isArray,
                value : []
            },
            instances : {
                validator : Y.Lang.isArray,
                setter : function(instances) {
                    var i,ia = [], count=0;
                    for (i in instances) {
                        ia.push(instances[i]);
                        count++;
                    }
                    this.set(UEP.MULTIPLE, (count>1));
                }
            },
            multiple : {
                validator : Y.Lang.isBool,
                value : false
            },
            page : {
                validator : Y.Lang.isNumber,
                value : 0
            },
            userCount : {
                value : 0,
                validator : Y.Lang.isNumber
            },
            requiresRefresh : {
                value : false,
                validator : Y.Lang.isBool
            },
            search : {
                setter : function(node) {
                    var n = Y.one(node);
                    if (!n) {
                        Y.fail(UEP.NAME+': invalid search node set');
                    }
                    return n;
                }
            },
            lastPreSearchValue : {
                value : '',
                validator : Y.Lang.isString
            },
            strings  : {
                value : {},
                validator : Y.Lang.isObject
            },
            defaultRole : {
                value : 0
            },
            defaultStartDate : {
                value : 2,
                validator : Y.Lang.isNumber
            },
            defaultDuration : {
                value : ''
            },
            assignableRoles : {
                value : []
            },
            searchEatblissement : {
                value : []
            },
            optionsStartDate : {
                value : []
            },
            disableGradeHistory : {
                value : 0
            },
            recoverGradesDefault : {
                value : ''
            },
            enrolCount : {
                value : 0,
                validator : Y.Lang.isNumber
            },
            perPage : {
                value: 25,
                Validator: Y.Lang.isNumber
            },
            cohortCount : {
                value : 0,
                validator : Y.Lang.isNumber
            },
            cohortsAvailable : {
                value : null
            }
        }
    });
    Y.augment(USERENROLLER, Y.EventTarget);

    M.enrol_simplesco = M.enrol_simplesco || {};
    M.enrol_simplesco.quickenrolment = {
        init : function(cfg) {
            new USERENROLLER(cfg);
        }
    }

}, '@VERSION@', {requires:['base','node', 'overlay', 'io-base', 'test', 'json-parse', 'event-delegate', 'dd-plugin', 'event-key', 'moodle-core-notification']});
