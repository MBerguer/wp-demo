<?php
if (class_exists('N2Platform', false)) {
    $role = get_role('administrator');
    $role->add_cap('nextend');
    $role->add_cap('nextend_config');
    $role->add_cap('nextend_visual_edit');
    $role->add_cap('nextend_visual_delete');

    $role = get_role('editor');
    $role->add_cap('nextend');
    $role->add_cap('nextend_config');
    $role->add_cap('nextend_visual_edit');
    $role->add_cap('nextend_visual_delete');
}