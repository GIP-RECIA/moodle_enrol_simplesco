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
 * Strings for component 'enrol_simplesco', language 'fr'.
 *
 * @package    enrol_simplesco
 * @copyright  2016 GIP RECIA
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
$string['noresultliste'] = 'Aucune valeur n\'est disponible ';
$string['allresultliste'] = 'Tous';
$string['alterstatus'] = 'Modification du statut';
$string['altertimeend'] = 'Modification de la date de fin';
$string['altertimestart'] = 'Modification de la date de début';
$string['assignrole'] = 'Assigner un role';
$string['browseusers'] = 'Affiche les utilisateurs';
$string['browsecohorts'] = 'Affiche les cohortes';
$string['searchoption']='Options de recherche';
$string['confirmbulkdeleteenrolment'] = 'Etes-vous sur de vouloir désinscrire ces utilisateurs ?';
$string['defaultperiod'] = 'Durée d\'inscription par défaut';
$string['defaultperiod_desc'] = 'Durée par défaut pendant laquelle  l\'inscription est valide. Si mise à zero, la durée d\'inscription est illimitée par defaut.';
$string['defaultperiod_help'] = 'Durée par défaut pendant laquelle  l\'inscription est valide, commençant au moment où l\'utilisateur est inscrit. Si désactivé, la durée d\'inscription sera illimitée par defaut.';
$string['deleteselectedusers'] = 'Désinscrire les utilisateurs';
$string['editselectedusers'] = 'Editer les inscriptions';
$string['enrolledincourserole'] = 'Inscrit dans "{$a->course}" comme "{$a->role}"';
$string['enrolusers'] = 'Inscrire';
$string['choisetitle'] = 'Inscription';
$string['frommyclass'] = 'Depuis mes classes/groupes';
$string['fromnetocentre'] = 'Depuis annuaire ENT';
$string['enrolcohorttitle'] = 'Inscription par cohorte';
$string['ajaxonecohortfound'] = '1 cohorte trouvée';
$string['ajaxxcohortfound'] = '{$a} cohortes trouvées';
$string['cohort'] = 'Cohorte';
$string['btnclosecohort'] = 'Terminer l\'inscription des cohortes';
$string['btnunenrolall'] = 'Tout désinscrire';
$string['btnclose'] = 'Fermer';
$string['byname'] = 'Par nom';
$string['btnenroluser'] = 'Inscrire un ou plusieurs utilisateurs';
$string['btnenrolcohort'] = 'Inscrire une ou plusieurs cohortes';
$string['expiredaction'] = 'Action lors de l\'expiration de l\'inscription';
$string['expiredaction_help'] = 'Sélectionnez l\'action à réaliser quand l\'inscription expire. Notez que quelques informations et paramétrages de l\'utilisateur sont effacés du cours lors de la désinscription.';
$string['expirymessageenrollersubject'] = 'Notification : expiration de l\'inscription';
$string['expirymessageenrollerbody'] = 'L\'inscription au cours \'{$a->course}\' expirera dans le prochain {$a->threshold} pour les utilisateurs suivants :

{$a->users}

Pour allonger leur inscription, allez à {$a->extendurl}';
$string['expirymessageenrolledsubject'] = 'Notification : expiration de l\'inscription';
$string['expirymessageenrolledbody'] = 'Chèr(e) {$a->user},

Votre inscription au cours \'{$a->course}\' va expirer à {$a->timeend}.

