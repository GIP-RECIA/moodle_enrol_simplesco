'use strict';
/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_simplesco/cohortenrolment
 * @package    enrol_simplesco
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import $ from 'jquery';
import {get_string, get_strings} from 'core/str';
import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';

const SELECTORS = {
    BUTTON_TRIGGER: "button#enrol_simplesco_addcohort",
    BUTTON_COLLAPSE: '.collapsible .ftoggler a',
    BUTTON_LOADMORE: 'button[data-toggle="load-more"]',
    BUTTON_ENROL: 'button[data-toggle="enrol"]',
    BUTTON_SEARCH: 'button#search',
    FIELD_TYPE: 'input[name="enrol_simplesco_typesearch"]',
    FIELD_ROLES: 'select#enrol_simplesco_assignable_roles',
    FIELD_DURATION: 'select#enrol_simplesco_assignable_duration',
    FIELD_SEARCH: 'input#enrolusersearch',
    FIELD_STARTDATE: 'select#enrol_simplesco_assignable_startdate',
    FIELD_COHORT_GROUP: 'select[name="cohort_group"]',
    AREA_RESULTS: "div#results",
};

class ESCOCohortEnrolment {
    /** @var {array} */
    strings = null;
    /** @var {Modal} modal */
    modal = null;
    /** @var {number} page - */
    page = 0;
    /** @var {number} perpage - */
    perpage = 25;
    /** @var {number} course_id - */
    course_id = 0;
    /** @var {number} role_default - */
    role_default = 0;
    /** @var {boolean} enrol_count - */
    enrol_count = 0;
    /** @var {array} assignales_roles - */
    assignales_roles = [];
    /** @var {array} instance - */
    instance = [];
    /** @var {array} start_dates - */
    start_dates = [];
    /** @var {array} groups - */
    groups = [];
    /** @var {boolean} require_refresh - */
    require_refresh = false;

    constructor(options) {
        this.course_id = options.course_id;
        this.instance = options.instance;
        this.start_dates = options.start_dates;
        this.role_default = options.role_default;
        this.init();
    }

    init() {
        const triggerButtons = $(SELECTORS.BUTTON_TRIGGER);

        Promise.all([
            get_strings([
                {component: 'enrol_simplesco', key: 'enrolcohorttitle'}, // 0
                {component: 'enrol_simplesco', key: 'btnclosecohort'},
                {component: 'role', key: 'assignroles'},
                {component: 'enrol', key: 'none'},
                {component: 'enrol', key: 'enrolmentoptions'},
                {component: 'moodle', key: 'startingfrom'},
                {component: 'enrol', key: 'enrolperiod'},
                {component: 'enrol', key: 'unlimitedduration'},
                {component: 'enrol_simplesco', key: 'searchoption'},
                {component: 'enrol', key: 'usersearch'},
                {component: 'enrol_simplesco', key: 'noresultliste'}, // 10
                {component: 'enrol_simplesco', key: 'allresultliste'},
                {component: 'enrol_simplesco', key: 'ajaxxcohortfound'},
                {component: 'enrol', key: 'ajaxnext25'},
                {component: 'enrol', key: 'enrol'},
                {component: 'enrol_simplesco', key: 'cohort'},
                {component: 'enrol_cohort', key: 'addgroup'},
            ]),
            ModalFactory.create({
                type: ModalFactory.types.DEFAULT,
                large: true,
            }, triggerButtons)])
        .then(values => {
            this.strings = values[0];
            this.modal = values[1];

            this.modal.setTitle(this.strings[0]);

            const body = `<div class="form-inline mform simplesco">
            <div class="form-group">
            <label for="enrol_simplesco_assignable_roles">${this.strings[2]} : </label>
            <select id="enrol_simplesco_assignable_roles"><option value="">${this.strings[3]}</option></select>
            </div>
            <fieldset class="collapsible collapsed" id="enrolment_options">
            <legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" 
                aria-expanded="false">${this.strings[4]}</a></legend>
            <div class="fcontainer">
            <div class="startdate form-group"><label for="enrol_simplesco_assignable_startdate">${this.strings[5]}:</label> 
                <select id="enrol_simplesco_assignable_startdate"></select></div>
            <div class="duration form-group"><label for="enrol_simplesco_assignable_duration">${this.strings[6]} :</label> 
                <select id="enrol_simplesco_assignable_duration"><option value="0" selected="selected">${this.strings[7]}
                </option></select></div>
            </div>
            </fieldset>
            <fieldset class="collapsible collapsed" id="enrolment_searchs">
            <legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" 
            aria-expanded="false">${this.strings[8]}</a></legend>
            <div class="fcontainer">
            <label for="enrolusersearch">${this.strings[9]} :</label> <input type="text" id="enrolusersearch" value="" 
                class="form-control"/>
            <div class="text-center"><button class="btn btn-primary" id="search"> ${this.strings[9]}</button></div>
            </div>
            </fieldset>
            <div id="results"></div>
            <div id="loading" style="display:none;">CHARGEMENT</div>
            </div>`;

            this.modal.setBody(body);

            this.modal.setFooter(`<button class="btn btn-primary" data-action="hide">${this.strings[1]}</button>`);

            this.modal.getRoot().on(ModalEvents.hidden, () => {
                if (this.require_refresh) {
                    location.reload();
                }
            });

            this.bindEvents();
            this.populateRoles();
            this.updateStartDateList();
            this.updateDurationsList();
        })
        .catch(Notification.exception);
    }

