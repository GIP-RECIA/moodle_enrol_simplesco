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
 * Auxiliary simplesco user enrolment lib, the main purpose is to lower memory requirements...
 *
 * @package    enrol_simplesco
 * @copyright  2010 Petr Skoda {@link http://skodak.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/user/selector/lib.php');
require_once($CFG->dirroot . '/enrol/locallib.php');
require_once($CFG->libdir.'/ldaplib.php');

class enrol_simpleldap_ldapsearch {
	protected $instance;
	protected $ldapconn;

	public function __construct($instance, $ldapconn){
		$this->instance = $instance;
		$this->ldapconn = $ldapconn;
	}


	  public function getSirenFromUAI($uai){
        $ldapconnection = $this->ldapconn->ldap_connect();
        if (!$ldapconnection) {
                return;
        }
        //$filter= "code1";
        $base_dn = "ou=structures,dc=esco-centre,dc=fr";
        $filter="(ENTStructureUAI=".$uai.")";
        $justThese = ("ENTStructureSIREN");
        $records = ldap_search(
                        $ldapconnection,
                        $base_dn
                        ,$filter, array("ENTStructureSIREN") )

        ;

        $entries = ldap_get_entries($ldapconnection, $records);
        $siren="";
        foreach($entries as $ent){
                if (isset($ent["entstructuresiren"])){
                        $siren = $ent["entstructuresiren"][0];
                }
        }
        // free memory 
        unset( $record);
        $this->ldapconn->ldap_close();
                //var_dump( $siren);
                return $siren;
    }


	public function get_listFilter($number,$ldapFilter){
		$filter = 'filter'.$number;
		$list = array();

		if ($this->instance->getConfig($filter.'_list_values') != ''){
			$config_values = $this->instance->getConfig($filter.'_list_values');
			$values = explode(";", $config_values);
			foreach ($values as $value){
				$val = explode("#", $value);
				$key=$val[1];
				$label=$val[0];
				$list[$key] = $label;
				//$list[$val[1]] = $val[0];
			}

		} else {

			$ldapconnection = $this->ldapconn->ldap_connect();
			if (!$ldapconnection) {
				return;
			}
			$keyAttr = $this->instance->getConfig($filter.'_list_code');
			$labelAttr = $this->instance->getConfig($filter.'_list_label');

			if ($ldapFilter != ''){
				$records = $this->ldapconn->ldap_search(
						$this->instance->getConfig($filter.'_list_branch'),
						$ldapFilter,
						array($keyAttr,$labelAttr)
						);
			}
			foreach ($records as $record) {
				//array_push($flat_records, $records[$c]);
				if ($keyAttr == "dn"){
					$key = $record[$keyAttr];
					////////////////////////////////////////////////
					// MODIFICATION RECIA | DEBUT | 2013-03-14
					////////////////////////////////////////////////
					// Ancien code :
					/*
					 } else {
					 $key = $record[$keyAttr][0];
					 }
					 if ($labelAttr == "dn"){
					 $label = $record[$labelAttr];
					 } else {
					 $label = $record[$labelAttr][0];
					 }
					 $list[$key] = $label;
						*/

					// Nouveau code :
				} else {
					for ($j = 0; $j < $record[$keyAttr]["count"] ; $j++){
						$key = $record[$keyAttr][$j];
						if($labelAttr == "dn") {
							$label = $record[$labelAttr];
						} else {
							$label = $record[$labelAttr][$j];
						}
						$list[$key] = $label;
					}

					////////////////////////////////////////////////
					// MODIFICATION RECIA | FIN
					////////////////////////////////////////////////

				}
			}
			$this->ldapconn->ldap_close();
		}

		asort($list);
		return $list;
	}

	public function get_userAttribute($username, $attributes){
		$ldapconnection = $this->ldapconn->ldap_connect();
		if (!$ldapconnection) {
			return;
		}

		$ldapFilter = "(".$this->instance->getConfig('username_attribute')."=".$username.")";

		$records = $this->ldapconn->ldap_search(
				$this->instance->getConfig('branch'),
				$ldapFilter,
				$attributes
				);
		 
		$list = array();
		foreach ($records as $record) {
			foreach ($attributes as $attribute) {
				if (array_key_exists($attribute, $record)){
					$list[$attribute] = $record[$attribute][0];
				}
			}
		}
		$this->ldapconn->ldap_close();
		return $list;
	}
	
	public function get_userAttributeMultiple($username, $attributes){
		$ldapconnection = $this->ldapconn->ldap_connect();
		if (!$ldapconnection) {
			return;
		}
		 
		$ldapFilter = "(".$this->instance->getConfig('username_attribute')."=".$username.")";
		$records = $this->ldapconn->ldap_search(
				$this->instance->getConfig('branch'),
				$ldapFilter,
				$attributes
				);
		 
	
		foreach ($records as $record) {
			foreach ($attributes as $attribute) {
				if (array_key_exists($attribute, $record) ){
					$list[$attribute] = $record[$attribute];
				}
			}
		}
		$this->ldapconn->ldap_close();
		return $list;
	}
	
	
	public function matchLDAPValues($listFilter, $userValues, $i){
		switch ($i){
			case 1 : return $this->matchLDAPVAlues1($listFilter,$userValues);
			case 2 : return $this->matchLDAPVAlues2($listFilter,$userValues);
			case 3 : return $this->matchLDAPVAlues3($listFilter,$userValues);
			case 4 : return $this->matchLDAPVAlues4($listFilter,$userValues);
		}
	
		return array();
	}
	
	public function matchLDAPVAlues1($listTmp, $userValues){
		$liste = array();
		for ($i = 0; $i < $userValues["escouai"]["count"] ; $i++){
			$uai = $userValues["escouai"][$i] ;
			if ($listTmp[$uai] != ''){
				$liste[$uai] = $listTmp[$uai];
			}
		}
		return $liste;
	}
	public function matchLDAPVAlues2($listFilter, $userValues){
		return $listFilter;
	}
	public function matchLDAPVAlues3($listTmp, $userValues){

		$liste = array();
		for ($i = 0; $i < $userValues["entauxensclasses"]["count"] ; $i++){
			$classe = $userValues["entauxensclasses"][$i];
			if ($listTmp[$classe] != ''){
				$liste[$classe] = $listTmp[$classe];
			}
		}
		return $liste;
	}
	public function matchLDAPVAlues4($listTmp, $userValues){
		$liste = array();
		for ($i = 0; $i < $userValues["entauxensgroupes"]["count"] ; $i++){
			$groupe = $userValues["entauxensgroupes"][$i];
			if ($listTmp[$groupe] != ''){
				$liste[$groupe] = $listTmp[$groupe];
			}
		}
		return $liste;
	}



}

/**
 * Enrol candidates.
 */
class enrol_simplesco_potential_participant extends user_selector_base {
    protected $enrolid;

    public function __construct($name, $options) {
        $this->enrolid  = $options['enrolid'];
        parent::__construct($name, $options);
    }

    /**
     * Candidate users
     * @param string $search
     * @return array
     */
    public function find_users($search) {
        global $DB;
        // By default wherecondition retrieves all users except the deleted, not confirmed and guest.
        list($wherecondition, $params) = $this->search_sql($search, 'u');
        $params['enrolid'] = $this->enrolid;

        $fields      = 'SELECT ' . $this->required_fields_sql('u');
        $countfields = 'SELECT COUNT(1)';

        $sql = " FROM {user} u
            LEFT JOIN {user_enrolments} ue ON (ue.userid = u.id AND ue.enrolid = :enrolid)
                WHERE $wherecondition
                      AND ue.id IS NULL";

        list($sort, $sortparams) = users_order_by_sql('u', $search, $this->accesscontext);
        $order = ' ORDER BY ' . $sort;

        if (!$this->is_validating()) {
            $potentialmemberscount = $DB->count_records_sql($countfields . $sql, $params);
            if ($potentialmemberscount > $this->maxusersperpage) {
                return $this->too_many_results($search, $potentialmemberscount);
            }
        }

        $availableusers = $DB->get_records_sql($fields . $sql . $order, array_merge($params, $sortparams));

        if (empty($availableusers)) {
            return array();
        }


        if ($search) {
            $groupname = get_string('enrolcandidatesmatching', 'enrol', $search);
        } else {
            $groupname = get_string('enrolcandidates', 'enrol');
        }

        return array($groupname => $availableusers);
    }

    protected function get_options() {
        $options = parent::get_options();
        $options['enrolid'] = $this->enrolid;
        $options['file']    = 'enrol/simplesco/locallib.php';
        return $options;
    }
}

/**
 * Enrolled users.
 */
class enrol_simplesco_current_participant extends user_selector_base {
    protected $courseid;
    protected $enrolid;

    public function __construct($name, $options) {
        $this->enrolid  = $options['enrolid'];
        parent::__construct($name, $options);
    }

    /**
     * Candidate users
     * @param string $search
     * @return array
     */
    public function find_users($search) {
        global $DB;
        // By default wherecondition retrieves all users except the deleted, not confirmed and guest.
        list($wherecondition, $params) = $this->search_sql($search, 'u');
        $params['enrolid'] = $this->enrolid;

        $fields      = 'SELECT ' . $this->required_fields_sql('u');
        $countfields = 'SELECT COUNT(1)';

        $sql = " FROM {user} u
                 JOIN {user_enrolments} ue ON (ue.userid = u.id AND ue.enrolid = :enrolid)
                WHERE $wherecondition";

        list($sort, $sortparams) = users_order_by_sql('u', $search, $this->accesscontext);
        $order = ' ORDER BY ' . $sort;

        if (!$this->is_validating()) {
            $potentialmemberscount = $DB->count_records_sql($countfields . $sql, $params);
            if ($potentialmemberscount > $this->maxusersperpage) {
                return $this->too_many_results($search, $potentialmemberscount);
            }
        }

        $availableusers = $DB->get_records_sql($fields . $sql . $order, array_merge($params, $sortparams));

        if (empty($availableusers)) {
            return array();
        }


        if ($search) {
            $groupname = get_string('enrolledusersmatching', 'enrol', $search);
        } else {
            $groupname = get_string('enrolledusers', 'enrol');
        }

        return array($groupname => $availableusers);
    }

    protected function get_options() {
        $options = parent::get_options();
        $options['enrolid'] = $this->enrolid;
        $options['file']    = 'enrol/simplesco/locallib.php';
        return $options;
    }
}

/**
 * A bulk operation for the simplesco enrolment plugin to edit selected users.
 *
 * @copyright 2011 Sam Hemelryk
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class enrol_simplesco_editselectedusers_operation extends enrol_bulk_enrolment_operation {

    /**
     * Returns the title to display for this bulk operation.
     *
     * @return string
     */
    public function get_title() {
        return get_string('editselectedusers', 'enrol_simplesco');
    }

    /**
     * Returns the identifier for this bulk operation. This is the key used when the plugin
     * returns an array containing all of the bulk operations it supports.
     */
    public function get_identifier() {
        return 'editselectedusers';
    }

    /**
     * Processes the bulk operation request for the given userids with the provided properties.
     *
     * @param course_enrolment_manager $manager
     * @param array $userids
     * @param stdClass $properties The data returned by the form.
     */
    public function process(course_enrolment_manager $manager, array $users, stdClass $properties) {
        global $DB, $USER;

        if (!has_capability("enrol/simplesco:manage", $manager->get_context())) {
            return false;
        }

        // Get all of the user enrolment id's.
        $ueids = array();
        $instances = array();
        foreach ($users as $user) {
            foreach ($user->enrolments as $enrolment) {
                $ueids[] = $enrolment->id;
                if (!array_key_exists($enrolment->id, $instances)) {
                    $instances[$enrolment->id] = $enrolment;
                }
            }
        }

        // Check that each instance is manageable by the current user.
        foreach ($instances as $instance) {
            if (!$this->plugin->allow_manage($instance)) {
                return false;
            }
        }

        // Collect the known properties.
        $status = $properties->status;
        $timestart = $properties->timestart;
        $timeend = $properties->timeend;

        list($ueidsql, $params) = $DB->get_in_or_equal($ueids, SQL_PARAMS_NAMED);

        $updatesql = array();
        if ($status == ENROL_USER_ACTIVE || $status == ENROL_USER_SUSPENDED) {
            $updatesql[] = 'status = :status';
            $params['status'] = (int)$status;
        }
        if (!empty($timestart)) {
            $updatesql[] = 'timestart = :timestart';
            $params['timestart'] = (int)$timestart;
        }
        if (!empty($timeend)) {
            $updatesql[] = 'timeend = :timeend';
            $params['timeend'] = (int)$timeend;
        }
        if (empty($updatesql)) {
            return true;
        }

        // Update the modifierid.
        $updatesql[] = 'modifierid = :modifierid';
        $params['modifierid'] = (int)$USER->id;

        // Update the time modified.
        $updatesql[] = 'timemodified = :timemodified';
        $params['timemodified'] = time();

        // Build the SQL statement.
        $updatesql = join(', ', $updatesql);
        $sql = "UPDATE {user_enrolments}
                   SET $updatesql
                 WHERE id $ueidsql";

        if ($DB->execute($sql, $params)) {
            foreach ($users as $user) {
                foreach ($user->enrolments as $enrolment) {
                    $enrolment->courseid  = $enrolment->enrolmentinstance->courseid;
                    $enrolment->enrol     = 'simplesco';
                    // Trigger event.
                    $event = \core\event\user_enrolment_updated::create(
                            array(
                                'objectid' => $enrolment->id,
                                'courseid' => $enrolment->courseid,
                                'context' => context_course::instance($enrolment->courseid),
                                'relateduserid' => $user->id,
                                'other' => array('enrol' => 'simplesco')
                                )
                            );
                    $event->trigger();
                }
            }
            return true;
        }

        return false;
    }

    /**
     * Returns a enrol_bulk_enrolment_operation extension form to be used
     * in collecting required information for this operation to be processed.
     *
     * @param string|moodle_url|null $defaultaction
     * @param mixed $defaultcustomdata
     * @return enrol_simplesco_editselectedusers_form
     */
    public function get_form($defaultaction = null, $defaultcustomdata = null) {
        global $CFG;
        require_once($CFG->dirroot.'/enrol/simplesco/bulkchangeforms.php');
        return new enrol_simplesco_editselectedusers_form($defaultaction, $defaultcustomdata);
    }
}


