'use strict';
/**
 * ESCO Enrolment AMD module.
 *
 * @module     enrol_simplesco/choiceenrolment
 * @package    enrol_simplesco
 * @copyright  2016 Damyon Wiese <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
import $ from 'jquery';
import {get_strings} from 'core/str';
import Notification from 'core/notification';
import ModalFactory from 'core/modal_factory';

const SELECTORS = {
    BUTTON_TRIGGER: ".enrolusersbutton.enrol_simplesco_plugin.enrol [type='submit']",
};

class ESCOChoiceEnrolment {
    /** @var {array} */
    strings = null;
    /** @var {number} courseid - */
    courseid = 0;

    /** @var {Modal} modal */
    modal = null;

    constructor(options) {
        this.contextid = options.contextid;
        this.init();
    }

    init() {
        const triggerButtons = $(SELECTORS.BUTTON_TRIGGER);
        Array.from(document.querySelectorAll(".singlebutton.enrol_manual_plugin")).forEach(button => {
            button.remove();
        });

        Promise.all([
            get_strings([
                {key: 'choisetitle', component: 'enrol_simplesco'},
                {key: 'btnenroluser', component: 'enrol_simplesco'},
                {key: 'btnenrolcohort', component: 'enrol_simplesco'},
            ]),
            ModalFactory.create({
                type: ModalFactory.types.DEFAULT,
            }, triggerButtons)])
        .then(values => {
            this.strings = values[0];
            this.modal = values[1];

            this.modal.setTitle(this.strings[0]);

            const body = `<button class="btn btn-primary btn-block" id="enrol_simplesco_adduser">${this.strings[1]}</button>
                <button class="btn btn-primary btn-block" id="enrol_simplesco_addcohort">${this.strings[2]}</button>`;

            this.modal.setBody(body);

            $('body').on('click', 'button#enrol_simplesco_adduser, button#enrol_simplesco_addcohort', () => {
                this.modal.hide();
            });
        })
        .catch(Notification.exception);


        document.addEventListener('click', event => {
            if (event.target.closest(SELECTORS.BUTTON_TRIGGER)) {
                event.preventDefault();
                this.modal.show();
                return;
            }
        });
    }
}

export const init = config => {
    (new ESCOChoiceEnrolment(config));
};