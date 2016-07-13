<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Strings for component 'enrol_simplesco', language 'en'.
 *
 * @package    enrol_simplesco
 * @copyright  2016 GIP RECIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
$string['noresultliste'] = 'No result available';
$string['allresultliste'] = 'All';
$string['alterstatus'] = 'Alter status';
$string['altertimeend'] = 'Alter end time';
$string['altertimestart'] = 'Alter start time';
$string['assignrole'] = 'Assign role';
$string['browseusers'] = 'Browse users';
$string['browsecohorts'] = 'Browse cohorts';
$string['searchoption']='Search Option';
$string['confirmbulkdeleteenrolment'] = 'Are you sure you want to delete these users enrolments?';
$string['defaultperiod'] = 'Default enrolment duration';
$string['defaultperiod_desc'] = 'Default length of time that the enrolment is valid. If set to zero, the enrolment duration will be unlimited by default.';
$string['defaultperiod_help'] = 'Default length of time that the enrolment is valid, starting with the moment the user is enrolled. If disabled, the enrolment duration will be unlimited by default.';
$string['deleteselectedusers'] = 'Delete selected user enrolments';
$string['editselectedusers'] = 'Edit selected user enrolments';
$string['enrolledincourserole'] = 'Enrolled in "{$a->course}" as "{$a->role}"';
$string['enrolusers'] = 'Enrol';
$string['choisetitle'] = 'Enrolment';
$string['frommyclass'] = 'From my classes/groups';
$string['fromnetocentre'] = 'From Net O\' Centre';
$string['enrolcohorttitle'] = 'Cohort enrolement';
$string['ajaxonecohortfound'] = '1 cohort found';
$string['ajaxxcohortfound'] = '{$a} cohorts found';
$string['cohort'] = 'Cohort';
$string['btnclosecohort'] = 'Finish cohort enrolment';
$string['btnunenrolall'] = 'Unenrol all';
$string['btnclose'] = 'Close';
$string['byname'] = 'By name';
$string['btnenroluser'] = 'Enrol users';
$string['btnenrolcohort'] = 'Enrol cohorts';
$string['expiredaction'] = 'Enrolment expiration action';
$string['expiredaction_help'] = 'Select action to carry out when user enrolment expires. Please note that some user data and settings are purged from course during course unenrolment.';
$string['expirymessageenrollersubject'] = 'Enrolment expiry notification';
$string['expirymessageenrollerbody'] = 'Enrolment in the course \'{$a->course}\' will expire within the next {$a->threshold} for the following users:

{$a->users}

To extend their enrolment, go to {$a->extendurl}';
$string['expirymessageenrolledsubject'] = 'Enrolment expiry notification';
$string['expirymessageenrolledbody'] = 'Dear {$a->user},

This is a notification that your enrolment in the course \'{$a->course}\' is due to expire on {$a->timeend}.

If you need help, please contact {$a->enroller}.';
$string['simplesco:config'] = 'Configure simplesco enrol instances';
$string['simplesco:enrol'] = 'Enrol users';
$string['simplesco:manage'] = 'Manage user enrolments';
$string['simplesco:unenrol'] = 'Unenrol users from the course';
$string['simplesco:unenrolself'] = 'Unenrol self from the course';
$string['messageprovider:expiry_notification'] = 'simplesco enrolment expiry notifications';
$string['pluginname'] = 'SCO simple enrolments';
$string['pluginname_desc'] = 'The simplesco enrolments plugin allows users to be enrolled manually via a link in the course administration settings, by a user with appropriate permissions such as a teacher. The plugin should normally be enabled, since certain other enrolment plugins, such as self enrolment, require it.';
$string['status'] = 'Enable simplesco enrolments';
$string['status_desc'] = 'Allow course access of internally enrolled users. This should be kept enabled in most cases.';
$string['status_help'] = 'This setting determines whether users can be enrolled manually, via a link in the course administration settings, by a user with appropriate permissions such as a teacher.';
$string['statusenabled'] = 'Enabled';
$string['statusdisabled'] = 'Disabled';
$string['unenrol'] = 'Unenrol user';
$string['unenrolselectedusers'] = 'Unenrol selected users';
$string['unenrolselfconfirm'] = 'Do you really want to unenrol yourself from course "{$a}"?';
$string['unenroluser'] = 'Do you really want to unenrol "{$a->user}" from course "{$a->course}"?';
$string['unenrolusers'] = 'Unenrol';
$string['unenroltitle'] = 'Unenrolment';
$string['wscannotenrol'] = 'Plugin instance cannot manually enrol a user in the course id = {$a->courseid}';
$string['wsnoinstance'] = 'simplesco enrolment plugin instance doesn\'t exist or is disabled for the course (id = {$a->courseid})';
$string['wsusercannotassign'] = 'You don\'t have the permission to assign this role ({$a->roleid}) to this user ({$a->userid}) in this course({$a->courseid}).';

//LDAP
$string['phpldap_noextension'] = '<em>The PHP LDAP module does not seem to be present. Please ensure it is installed and enabled if you want to use this enrolment plugin.</em>';
$string['pluginnotenabled'] = 'Plugin not enabled!';
$string['server_settings'] = 'LDAP server settings';
$string['host_url'] = 'Specify LDAP host in URL-form like \'ldap://ldap.myorg.com/\' or \'ldaps://ldap.myorg.com/\'';
$string['host_url_key'] = 'Host URL';
$string['filter1'] = 'Filter n°1';
$string['filter2'] = 'Filter n°2';
$string['filter3'] = 'Filter n°3';
$string['filter4'] = 'Filter n°4';
$string['filter5'] = 'Filter n°5';
$string['fitre1name'] = 'Etablissment';
$string['fitre2name'] = 'Profil';
$string['fitre3name'] = 'Class';
$string['fitre4name'] = 'Group pédagogique';
$string['fitre5name'] = 'Group ENT';
$string['fitre6name'] = 'Name';
$string['fitre6namecohort'] = 'Cohort name';

$string['filter_label'] = 'Filter label';
$string['filter_label_desc'] = 'The label associated to the filter.';
$string['filter_list_values'] = 'List values';
$string['filter_list_values_desc'] = 'The values proposed for the filter with the filter associated.';
$string['filter_list_filter'] = 'List filter';
$string['filter_list_filter_desc'] = 'The filter to create the select list.';
$string['filter_list_branch'] = 'List branch';
$string['filter_list_branch_desc'] = 'The branch to interogate to create the select list.';
$string['filter_list_label'] = 'Attribute label';
$string['filter_list_label_desc'] = 'The LDAP attribute to be shown in the list.';
$string['filter_list_code'] = 'Attribute code';
$string['filter_list_code_desc'] = 'The LDAP attribute used as a code to represent the user selection.';
$string['main_search'] = 'User search';
$string['branch'] = 'Branch';
$string['branch_desc'] = 'The branch used to search the users.';
$string['username_attribute'] = 'Username attribute';
$string['username_attribute_desc'] = 'The LDAP attribute that matches the username column.';
$string['default_filter'] = 'Default filter';
$string['default_filter_desc'] = 'Default filter ever call';
$string['filter_mandatory'] = 'Mandatory filter';
$string['filter_mandatory_desc'] = 'Chek if the filter must be used during the search.';
$string['filter_sub_filter'] = 'The filter';
$string['filter_sub_filter_desc'] = 'The filter associated with the selection. Used only if a value is selected.';
$string['filter_default'] = 'Default code';
$string['filter_default_desc'] = 'threhr';
