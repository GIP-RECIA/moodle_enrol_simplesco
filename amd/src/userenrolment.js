'use strict';
/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_simplesco/userenrolment
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

class ESCOUserEnrolment {
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
    /** @var {number} role_default - */
    role_default = 0;
    /** @var {number} enrol_count - */
    enrol_count = 0;
    /** @var {array} assignales_roles - */
    assignales_roles = [];
    /** @var {array} instance - */
    instance = [];
    /** @var {array} start_dates - */
    start_dates = [];
    /** @var {boolean} require_refresh - */
    require_refresh = false;
    /** @var {Modal} modal */
    modal = null;

    constructor(options) {
        this.course_id = options.course_id;
        this.instance = options.instance;
        this.start_dates = options.start_dates;
        this.role_default = options.role_default;
        this.init();
    }

    init() {
        Promise.all([
            get_strings([
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
            }, undefined)])
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
            <div class="startdate form-group"><label for="enrol_simplesco_assignable_startdate">${this.strings[5]} 
                :</label> <select id="enrol_simplesco_assignable_startdate"></select></div>
            <div class="duration form-group"><label for="enrol_simplesco_assignable_duration">${this.strings[6]} 
                :</label> <select id="enrol_simplesco_assignable_duration"><option value="0" selected="selected">
                ${this.strings[7]}</option></select></div>
            </div>
            </fieldset>
            <fieldset class="collapsible" id="enrolment_options">
            <legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" 
                aria-expanded="false">${this.strings[8]}</a></legend>
            <div class="fcontainer">
            <div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_classe" 
                name="enrol_simplesco_typesearch" value="classe" checked="checked"/>${this.strings[9]}</label></div>
            <div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_ent" 
                name="enrol_simplesco_typesearch" value="ent"/>${this.strings[10]}</label></div>
            <div class="radio"><label><input type="radio" id="enrol_simplesco_typesearch_nom" 
                name="enrol_simplesco_typesearch" value="nom"/>${this.strings[11]}</label></div>
            <div id="enrol_simplesco_selects">
            <div class="form-group"><label for="enrol_simplesco_liste1">${this.strings[12]} :</label>
                <select id="enrol_simplesco_liste1" name="code1" style="max-width: 300px; width:100%;"></select></div>
            <div class="form-group"><label for="enrol_simplesco_liste2">${this.strings[13]} :</label>
                <select id="enrol_simplesco_liste2" name="code2" style="max-width: 300px; width:100%;"></select></div>
            <div class="form-group"><label for="enrol_simplesco_liste3">${this.strings[14]} :</label>
                <select id="enrol_simplesco_liste3" name="code3" style="max-width: 300px; width:100%;"></select></div>
            <div class="form-group"><label for="enrol_simplesco_liste4">${this.strings[15]} :</label>
                <select id="enrol_simplesco_liste4" name="code4" style="max-width: 300px; width:100%;"></select></div>
            <div class="form-group"><label for="enrol_simplesco_liste5">${this.strings[16]} :</label>
                <select id="enrol_simplesco_liste5" name="code5" style="max-width: 300px; width:100%;"></select></div>
            </div>
            <div id="enrol_simplesco_input form-group">
            <label for="enrolusersearch">${this.strings[17]} :</label>
                <input type="text" id="enrolusersearch" value="" class="form-control" style="max-width: 300px; width:100%;"/>
            </div>
            <div class="text-center"><button class="btn btn-primary" id="search"> ${this.strings[18]}</button></div>
            </div>
            </fieldset>
            <div id="results"></div>
            <div id="loading" style="display:none;">CHARGEMENT</div>
            </div>`;
            this.modal.setBody(body);

            this.modal.setFooter(`<button class="btn btn-primary" data-action="hide">${this.strings[1]}</button>`);

            this.modal.getRoot().on(ModalEvents.hidden, () => {
                if(this.require_refresh){
                    location.reload();
                }
            });

            this.bindEvents();
            this.displayLists();
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
                return;
            }
        });

        this.modal.getBody().find(SELECTORS.FIELD_TYPE).on("change", () => {
            this.displayLists();
        });

        this.modal.getBody().find(SELECTORS.BUTTON_COLLAPSE).on("click", (event) => {
            event.preventDefault();
            event.target.closest(".collapsible").classList.toggle('collapsed');
            return false;
        });

        this.modal.getBody().find("#enrol_simplesco_liste1").on("change", (event) => {
            this.refreshSearchLists(event.target);
        });

        this.modal.getBody().find(SELECTORS.BUTTON_SEARCH).on("click", (event) => {
            event.preventDefault();
            this.search();
            return false;
        });
        this.modal.getBody().find(SELECTORS.FIELD_SEARCH).on("keypress", (event) => {
            if(event.which === 13){
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
            const userid = $(event.target).attr("value");
            this.enrol(userid);
            return false;
        });
    }

    /**
     * Change the display of listes based on selected search type
     */
    displayLists() {
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
    }

    /**
     * Enrol the given userid
     */
    enrol(userid) {
        const parameters = {
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
            success: (result, statut) => {
                if (result.error) {
                    return Notification.exception(result);
                }
                this.require_refresh = true;
                this.enrol_count++;
                this.modal.getBody().find(SELECTORS.AREA_RESULTS).find('div.user[rel="' + userid + '"]').addClass("enrolled");
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
            beforeSend : () => {
                this.startLoading();
            }
        }).always(() => {
            this.stopLoading();
        });
    }

    /**
     * Based on the type of search, refresh content of search lists
     */
    refreshSearchLists(listes) {
        let code1 = this.modal.getBody().find("select#enrol_simplesco_liste1").val();
        if (listes == undefined) {
            listes = "12345";
        } else if (typeof(listes) == "object") {
            listes = '345';
        }
        if (code1 === null) {
            code1 = "";
        }
        const parameters = {
            id: this.course_id,
            action: 'getListes',
            sesskey: M.cfg.sesskey,
            code1: code1,
            option: this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val(),
            numliste: listes
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
                for (let i = 0; i < parameters.numliste.length; i++) {
                    const id_liste = parameters.numliste.charAt(i);
                    const $liste = this.modal.getBody().find("#enrol_simplesco_liste" + id_liste);
                    const value = result.response["defaut" + id_liste];
                    $liste.html("");
                    if (result.response[id_liste].length == 0) {
                        $liste.append(`<option value="">${this.strings[19]}</option>`);
                    } else {
                        for (let j in result.response[id_liste]) {
                            $liste.append(`<option value="${j}">${result.response[id_liste][j]}</option>`);
                        }
                        if (id_liste != 1) {
                            $liste.append(`<option value="">${this.strings[20]}</option>`);
                        }
                    }
                    $liste.val(value);
                }
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
        <button class="btn btn-success" data-toggle="enrol" value="${user.id}">${this.strings[23]}</button>
        </div>
        </div>`;

        return user_html;
    }

