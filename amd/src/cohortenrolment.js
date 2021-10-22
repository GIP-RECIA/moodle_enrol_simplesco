/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_manual/quickenrolment
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import $ from 'jquery';
import Str from 'core/str';
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

const ESCOCohortEnrolment = (options) => {
    this.course_id = options.course_id;
    this.instance = options.instance;
    this.start_dates = options.start_dates;
    this.role_default = options.role_default;
    this.init();
};

/** @var {Modal} modal */
ESCOCohortEnrolment.prototype.modal = null;
/** @var {number} page - */
ESCOCohortEnrolment.prototype.page = 0;
/** @var {number} perpage - */
ESCOCohortEnrolment.prototype.perpage = 25;
/** @var {number} courseid - */
ESCOCohortEnrolment.prototype.course_id = 0;
/** @var {number} courseid - */
ESCOCohortEnrolment.prototype.role_default = 0;
/** @var {boolean} enrol_count - */
ESCOCohortEnrolment.prototype.enrol_count = 0;
/** @var {array} assignales_roles - */
ESCOCohortEnrolment.prototype.assignales_roles = [];
/** @var {array} instance - */
ESCOCohortEnrolment.prototype.instance = [];
/** @var {array} start_dates - */
ESCOCohortEnrolment.prototype.start_dates = [];
/** @var {array} groups - */
ESCOCohortEnrolment.prototype.groups = [];
/** @var {boolean} require_refresh - */
ESCOCohortEnrolment.prototype.require_refresh = false;

ESCOCohortEnrolment.prototype.init = () => {
    const context = this;
    const triggerButtons = $(SELECTORS.BUTTON_TRIGGER);

    $.when(
        Str.get_strings([
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
        }, triggerButtons)
    ).then(function (strings, modal) {
        this.strings = strings;
        this.modal = modal;

        modal.setTitle(strings[0]);


        let body = '<div class="form-inline mform simplesco">';

        body += '<div class="form-group">';
        body += '<label for="enrol_simplesco_assignable_roles">' + strings[2] + ' : </label>';
        body += '<select id="enrol_simplesco_assignable_roles"><option value="">' + strings[3] + '</option></select>';
        body += '</div>';

        body += '<fieldset class="collapsible collapsed" id="enrolment_options">';
        body += '<legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" '
            + 'aria-expanded="false">' + strings[4] + '</a></legend>';
        body += '<div class="fcontainer">';
        body += '<div class="startdate form-group"><label for="enrol_simplesco_assignable_startdate">' + strings[5] + ':</label> '
            + '<select id="enrol_simplesco_assignable_startdate"></select></div>';
        body += '<div class="duration form-group"><label for="enrol_simplesco_assignable_duration">' + strings[6] + ' :</label> '
            + '<select id="enrol_simplesco_assignable_duration"><option value="0" selected="selected">' + strings[7]
            + '</option></select></div>';
        body += '</div>';
        body += '</fieldset>';

        body += '<fieldset class="collapsible collapsed" id="enrolment_searchs">';
        body += '<legend class="ftoggler"><a href="#" class="fheader" role="button" aria-controls="enrolment_options" '
            + 'aria-expanded="false">' + strings[8] + '</a></legend>';
        body += '<div class="fcontainer">';
        body += '<label for="enrolusersearch">' + strings[9] + ' :</label> <input type="text" id="enrolusersearch" value="" '
            + 'class="form-control"/>';
        body += '<div class="text-center"><button class="btn btn-primary" id="search"> ' + strings[9] + '</button></div>';
        body += '</div>';
        body += '</fieldset>';

        body += '<div id="results"></div>';

        body += '<div id="loading" style="display:none;">CHARGEMENT</div>';

        body += '</div>';
        modal.setBody(body);

        modal.setFooter('<button class="btn btn-primary" data-action="hide">' + strings[1] + '</button>');

        modal.getRoot().on(ModalEvents.hidden, () => {
            if (context.require_refresh) {
                location.reload();
            }
        });

        this.bindEvents();
        this.populateRoles();
        this.updateStartDateList();
        this.updateDurationsList();
    }.bind(this)).fail(Notification.exception);
};

/**
 * Bind events needed for the modal to work
 */
ESCOCohortEnrolment.prototype.bindEvents = () => {
    const context = this;
    $("body").on("click", SELECTORS.BUTTON_TRIGGER, () => {
        context.modal.show();
        context.modal.getBody().find(SELECTORS.BUTTON_SEARCH).trigger("click");
    });
    this.modal.getBody().find(SELECTORS.BUTTON_COLLAPSE).on("click", (event) => {
        event.preventDefault();
        $(this).closest(".collapsible").toggleClass("collapsed");
        return false;
    });
    this.modal.getBody().find(SELECTORS.BUTTON_SEARCH).on("click", (event) => {
        event.preventDefault();
        context.search();
        return false;
    });
    this.modal.getBody().find(SELECTORS.FIELD_SEARCH).on("keypress", (event) => {
        if (event.which === 13) {
            event.preventDefault();
            context.search();
            return false;
        }
    });
    this.modal.getBody().on("click", SELECTORS.BUTTON_LOADMORE, (event) => {
        event.preventDefault();
        context.search(true);
        return false;
    });
    this.modal.getBody().on("click", SELECTORS.BUTTON_ENROL, (event) => {
        event.preventDefault();
        const cohortid = $(this).attr("value");
        context.enrol(cohortid);
        return false;
    });
};

/**
 * Enrol the given userid
 */
