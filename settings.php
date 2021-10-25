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
 * Manual enrolment plugin settings and presets.
 *
 * @package    enrol_simplesco
 * @copyright  2016 GIP RECIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

if ($ADMIN->fulltree) {

    //--- general settings -----------------------------------------------------------------------------------
    $settings->add(new admin_setting_heading('enrol_simplesco_settings', '', get_string('pluginname_desc', 'enrol_simplesco')));

    // Note: let's reuse the ext sync constants and strings here, internally it is very similar,
    //       it describes what should happend when users are not supposed to be enerolled any more.
    $options = array(
        ENROL_EXT_REMOVED_KEEP           => get_string('extremovedkeep', 'enrol'),
        ENROL_EXT_REMOVED_SUSPEND        => get_string('extremovedsuspend', 'enrol'),
        ENROL_EXT_REMOVED_SUSPENDNOROLES => get_string('extremovedsuspendnoroles', 'enrol'),
        ENROL_EXT_REMOVED_UNENROL        => get_string('extremovedunenrol', 'enrol'),
    );
    $settings->add(new admin_setting_configselect('enrol_simplesco/expiredaction', get_string('expiredaction', 'enrol_simplesco'), get_string('expiredaction_help', 'enrol_simplesco'), ENROL_EXT_REMOVED_KEEP, $options));

    $options = array();
    for ($i=0; $i<24; $i++) {
        $options[$i] = $i;
    }
    $settings->add(new admin_setting_configselect('enrol_simplesco/expirynotifyhour', get_string('expirynotifyhour', 'core_enrol'), '', 6, $options));


    //--- enrol instance defaults ----------------------------------------------------------------------------
    $settings->add(new admin_setting_heading('enrol_manual_defaults',
        get_string('enrolinstancedefaults', 'admin'), get_string('enrolinstancedefaults_desc', 'admin')));

    $settings->add(new admin_setting_configcheckbox('enrol_simplesco/defaultenrol',
        get_string('defaultenrol', 'enrol'), get_string('defaultenrol_desc', 'enrol'), 1));

    $options = array(ENROL_INSTANCE_ENABLED  => get_string('yes'),
                     ENROL_INSTANCE_DISABLED => get_string('no'));
    $settings->add(new admin_setting_configselect('enrol_simplesco/status',
        get_string('status', 'enrol_simplesco'), get_string('status_desc', 'enrol_simplesco'), ENROL_INSTANCE_ENABLED, $options));

    if (!during_initial_install()) {
        $options = get_default_enrol_roles(context_system::instance());
        $student = get_archetype_roles('student');
        $student = reset($student);
        $settings->add(new admin_setting_configselect('enrol_simplesco/roleid',
            get_string('defaultrole', 'role'), '', $student->id, $options));
    }

    $settings->add(new admin_setting_configduration('enrol_simplesco/enrolperiod',
        get_string('defaultperiod', 'enrol_simplesco'), get_string('defaultperiod_desc', 'enrol_simplesco'), 0));

    $options = array(0 => get_string('no'), 1 => get_string('expirynotifyenroller', 'core_enrol'), 2 => get_string('expirynotifyall', 'core_enrol'));
    $settings->add(new admin_setting_configselect('enrol_simplesco/expirynotify',
        get_string('expirynotify', 'core_enrol'), get_string('expirynotify_help', 'core_enrol'), 0, $options));

    $settings->add(new admin_setting_configduration('enrol_simplesco/expirythreshold',
        get_string('expirythreshold', 'core_enrol'), get_string('expirythreshold_help', 'core_enrol'), 86400, 86400));

    if (!function_exists('ldap_connect')) {
        $settings->add(new admin_setting_heading('enrol_phpldap_noextension', '', get_string('phpldap_noextension', 'enrol_simplesco')));
    } else {
        require_once($CFG->dirroot.'/enrol/simplesco/settingslib.php');
        require_once($CFG->libdir.'/ldaplib.php');
    
        $yesno = array(get_string('no'), get_string('yes'));
    
        //--- connection settings ---
        $settings->add(new admin_setting_heading('enrol_simplesco_server_settings', get_string('server_settings', 'enrol_ldap'), ''));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/host_url', get_string('host_url_key', 'enrol_ldap'), get_string('host_url', 'enrol_ldap'), ''));
        // Set LDAPv3 as the default. Nowadays all the servers support it and it gives us some real benefits.
        $options = array(3=>'3', 2=>'2');
        $settings->add(new admin_setting_configselect('enrol_simplesco/ldap_version', get_string('version_key', 'enrol_ldap'), get_string('version', 'enrol_ldap'), 3, $options));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/ldapencoding', get_string('ldap_encoding_key', 'enrol_ldap'), get_string('ldap_encoding', 'enrol_ldap'), 'utf-8'));
    
        //--- binding settings ---
        $settings->add(new admin_setting_heading('enrol_simplesco_bind_settings', get_string('bind_settings', 'enrol_ldap'), ''));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/bind_dn', get_string('bind_dn_key', 'enrol_ldap'), get_string('bind_dn', 'enrol_ldap'), ''));
        $settings->add(new admin_setting_configpasswordunmask('enrol_simplesco/bind_pw', get_string('bind_pw_key', 'enrol_ldap'), get_string('bind_pw', 'enrol_ldap'), ''));
    
        //--- main search settings ---
        $settings->add(new admin_setting_heading('enrol_simplesco_main_search_settings', get_string('main_search', 'enrol_simplesco'), ''));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/branch', get_string('branch', 'enrol_simplesco'), get_string('branch_desc', 'enrol_simplesco'), ''));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/username_attribute', get_string('username_attribute', 'enrol_simplesco'), get_string('username_attribute_desc', 'enrol_simplesco'), 'uid'));
        $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/default_filter', get_string('default_filter', 'enrol_simplesco'), get_string('default_filter_desc', 'enrol_simplesco'), ''));
    
    
        $nb_filter = 5;
        //--- filters -----
        for ($i = 1; $i <= $nb_filter ; $i++){
            $settings->add(new admin_setting_heading('filter_'.$i, get_string('filter'.$i, 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_label', get_string('filter_label', 'enrol_simplesco'), get_string('filter_label_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configcheckbox('enrol_simplesco/filter'.$i.'_mandatory', get_string('filter_mandatory', 'enrol_simplesco'), get_string('filter_mandatory_desc', 'enrol_simplesco'), false));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_list_values', get_string('filter_list_values', 'enrol_simplesco'), get_string('filter_list_values_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_list_filter', get_string('filter_list_filter', 'enrol_simplesco'), get_string('filter_list_filter_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_list_branch', get_string('filter_list_branch', 'enrol_simplesco'), get_string('filter_list_branch_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_list_label', get_string('filter_list_label', 'enrol_simplesco'), get_string('filter_list_label_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_list_code', get_string('filter_list_code', 'enrol_simplesco'), get_string('filter_list_code_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_sub_filter', get_string('filter_sub_filter', 'enrol_simplesco'), get_string('filter_sub_filter_desc', 'enrol_simplesco'), ''));
            $settings->add(new admin_setting_configtext_trim_lower('enrol_simplesco/filter'.$i.'_default', get_string('filter_default', 'enrol_simplesco'), get_string('filter_default_desc', 'enrol_simplesco'), ''));
             
        }
    
    }
    
}
