/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_manual/quickenrolment
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define(['core/templates',
        'jquery',
        'core/str',
        'core/config',
        'core/notification',
        'core/yui',
        'core/modal_factory',
        'core/modal_events',
        'core/fragment',
    ],
    function (Template, $, Str, Config, Notification, Y, ModalFactory, ModalEvents, Fragment) {

        var SELECTORS = {
            BUTTON_TRIGGER: "button#enrol_simplesco_adduser",
            BUTTON_COLLAPSE: '.collapsible .ftoggler a',
            BUTTON_LOADMORE: 'button[data-toggle="load-more"]',
            BUTTON_ENROL: 'button[data-toggle="enrol"]',
            BUTTON_SEARCH: 'button#search',
            FIELD_TYPE: 'input[name="enrol_simplesco_typesearch"]',
            FIELD_ROLES: 'select#enrol_simplesco_assignable_roles',
            FIELD_DURATION: 'select#enrol_simplesco_assignable_duration',
            FIELD_SEARCH: 'input#enrolusersearch',
            FIELD_STARTDATE: 'select#enrol_simplesco_assignable_startdate',
            AREA_RESULTS: "div#results",
        };

        var ESCOUserEnrolment = function (options) {
            this.course_id = options.course_id;
            this.instance = options.instance;
            this.start_dates = options.start_dates;
            this.role_default = options.role_default;
            this.init();
        };

        /** @var {Modal} modal - */
        ESCOUserEnrolment.prototype.modal = null;
        /** @var {number} page - */
        ESCOUserEnrolment.prototype.page = 0;
        /** @var {number} perpage - */
        ESCOUserEnrolment.prototype.perpage = 25;
        /** @var {number} courseid - */
        ESCOUserEnrolment.prototype.course_id = 0;
        /** @var {number} courseid - */
        ESCOUserEnrolment.prototype.role_default = 0;
        /** @var {number} enrol_count - */
        ESCOUserEnrolment.prototype.enrol_count = 0;
        /** @var {array} assignales_roles - */
        ESCOUserEnrolment.prototype.assignales_roles = [];
        /** @var {array} instance - */
        ESCOUserEnrolment.prototype.instance = [];
        /** @var {array} start_dates - */
        ESCOUserEnrolment.prototype.start_dates = [];
        /** @var {boolean} require_refresh - */
        ESCOUserEnrolment.prototype.require_refresh = false;

        /** @var {Modal} modal */
        ESCOUserEnrolment.prototype.modal = null;

        ESCOUserEnrolment.prototype.init = function () {
            var context = this;
            $.when(
                Str.get_strings([
                    {component: 'enrol', key: 'enrolusers'}, //0
                    {component: 'enrol', key: 'finishenrollingusers'},
                    {component: 'role', key: 'assignroles'},
                    {component: 'enrol', key: 'none'},
                    {component: 'enrol', key: 'enrolmentoptions'},
                    {component: 'moodle', key: 'startingfrom'},
                    {component: 'enrol', key: 'enrolperiod'},
                    {component: 'enrol', key: 'unlimitedduration'},
                    {component: 'enrol_simplesco', key: 'searchoption'},
                    {component: 'enrol_simplesco', key: 'frommyclass'},
                    {component: 'enrol_simplesco', key: 'fromnetocentre'}, //10
                    {component: 'enrol_simplesco', key: 'byname'},
                    {component: 'enrol_simplesco', key: 'fitre1name'},
                    {component: 'enrol_simplesco', key: 'fitre2name'},
                    {component: 'enrol_simplesco', key: 'fitre3name'},
                    {component: 'enrol_simplesco', key: 'fitre4name'},
                    {component: 'enrol_simplesco', key: 'fitre5name'},
                    {component: 'enrol_simplesco', key: 'fitre6name'},
                    {component: 'enrol', key: 'usersearch'},
                    {component: 'enrol_simplesco', key: 'noresultliste'},
                    {component: 'enrol_simplesco', key: 'allresultliste'}, //20
                    {component: 'enrol', key: 'ajaxxusersfound'},
                    {component: 'enrol', key: 'ajaxnext25'},
                    {component: 'enrol', key: 'enrol'},
                ]),
                ModalFactory.create({
                    type: ModalFactory.types.DEFAULT,
                    large: true,
                }, undefined)
            ).then(function (strings, modal) {
                this.strings = strings;
                this.modal = modal;

                modal.setTitle(strings[0]);


                var body = '<div class="form-inline mform simplesco">';

                body += '<div class="form-group">';
                body += '<label for="enrol_simplesco_assignable_roles">' + strings[2] + ' : </label>';
                body += '<select id="enrol_simplesco_assignable_roles"><option value="">' + strings[3] + '</option></select>';
                body += '</div>';

                body += '<fieldset class="collapsible collapsed" id="enrolment_options">';
                body += '<legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" aria-expanded="false">' + strings[4] + '</a></legend>';
                body += '<div class="fcontainer">';
                body += '<div class="startdate form-group"><label for="enrol_simplesco_assignable_startdate">' + strings[5] + ':</label> <select id="enrol_simplesco_assignable_startdate"></select></div>';
                body += '<div class="duration form-group"><label for="enrol_simplesco_assignable_duration">' + strings[6] + ' :</label> <select id="enrol_simplesco_assignable_duration"><option value="0" selected="selected">' + strings[7] + '</option></select></div>';
                body += '</div>';
                body += '</fieldset>';

                body += '<fieldset class="collapsible" id="enrolment_options">';
                body += '<legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" aria-expanded="false">' + strings[8] + '</a></legend>';
                body += '<div class="fcontainer">';
                body += '<div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_classe" name="enrol_simplesco_typesearch" value="classe" checked="checked"/>' + strings[9] + '</label></div>';
                body += '<div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_ent" name="enrol_simplesco_typesearch" value="ent"/>' + strings[10] + '</label></div>';
                body += '<div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_nom" name="enrol_simplesco_typesearch" value="nom"/>' + strings[11] + '</label></div>';

                body += '<div id="enrol_simplesco_selects">';
                body += '<div class="form-group"><label for="enrol_simplesco_liste1">' + strings[12] + ' :</label><select id="enrol_simplesco_liste1" name="code1" style="max-width: 300px; width:100%;"></select></div>'
                body += '<div class="form-group"><label for="enrol_simplesco_liste2">' + strings[13] + ' :</label><select id="enrol_simplesco_liste2" name="code2" style="max-width: 300px; width:100%;"></select></div>'
                body += '<div class="form-group"><label for="enrol_simplesco_liste3">' + strings[14] + ' :</label><select id="enrol_simplesco_liste3" name="code3" style="max-width: 300px; width:100%;"></select></div>'
                body += '<div class="form-group"><label for="enrol_simplesco_liste4">' + strings[15] + ' :</label><select id="enrol_simplesco_liste4" name="code4" style="max-width: 300px; width:100%;"></select></div>'
                body += '<div class="form-group"><label for="enrol_simplesco_liste5">' + strings[16] + ' :</label><select id="enrol_simplesco_liste5" name="code5" style="max-width: 300px; width:100%;"></select></div>'
                body += '</div>';
                body += '<div id="enrol_simplesco_input form-group">';
                body += '<label for="enrolusersearch">' + strings[17] + ' :</label> <input type="text" id="enrolusersearch" value="" class="form-control" style="max-width: 300px; width:100%;"/>';
                body += '</div>';
                body += '<div class="text-center"><button class="btn btn-primary" id="search"> ' + strings[18] + '</button></div>';
                body += '</div>';
                body += '</fieldset>';

                body += '<div id="results"></div>';

                body += '<div id="loading" style="display:none;">CHARGEMENT</div>';

                body += '</div>';
                modal.setBody(body);

                modal.setFooter('<button class="btn btn-primary" data-action="hide">' + strings[1] + '</button>');

                modal.getRoot().on(ModalEvents.hidden, function() {
                    if(context.require_refresh){
                        location.reload();
                    }
                });

                this.bindEvents();
                this.displayLists();
                this.populateRoles();
                this.updateStartDateList();
                this.updateDurationsList();
            }.bind(this)).fail(Notification.exception);
        };

        /**
         * Bind events needed for the modal to work
         */
        ESCOUserEnrolment.prototype.bindEvents = function () {
            var context = this;
            $("body").on("click", SELECTORS.BUTTON_TRIGGER, function () {
                context.modal.show();
            });

            this.modal.getBody().find(SELECTORS.FIELD_TYPE).on("change", function () {
                context.displayLists();
            });

            this.modal.getBody().find(SELECTORS.BUTTON_COLLAPSE).on("click", function (event) {
                event.preventDefault();
                $(this).closest(".collapsible").toggleClass("collapsed");
                return false;
            });

            this.modal.getBody().find("#enrol_simplesco_liste1").on("change", function () {
                context.refreshSearchLists(this);
            });

            this.modal.getBody().find(SELECTORS.BUTTON_SEARCH).on("click", function (event) {
                event.preventDefault();
                context.search();
                return false;
            });
            this.modal.getBody().find(SELECTORS.FIELD_SEARCH).on("keypress", function(event){
                if(event.which === 13){
                    event.preventDefault();
                    context.search();
                    return false;
                }
            });

            this.modal.getBody().on("click", SELECTORS.BUTTON_LOADMORE, function (event) {
                event.preventDefault();
                context.search(true);
                return false;
            });
            this.modal.getBody().on("click", SELECTORS.BUTTON_ENROL, function (event) {
                event.preventDefault();
                var userid = $(this).attr("value");
                context.enrol(userid);
                return false;
            });
        };

        /**
         * Change the display of listes based on selected search type
         */
        ESCOUserEnrolment.prototype.displayLists = function () {
            switch (this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val()) {
                case "classe" :
                    this.modal.getBody().find("#enrol_simplesco_liste1").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste2").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste3").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste4").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste5").closest('.form-group').hide();
                    this.refreshSearchLists();
                    break;
                case "ent" :
                    this.modal.getBody().find("#enrol_simplesco_liste1").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste2").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste3").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste4").closest('.form-group').show();
                    this.modal.getBody().find("#enrol_simplesco_liste5").closest('.form-group').show();
                    this.refreshSearchLists();
                    break;
                case "nom" :
                    this.modal.getBody().find("#enrol_simplesco_liste1").closest('.form-group').hide();
                    this.modal.getBody().find("#enrol_simplesco_liste2").closest('.form-group').hide();
                    this.modal.getBody().find("#enrol_simplesco_liste3").closest('.form-group').hide();
                    this.modal.getBody().find("#enrol_simplesco_liste4").closest('.form-group').hide();
                    this.modal.getBody().find("#enrol_simplesco_liste5").closest('.form-group').hide();
                    break;
            }
        };

        /**
         * Enrol the given userid
         */
        ESCOUserEnrolment.prototype.enrol = function (userid) {
            var context = this;
            var parameters = {
                id: this.course_id,
                sesskey: M.cfg.sesskey,
                action: 'enrol',
                enrolid: this.instance.id,
                userid : userid,
                role : this.modal.getBody().find(SELECTORS.FIELD_ROLES).val(),
                startdate : this.modal.getBody().find(SELECTORS.FIELD_STARTDATE).val(),
                duration : this.modal.getBody().find(SELECTORS.FIELD_DURATION).val(),
                recovergrades : 0,
            };
            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result, statut) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    context.require_refresh = true;
                    context.enrol_count++;
                    context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('div.user[rel="' + userid + '"]').addClass("enrolled");
                },
                error: function (resultat, statut, erreur) {
                    Notification.exception(erreur);
                },
                beforeSend : function(){
                    context.startLoading();
                }
            }).always(function(){
                context.stopLoading();
            });
        };

        /**
         * Load the list of roles from the database for given course
         */
        ESCOUserEnrolment.prototype.populateRoles = function () {
            if (this.assignales_roles.length > 0) {
                return this.updateRolesList();
            }
            var context = this;
            $.ajax({
                url: M.cfg.wwwroot + '/enrol/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: 'id=' + this.course_id + '&action=getassignable&sesskey=' + M.cfg.sesskey,
                success: function (result, statut) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    context.assignales_roles = result.response;
                    context.updateRolesList();
                },
                error: function (resultat, statut, erreur) {
                    Notification.exception(erreur);
                },
                beforeSend : function(){
                    context.startLoading();
                }
            }).always(function(){
                context.stopLoading();
            });
        };

        /**
         * Based on the type of search, refresh content of search lists
         */
        ESCOUserEnrolment.prototype.refreshSearchLists = function (listes) {
            var code1 = this.modal.getBody().find("select#enrol_simplesco_liste1").val();
            if (listes == undefined) {
                listes = "12345";
            } else if (typeof(listes) == "object") {
                listes = '345';
            }
            if (code1 == null) {
                code1 = "";
            }
            var parameters = {
                id: this.course_id,
                action: 'getListes',
                sesskey: M.cfg.sesskey,
                code1: code1,
                option: this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val(),
                numliste: listes
            }
            var context = this;
            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result, statut) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    for (var i = 0; i < parameters.numliste.length; i++) {
                        var id_liste = parameters.numliste.charAt(i);
                        var $liste = context.modal.getBody().find("#enrol_simplesco_liste" + id_liste);
                        var value = result.response["defaut" + id_liste];
                        $liste.html("");
                        if (result.response[id_liste].length == 0) {
                            $liste.append('<option value="">' + context.strings[19] + '</option>');
                        } else {
                            for (var j in result.response[id_liste]) {
                                $liste.append('<option value="' + j + '">' + result.response[id_liste][j] + '</option>');
                            }
                            if (id_liste != 1) {
                                $liste.append('<option value="">' + context.strings[20] + '</option>');
                            }
                        }
                        $liste.val(value);
                    }
                },
                error: function (resultat, statut, erreur) {
                    Notification.exception(erreur);
                },
                beforeSend : function(){
                    context.startLoading();
                }
            }).always(function(){
                context.stopLoading();
            });
        };

        /**
         * Render user data to HTML format
         * @param user
         */
        ESCOUserEnrolment.prototype.renderUser = function (user) {
            var count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".user").length;
            var user_html = '<div class="user item clearfix" rel="' + user.id + '">';

            user_html += '<div class="count">' + (count + 1) + '</div>';
            user_html += '<div class="picture">' + user.picture + '</div>';

            user_html += '<div class="details">';
            user_html += '<div class="fullname">' + user.fullname + '</div>';
            user_html += '<div class="extrafields">' + user.extrafields + '</div>';
            user_html += '</div>';

            user_html += '<div class="options">';
            user_html += '<button class="btn btn-success" data-toggle="enrol" value="'+ user.id+'">' + this.strings[23] + '</button>';
            user_html += '</div>';

            user_html += '</div>';

            return user_html;
        };
        /**
         * Send the send request to server(s) and then process the results
         */
        ESCOUserEnrolment.prototype.search = function (append) {
            var context = this;
            var type;

            if(append){
                this.page++;
            }else{
                this.page = 0;
            }
            if (["classe", "ent"].indexOf(this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val()) !== -1) {
                type = 'ldap';
            }
            var parameters = {
                id: this.course_id,
                sesskey: M.cfg.sesskey,
                action: 'searchusers',
                search: this.modal.getBody().find(SELECTORS.FIELD_SEARCH).val(),
                option: this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val(),
                numliste: "12345",
                page: this.page,
                perpage: this.perpage,
                enrolcount: this.enrol_count,
                enrolid: this.instance.id,
                type: type,
                code1: this.modal.getBody().find("#enrol_simplesco_liste1").val(),
                code2: this.modal.getBody().find("#enrol_simplesco_liste2").val(),
                code3: this.modal.getBody().find("#enrol_simplesco_liste3").val(),
                code4: this.modal.getBody().find("#enrol_simplesco_liste4").val(),
                code5: this.modal.getBody().find("#enrol_simplesco_liste5").val(),
            };
            context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('button[data-toggle="load-more"]').remove();
            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result, statut) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    if(!append){
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).append('<div class="total_results">' + context.strings[21].replace("{$a}", result.response.totalusers) + '</div>');
                    }
                    for (var line in result.response.users) {
                        var user = result.response.users[line];
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).append(context.renderUser(user));
                    }
                    var count = context.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length;
                    if(count < result.response.totalusers){
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).append('<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">'+ context.strings[22] + '</button></div>');
                    }
                },
                error: function (resultat, statut, erreur) {
                    Notification.exception(erreur);
                },
                beforeSend : function(){
                    context.startLoading();
                }
            }).always(function(){
                context.stopLoading();
            });
        };
        /**
         * Display the loading screen
         */
        ESCOUserEnrolment.prototype.startLoading = function () {
            this.modal.getBody().find("#loading").show();
        };
        /**
         * Show the loading screen
         */
        ESCOUserEnrolment.prototype.stopLoading = function () {
            this.modal.getBody().find("#loading").hide();
        };
        /**
         * Update the roles select field
         */
        ESCOUserEnrolment.prototype.updateRolesList = function () {
            var select = this.modal.getBody().find(SELECTORS.FIELD_ROLES);
            for (var i in this.assignales_roles) {
                var selected = (this.role_default == this.assignales_roles[i].id) ? 'selected="selected"' : "";
                $(select).append('<option value="' + this.assignales_roles[i].id + '" '+ selected + '>' + this.assignales_roles[i].name + '</option>');
            }
        };

        /**
         * Update the durations select field
         */
        ESCOUserEnrolment.prototype.updateDurationsList = function () {
            var select = this.modal.getBody().find(SELECTORS.FIELD_DURATION);

            $.when(Str.get_string('durationdays', 'enrol', '{a}')).then(function (text) {
                for (var i = 1; i <= 365; i++) {
                    $(select).append('<option value="' + i + '">' + text.replace('{a}', i) + '</option>');
                }
            });
        };

        /**
         * Update the start date select field
         */
        ESCOUserEnrolment.prototype.updateStartDateList = function () {
            var select = this.modal.getBody().find(SELECTORS.FIELD_STARTDATE);

            for (var i in this.start_dates) {
                $(select).append('<option value="' + i + '">' + this.start_dates[i] + '</option>');
            }

        };

        return /** @alias module:enrol_simplesco/QuickEnrolment */{
            init: function (config) {
                (new ESCOUserEnrolment(config));
            }
        };
    }
);