    /**
     * Bind events needed for the modal to work
     */
    bindEvents() {
        document.addEventListener('click', event => {
            if (event.target.closest(SELECTORS.BUTTON_TRIGGER)) {
                event.preventDefault();
                this.modal.show();
                this.modal.getBody().find(SELECTORS.BUTTON_SEARCH).trigger("click");
                return;
            }
        });
        this.modal.getBody().find(SELECTORS.BUTTON_COLLAPSE).on("click", (event) => {
            event.preventDefault();
            event.target.closest(".collapsible").classList.toggle('collapsed');
            return false;
        });
        this.modal.getBody().find(SELECTORS.BUTTON_SEARCH).on("click", (event) => {
            event.preventDefault();
            this.search();
            return false;
        });
        this.modal.getBody().find(SELECTORS.FIELD_SEARCH).on("keypress", (event) => {
            if (event.which === 13) {
                event.preventDefault();
                this.search();
                return false;
            }
        });
        this.modal.getBody().on("click", SELECTORS.BUTTON_LOADMORE, (event) => {
            event.preventDefault();
            this.search(true);
            return false;
        });
        this.modal.getBody().on("click", SELECTORS.BUTTON_ENROL, (event) => {
            event.preventDefault();
            const cohortid = $(event.target).attr("value");
            this.enrol(cohortid);
            return false;
        });
    }

