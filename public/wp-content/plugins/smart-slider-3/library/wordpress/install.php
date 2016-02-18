<?php
if (class_exists('N2Platform', false)) {
    $role = get_role('administrator');
    $role->add_cap('smartslider');
    $role->add_cap('smartslider_config');
    $role->add_cap('smartslider_edit');
    $role->add_cap('smartslider_delete');

    $role = get_role('editor');
    $role->add_cap('smartslider');
    $role->add_cap('smartslider_config');
    $role->add_cap('smartslider_edit');
    $role->add_cap('smartslider_delete');
}