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

const SELECTORS = {
    BUTTON_TRIGGER: ".enrolusersbutton.enrol_simplesco_plugin.enrol [type='submit']",
};

const ESCOChoiceEnrolment = (options) => {
    this.contextid = options.contextid;
    this.init();
};

/** @var {number} courseid - */
ESCOChoiceEnrolment.prototype.courseid = 0;

/** @var {Modal} modal */
ESCOChoiceEnrolment.prototype.modal = null;

ESCOChoiceEnrolment.prototype.init = () => {
    const triggerButtons = $(SELECTORS.BUTTON_TRIGGER);
    $(".singlebutton.enrol_manual_plugin").remove();

    $.when(
        Str.get_strings([
            {key: 'choisetitle', component: 'enrol_simplesco'},
            {key: 'btnenroluser', component: 'enrol_simplesco'},
            {key: 'btnenrolcohort', component: 'enrol_simplesco'},
        ]),
        ModalFactory.create({
            type: ModalFactory.types.DEFAULT,
        }, triggerButtons)
    ).then(function (strings, modal) {
        this.modal = modal;

        modal.setTitle(strings[0]);

        let body = "";
        body += '<button class="btn btn-primary btn-block" id="enrol_simplesco_adduser">' + strings[1] + '</button>';
        body += '<button class="btn btn-primary btn-block" id="enrol_simplesco_addcohort">' + strings[2] + '</button>';

        modal.setBody(body);

        $('body').on('click', 'button#enrol_simplesco_adduser, button#enrol_simplesco_addcohort', () => {
            modal.hide();
        });
    }.bind(this)).fail(Notification.exception);

    const context = this;
    $("body").on("click", SELECTORS.BUTTON_TRIGGER, () => {
        context.modal.show();
    });
};

export const init = config => {
    (new ESCOChoiceEnrolment(config));
};