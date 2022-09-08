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
 * This file processes AJAX enrolment actions and returns JSON for the simplesco enrolments plugin
 *
 * The general idea behind this file is that any errors should throw exceptions
 * which will be returned and acted upon by the calling AJAX script.
 *
 * @package    enrol_simplesco
 * @copyright  2010 Sam Hemelryk
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require('../../config.php');
require_once($CFG->dirroot.'/enrol/locallib.php');
require_once($CFG->dirroot.'/user/lib.php');
require_once($CFG->dirroot.'/enrol/renderer.php');
require_once($CFG->dirroot.'/group/lib.php');
require_once($CFG->dirroot.'/enrol/simplesco/locallib.php');
require_once($CFG->dirroot.'/cohort/lib.php');
require_once($CFG->dirroot.'/enrol/simplesco/ldapconn.php');
require_once($CFG->dirroot.'/enrol/cohort/locallib.php');

error_reporting(E_ALL);
$id      = required_param('id', PARAM_INT); // Course id.
$action  = required_param('action', PARAM_ALPHANUMEXT);

$PAGE->set_url(new moodle_url('/enrol/ajax.php', array('id'=>$id, 'action'=>$action)));

$course = $DB->get_record('course', array('id'=>$id), '*', MUST_EXIST);
$context = context_course::instance($course->id, MUST_EXIST);

if ($course->id == SITEID) {
    throw new moodle_exception('invalidcourse');
}

require_login($course);
require_capability('moodle/course:enrolreview', $context);
require_sesskey();

echo $OUTPUT->header(); // Send headers.

$manager = new course_enrolment_manager($PAGE, $course);

$outcome = new stdClass();
$outcome->success = true;
$outcome->response = new stdClass();
$outcome->error = '';

$searchanywhere = get_user_preferences('userselector_searchanywhere', false);

$code1 = optional_param('code1', '', PARAM_TEXT);
$code2 = optional_param('code2', '', PARAM_TEXT);
$code3 = optional_param('code3', '', PARAM_TEXT);
$code4 = optional_param('code4', '', PARAM_TEXT);
$code5 = optional_param('code5', '', PARAM_TEXT);
$option = optional_param('option', '', PARAM_TEXT);
$type = optional_param('type', '', PARAM_TEXT);
$numliste = optional_param('numliste', '', PARAM_TEXT);

$search = optional_param('search', false, PARAM_BOOL);
$searchZoneShown = optional_param('showSearchZone', false, PARAM_BOOL);
$showSearchZone = $search || $searchZoneShown;

require_capability('enrol/simplesco:enrol', $context);
//require_capability('enrol/simplesco:manage', $context);
require_capability('enrol/simplesco:unenrol', $context);

function post_process1($liste){
    return $liste;
}
function post_process2($liste){
    return $liste;
}
function post_process3($liste){
    $listCorrigee = array();
    foreach ($liste as $key=>$value) {
        $index = strrpos($value, '$', -1) +1;
        $listCorrigee[$key] = substr ( $value , $index) ;
    }

    return $listCorrigee;
}
function post_process4($liste){
    return post_process3($liste);
}
function post_process5($liste){
    $listCorrigee = array();
    foreach ($liste as $key=>$value) {
        $valueCorrigee = $value;
        for($j = 0; $j < 3; $j++ ) {
            $index = strpos($valueCorrigee, ':') + 1;
            $valueCorrigee = substr ( $valueCorrigee , $index) ;
        }
        $valueIndesirable1 = preg_match( '/^Parents/', $valueCorrigee );
        $valueIndesirable2 = preg_match( '/^Groupes_Parents/', $valueCorrigee );

        if( !$valueIndesirable1 && !$valueIndesirable2 ) {
            $listCorrigee[$key] = $valueCorrigee;
        }

    }
    return $listCorrigee;
}

function pre_process1($filtre){
    return $filtre;
}
function pre_process2($filtre){
    return $filtre;
}
function pre_process3($filtre){
    return $filtre;
}