/**
 * A bulk operation for the simplesco enrolment plugin to delete selected users enrolments.
 *
 * @copyright 2011 Sam Hemelryk
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class enrol_simplesco_deleteselectedusers_operation extends enrol_bulk_enrolment_operation {

    /**
     * Returns the title to display for this bulk operation.
     *
     * @return string
     */
    public function get_identifier() {
        return 'deleteselectedusers';
    }

    /**
     * Returns the identifier for this bulk operation. This is the key used when the plugin
     * returns an array containing all of the bulk operations it supports.
     *
     * @return string
     */
    public function get_title() {
        return get_string('deleteselectedusers', 'enrol_simplesco');
    }

    /**
     * Returns a enrol_bulk_enrolment_operation extension form to be used
     * in collecting required information for this operation to be processed.
     *
     * @param string|moodle_url|null $defaultaction
     * @param mixed $defaultcustomdata
     * @return enrol_simplesco_editselectedusers_form
     */
    public function get_form($defaultaction = null, $defaultcustomdata = null) {
        global $CFG;
        require_once($CFG->dirroot.'/enrol/simplesco/bulkchangeforms.php');
        if (!array($defaultcustomdata)) {
            $defaultcustomdata = array();
        }
        $defaultcustomdata['title'] = $this->get_title();
        $defaultcustomdata['message'] = get_string('confirmbulkdeleteenrolment', 'enrol_simplesco');
        $defaultcustomdata['button'] = get_string('unenrolusers', 'enrol_simplesco');
        return new enrol_simplesco_deleteselectedusers_form($defaultaction, $defaultcustomdata);
    }

    /**
     * Processes the bulk operation request for the given userids with the provided properties.
     *
     * @global moodle_database $DB
     * @param course_enrolment_manager $manager
     * @param array $userids
     * @param stdClass $properties The data returned by the form.
     */
    public function process(course_enrolment_manager $manager, array $users, stdClass $properties) {
        global $DB;

        if (!has_capability("enrol/simplesco:unenrol", $manager->get_context())) {
            return false;
        }
        $useridconnect = $_SESSION['USER']->id;
        foreach ($users as $user) {
        	$useridliste = $user->id;
            foreach ($user->enrolments as $enrolment) {
                $plugin = $enrolment->enrolmentplugin;
                $instance = $enrolment->enrolmentinstance;
                $canselfunenrol = has_capability("enrol/simplesco:unenrolself", $manager->get_context());
                if ($plugin->allow_unenrol_user($instance, $enrolment)) {
                	if ($useridconnect != $useridliste || $canselfunenrol) {
                    	$plugin->unenrol_user($instance, $user->id);
                	}
                }
            }
        }
        return true;
    }
}

