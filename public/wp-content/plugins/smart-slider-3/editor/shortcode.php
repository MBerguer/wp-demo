<?php

class N2SSShortcodeInsert
{

    public static function init() {
        add_action('admin_init', array(
            'N2SSShortcodeInsert',
            'addButton'
        ));
    }

    public static function addButton() {
        if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) {
            return;
        }
        if (in_array(basename($_SERVER['PHP_SELF']), array(
            'post-new.php',
            'page-new.php',
            'post.php',
            'page.php'
        ))) {
            add_action('admin_print_footer_scripts', array(
                'N2SSShortcodeInsert',
                'addButtonDialog'
            ));

            wp_enqueue_script('jquery-ui-dialog');
            wp_enqueue_style("wp-jquery-ui-dialog");

            if (get_user_option('rich_editing') == 'true') {
                add_filter('mce_external_plugins', array(
                    'N2SSShortcodeInsert',
                    'mceAddPlugin'
                ));
                add_filter('mce_buttons', array(
                    'N2SSShortcodeInsert',
                    'mceRegisterButton'
                ));
            }
        }
    }

    public static function mceAddPlugin($plugin_array) {
        $plugin_array['nextend2smartslider3'] = plugin_dir_url(__FILE__) . 'shortcode.js';
        return $plugin_array;
    }

    public static function mceRegisterButton($buttons) {
        array_push($buttons, "|", "nextend2smartslider3");
        return $buttons;
    }

    public static function addButtonDialog() {
        global $wpdb;
        $query   = 'SELECT title, id FROM ' . $wpdb->prefix . 'nextend2_smartslider3_sliders' . ' ORDER BY time DESC';
        $sliders = $wpdb->get_results($query, ARRAY_A);
        ?>
        <div id='n2-ss-wp-sliders-modal' title='Select a Slider' style="display:none;">
            Please choose a slider from the following list:
        </div>
        <script type="text/javascript">
            (function () {
                var $modal,
                    callback = function () {
                    },
                    sliders = <?php echo json_encode($sliders) ?>;

                function show() {
                    if (!$modal) {
                        var buttons = {};
                        for (var i = 0; i < sliders.length; i++) {
                            buttons[sliders[i].title] = jQuery.proxy(function (id) {
                                $modal.dialog('close');
                                callback(id);
                            }, this, sliders[i].id);
                        }
                        $modal = jQuery('#n2-ss-wp-sliders-modal');
                        $modal.dialog({
                            modal: true,
                            draggable: false,
                            resizable: false,
                            dialogClass: 'n2-ss-wp-sliders-modal',
                            width: 900,
                            buttons: buttons
                        });
                    } else {
                        $modal.dialog('open');
                    }
                }

                window.NextendSmartSliderWPTinyMCEModal = function (ed) {
                    callback = function (id) {
                        ed.execCommand('mceInsertContent', false, '<div>[smartslider3 slider=' + id + ']</div>');
                    };
                    show();
                };

                if (typeof QTags !== 'undefined') {
                    QTags.addButton('smart-slider-3', 'Smart Slider', function () {
                        callback = function (id) {
                            QTags.insertContent('<div>[smartslider3 slider=' + id + ']</div>');
                        };
                        show();
                    });
                }
            })();
        </script>
        <style type="text/css">
            .n2-ss-wp-sliders-modal .ui-dialog-buttonpane .ui-dialog-buttonset {
                line-height: 46px;
            }
        </style>
    <?php
    }
}

N2SSShortcodeInsert::init();