function pre_process4($filtre){
    return $filtre;
}
function pre_process5($filtre){
    return $filtre;
}
function addFilterFromSiren($list, $num, $siren ){
    //error_log("Sended : ".print_r($list[$num], true)." Siren ".$siren, 3 , "/tmp/myenrolfuction.log");
    if ($num > 2){
        $ret = array();
        foreach ($list[$num] as $key => $elmt){
            //  error_log("THE ELEMENT : ".$elmt, 3, "/tmp/myenrolfunction.log");
            if (strpos($elmt, $siren) !== false){
                $ret[$key] = $elmt;
            }
        }
        return $ret;
    }else{
        return $list[$num];
    }
}
    

//if ($roleid < 0) {
//    $roleid = $instance->roleid;
//}
//$roles = get_assignable_roles($context);
//$roles = array('0'=>get_string('none')) + $roles;
//
//if (!isset($roles[$roleid])) {
//    // weird - security always first!
//    $roleid = 0;
//}

//$instancename = $enrol_simplesco->get_instance_name($instance);

switch ($action) {
    case 'getassignable':
        $otheruserroles = optional_param('otherusers', false, PARAM_BOOL);
        $outcome->response = array_reverse($manager->get_assignable_roles($otheruserroles), true);        
        break;
    case 'getListes':
        $return = array();
        
        if (!$enrol_simplesco = enrol_get_plugin('simplesco')) {
            throw new coding_exception('Can not instantiate enrol_simpleldap');
        }
        $ldapconn = new ldapconn($enrol_simplesco);
        $ldapselector = new enrol_simpleldap_ldapsearch($enrol_simplesco,$ldapconn);
        
        //Get the default values for the user
        $username = $USER->username;
        $attributes = array();
        $nb_filter = 5;
        for ($i = 1; $i <= $nb_filter ; $i++){
            array_push($attributes, $enrol_simplesco->getConfig('filter'.$i.'_default'));
        }
        array_push($attributes, "escouai");
        array_push($attributes, "entauxensclasses");
        array_push($attributes, "entauxensgroupes");
        array_push($attributes, "escouaicourant");
        
        //$userValues = $ldapselector->get_userAttribute($username,$attributes);
        $userValues = $ldapselector->get_userAttributeMultiple($username,$attributes);
        
        //Create the lists to be shown before the enrol_simpleldap_potential_participant.
        
        $list = array();
        
        for ($i = 0; $i < strlen($numliste); $i++) {
            $num=$numliste{$i};
            
            $attrbValue = 'filter'.$num.'_list_filter';
            $ldapFilter = $enrol_simplesco->getConfig($attrbValue);
            for ($j = 1; $j <= $num ; $j++){
                // TODO: voir si $nomvar et $$nomvar ne devraient pas être une seule et même variable ?
                $nomvar = 'code'.$j;
                if ($$nomvar != ''){
                    $ldapFilter = str_replace("{CODE".$j."}", $$nomvar, $ldapFilter);
                }
            }
            $nomFonction = 'pre_process'.$num;
            $ldapFilter = call_user_func($nomFonction, $ldapFilter);
            $list[$num] = $ldapselector->get_listFilter($num,$ldapFilter);
            
            //Mes classes
            if ($option=='classe') {
            //    error_log(" \n LISTE NUM BEF0RE MATCH LDAP VALUES :  ".$num." ::::::> ".print_r($list, true), 3 ,"/tmp/testEnrolClasse.log");
                $list[$num]  = $ldapselector->matchLDAPValues($list[$num], $userValues, $num);
                //    error_log("\n LISTE NUM AFTER MATCH LDAP VALUES :  ".$num." ::::::> ".print_r($list, true), 3 ,"/tmp/testEnrolClasse.log");
                if (isset($_REQUEST['code1']) && $_REQUEST['code1'] !== ""){
                    $siren = $ldapselector->getSirenFromUAI($code1);
                    $list[$num] = addFilterFromSiren($list, $num, $siren);
                }
            }
            
            //Post traitement sur les résultat provenant du LDAP.
            $nomFonction = 'post_process'.$num;
            
            $myListe  = call_user_func($nomFonction, $list[$num]);
            asort($myListe);
            $list[$num] = $myListe;
            
            $nomvar = 'code'.$num;
            
            if (count($list[$num]) == 0 ){
                $$nomvar = null;
            }
                
            //If there is no value for this code, we will choose one.
            if ($$nomvar == null || $$nomvar == ''){
            
                if ($enrol_simplesco->getConfig('filter'.$num.'_mandatory') && $$nomvar == ''){
                    $keys = array_keys($list[$num]);
                    $$nomvar = array_shift($keys);
                }
                $defaultValue = '';
                $defaultAttr = $enrol_simplesco->getConfig('filter'.$num.'_default');
                if ($defaultAttr != null && array_key_exists($defaultAttr, $userValues)) {
                    $defaultValue = $userValues[$defaultAttr][0];
                }
            } else {
                $defaultValue = $$nomvar;
            }

            $return[$num] = $list[$num];
            $return['defaut'.$num] = $defaultValue;
        }
        $outcome->response =$return;
        break;
    case 'searchusers':
        $enrolid = required_param('enrolid', PARAM_INT);
        $search = optional_param('search', '', PARAM_RAW);
        $page = optional_param('page', 0, PARAM_INT);
        $addedenrollment = optional_param('enrolcount', 0, PARAM_INT);
        $perpage = optional_param('perpage', 25, PARAM_INT);  //  This value is hard-coded to 25 in quickenrolment.js
        if ($type!='ldap'){
            $reponse = $manager->get_potential_users($enrolid, $search, $searchanywhere, $page, $perpage, $addedenrollment);
        } else {
            if (!$enrol_simplesco = enrol_get_plugin('simplesco')) {
                throw new coding_exception('Can not instantiate enrol_simpleldap');
            }
            $ldapconn = new ldapconn($enrol_simplesco);
            $options = array('enrolid' => $enrolid, 'code1' => $code1, 'code2' => $code2, 'code3' => $code3, 'code4' => $code4, 'code5' => $code5);
            $potentialuserselector = new enrol_simpleldap_potential_participant('addselect', $options, $enrol_simplesco, $ldapconn);
            $reponse = $potentialuserselector->display2($page, $perpage, $addedenrollment);
            
            //$outcome->response = $manager->get_potential_users($enrolid, $search, $searchanywhere, $page, $perpage, $addedenrollment);
        }
        
        $extrafields = get_extra_user_fields($context);
        $useroptions = array();

        // User is not enrolled yet, either link to site profile or do not link at all.
        if (has_capability('moodle/user:viewdetails', context_system::instance())) {
            $useroptions['courseid'] = SITEID;
        } else {
            $useroptions['link'] = false;
        }

        foreach ($reponse['users'] as &$user) {
            $user->picture = $OUTPUT->user_picture($user, $useroptions);
            $user->fullname = fullname($user);
            $fieldvalues = array();
            foreach ($extrafields as $field) {
                $fieldvalues[] = s($user->{$field});
                unset($user->{$field});
            }
            $user->extrafields = implode(', ', $fieldvalues);
        }
        $reponse['users'] = array_values($reponse['users']);
        // Chrome will display users in the order of the array keys, so we need
        // to ensure that the results ordered array keys. Fortunately, the JavaScript
        // does not care what the array keys are. It uses user.id where necessary.
        $outcome->response = $reponse;
        $outcome->success = true;
        break;
    case 'searchusersenrol':
        $users = $manager->get_users('lastname', 'ASC', 0, 200);
        $usersfiltre = array();
        
        $extrafields = get_extra_user_fields($context);
        $useroptions = array();
        if (has_capability('moodle/user:viewdetails', context_system::instance())) {
            $useroptions['courseid'] = SITEID;
        } else {
            $useroptions['link'] = false;
        }
        
        foreach ($users as &$user) {
            $userenrolments = $manager->get_user_enrolments($user->id);
            foreach ($userenrolments as &$userenrolment) {
                $pluginname = '';
                $pluginname = get_class($userenrolment->enrolmentplugin);
                $myname = 'enrol_cohort_plugin';
                $comp = strcmp($pluginname,$myname);
                $useridconnect = $_SESSION['USER']->id;
                $useridliste = $user->id;
                if ($comp != 0) {
                    if ($useridconnect != $useridliste || has_capability("enrol/simplesco:unenrolself", $context)) {
                        $usersfiltre[$useridliste]=$user;
                    }
                }
            }
        }
        
        foreach ($usersfiltre as &$user) {
            $user->picture = $OUTPUT->user_picture($user, $useroptions);
            $user->fullname = fullname($user);
            $fieldvalues = array();
            foreach ($extrafields as $field) {
                $fieldvalues[] = s($user->{$field});
                unset($user->{$field});
            }
            $user->extrafields = implode(', ', $fieldvalues);
        }
            
        $reponse['users']=array_values($usersfiltre);
        //$reponse['users'] = array_values($reponse['users']);
        $reponse['totalusers']=sizeof($usersfiltre);
        $outcome->response = $reponse;
        $outcome->success = true;
        break;
    case 'searchcohorts':
        $enrolid = required_param('enrolid', PARAM_INT);
        $search = optional_param('search', '', PARAM_RAW);
        $page = optional_param('page', 0, PARAM_INT);
        $addedenrollment = optional_param('enrolcount', 0, PARAM_INT);
        $perpage = optional_param('perpage', 25, PARAM_INT);  //  This value is hard-coded to 25 in quickenrolment.js
        $reponse = enrol_simplesco_get_potential_cohorts($context, $enrolid, $search, $page, $perpage, $addedenrollment);
        $groups = array(0 => get_string('none'));
        foreach (groups_get_all_groups($course->id) as $group) {
            $groups[$group->id] = format_string($group->name, true, array('context'=>$context));
        }
        $reponse['group']=$groups;
        $outcome->response = $reponse;
        $outcome->success = true;
        break;
    case 'searchcohortsenrol':
        $usersfiltre = array();
        //$users = $manager->get_users('lastname', 'ASC', 0, 200);
        $listeplugin = $manager->get_enrolment_instances();
        $instances = enrol_get_instances($course->id, true);
        foreach ($listeplugin as &$plugin_name) {
            if($plugin_name->enrol == 'cohort') {
                if($plugin_name->name == '') {
                    $cohort = $DB->get_record('cohort', array('id' => $plugin_name->customint1), 'name');
                    if($cohort === false){
                        $plugin_name->name = $inames[$plugin_name->id];
                    }else{
                        $plugin_name->name = $cohort->name;
                    }
                }
                $usersfiltre[$plugin_name->id] = $plugin_name;
            }
        }
        $reponse['cohorts']=array_values($usersfiltre);
        $reponse['totalcohorts']=sizeof($usersfiltre);
        $outcome->response = $reponse;
        $outcome->success = true;
        break;
    case 'enrol':
        $enrolid = required_param('enrolid', PARAM_INT);
        $cohort = $user = null;
        $cohortid = optional_param('cohortid', 0, PARAM_INT);
        if (!$cohortid) {
            $userid = required_param('userid', PARAM_INT);
            $user = $DB->get_record('user', array('id' => $userid), '*', MUST_EXIST);
        } else {
            $cohort = $DB->get_record('cohort', array('id' => $cohortid), '*', MUST_EXIST);
            if (!cohort_can_view_cohort($cohort, $context)) {
                throw new enrol_ajax_exception('invalidenrolinstance'); // TODO error text!
            }
        }

        $roleid = optional_param('role', null, PARAM_INT);
        $duration = optional_param('duration', 0, PARAM_INT);
        $startdate = optional_param('startdate', 0, PARAM_INT);
        $recovergrades = optional_param('recovergrades', 0, PARAM_INT);

        if (empty($roleid)) {
            $roleid = null;
        }

        switch($startdate) {
            case 2:
                $timestart = $course->startdate;
                break;
            case 3:
            default:
                $today = time();
                $today = make_timestamp(date('Y', $today), date('m', $today), date('d', $today), 0, 0, 0);
                $timestart = $today;
                break;
        }

        if ($duration <= 0) {
            $timeend = 0;
        } else {
            $timeend = $timestart + ($duration*24*60*60);
        }

        $instances = $manager->get_enrolment_instances();
        $plugins = $manager->get_enrolment_plugins(true); // Do not allow actions on disabled plugins.
        if (!array_key_exists($enrolid, $instances)) {
            throw new enrol_ajax_exception('invalidenrolinstance');
        }
        $instance = $instances[$enrolid];
        if (!isset($plugins[$instance->enrol])) {
            throw new enrol_ajax_exception('enrolnotpermitted');
        }
        $plugin = $plugins[$instance->enrol];
        if ($plugin->allow_enrol($instance) && has_capability('enrol/'.$plugin->get_name().':enrol', $context)) {
            if ($user) {
                $plugin->enrol_user($instance, $user->id, $roleid, $timestart, $timeend, null, $recovergrades);
            } else {
                $plugin->enrol_cohort($instance, $cohort->id, $roleid, $timestart, $timeend, null, $recovergrades);
            }
        } else {
            throw new enrol_ajax_exception('enrolnotpermitted');
        }
        $outcome->success = true;
        break;
    case 'enrolcohort':
        $enrolid = required_param('enrolid', PARAM_INT);
        $cohort = $user = null;
        $cohortid = optional_param('cohortid', 0, PARAM_INT);
        $roleid = optional_param('role', null, PARAM_INT);
        $groupeid = optional_param('groupeid', null, PARAM_INT);
        
        $cohort = $DB->get_record('cohort', array('id' => $cohortid), '*', MUST_EXIST);
        if (!cohort_can_view_cohort($cohort, $context)) {
            throw new enrol_ajax_exception('invalidenrolinstance'); // TODO error text!
        }
 
        $enrol = enrol_get_plugin('cohort');
        // customint1 : Cohort id.
        // customint2 : Optional group id.
        $nameperso = $cohort->name.' - simplesco';
        $enrol->add_instance($course, array('name'=>$nameperso, 'status'=>0, 'customint1'=>$cohortid, 'roleid'=>$roleid, 'customint2'=>$groupeid));
        $trace = new null_progress_trace();
        enrol_cohort_sync($trace, $course->id);
        $trace->finished();

        $outcome->success = true;
        break;
    case 'unenroluser':
        $userid = required_param('userid', PARAM_INT);
        //$enrolid = required_param('enrolid', PARAM_INT);
        
        $userenrolments = $manager->get_user_enrolments($userid);
        foreach ($userenrolments as &$userenrolment) {
            $pluginname = '';
            $pluginname = get_class($userenrolment->enrolmentplugin);
            $myname = 'enrol_cohort_plugin';
            $comp = strcmp($pluginname,$myname);
            if ($comp != 0) {
                $plugin = $userenrolment->enrolmentplugin;
                $instance = $DB->get_record('enrol', array('id'=>$userenrolment->enrolid), '*', MUST_EXIST);
                $plugin->unenrol_user($instance, $userid);
            }
        }
        $outcome->success = true;
        break;
    case 'unenrolcohort':
        $enrolid = required_param('cohortid', PARAM_INT);
        $instance = $DB->get_record('enrol', array('id'=>$enrolid), '*', MUST_EXIST);
        $enrol = enrol_get_plugin('cohort');
        $enrol->delete_instance($instance);
        $outcome->success = true;
        break;
    case 'unenrolalluser':
        $users = $manager->get_users('lastname', 'ASC', 0, 200);
        $useridconnect = $_SESSION['USER']->id;
        foreach ($users as &$user) {
            $userid = $user->id;
            $userenrolments = $manager->get_user_enrolments($user->id);
            foreach ($userenrolments as &$userenrolment) {
                $pluginname = '';
                $pluginname = get_class($userenrolment->enrolmentplugin);
                $myname = 'enrol_cohort_plugin';
                $comp = strcmp($pluginname,$myname);    
                if ($comp != 0) {
                    if ($useridconnect != $userid || has_capability("enrol/simplesco:unenrolself", $context)) {
                        $plugin = $userenrolment->enrolmentplugin;
                        $instance = $DB->get_record('enrol', array('id'=>$userenrolment->enrolid), '*', MUST_EXIST);
                        $plugin->unenrol_user($instance, $userid);
                    }
                    
                }
            }
        }
        $outcome->success = true;
        break;
    case 'unenrolallcohort':
        $listeplugin = $manager->get_enrolment_instances();
        $enrol = enrol_get_plugin('cohort');
        foreach ($listeplugin as &$plugin_name) {
            if($plugin_name->enrol == 'cohort') {
                $instance = $DB->get_record('enrol', array('id'=>$plugin_name->id), '*', MUST_EXIST);
                $enrol->delete_instance($instance);
            }
        }
        $outcome->success = true;
        break;
    default:
        throw new enrol_ajax_exception('unknowajaxaction');
}

echo json_encode($outcome);