/**
 * Migrates all enrolments of the given plugin to enrol_simplesco plugin,
 * this is used for example during plugin uninstallation.
 *
 * NOTE: this function does not trigger role and enrolment related events.
 *
 * @param string $enrol  The enrolment method.
 */
function enrol_simplesco_migrate_plugin_enrolments($enrol) {
    global $DB;

    if ($enrol === 'simplesco') {
        // We can not migrate to self.
        return;
    }

    $simplescoplugin = enrol_get_plugin('simplesco');

    $params = array('enrol'=>$enrol);
    $sql = "SELECT e.id, e.courseid, e.status, MIN(me.id) AS mid, COUNT(ue.id) AS cu
              FROM {enrol} e
              JOIN {user_enrolments} ue ON (ue.enrolid = e.id)
              JOIN {course} c ON (c.id = e.courseid)
         LEFT JOIN {enrol} me ON (me.courseid = e.courseid AND me.enrol='simplesco')
             WHERE e.enrol = :enrol
          GROUP BY e.id, e.courseid, e.status
          ORDER BY e.id";
    $rs = $DB->get_recordset_sql($sql, $params);

    foreach($rs as $e) {
        $minstance = false;
        if (!$e->mid) {
            // simplesco instance does not exist yet, add a new one.
            $course = $DB->get_record('course', array('id'=>$e->courseid), '*', MUST_EXIST);
            if ($minstance = $DB->get_record('enrol', array('courseid'=>$course->id, 'enrol'=>'simplesco'))) {
                // Already created by previous iteration.
                $e->mid = $minstance->id;
            } else if ($e->mid = $simplescoplugin->add_default_instance($course)) {
                $minstance = $DB->get_record('enrol', array('id'=>$e->mid));
                if ($e->status != ENROL_INSTANCE_ENABLED) {
                    $DB->set_field('enrol', 'status', ENROL_INSTANCE_DISABLED, array('id'=>$e->mid));
                    $minstance->status = ENROL_INSTANCE_DISABLED;
                }
            }
        } else {
            $minstance = $DB->get_record('enrol', array('id'=>$e->mid));
        }

        if (!$minstance) {
            // This should never happen unless adding of default instance fails unexpectedly.
            debugging('Failed to find simplesco enrolment instance', DEBUG_DEVELOPER);
            continue;
        }

        // First delete potential role duplicates.
        $params = array('id'=>$e->id, 'component'=>'enrol_'.$enrol, 'empty'=>'');
        $sql = "SELECT ra.id
                  FROM {role_assignments} ra
                  JOIN {role_assignments} mra ON (mra.contextid = ra.contextid AND mra.userid = ra.userid AND mra.roleid = ra.roleid AND mra.component = :empty AND mra.itemid = 0)
                 WHERE ra.component = :component AND ra.itemid = :id";
        $ras = $DB->get_records_sql($sql, $params);
        $ras = array_keys($ras);
        $DB->delete_records_list('role_assignments', 'id', $ras);
        unset($ras);

        // Migrate roles.
        $sql = "UPDATE {role_assignments}
                   SET itemid = 0, component = :empty
                 WHERE itemid = :id AND component = :component";
        $params = array('empty'=>'', 'id'=>$e->id, 'component'=>'enrol_'.$enrol);
        $DB->execute($sql, $params);

        // Delete potential enrol duplicates.
        $params = array('id'=>$e->id, 'mid'=>$e->mid);
        $sql = "SELECT ue.id
                  FROM {user_enrolments} ue
                  JOIN {user_enrolments} mue ON (mue.userid = ue.userid AND mue.enrolid = :mid)
                 WHERE ue.enrolid = :id";
        $ues = $DB->get_records_sql($sql, $params);
        $ues = array_keys($ues);
        $DB->delete_records_list('user_enrolments', 'id', $ues);
        unset($ues);

        // Migrate to simplesco enrol instance.
        $params = array('id'=>$e->id, 'mid'=>$e->mid);
        if ($e->status != ENROL_INSTANCE_ENABLED and $minstance->status == ENROL_INSTANCE_ENABLED) {
            $status = ", status = :disabled";
            $params['disabled'] = ENROL_USER_SUSPENDED;
        } else {
            $status = "";
        }
        $sql = "UPDATE {user_enrolments}
                   SET enrolid = :mid $status
                 WHERE enrolid = :id";
        $DB->execute($sql, $params);
    }
    $rs->close();
}