    /**
     * Enrol the given userid
     */
    enrol(cohortid) {
        const parameters = {
            id: this.course_id,
            sesskey: M.cfg.sesskey,
            action: 'enrolcohort',
            enrolid: this.instance.id,
            cohortid : cohortid,
            groupeid : this.modal.getBody().find(SELECTORS.FIELD_COHORT_GROUP + '[rel="'+cohortid+'"]').val(),
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
            success: (result, statut) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                this.require_refresh = true;
                this.enrol_count++;
                this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(`div.cohort[rel="'${cohortid}"]`).addClass("enrolled");
            },
            error: (resultat, statut, erreur) => {
                Notification.exception(erreur);
            },
            beforeSend : () => {
                this.startLoading();
            }
        }).always(() => {
            this.stopLoading();
        });
    }

    /**
     * Load the list of roles from the database for given course
     */
    populateRoles() {
        if (this.assignales_roles.length > 0) {
            return this.updateRolesList();
        }
        $.ajax({
            url: M.cfg.wwwroot + '/enrol/ajax.php',
            method: 'POST',
            dataType: 'json',
            data: 'id=' + this.course_id + '&action=getassignable&sesskey=' + M.cfg.sesskey,
            success: (result, statut) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                this.assignales_roles = result.response;
                this.updateRolesList();
            },
            error: (resultat, statut, erreur) => {
                Notification.exception(erreur);
            },
            beforeSend: () => {
                this.startLoading();
            }
        }).always(() => {
            this.stopLoading();
        });
    }

    /**
     * Generate HTML for cohort display
     */
    renderCohort(cohort) {
        const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".cohort").length;
        let cohort_html = `<div class="cohort item clearfix" rel="${cohort.id}">
            <div class="count">${count}</div>
            <div class="details">
            <div class="fullname">${cohort.name}</div>
            </div>
            <div class="options">
            <select name="cohort_group" rel="${cohort.id}">`;

        for (let id in this.groups) {
            cohort_html += `<option value="${id}">${this.groups[id]}</option>`;
        }

        cohort_html += `</select>
            <button class="btn btn-success" data-toggle="enrol" value="${cohort.id}">
                ${this.strings[14]}</button>
            </div>
            </div>`;

        return cohort_html;
    }

    /**
     * Send the send request to server(s) and then process the results
     */
    search(append) {
        if (append) {
            this.page++;
        } else {
            this.page = 0;
        }
        const parameters = {
            id: this.course_id,
            sesskey: M.cfg.sesskey,
            action: 'searchcohorts',
            search: this.modal.getBody().find(SELECTORS.FIELD_SEARCH).val(),
            page: this.page,
            perpage: this.perpage,
            enrolcount: this.enrol_count,
            enrolid: this.instance.id,
        };
        this.modal.getBody().find(SELECTORS.AREA_RESULTS).find('button[data-toggle="load-more"]').remove();
        $.ajax({
            url: M.cfg.wwwroot + '/enrol/simplesco/ajax.php',
            method: 'POST',
            dataType: 'json',
            data: build_querystring(parameters),
            success: (result, statut) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                if (!append) {
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS)
                        .append('<div class="total_results">' + this.strings[12].replace("{$a}",
                            result.response.totalcohorts) + '</div>');
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS)
                        .append('<div class="item cohort clearfix"><div class="count">N°</div><div class="details">'
                            + this.strings[14] + '</div><div class="options">' + this.strings[15] + '</div></div>');
                }
                this.groups = result.response.group;
                for (let line in result.response.cohorts) {
                    const cohort = result.response.cohorts[line];
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(this.renderCohort(cohort));
                }
                const count = (this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length - 1);
                if (count < result.response.totalcohorts) {
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS)
                        .append('<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">'
                            + this.strings[13] + '</button></div>');
                }
            },
            error: (resultat, statut, erreur) => {
                Notification.exception(erreur);
            },
            beforeSend: () => {
                this.startLoading();
            }
        }).always(() => {
            this.stopLoading();
        });
    }

    /**
     * Display the loading screen
     */
    startLoading() {
        this.modal.getBody().find("#loading").show();
    }

    /**
     * Show the loading screen
     */
    stopLoading() {
        this.modal.getBody().find("#loading").hide();
    }

    /**
     * Update the roles select field
     */
    updateRolesList() {
        const select = this.modal.getBody().find(SELECTORS.FIELD_ROLES);
        for (let i in this.assignales_roles) {
            const selected = (this.role_default == this.assignales_roles[i].id) ? 'selected="selected"' : "";
            $(select).append('<option value="' + this.assignales_roles[i].id + '" '+ selected + '>' + this.assignales_roles[i].name
                + '</option>');
        }
    }

    /**
     * Update the durations select field
     */
    updateDurationsList() {
        const select = this.modal.getBody().find(SELECTORS.FIELD_DURATION);

        $.when(get_string('durationdays', 'enrol', '{a}')).then((text) => {
            for (let i = 1; i <= 365; i++) {
                $(select).append('<option value="' + i + '">' + text.replace('{a}', i) + '</option>');
            }
        });
    }

    /**
     * Update the start date select field
     */
    updateStartDateList() {
        const select = this.modal.getBody().find(SELECTORS.FIELD_STARTDATE);

        for (let i in this.start_dates) {
            $(select).append('<option value="' + i + '">' + this.start_dates[i] + '</option>');
        }
    }

}

export const init = config => {
    (new ESCOCohortEnrolment(config));
};