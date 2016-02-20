<?php return array(


/* Framework Admin Menu */
"menu" => array(

    array("id"    => "4",
          "name"  => "Miscellaneous"),

    // 5 is reserved for styling

    "framework" =>array(
        "name"  => "Framework"),

    // 7 is reserved for banners

    "import-export" => array(
        "name"  => "Import/Export")
),

/* Framework Admin Options */

"id4" => array(
    array("type"  => "preheader",
          "name"  => "Custom Code"),

    array("name"  => "Header Code",
          "desc"  => "Here you can add scripts that will be added before the end of <code>&lt;head&gt;</code> tag.",
          "id"    => "header_code",
          "std"   => "",
          "type"  => "textarea"),

    array("name"  => "Footer Code & Analytics",
          "desc"  => "If you want to add some tracking script to the footer, like Google Analytics, insert the complete tracking code here. The following code will be added to the footer before the closing <code>&lt;/body&gt;</code> tag.",
          "id"    => "footer_code",
          "std"   => "",
          "type"  => "textarea"),
),


"framework" => array(
    array("type"  => "preheader",
          "name"  => "Framework Options"),

    array("name"  => "Framework Generator Meta Tags",
          "desc"  => "Includes information about theme and framework you use in meta tags along to WordPress ones, they are used just for information and doesn't impact your SEO.",
          "id"    => "meta_generator",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Typography Preview",
          "desc"  => "Preview fonts in typography option dropdown. Disable this if this page takes long to load or you never need that.",
          "id"    => "framework_fonts_preview",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Framework Updater",
          "desc"  => "This enables update features for WPZOOM framework such as menu in wp-admin and also global notifications about new updates.",
          "id"    => "framework_update_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Framework Updater Notification",
          "desc"  => "Enables or disables global wp-admin notification about new versions of framework. If previous option is disabled this one is irrelevant.",
          "id"    => "framework_update_notification_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Themes Updater Notification",
          "desc"  => "Enables or disables global wp-admin notification about new versions of theme.",
          "id"    => "framework_theme_update_notification_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "New Themes Page",
          "desc"  => "Enables or disables page with all WPZOOM themes and displays a link to it under WPZOOM menu.",
          "id"    => "framework_newthemes_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Enable WPZOOM Shortcodes",
          "desc"  => "This enables the output of shortcodes.css in the HEAD section of your site.",
          "id"    => "framework_shortcodes_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Enable WPZOOM Slideshow Shortcode",
          "desc"  => "This enables the output of slideshow libraries in the footer section of your site.",
          "id"    => "framework_wzslider_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("type"  => "preheader",
          "name"  => "Debug"),

    array("name"  => "Debug info",
          "desc"  => "You can include this information in your support tickets on WPZOOM Support Desk.",
          "id"    => "misc_debug",
          "std"   => "",
          "type"  => "textarea"),
),

"import-export" => array(
    array("type"  => "preheader",
          "name"  => "Theme Options"),

    array("name"  => "Import Options",
          "desc"  => "To import the options from another installation of this theme paste your code here.",
          "id"    => "misc_import",
          "std"   => "",
          "type"  => "textarea"),

    array("name"  => "Export Options",
          "desc"  => "Export the options to another installation of this theme, or to keep a backup of your options. You can can also save your options in a new text document.",
          "id"    => "misc_export",
          "std"   => "",
          "type"  => "textarea"),

    array("type"  => "preheader",
          "name"  => "Widgets"),


    array("name"  => "Load default widget settings",
          "desc"  => "Click on this button to load the default widget settings (as in theme demo).</br><em><strong>NOTE:</strong> Click on <strong>Save all changes</strong> button to save other modifications before loading default widgets.</em>",
          "id"    => "misc_load_default_widgets",
          "type"  => "button"),

    array("name"  => "Import Widgets",
          "desc"  => "To import widgets from another installation of this theme insert your exported code here. ",
          "id"    => "misc_import_widgets",
          "std"   => "",
          "type"  => "textarea"),

    array("name"  => "Export Widgets",
          "desc"  => "Export widgets to another installation of this theme.",
          "id"    => "misc_export_widgets",
          "std"   => "",
          "type"  => "textarea")
)

/* end return */
);
