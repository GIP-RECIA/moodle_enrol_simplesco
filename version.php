<?php
// This file is part of Moodle - http://moodle.org/
//


/**
 * Manual enrolment plugin version specification.
 *
 * @package    enrol_simplesco
 * @copyright  2016 GIP RECIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$plugin->version   = 2023080400;        // The current plugin version (Date: YYYYMMDDXX)
$plugin->requires  = 2022111800;        // Requires this Moodle version
$plugin->component = 'enrol_simplesco';    // Full name of the plugin (used for diagnostics)
$plugin->cron      = 600;
