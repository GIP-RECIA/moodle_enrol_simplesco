'use strict';
/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_simplesco/unenrolment
 * @package    enrol_simplesco
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import $ from 'jquery';
import {get_strings} from 'core/str';
import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';
import ModalEvents from 'core/modal_events';

const SELECTORS = {
    BUTTON_TRIGGER: ".enrolusersbutton.enrol_simplesco_plugin.unenrol [type='submit']",
    BUTTON_LOADMORE: 'button[data-toggle="load-more"]',
    BUTTON_UNENROL: 'button[data-toggle="unenrol"]',
    BUTTON_UNENROL_ALL: 'button[data-toggle="unenrol-all"]',
    FIELD_ENTITY: 'input[name="entity"]',
    AREA_RESULTS: "div#results",
};

class ESCOUnenrolment {
    /** @var {array} */
    strings = null;
    /** @var {Modal} modal - */
    modal = null;
    /** @var {number} page - */
    page = 0;
    /** @var {number} perpage - */
    perpage = 25;
    /** @var {number} course_id - */
    course_id = 0;
    /** @var {boolean} unenrol_count - */
    unenrol_count = 0;
    /** @var {array} instance - */
    instance = [];
    /** @var {boolean} require_refresh - */
    require_refresh = false;

    constructor(options) {
        this.course_id = options.course_id;
        this.instance = options.instance;
        this.init();
    }

    init() {
        Promise.all([
            get_strings([
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
            }, undefined)])
        .then(values => {
            this.strings = values[0];
            this.modal = values[1];

            this.modal.setTitle(this.strings[0]);

            const body = `<div class="form-inline mform simplesco">
            <div class="search-control">
            <div class="entity-selector">
            <label><input type="radio" name="entity" value="users" checked="checked"/>${this.strings[3]}</label>
            <label><input type="radio" name="entity" value="cohorts"/>${this.strings[4]}</label>
            </div>
            </div>
            <div id="results"></div>
            <div id="loading" style="display:none;">CHARGEMENT</div>
            </div>`;

            this.modal.setBody(body);

            this.modal.setFooter(`<button class="btn btn-primary" data-toggle="unenrol-all">${this.strings[1]}</button>
            <button class="btn btn-primary" data-action="hide">${this.strings[2]}</button>`);

            this.modal.getRoot().on(ModalEvents.hidden, () => {
                if (this.require_refresh) {
                    location.reload();
                }
            });

            this.bindEvents();
            this.search();
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
                return;
            }
        });

        this.modal.getBody().find(SELECTORS.FIELD_ENTITY).on("change", (/*event*/) => {
            this.search();
        });

        this.modal.getBody().on("click", SELECTORS.BUTTON_LOADMORE, (event) => {
            event.preventDefault();
            this.search(true);
            return false;
        });

        this.modal.getFooter().on("click", SELECTORS.BUTTON_UNENROL_ALL, (event) => {
            event.preventDefault();
            if (confirm('Vous allez désinscrire tous les utilisateurs de ce cours ! Voulez-vous continuer ?')) {
                this.unenrolall();
            }
            return false;
        });

        this.modal.getBody().find(SELECTORS.AREA_RESULTS).on("click", SELECTORS.BUTTON_UNENROL,(event) => {
            event.preventDefault();
            const itemid = $(event.target).attr("value");
            this.unenrol(itemid);
            return false;
        });
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

        let action = "searchusersenrol";
        if (this.modal.getBody().find(SELECTORS.FIELD_ENTITY + ':checked').val() === "cohorts") {
            action = "searchcohortsenrol";
        }

        const parameters = {
            id: this.course_id,
            sesskey: M.cfg.sesskey,
            action: action,
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
            // eslint-disable-next-line no-unused-vars
            data: build_querystring(parameters),
            success: (result) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                let string_total_item = this.strings[5].replace("{$a}", result.response.totalusers);
                if (action === "searchcohortsenrol") {
                    string_total_item = this.strings[6].replace("{$a}", result.response.totalcohorts);
                }

                if (!append) {
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(`<div class="total_results">${string_total_item}
                        </div>`);
                }
                if (action === "searchcohortsenrol") {
                    for (let line in result.response.cohorts) {
                        const cohort = result.response.cohorts[line];
                        this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(this.renderCohort(cohort));
                    }
                } else {
                    for (let line in result.response.users) {
                        const user = result.response.users[line];
                        this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(this.renderUser(user));
                    }
                }
                const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length;
                if (count < result.response.totalusers) {
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS)
                        .append(`<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">'
                            ${this.strings[7]}</button></div>`);
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
     * Render user data to HTML format
     * @param cohort
     */
    renderCohort(cohort) {
        const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".cohort").length;
        const cohort_html = `<div class="cohort item clearfix" rel="${cohort.id}">
        <div class="count">${count + 1}</div>
        <div class="details">
        <div class="fullname">${cohort.name}</div>
        </div>
        <div class="options">
        <button class="btn btn-success" data-toggle="unenrol" value="${cohort.id}">
            ${this.strings[8]}</button>
        </div>
        </div>`;

        return cohort_html;
    }

    /**
     * Render user data to HTML format
     * @param user
     */
    renderUser(user) {
        const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".user").length;
        const user_html = `<div class="user item clearfix" rel="${user.id}">
        <div class="count">${count + 1}</div>
        <div class="picture">${user.picture}</div>
        <div class="details">
        <div class="fullname">${user.fullname}</div>
        <div class="extrafields">${user.extrafields}</div>
        </div>
        <div class="options">
        <button class="btn btn-success" data-toggle="unenrol" value="${user.id}">${this.strings[8]}</button>
        </div>
        </div>`;

        return user_html;
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
     * Enrol the given itemid
     */
    unenrol(itemid) {
        const parameters = {
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
            // eslint-disable-next-line no-unused-vars
            data: build_querystring(parameters),
            success: (result) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                this.require_refresh = true;
                this.unenrol_count++;
                this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(`div.item[rel="${itemid}"]`).addClass("enrolled");
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
     * Enrol the given itemid
     */
    unenrolall() {
        let parameters = {
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
            // eslint-disable-next-line no-unused-vars
            data: build_querystring(parameters),
            success: (result) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                this.require_refresh = true;
                this.hide();
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
}

export const init = config => {
    (new ESCOUnenrolment(config));
};