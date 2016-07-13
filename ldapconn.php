<?php

require_once($CFG->libdir.'/ldaplib.php');

class ldapconn {
		
	protected $instance;
	
	public function __construct($instance){
		$this->instance = $instance;
	}
	
	/**
	 * Connect to the LDAP server, using the plugin configured
	 * settings. It's actually a wrapper around ldap_connect_moodle()
	 *
	 * @return mixed A valid LDAP connection or false.
	 */
	public function ldap_connect() {
		global $CFG;

		// Cache ldap connections. 
		if(!empty($this->ldapconnection)) {
			$this->ldapconns++;
			return $this->ldapconnection;
		}
		

		$ldapconnection = ldap_connect_moodle(
				$this->instance->getConfig('host_url'),
				$this->instance->getConfig('ldap_version'),
				'default',
				$this->instance->getConfig('bind_dn'),
				$this->instance->getConfig('bind_pw'),
				'0',
				$debuginfo);
	
		if ($ldapconnection) {
			$this->ldapconns = 1;
			$this->ldapconnection = $ldapconnection;
			return $ldapconnection;
		}
		
		// Log the problem, but don't show it to the user. She doesn't
		// even have a chance to see it, as we redirect instantly to
		// the user/front page.
		error_log($this->errorlogtag.$debuginfo);
	
		return false;
	}
	
	public function ldap_close() {
		$this->ldapconns--;
		
		if($this->ldapconns == 0) {
			@ldap_close($this->ldapconnection);
			unset($this->ldapconnection);
		}
	}
	
	public function ldap_search($branch, $filter, $attributes){
		
		$computeTime = false;		

		if ($computeTime){
			list($usec, $sec) = explode(" ", microtime());
	  		$time_start = ((float)$usec + (float)$sec);			
		}


		$ldap_result = @ldap_search(
				$this->ldapconnection,
				$branch,
				$filter,
				$attributes);
		
		if ($computeTime){
			list($usec, $sec) = explode(" ", microtime());
			$time_end = ((float)$usec + (float)$sec);
			$time = $time_end - $time_start;	
			echo "<br/>--------<br/>";
			var_dump($filter);
			echo "<br/>";
			var_dump($branch);
			echo "<br/>";
			echo $time;
			echo "<br/>--------<br/>";
		}

		// Check and push results
		$records = ldap_get_entries($this->ldapconnection, $ldap_result);
		// LDAP libraries return an odd array, really. fix it:
		$flat_records = array();
		for ($c = 0; $c < $records['count']; $c++) {
			array_push($flat_records, $records[$c]);
		}
		// Free some mem
		unset($records);
		return $flat_records;
	}
	
	
}



?>