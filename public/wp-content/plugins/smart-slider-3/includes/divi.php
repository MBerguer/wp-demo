<?php

class Nextend_ET_Builder_Module_Smart_Slider extends ET_Builder_Module
{
    function init()
    {
        $this->name = 'Smart Slider 3';
        $this->slug = 'et_pb_nextend_smart_slider_3';

        $this->whitelisted_fields = array(
            'slider',
        );

        $this->fields_defaults = array();

        $this->advanced_options = array();

        add_action('admin_footer', 'Nextend_ET_Builder_Module_Smart_Slider::add_admin_icon');
    }

    public static function add_admin_icon()
    {
        ?>
        <style type="text/css">
            .et-pb-all-modules .et_pb_nextend_smart_slider_3::before {
                content: 'S';
            }
        </style>
        <?php
    }

    function get_fields()
    {
        global $wpdb;

        $res = $wpdb->get_results('SELECT id, title FROM ' . $wpdb->prefix . 'nextend2_smartslider3_sliders');
        $options = array();
        foreach ($res AS $r) {
            $options[$r->id] = $r->title;
        }
        $fields = array(
            'slider' => array(
                'label' => 'Slider',
                'type' => 'select',
                'option_category' => 'basic_option',
                'options' => $options
            )
        );

        return $fields;
    }

    function shortcode_callback($atts, $content = null, $function_name)
    {
        $sliderId = $this->shortcode_atts['slider'];

        return N2SS3Shortcode::render(array('slider' => $sliderId), 'Divi module');
    }
}

new Nextend_ET_Builder_Module_Smart_Slider;