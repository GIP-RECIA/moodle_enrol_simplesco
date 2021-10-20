/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_manual/quickenrolment
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('unenrolment',
    ['core/templates',
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
            BUTTON_TRIGGER: ".enrolusersbutton.enrol_simplesco_plugin.unenrol [type='submit']",
            BUTTON_LOADMORE: 'button[data-toggle="load-more"]',
            BUTTON_UNENROL: 'button[data-toggle="unenrol"]',
            BUTTON_UNENROL_ALL: 'button[data-toggle="unenrol-all"]',
            FIELD_ENTITY: 'input[name="entity"]',
            AREA_RESULTS: "div#results",
        };

        var ESCOUnenrolment = function (options) {
            this.course_id = options.course_id;
            this.instance = options.instance;
            this.init();
        };

        /** @var {Modal} modal - */
        ESCOUnenrolment.prototype.modal = null;
        /** @var {number} page - */
        ESCOUnenrolment.prototype.page = 0;
        /** @var {number} perpage - */
        ESCOUnenrolment.prototype.perpage = 25;
        /** @var {number} courseid - */
        ESCOUnenrolment.prototype.course_id = 0;
        /** @var {boolean} enrol_count - */
        ESCOUnenrolment.prototype.unenrol_count = 0;
        /** @var {array} instance - */
        ESCOUnenrolment.prototype.instance = [];
        /** @var {boolean} require_refresh - */
        ESCOUnenrolment.prototype.require_refresh = false;

        /** @var {Modal} modal */
        ESCOUnenrolment.prototype.modal = null;

        ESCOUnenrolment.prototype.init = function () {
            var context = this;
            $.when(
                Str.get_strings([
                    {component: 'enrol_simplesco', key: 'unenroltitle'}, //0
                    {component: 'enrol_simplesco', key: 'btnunenrolall'},
                    {component: 'enrol_simplesco', key: 'btnclose'},
                    {component: 'enrol_simplesco', key: 'browseusers'},
                    {component: 'enrol_simplesco', key: 'browsecohorts'},
                    {component: 'enrol', key: 'ajaxxusersfound'},
                    {component: 'enrol_simplesco', key: 'ajaxxcohortfound'},
                    {component: 'enrol', key: 'ajaxnext25'},
                    {component: 'enrol_simplesco', key: 'unenrolusers'},
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

                body += '<div class="search-control">';
                body += '<div class="entity-selector">';
                body += '<label><input type="radio" name="entity" value="users" checked="checked"/>' + strings[3] + '</label>';
                body += '<label><input type="radio" name="entity" value="cohorts"/>' + strings[4] + '</label>';
                body += '</div>';
                body += '</div>';

                body += '<div id="results"></div>';

                body += '<div id="loading" style="display:none;">CHARGEMENT</div>';

                body += '</div>';
                modal.setBody(body);

                modal.setFooter('<button class="btn btn-primary" data-toggle="unenrol-all">' + strings[1] + '</button><button class="btn btn-primary" data-action="hide">' + strings[2] + '</button>');

                modal.getRoot().on(ModalEvents.hidden, function () {
                    if (context.require_refresh) {
                        location.reload();
                    }
                });

                this.bindEvents();
                this.search();
            }.bind(this)).fail(Notification.exception);
        };

        /**
         * Bind events needed for the modal to work
         */
        ESCOUnenrolment.prototype.bindEvents = function () {
            var context = this;
            $("body").on("click", SELECTORS.BUTTON_TRIGGER, function () {
                context.modal.show();
            });

            this.modal.getBody().find(SELECTORS.FIELD_ENTITY).on("change", function (event) {
                context.search();
            });

            this.modal.getBody().on("click", SELECTORS.BUTTON_LOADMORE, function (event) {
                event.preventDefault();
                context.search(true);
                return false;
            });

            this.modal.getFooter().on("click", SELECTORS.BUTTON_UNENROL_ALL, function (event) {
                event.preventDefault();
                if (confirm('Vous allez désinscrire tous les utilisateurs de ce cours ! Voulez-vous continuer ?')) {
                    context.unenrolall();
                }
                return false;
            });

            this.modal.getBody().find(SELECTORS.AREA_RESULTS).on("click", SELECTORS.BUTTON_UNENROL,function (event) {
                event.preventDefault();
                var itemid = $(this).attr("value");
                context.unenrol(itemid);
                return false;
            });
        };
        /**
         * Send the send request to server(s) and then process the results
         */
        ESCOUnenrolment.prototype.search = function (append) {
            var context = this;

            if (append) {
                this.page++;
            } else {
                this.page = 0;
            }

            var action = "searchusersenrol";
            if (this.modal.getBody().find(SELECTORS.FIELD_ENTITY + ':checked').val() === "cohorts") {
                action = "searchcohortsenrol";
            }

            var parameters = {
                id: this.course_id,
                sesskey: M.cfg.sesskey,
                action: action,
                page: this.page,
                perpage: this.perpage,
                enrolcount: this.enrol_count,
                enrolid: this.instance.id,
            };

            context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('button[data-toggle="load-more"]').remove();
            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    var string_total_item = context.strings[5].replace("{$a}", result.response.totalusers);
                    if (action === "searchcohortsenrol") {
                        string_total_item = context.strings[6].replace("{$a}", result.response.totalcohorts);
                    }

                    if (!append) {
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).append('<div class="total_results">' + string_total_item + '</div>');
                    }
                    if (action === "searchcohortsenrol") {
                        for (var line in result.response.cohorts) {
                            var cohort = result.response.cohorts[line];
                            context.modal.getBody().find(SELECTORS.AREA_RESULTS).append(context.renderCohort(cohort));
                        }
                    } else {
                        for (var line in result.response.users) {
                            var user = result.response.users[line];
                            context.modal.getBody().find(SELECTORS.AREA_RESULTS).append(context.renderUser(user));
                        }
                    }
                    var count = context.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length;
                    if (count < result.response.totalusers) {
                        context.modal.getBody().find(SELECTORS.AREA_RESULTS).append('<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">' + context.strings[7] + '</button></div>');
                    }
                },
                error: function (resultat, statut, erreur) {
                    Notification.exception(erreur);
                },
                beforeSend: function () {
                    context.startLoading();
                }
            }).always(function () {
                context.stopLoading();
            });
        };

        /**
         * Render user data to HTML format
         * @param cohort
         */
        ESCOUnenrolment.prototype.renderCohort = function (cohort) {
            var count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".cohort").length;
            var cohort_html = '<div class="cohort item clearfix" rel="' + cohort.id + '">';

            cohort_html += '<div class="count">' + (count + 1) + '</div>';

            cohort_html += '<div class="details">';
            cohort_html += '<div class="fullname">' + cohort.name + '</div>';
            cohort_html += '</div>';

            cohort_html += '<div class="options">';
            cohort_html += '<button class="btn btn-success" data-toggle="unenrol" value="' + cohort.id + '">' + this.strings[8] + '</button>';
            cohort_html += '</div>';

            cohort_html += '</div>';

            return cohort_html;
        };

        /**
         * Render user data to HTML format
         * @param user
         */
        ESCOUnenrolment.prototype.renderUser = function (user) {
            var count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".user").length;
            var user_html = '<div class="user item clearfix" rel="' + user.id + '">';

            user_html += '<div class="count">' + (count + 1) + '</div>';
            user_html += '<div class="picture">' + user.picture + '</div>';

            user_html += '<div class="details">';
            user_html += '<div class="fullname">' + user.fullname + '</div>';
            user_html += '<div class="extrafields">' + user.extrafields + '</div>';
            user_html += '</div>';

            user_html += '<div class="options">';
            user_html += '<button class="btn btn-success" data-toggle="unenrol" value="'+ user.id+'">' + this.strings[8] + '</button>';
            user_html += '</div>';

            user_html += '</div>';

            return user_html;
        };

        /**
         * Display the loading screen
         */
        ESCOUnenrolment.prototype.startLoading = function () {
            this.modal.getBody().find("#loading").show();
        };

        /**
         * Show the loading screen
         */
        ESCOUnenrolment.prototype.stopLoading = function () {
            this.modal.getBody().find("#loading").hide();
        };

        /**
         * Enrol the given itemid
         */
        ESCOUnenrolment.prototype.unenrol = function (itemid) {
            var context = this;
            var parameters = {
                id: this.course_id,
                sesskey: M.cfg.sesskey,
                action: 'enrolcohort',
                enrolid: this.instance.id,
            };

            if (this.modal.getBody().find(SELECTORS.FIELD_ENTITY + ':checked').val() === "cohorts") {
                parameters["cohortid"] = itemid;
                parameters["action"] = 'unenrolcohort';
            }else{
                parameters["userid"] = itemid;
                parameters["action"] = 'unenroluser';
            }


            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    context.require_refresh = true;
                    context.unenrol_count++;
                    context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('div.item[rel="' + itemid + '"]').addClass("enrolled");
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
         * Enrol the given itemid
         */
        ESCOUnenrolment.prototype.unenrolall = function () {
            var context = this;
            var parameters = {
                id: this.course_id,
                sesskey: M.cfg.sesskey,
                action: 'enrolcohort',
                enrolid: this.instance.id,
            };

            if (this.modal.getBody().find(SELECTORS.FIELD_ENTITY + ':checked').val() === "cohorts") {
                parameters["action"] = 'unenrolallcohort';
            }else{
                parameters["action"] = 'unenrolalluser';
            }


            $.ajax({
                url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
                method: 'POST',
                dataType: 'json',
                data: build_querystring(parameters),
                success: function (result) {
                    if (result.error) {
                        return Notification.exception(result);
                    }
                    context.require_refresh = true;
                    context.hide();
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

        return /** @alias module:enrol_simplesco/QuickEnrolment */{
            init: function (config) {
                (new ESCOUnenrolment(config));
            }
        };
    }
);