ESCOCohortEnrolment.prototype.enrol = (cohortid) => {
    const context = this;
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
            context.require_refresh = true;
            context.enrol_count++;
            context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('div.cohort[rel="' + cohortid + '"]').addClass("enrolled");
        },
        error: (resultat, statut, erreur) => {
            Notification.exception(erreur);
        },
        beforeSend : () => {
            context.startLoading();
        }
    }).always(() => {
        context.stopLoading();
    });
};

/**
 * Load the list of roles from the database for given course
 */
ESCOCohortEnrolment.prototype.populateRoles = () => {
    if (this.assignales_roles.length > 0) {
        return this.updateRolesList();
    }
    const context = this;
    $.ajax({
        url: M.cfg.wwwroot + '/enrol/ajax.php',
        method: 'POST',
        dataType: 'json',
        data: 'id=' + this.course_id + '&action=getassignable&sesskey=' + M.cfg.sesskey,
        success: (result, statut) => {
            if (result.error) {
                return Notification.exception(result);
            }
            context.assignales_roles = result.response;
            context.updateRolesList();
        },
        error: (resultat, statut, erreur) => {
            Notification.exception(erreur);
        },
        beforeSend: () => {
            context.startLoading();
        }
    }).always(() => {
        context.stopLoading();
    });
};

/**
 * Generate HTML for cohort display
 */
ESCOCohortEnrolment.prototype.renderCohort = (cohort) => {
    const count = this.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".cohort").length;
    let cohort_html = '<div class="cohort item clearfix" rel="' + cohort.id + '">';

    cohort_html += '<div class="count">' + (count) + '</div>';

    cohort_html += '<div class="details">';
    cohort_html += '<div class="fullname">' + cohort.name + '</div>';
    cohort_html += '</div>';

    cohort_html += '<div class="options">';
    cohort_html += '<select name="cohort_group" rel="' + cohort.id + '">';

    for (let id in this.groups) {
        cohort_html += '<option value="' + id + '">' + this.groups[id] + '</option>';
    }

    cohort_html += '</select>';
    cohort_html += '<button class="btn btn-success" data-toggle="enrol" value="' + cohort.id + '">'
        + this.strings[14] + '</button>';
    cohort_html += '</div>';

    cohort_html += '</div>';

    return cohort_html;
};

/**
 * Send the send request to server(s) and then process the results
 */
ESCOCohortEnrolment.prototype.search = (append) => {
    const context = this;

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
    context.modal.getBody().find(SELECTORS.AREA_RESULTS).find('button[data-toggle="load-more"]').remove();
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
                context.modal.getBody().find(SELECTORS.AREA_RESULTS).html("");
                context.modal.getBody().find(SELECTORS.AREA_RESULTS)
                    .append('<div class="total_results">' + context.strings[12].replace("{$a}",
                        result.response.totalcohorts) + '</div>');
                context.modal.getBody().find(SELECTORS.AREA_RESULTS)
                    .append('<div class="item cohort clearfix"><div class="count">N°</div><div class="details">'
                        + context.strings[14] + '</div><div class="options">' + context.strings[15] + '</div></div>');
            }
            context.groups = result.response.group;
            for (let line in result.response.cohorts) {
                const cohort = result.response.cohorts[line];
                context.modal.getBody().find(SELECTORS.AREA_RESULTS).append(context.renderCohort(cohort));
            }
            const count = (context.modal.getBody().find(SELECTORS.AREA_RESULTS).find(".item").length - 1);
            if (count < result.response.totalcohorts) {
                context.modal.getBody().find(SELECTORS.AREA_RESULTS)
                    .append('<div class="text-center"><button class="btn btn-secondary" data-toggle="load-more">'
                        + context.strings[13] + '</button></div>');
            }
        },
        error: (resultat, statut, erreur) => {
            Notification.exception(erreur);
        },
        beforeSend: () => {
            context.startLoading();
        }
    }).always(() => {
        context.stopLoading();
    });
};
/**
 * Display the loading screen
 */
ESCOCohortEnrolment.prototype.startLoading = () => {
    this.modal.getBody().find("#loading").show();
};
/**
 * Show the loading screen
 */
ESCOCohortEnrolment.prototype.stopLoading = () => {
    this.modal.getBody().find("#loading").hide();
};
/**
 * Update the roles select field
 */
ESCOCohortEnrolment.prototype.updateRolesList = () => {
    const select = this.modal.getBody().find(SELECTORS.FIELD_ROLES);
    for (let i in this.assignales_roles) {
        const selected = (this.role_default == this.assignales_roles[i].id) ? 'selected="selected"' : "";
        $(select).append('<option value="' + this.assignales_roles[i].id + '" '+ selected + '>' + this.assignales_roles[i].name
            + '</option>');
    }
};

/**
 * Update the durations select field
 */
ESCOCohortEnrolment.prototype.updateDurationsList = () => {
    const select = this.modal.getBody().find(SELECTORS.FIELD_DURATION);

    $.when(Str.get_string('durationdays', 'enrol', '{a}')).then((text) => {
        for (let i = 1; i <= 365; i++) {
            $(select).append('<option value="' + i + '">' + text.replace('{a}', i) + '</option>');
        }
    });
};

/**
 * Update the start date select field
 */
ESCOCohortEnrolment.prototype.updateStartDateList = () => {
    const select = this.modal.getBody().find(SELECTORS.FIELD_STARTDATE);

    for (let i in this.start_dates) {
        $(select).append('<option value="' + i + '">' + this.start_dates[i] + '</option>');
    }

};


export const init = config => {
    (new ESCOCohortEnrolment(config));
};