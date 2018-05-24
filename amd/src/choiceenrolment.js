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
        'core/modal_factory',
        'core/modal_events',
        'core/fragment',
    ],
    function (Template, $, Str, Config, Notification, ModalFactory, ModalEvents, Fragment) {

        var SELECTORS = {
            BUTTON_TRIGGER: ".enrolusersbutton.enrol_simplesco_plugin.enrol [type='submit']",
        };


        var ESCOChoiceEnrolment = function (options) {
            this.contextid = options.contextid;
            this.init();
        };

        /** @var {number} courseid - */
        ESCOChoiceEnrolment.prototype.courseid = 0;

        /** @var {Modal} modal */
        ESCOChoiceEnrolment.prototype.modal = null;

        ESCOChoiceEnrolment.prototype.init = function () {
            var triggerButtons = $(SELECTORS.BUTTON_TRIGGER);
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

                var body = "";
                body += '<button class="btn btn-primary btn-block" id="enrol_simplesco_adduser">' + strings[1] + '</button>';
                body += '<button class="btn btn-primary btn-block" id="enrol_simplesco_addcohort">' + strings[2] + '</button>';

                modal.setBody(body);

                $('body').on('click', 'button#enrol_simplesco_adduser, button#enrol_simplesco_addcohort', function(){
                    modal.hide()
                });
            }.bind(this)).fail(Notification.exception);

            var context = this;
            $("body").on("click", SELECTORS.BUTTON_TRIGGER, function () {
                context.modal.show();
            });
        };

        return /** @alias module:enrol_simplesco/choiseenrolment */{
            init: function (config) {
                (new ESCOChoiceEnrolment(config));
            }
        };
    }
);