/**
 * Gets an array of the cohorts that can be enrolled in this course.
 *
 * @param int $enrolid
 * @param string $search
 * @param int $page Defaults to 0
 * @param int $perpage Defaults to 25
 * @param int $addedenrollment
 * @return array Array(totalcohorts => int, cohorts => array)
 */
function enrol_simplesco_get_potential_cohorts($context, $enrolid, $search = '', $page = 0, $perpage = 25, $addedenrollment = 0) {
    global $CFG;
    require_once($CFG->dirroot . '/cohort/lib.php');

    $allcohorts = cohort_get_available_cohorts($context, COHORT_WITH_NOTENROLLED_MEMBERS_ONLY, 0, 0, $search);
    $totalcohorts = count($allcohorts);
    $cohorts = array();
    $cnt = 0;
    foreach ($allcohorts as $c) {
        if ($cnt >= $page * $perpage && (!$perpage || $cnt < ($page+1)*$perpage) && $c->contextid != 1) {
            $cohorts[] = (object)array(
                'id' => $c->id,
                'name' => format_string($c->name, true, array('context' => $c->contextid)),
                'cnt' => $c->memberscnt - $c->enrolledcnt
            );
        }
        $cnt++;
    }
    return array('totalcohorts' => $totalcohorts, 'cohorts' => $cohorts);
}

