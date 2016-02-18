<?php
/**
 * WPZOOM_Admin
 *
 * @package WPZOOM
 * @subpackage Admin
 */

new WPZOOM_Admin();

class WPZOOM_Admin {

    /**
     * Initialize wp-admin options page
     */
    public function __construct() {
        if (isset($_GET['activated']) && $_GET['activated'] == 'true') {
            header('Location: admin.php?page=wpzoom_options');
        }

        if (isset($_GET['page']) && $_GET['page'] == 'wpzoom_options') {
            add_action('init', array('WPZOOM_Admin_Settings_Page', 'init'));
        }

        add_action('admin_menu', array($this, 'register_admin_pages'));
        add_action('admin_footer', array($this, 'activate'));

        add_action('wp_ajax_wpzoom_ajax_post',       array('WPZOOM_Admin_Settings_Page', 'ajax_options'));
        add_action('wp_ajax_wpzoom_widgets_default', array('WPZOOM_Admin_Settings_Page', 'ajax_widgets_default'));

        add_action('admin_print_scripts-widgets.php', array($this, 'widgets_styling_script'));
        add_action('admin_print_scripts-widgets.php', array($this, 'widgets_styling_css'));

        add_action('admin_notices', array($this, 'seo_notification'));

        add_action('admin_enqueue_scripts', array($this, 'wpadmin_script'));
        add_action('admin_enqueue_scripts',  array($this, 'wpadmin_css'));
    }

    public function widgets_styling_script() {
        wp_enqueue_script('wpzoom_widgets_styling', WPZOOM::$assetsPath . '/js/widgets-styling.js', array('jquery'));
    }

    public function widgets_styling_css() {
        wp_enqueue_style('wpzoom_widgets_styling', WPZOOM::$assetsPath . '/css/widgets-styling.css');
    }

    public function wpadmin_script() {
        wp_enqueue_script('zoom-wp-admin', WPZOOM::$assetsPath . '/js/wp-admin.js', array('jquery'), WPZOOM::$wpzoomVersion);
        wp_localize_script('zoom-wp-admin', 'zoomFramework', array(
            'rootUri'   => WPZOOM::get_root_uri(),
            'assetsUri' => WPZOOM::get_assets_uri()
        ));
    }

    public function wpadmin_css() {
        wp_enqueue_style('zoom-wp-admin', WPZOOM::get_assets_uri() . '/css/wp-admin.css', array(), WPZOOM::$wpzoomVersion);
    }

    public function activate() {
        if (option::get('wpzoom_activated') != 'yes') {
            option::set('wpzoom_activated', 'yes');
            option::set('wpzoom_activated_time', time());
        } else {
            $activated_time = option::get('wpzoom_activated_time');
            if ((time() - $activated_time) < 2592000) {
                return;
            }
        }

        option::set('wpzoom_activated_time', time());
        require_once(WPZOOM_INC . '/pages/welcome.php');
    }

    public function admin() {
        require_once(WPZOOM_INC . '/pages/admin.php');
    }

    public function themes() {
        require_once(WPZOOM_INC . '/pages/themes.php');
    }

    public function update() {
        require_once(WPZOOM_INC . '/pages/update.php');
    }

    /**
     * WPZOOM custom menu for wp-admin
     */
    public function register_admin_pages() {
        add_object_page ( 'Page Title', 'WPZOOM', 'manage_options','wpzoom_options', array($this, 'admin'), 'none');

        add_submenu_page('wpzoom_options', 'WPZOOM', 'Theme Options', 'manage_options', 'wpzoom_options', array($this, 'admin'));

        if ( file_exists( get_template_directory() . '/functions/customizer' ) ) {
            $customize_url = add_query_arg( 'return', urlencode( wp_unslash( $_SERVER['REQUEST_URI'] ) ), 'customize.php' );
            add_submenu_page( 'wpzoom_options', 'Customize', 'Customize', 'customize', esc_url( $customize_url ) );
        }

        if (option::is_on('framework_update_enable')) {
            add_submenu_page('wpzoom_options', 'Update Framework', 'Update Framework', 'update_themes', 'wpzoom_update', array($this, 'update'));
        }

        if (option::is_on('framework_newthemes_enable') && !wpzoom::$tf) {
            add_submenu_page('wpzoom_options', 'New Themes', 'New Themes', 'manage_options', 'wpzoom_themes', array($this, 'themes'));
        }
    }

    public function seo_notification() {
        if (option::get('framework_seo_aware2')) return;   // don't show notification if it was hidden
        if (!current_user_can('install_plugins')) return;  // don't show notification if current user can't install plugins

        echo '<div class="zoomfw-seo update-nag">';
        echo '<p>';
        echo __('SEO Settings were removed from WPZOOM Framework as it was announced in the previous update.', 'wpzoom');
        echo '</p>';

        echo sprintf('<p>%s</p>', __('Recommended replacement plugin is <a href="http://wordpress.org/plugins/wordpress-seo/" target="_blank">Yoast SEO</a>.', 'wpzoom'));

        if (is_multisite()) {
            echo sprintf( '<p>%s</p>', __( 'If you\'re using our themes on a multisite install don\'t forget to notify your users about this change.', 'wpzoom' ) );
        }

        echo '<input type="button" class="close button" value="Hide" /></div>';
    }
}
