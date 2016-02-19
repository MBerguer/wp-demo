<?php return array(


/* Theme Admin Menu */
"menu" => array(
    array("id"    => "1",
          "name"  => "General"),

    array("id"    => "2",
          "name"  => "Homepage"),

    array("id"    => "5",
          "name"  => "Styling"),

    array("id"    => "7",
      "name"  => "Banners"),
),

/* Theme Admin Options */
"id1" => array(
    array("type"  => "preheader",
          "name"  => "Theme Settings"),

	array("name"  => "Logo Image",
          "desc"  => "Upload a custom logo image for your site, or you can specify an image URL directly.",
          "id"    => "misc_logo_path",
          "std"   => "",
          "type"  => "upload"),

    array("name"  => "Display Site Tagline under Logo?",
          "desc"  => "Tagline can be changed in <a href='options-general.php' target='_blank'>General Settings</a>",
          "id"    => "logo_desc",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Favicon URL",
          "desc"  => "Upload a favicon image (16&times;16px).",
          "id"    => "misc_favicon",
          "std"   => "",
          "type"  => "upload"),

    array("name"  => "Custom Feed URL",
          "desc"  => "Example: <strong>http://feeds.feedburner.com/wpzoom</strong>",
          "id"    => "misc_feedburner",
          "std"   => "",
          "type"  => "text"),

	array("name"  => "Enable comments for static pages",
          "id"    => "comments_page",
          "std"   => "off",
          "type"  => "checkbox"),

    array("name"  => "Display WooCommerce Cart Button in the Header?",
          "id"    => "cart_icon",
          "std"   => "on",
          "type"  => "checkbox"),




   array("type"  => "preheader",
          "name"  => "Global Posts Options"),

    array("name"  => "Content",
          "desc"  => "Number of posts displayed on homepage can be changed <a href=\"options-reading.php\" target=\"_blank\">here</a>.",
          "id"    => "display_content",
          "options" => array('Excerpt', 'Full Content', 'None'),
          "std"   => "Excerpt",
          "type"  => "select"),

    array("name"  => "Excerpt length",
          "desc"  => "Default: <strong>50</strong> (words)",
          "id"    => "excerpt_length",
          "std"   => "50",
          "type"  => "text"),

    array("type" => "startsub",
            "name" => "Thumbnails"),

        array("name"  => "Display thumbnail",
              "id"    => "index_thumb",
              "std"   => "on",
              "type"  => "checkbox"),

        array("name"  => "Thumbnail Width (in pixels)",
              "desc"  => "Default: <strong>680</strong> (pixels).",
              "id"    => "thumb_width",
              "std"   => "680",
              "type"  => "text"),

        array("name"  => "Thumbnail Height (in pixels)",
              "id"    => "thumb_height",
              "desc"  => "Leave this field blank if you want to keep original image proportion.",
              "type"  => "text"),

    array("type"  => "endsub"),


    array("name"  => "Display Category",
          "id"    => "display_category",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Author",
          "id"    => "display_author",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Date/Time",
          "desc"  => "<strong>Date/Time format</strong> can be changed <a href='options-general.php' target='_blank'>here</a>.",
          "id"    => "display_date",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Comments Count",
          "id"    => "display_comments",
          "std"   => "on",
          "type"  => "checkbox"),


    array("type"  => "preheader",
          "name"  => "Single Post Options"),

    array("name"  => "Display Category",
          "id"    => "post_category",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Date/Time",
          "desc"  => "<strong>Date/Time format</strong> can be changed <a href='options-general.php' target='_blank'>here</a>.",
          "id"    => "post_date",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Author",
          "desc"  => "You can edit your profile on this <a href='profile.php' target='_blank'>page</a>.",
          "id"    => "post_author",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Author Bio",
          "desc"  => "Display a box with information about post author.",
          "id"    => "post_authorbio",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Tags",
          "id"    => "post_tags",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Sharing Buttons",
          "id"    => "post_share",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Comments",
          "id"    => "post_comments",
          "std"   => "on",
          "type"  => "checkbox"),

),

"id2" => array(

    array("type"  => "preheader",
          "name"  => "Featured Slideshow"),

    array("name"  => "Display the slideshow on homepage?",
          "desc"  => "Edit posts or pages which you want to feature, and check the option from Post Options box: <strong>Feature in Homepage Slider</strong>",
          "id"    => "featured_posts_show",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Content Source",
          "desc"  => "Select the type of content that should be displayed in the slider.",
          "options" => array('Posts', 'Pages'),
          "id"   => "featured_type",
          "std"   => "Posts",
          "type"  => "select"),

    array("name"  => "Autoplay Slider?",
          "desc"  => "Should the slider start rotating automatically?",
    	  "id"    => "slideshow_auto",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Autoplay Interval",
          "desc"  => "Select the interval (in miliseconds) at which the Slider should change posts (<strong>if autoplay is enabled</strong>). Default: 5000 (5 seconds).",
          "id"    => "slideshow_speed",
          "std"   => "5000",
          "type"  => "text"),

    array("name"  => "Number of Featured Posts/Pages",
          "desc"  => "How many posts should appear in \"Featured Slider\" on the homepage? Default: 5.",
          "id"    => "featured_number",
          "std"   => "5",
          "type"  => "text"),


    array("type"  => "preheader",
          "name"  => "Intro Message"),

    array("name"  => "Show Intro Message on Homepage?",
          "id"    => "homepage_intro",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Intro Title",
          "desc"  => "Add title to your welcome message.",
          "id"    => "homepage_intro_headline",
          "type"  => "text"),

    array("name"  => "Welcome Message",
          "desc"  => "Add your short intro message.",
          "id"    => "homepage_intro_msg",
          "type"  => "textarea"),


    array("type"  => "preheader",
          "name"  => "Featured Products"),

    array("name"  => "Display Featured Products on Homepage?",
          "desc"  => "<a href=\"http://wordpress.org/plugins/woocommerce/\">WooCommerce</a> plugin should be installed. <br />To mark a product as <strong>Featured</strong>, go to <a href='edit.php?post_type=product' target='_blank'>Products</a> page and click on the star (<a href=\"http://docs.woothemes.com/wp-content/uploads/2013/03/WC-Featured-Product-950x419.png\" target='_blank'>see how</a>).",
          "id"    => "featured_products_enable",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Section Title",
          "id"    => "featured_products_headline",
          "std"   => "Featured Products",
          "type"  => "text"),


    array("name"  => "Number of Featured Products",
          "id"    => "featured_products_number",
          "std"   => "4",
          "type"  => "text"),


    array("type"  => "preheader",
          "name"  => "Recent Posts"),

    array("name"  => "Display Recent Posts on Homepage",
          "id"    => "recent_posts",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Exclude categories",
          "desc"  => "Choose the categories which should be excluded from the main Loop on the homepage.<br/><em>Press CTRL or CMD key to select/deselect multiple categories </em>",
          "id"    => "recent_part_exclude",
          "std"   => "",
          "type"  => "select-category-multi"),

    array("name"  => "Hide Featured Posts in Recent Posts?",
          "desc"  => "You can use this option if you want to hide posts which are featured in the slider on front page.",
          "id"    => "hide_featured",
          "std"   => "off",
          "type"  => "checkbox"),

),


"id5" => array(
    array("type"  => "preheader",
          "name"  => "Colors"),

    array("name"  => "Logo Color",
           "id"   => "logo_color",
           "type" => "color",
           "selector" => "#logo h1 a",
           "attr" => "color"),

    array("name"  => "Menu Background",
           "id"   => "menu_color",
           "type" => "color",
	   "selector" => "#menu",
	   "attr" => "background"),

    array("name"  => "Link Color",
           "id"   => "a_css_color",
           "type" => "color",
           "selector" => "a",
           "attr" => "color"),

    array("name"  => "Link Hover Color",
           "id"   => "ahover_css_color",
           "type" => "color",
           "selector" => "a:hover",
           "attr" => "color"),

    array("name"  => "Widget Title Color",
           "id"   => "widget_color",
           "type" => "color",
           "selector" => "h3.title",
           "attr" => "color"),

    array("name"  => "Footer Background",
	   "id"   => "footerbg_color",
           "type" => "color",
	   "selector" => "#footer",
	   "attr" => "background"),


    array("type"  => "preheader",
          "name"  => "Fonts"),

    array("name" => "General Text Font Style",
          "id" => "typo_body",
          "type" => "typography",
          "selector" => "body" ),

    array("name" => "Logo Text Style",
          "id" => "typo_logo",
          "type" => "typography",
          "selector" => "#logo h1 a" ),

    array("name"  => "Post Title Style",
           "id"   => "typo_post_title",
           "type" => "typography",
           "selector" => ".recent-post h2.post-title a, h1.entry-title a, .home_widgets .widget h3.title a, .wpzoom-featured-category h3.post-title a"),

     array("name"  => "Widget Title Style",
           "id"   => "typo_widget",
           "type" => "typography",
           "selector" => ".widget h3.title "),

),


"id7" => array(
  array("type"  => "preheader",
      "name"  => "Header Ad"),

  array("name"  => "Enable ad space in the header?",
      "id"    => "ad_head_select",
      "std"   => "off",
      "type"  => "checkbox"),

  array("name"  => "HTML Code (Adsense)",
      "desc"  => "Enter complete HTML code for your banner (or Adsense code) or upload an image below.",
      "id"    => "ad_head_code",
      "std"   => "",
      "type"  => "textarea"),

  array("name"  => "Upload your image",
      "desc"  => "Upload a banner image or enter the URL of an existing image.<br/>Recommended size: <strong>468 × 60px</strong>",
      "id"    => "banner_top",
      "std"   => "",
      "type"  => "upload"),

  array("name"  => "Destination URL",
      "desc"  => "Enter the URL where this banner ad points to.",
      "id"    => "banner_top_url",
      "type"  => "text"),

  array("name"  => "Banner Title",
      "desc"  => "Enter the title for this banner which will be used for ALT tag.",
      "id"    => "banner_top_alt",
      "type"  => "text"),


  array("type"  => "preheader",
      "name"  => "Sidebar Ad"),

  array("name"  => "Enable ad space in sidebar?",
      "id"    => "banner_sidebar_enable",
      "std"   => "off",
      "type"  => "checkbox"),

  array("name"  => "Ad Position",
      "desc"  => "Do you want to place the banner before the widgets or after the widgets?",
      "id"    => "banner_sidebar_position",
      "options" => array('Before widgets', 'After widgets'),
      "std"   => "Before widgets",
      "type"  => "select"),

  array("name"  => "HTML Code (Adsense)",
      "desc"  => "Enter complete HTML code for your banner (or Adsense code) or upload an image below.",
      "id"    => "banner_sidebar_html",
      "std"   => "",
      "type"  => "textarea"),

  array("name"  => "Upload your image",
      "desc"  => "Upload a banner image or enter the URL of an existing image.<br/>Recommended size: <strong>230 × 125px</strong>",
      "id"    => "banner_sidebar",
      "std"   => "",
      "type"  => "upload"),

  array("name"  => "Destination URL",
      "desc"  => "Enter the URL where this banner ad points to.",
      "id"    => "banner_sidebar_url",
      "type"  => "text"),

  array("name"  => "Banner Title",
      "desc"  => "Enter the title for this banner which will be used for ALT tag.",
      "id"    => "banner_sidebar_alt",
      "type"  => "text"),

)

/* end return */);