/**
 * Enrol candidates
 */
class enrol_simpleldap_potential_participant extends user_selector_base {
	protected $enrolid;
	protected $code1;
	protected $code2;
	protected $code3;
	protected $code4;
	protected $code5;
	protected $instance;
	protected $ldapconn;
	protected $nbFilter;
	protected $potentialUsers;
	protected $page;
	protected $perpage;
	protected $addedenrollment;

	public function __construct($name, $options, $instance,$ldapconn) {

		$this->enrolid  = $options['enrolid'];
		/* if (array_key_exists('codes', $options)){
		 $this->codes  = $options['codes'];
		 } */

		$this->code1  = $options['code1'];
		$this->code2  = $options['code2'];
		$this->code3  = $options['code3'];
		$this->code4  = $options['code4'];
		$this->code5  = $options['code5'];


		/*  if (array_key_exists('enrol_simpleldap', $options)){
		 //$this->instance  = $options['enrol_simpleldap']; //MODIF
			$this->instance = $instance;
			}

			if (array_key_exists('ldapconn', $options)){
			$this->ldapconn  = $options['ldapconn'];
			} */

		$this->instance = $instance;
		$this->ldapconn = $ldapconn;

		/* if (array_key_exists('nbFilter', $options)){
		 $this->nbFilter  = $options['nbFilter'];
		 } */


		/* if (array_key_exists('potentialUsers', $options)){
			$this->potentialUsers = $options['potentialUsers'];
			} else {
			$this->potentialUsers = null;
			} */

		//parent::__construct($name, array("enrolid" => $this->enrolid));
		parent::__construct($name, $options);
	}