    /**
     * Send the send request to server(s) and then process the results
     */
    search(append) {
        let type;

        if(append){
            this.page++;
        }else{
            this.page = 0;
        }
        if (["classe", "ent"].indexOf(this.modal.getBody().find(SELECTORS.FIELD_TYPE + ':checked').val()) !== -1) {
            type = 'ldap';
        }
        const parameters = {
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
                if(!append){
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).append('<div class="total_results">'
                        + this.strings[21].replace("{$a}", result.response.totalusers) + '</div>');
                }
                for (let line in result.response.users) {
                    const user = result.response.users[line];
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(this.renderUser(user));
                }
                const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length;
                if (count < result.response.totalusers){
                    this.modal.getBody().find(SELECTORS.AREA_RESULTS).append(
                        '<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">'
                        + this.strings[22] + '</button></div>');
                }
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
            $(select)
                .append(`<option value="${this.assignales_roles[i].id}" ${selected}>${this.assignales_roles[i].name}</option>`);
        }
    }

    /**
     * Update the durations select field
     */
    updateDurationsList() {
        const select = this.modal.getBody().find(SELECTORS.FIELD_DURATION);

        $.when(get_string('durationdays', 'enrol', '{a}')).then((text) => {
            for (let i = 1; i <= 365; i++) {
                $(select).append(`<option value="${i}">` + text.replace('{a}', i) + '</option>');
            }
        });
    }

    /**
     * Update the start date select field
     */
    updateStartDateList() {
        const select = this.modal.getBody().find(SELECTORS.FIELD_STARTDATE);

        for (let i in this.start_dates) {
            $(select).append(`<option value="${i}">${this.start_dates[i]}</option>`);
        }

    }
}

export const init = config => {
    (new ESCOUserEnrolment(config));
};