Si vous avez besoin d\'aide, contactez {$a->enroller}.';
$string['simplesco:config'] = 'Configurer les instances d\'inscription simplesco';
$string['simplesco:enrol'] = 'Inscrire des utilisateurs';
$string['simplesco:manage'] = 'Gérer les inscriptions';
$string['simplesco:unenrol'] = 'Désinscrire des utilisateurs du cours';
$string['simplesco:unenrolself'] = 'Se désinscrire du cours';
$string['messageprovider:expiry_notification'] = 'simplesco enrolment expiry notifications';
$string['pluginname'] = 'Inscriptions ENT';
$string['pluginname_desc'] = 'Le plugin d\'inscription ENT permet de s\'inscrire manuellement à un cours par un lien, par un utilisateur possédant les permissions appropriées, comme un enseignant.';
$string['status'] = 'Inscription simplesco active';
$string['status_desc'] = 'Autoriser l\'accès des cours aux utilisateurs inscrits en interne.  Cela devrait être activé dans la plupart des cas.';
$string['status_help'] = 'This setting determines whether users can be enrolled manually, via a link in the course administration settings, by a user with appropriate permissions such as a teacher.';
$string['statusenabled'] = 'Enabled';
$string['statusdisabled'] = 'Disabled';
$string['unenrol'] = 'Unenrol user';
$string['unenrolselectedusers'] = 'Unenrol selected users';
$string['unenrolselfconfirm'] = 'Do you really want to unenrol yourself from course "{$a}"?';
$string['unenroluser'] = 'Do you really want to unenrol "{$a->user}" from course "{$a->course}"?';
$string['unenrolusers'] = 'Désinscrire';
$string['unenroltitle'] = 'Désinscription';
$string['wscannotenrol'] = 'Plugin instance cannot manually enrol a user in the course id = {$a->courseid}';
$string['wsnoinstance'] = 'simplesco enrolment plugin instance doesn\'t exist or is disabled for the course (id = {$a->courseid})';
$string['wsusercannotassign'] = 'You don\'t have the permission to assign this role ({$a->roleid}) to this user ({$a->userid}) in this course({$a->courseid}).';

//LDAP
$string['phpldap_noextension'] = '<em>The PHP LDAP module does not seem to be present. Please ensure it is installed and enabled if you want to use this enrolment plugin.</em>';
$string['pluginnotenabled'] = 'Plugin not enabled!';
$string['main_search'] = 'Recherche des utilisateurs';
$string['branch'] = 'Contexte';
$string['branch_desc'] = 'Le contexte de la recherche pour les utilisateurs.';
$string['username_attribute'] = 'Identifiant utilisateur';
$string['username_attribute_desc'] = 'L\'attribut LDAP qui correspond au login de l\'utilisateur.';
$string['default_filter'] = 'Filtre par défaut';
$string['default_filter_desc'] = 'Un filtre LDAP qui sera toujours appelé. Ce filtre permet de limiter la rechercher et de cibler les utilisateurs pertinants. Par example : (actif=1).';

$string['filter1'] = 'Filtre n°1';
$string['filter2'] = 'Filtre n°2';
$string['filter3'] = 'Filtre n°3';
$string['filter4'] = 'Filtre n°4';
$string['filter5'] = 'Filtre n°5';
$string['fitre1name'] = 'Etablissement';
$string['fitre2name'] = 'Profil';
$string['fitre3name'] = 'Classe';
$string['fitre4name'] = 'Groupe pédagogique';
$string['fitre5name'] = 'Groupe ENT';
$string['fitre6name'] = 'Nom';
$string['fitre6namecohort'] = 'Nom de la cohorte';

$string['filter_label'] = 'Libellé du filtre';
$string['filter_label_desc'] = 'Le libellé du filtre.';
$string['filter_mandatory'] = 'Filtre obligatoire';
$string['filter_mandatory_desc'] = 'Cocher la case si le filtre doit toujours contenir une valeur.';

$string['filter_list_values'] = 'Valeurs proposées';
$string['filter_list_values_desc'] = 'Les valeurs proposées ainsi que les codes associés. Les données doivent être de la forme : libellé1#filtre1;libellé2#filtre2;... Par exemple:"Enseignants#ENTAuxEnseignant;Directeurs#ENTDirecteur;Personnel non enseignant#ENTAuxNonEnsEtab"';
$string['filter_list_filter'] = 'Filtres de valeurs';
$string['filter_list_filter_desc'] = 'Le filtre utilisé pour constituer la liste des valeurs. N\'est pas utilisé lorsque l\'option précédente est remplie.';
$string['filter_list_branch'] = 'Contexte de la liste';
$string['filter_list_branch_desc'] = 'Le contexte interogé pour constituer la liste des valeurs.';
$string['filter_list_label'] = 'Attribut libellé';
$string['filter_list_label_desc'] = 'L\'attribut LDAP qui sert de libellé dans la liste.';
$string['filter_list_code'] = 'Attribut code';
$string['filter_list_code_desc'] = 'L\'attribut LDAP qui sert de code dans la liste.';
$string['filter_sub_filter'] = 'Le filtre';
$string['filter_sub_filter_desc'] = 'Le filtre associé à la séléction. Ce filtre n\'est pris en compte que s\'il existe une valeur séléctionnée.';
$string['filter_default'] = 'Code par defaut';
$string['filter_default_desc'] = 'Le filtre qui permet de determiner la valeur par défaut.';