	/**
	 * Candidate users
	 * @param <type> $search
	 * @return array
	 */
	public function find_users($search) {
		$nbFilter = 5; // TODO : A externaliser pour une meilleure maintenabilité
		$doLDAPSearch = false;

		if ($this->code1 != ''
				|| $this->code2 != ''
				|| $this->code3 != ''
				|| $this->code4 != ''
				|| $this->code5 != '' ){
					$doLDAPSearch = true;
		}

		$userList = array();
		$LDAPWhereCondition = "";
		if ($doLDAPSearch){

			$ldapconnection = $this->ldapconn->ldap_connect();
			if (!$ldapconnection) {
				return;
			}

			$filter = "(&";
			$filter .=  $this->instance->getConfig('default_filter');

			for ($i = 1 ; $i <= $nbFilter ; $i++){
				$nomvar = 'code'.$i;
				if ($this->$nomvar != '' ){
					if ( $this->$nomvar == "ANYOTHER"){
						$filter .= "(!(|(ESCOPersonProfils=ELEVE)(ESCOPersonProfils=ENS)(ESCOPersonProfils=PERSREL)))";
					} else {
						$filter .=  $this->instance->getConfig('filter'.$i.'_sub_filter');
					}
				}
			}
			$filter .= ")";

			for ($i = 1 ; $i <= $nbFilter ; $i++){
				$nomvar = 'code'.$i;
				if ($this->$nomvar != ''){
					$valeur = $this->$nomvar;
					$valeur = str_replace("(", "\\28", $valeur);
					$valeur = str_replace(")", "\\29", $valeur);
					$filter = str_replace("{CODE".$i."}", $valeur, $filter);
				}
			}
			$records = $this->ldapconn->ldap_search(
					$this->instance->getConfig('branch'),
					$filter,
					array($this->instance->getConfig('username_attribute')));


			foreach ($records as $record) {
				array_push($userList, $record[$this->instance->getConfig('username_attribute')][0]);
			}
			$this->potentialUsers = $userList;

			$LDAPWhereCondition = " u.username IN ( '' ";
			if (count($userList) > 0 ){
				foreach ($userList as $user){
					$LDAPWhereCondition .= ",'".$user."'";
				}
			}
			$LDAPWhereCondition .= ") AND ";



			$this->ldapconn->ldap_close();
		}
		 
		global $DB , $CFG;
		//by default wherecondition retrieves all users except the deleted, not confirmed and guest
		list($wherecondition, $params) = $this->search_sql($search, 'u');
		$params['enrolid'] = $this->enrolid;

		$fields      = 'SELECT ' . $this->required_fields_sql('u');
		$countfields = 'SELECT COUNT(1)';

		$sql = " FROM {user} u
		WHERE $wherecondition AND $LDAPWhereCondition
		u.id NOT IN (
		SELECT ue.userid
		FROM {user_enrolments} ue
		JOIN {enrol} e ON (e.id = ue.enrolid AND e.id = :enrolid))";
		$order = ' ORDER BY u.lastname ASC, u.firstname ASC';

		if (!empty($CFG->maxusersperpage)) {
			$maxusersperpage = $CFG->maxusersperpage;
		} else {
			$maxusersperpage = 200;
		}
		
		if (!$this->is_validating()) {
			$potentialmemberscount = $DB->count_records_sql($countfields . $sql, $params);
			if ($potentialmemberscount > $maxusersperpage) {
				//return $this->too_many_results($search, $potentialmemberscount);
			}
		}


		$availableusers = $DB->get_records_sql($fields . $sql . $order, $params, ($this->page*$this->perpage) - $this->addedenrollment, $this->perpage);
						//$DB->get_records_sql($fields . $sql . $order, array_merge($params, $sortparams), ($page*$perpage) - $addedenrollment, $perpage);

		if (empty($availableusers)) {
			//return array();
		}

		if ($search) {
			$groupname = get_string('enrolcandidatesmatching', 'enrol', $search);
		} else {
			$groupname = get_string('enrolcandidates', 'enrol');
		}
		
		return array($groupname => $availableusers, 'total' => $potentialmemberscount);
	}

	protected function get_options() {
		$options = parent::get_options();
		$options['enrolid'] = $this->enrolid;
		// $options['potentialUsers'] = $this->potentialUsers;
		$options['file']    = 'enrol/simpleldap/locallib.php';
		return $options;
	}
	public function display2($page=0, $perpage=25, $addedenrollment=0) {
		global $PAGE;

		// Get the list of requested users.
		$search = optional_param('search', '', PARAM_RAW);
		/*if (optional_param($this->name . '_clearbutton', false, PARAM_BOOL)) {
			$search = '';
		}*/
		$this->page = $page;
		$this->perpage = $perpage;
		$this->addedenrollment = $addedenrollment;
		
		$groupedusers = $this->find_users($search);
		//$result = $groupedusers['Utilisateurs non inscrits'];
		$cle=key($groupedusers);
		//$totalusers = count($groupedusers[$cle]);
		$totalusers = $groupedusers['total'];
		$result = array('totalusers' => $totalusers, 'users' => $groupedusers[$cle]);
		return $result;
		
	}
	// Initialise one of the option checkboxes, either from
	// the request, or failing that from the user_preferences table, or
	// finally from the given default.
	private function initialise_option($name, $default) {
		$param = optional_param($name, null, PARAM_BOOL);
		if (is_null($param)) {
			return get_user_preferences($name, $default);
		} else {
			set_user_preference($name, $param);
			return $param;
		}
	}

	// Output one of the options checkboxes.
	private function option_checkbox($name, $on, $label) {
		if ($on) {
			$checked = ' checked="checked"';
		} else {
			$checked = '';
		}
		$name = 'userselector_' . $name;
		$output = '<p><input type="hidden" name="' . $name . '" value="0" />' .
				// For the benefit of brain-dead IE, the id must be different from the name of the hidden form field above.
		// It seems that document.getElementById('frog') in IE will return and element with name="frog".
		'<input type="checkbox" id="' . $name . 'id" name="' . $name . '" value="1"' . $checked . ' /> ' .
		'<label for="' . $name . 'id">' . $label . "</label></p>\n";
		user_preference_allow_ajax_update($name, PARAM_BOOL);
		return $output;
	}
}

