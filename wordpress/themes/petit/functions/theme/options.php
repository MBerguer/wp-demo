<?php return array(


/* Theme Admin Menu */
"menu" => array(
    array("id"    => "1",
          "name"  => "General"),
    
    array("id"    => "2",
          "name"  => "Homepage"),

    array("id"    => "5",
          "name"  => "Styling"),
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

    array("name"  => "Display Site Description next to Logo?",
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
  

 	array("type"  => "preheader",
          "name"  => "Global Posts Options"),
	
	array("name"  => "Content",
          "desc"  => "The number of posts displayed on homepage can be changed <a href=\"options-reading.php\" target=\"_blank\">here</a>.",
          "id"    => "display_content",
          "options" => array('Excerpt', 'Full Content'),
          "std"   => "Excerpt",
          "type"  => "select"),
     
    array("name"  => "Excerpt length",
          "desc"  => "Default: <strong>35</strong> (words)",
          "id"    => "excerpt_length",
          "std"   => "35",
          "type"  => "text"),

    array("type"  => "startsub",
          "name"  => "Thumbnail"),
          
        array("name"  => "Display thumbnail",
              "id"    => "index_thumb",
              "std"   => "on",
              "type"  => "checkbox"),
              
        array("name"  => "Thumbnail Width (in pixels)",
              "desc"  => "Default: <strong>180</strong> (pixels)",
              "id"    => "thumb_width",
              "std"   => "180",
              "type"  => "text"),
              
        array("name"  => "Thumbnail Height (in pixels)",
              "desc"  => "Default: <strong>155</strong> (pixels)",
              "id"    => "thumb_height",
              "std"   => "155",
              "type"  => "text"),

    array("type"  => "endsub"),

    array("name"  => "Display Meta",
          "id"    => "display_meta",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Display Read More Button",
          "id"    => "display_readmore",
          "std"   => "on",
          "type"  => "checkbox"),
           
          
	array("type"  => "preheader",
          "name"  => "Single Post Options"),

    array("type" => "startsub",
            "name" => "Featured Image at the Top"),
          
        array("name"  => "Display Featured Image at the Top in Recipe Posts",
              "id"    => "post_thumb",
              "std"   => "on",
              "type"  => "checkbox"), 

        array("name"  => "Display Featured Image at the Top in All Posts",
              "id"    => "regular_post_thumb",
              "std"   => "off",
              "type"  => "checkbox"), 
              
        array("name"  => "Limit Height of Featured Image?",
              "id"    => "post_thumb_limit",
              "std"   => "off",
              "type"  => "checkbox"), 
              
        array("name"  => "Featured Image Height (in pixels)",
              "desc"  => "Default: <strong>350</strong> (pixels). <br/>You'll have to run the <a href=\"http://wordpress.org/extend/plugins/regenerate-thumbnails/\">Regenerate Thumbnails</a> plugin each time you modify this size (<a href=\"http://www.wpzoom.com/tutorial/fixing-stretched-images/\">view how</a>).",
              "id"    => "post_thumb_height",
              "std"   => "350",
              "type"  => "text"),

    array("type"  => "endsub"), 

		array("type"  => "startsub",
          "name"  => "Display meta"),
      
     	array("name"  => "Date/Time",
              "desc"  => "<strong>Date/Time format</strong> can be changed <a href='options-general.php' target='_blank'>here</a>.",
              "id"    => "post_date",
              "std"   => "on",
              "type"  => "checkbox"),  
              
        array("name"  => "Author Name",
              "desc"  => "You can edit your profile on this <a href='profile.php' target='_blank'>page</a>.",
              "id"    => "post_author",
              "std"   => "on",
              "type"  => "checkbox"),

        array("name"  => "Category",
              "id"    => "post_category",
              "std"   => "on",
              "type"  => "checkbox"),
 

     array("type"  => "endsub"),

       array("name"  => "Display tags",
              "id"    => "post_tags",
              "std"   => "on",
              "type"  => "checkbox"),

		array("name"  => "Show Related Posts",
				  "desc"  => "Display 4 most recent posts in the same category as the active post.",
				  "id"    => "post_related",
				  "std"   => "on",
				  "type"  => "checkbox"),
          
	array("type"  => "preheader",
          "name"  => "Additional Post Details"),

	array("type"  => "startsub",
          "name"  => "Option #1"),

		array("name"  => "Label",
						"desc"  => "<em>Only completed labels on this section will be available on editing page.</em><br/>Default: <strong>Serves</strong>",
						"id"    => "additional_1_label",
						"std"   => "Serves",
						"type"  => "text"),

		array("name"  => "Icon",
						"id"    => "additional_1_icon",
						"std"   => get_template_directory_uri() . "/images/person.png",
						"type"  => "upload"),

	array("type"  => "endsub"),

	array("type"  => "startsub",
          "name"  => "Option #2"),

		array("name"  => "Label",
						"desc"  => "Default: <strong>Time</strong>",
						"id"    => "additional_2_label",
						"std"   => "Time",
						"type"  => "text"),

		array("name"  => "Icon",
						"id"    => "additional_2_icon",
						"std"   => get_template_directory_uri() . "/images/clock.png",
						"type"  => "upload"),

	array("type"  => "endsub"),

	array("type"  => "startsub",
          "name"  => "Option #3"),

		array("name"  => "Label",
						"desc"  => "Default: <strong>Difficulty</strong>",
						"id"    => "additional_3_label",
						"std"   => "Difficulty",
						"type"  => "text"),

		array("name"  => "Icon",
						"id"    => "additional_3_icon",
						"std"   => get_template_directory_uri() . "/images/difficulty.png",
						"type"  => "upload"),

	array("type"  => "endsub"),

	array("type"  => "startsub",
          "name"  => "Option #4"),

		array("name"  => "Label",
						"desc"  => "",
						"id"    => "additional_4_label",
						"std"   => "",
						"type"  => "text"),

		array("name"  => "Icon",
						"id"    => "additional_4_icon",
						"std"   => "",
						"type"  => "upload"),

	array("type"  => "endsub"),

	array("type"  => "startsub",
          "name"  => "Option #5"),

		array("name"  => "Label",
						"desc"  => "",
						"id"    => "additional_5_label",
						"std"   => "",
						"type"  => "text"),

		array("name"  => "Icon",
						"id"    => "additional_5_icon",
						"std"   => "",
						"type"  => "upload"),

	array("type"  => "endsub"),
),

"id2" => array(

    array("type"  => "preheader",
          "name"  => "Homepage Settings"),

    array("name"  => "Display Recent Posts on Homepage",
          "id"    => "recent_posts",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Title for Recent Posts",
          "desc"  => "Default: <em>Latest Posts</em>",
          "id"    => "recent_title",
          "std"   => "Latest Posts",
          "type"  => "text"),
 

    array("name"  => "What Should Be Displayed in Recent Posts?",
          "desc"  => "Choose which posts should be displayed in Recent Posts on the homepage.",
          "id"    => "recent_part_type",
          "options" => array('All Posts', 'Recipe Posts', 'Regular Posts'),
					"std"   => "Regular Posts",
          "type"  => "select"),

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

    array("name"  => "Hide Carousel Posts in Recent Posts?",
          "desc"  => "You can use this option if you want to hide posts which are featured in the carousel on front page.",
          "id"    => "hide_carousel",
          "std"   => "off",
          "type"  => "checkbox"),

    array("type"  => "preheader",
          "name"  => "Homepage Slider"),   
              
    array("name"  => "Display the slider on homepage?",
          "desc"  => "Do you want to show a featured slider on the homepage? Edit posts which you want to feature, and check the box from editing page: <strong>Feature in Homepage Slider</strong>",
          "id"    => "featured_posts_show",
          "std"   => "on",
          "type"  => "checkbox"),
    
    array("name"  => "Autoplay Slider?",
          "desc"  => "Do you want to auto-scroll the slides?",
    	  "id"    => "slideshow_auto",
          "std"   => "on",
          "type"  => "checkbox"),
            
    array("name"  => "Slider Autoplay Interval",
          "desc"  => "Select the interval (in miliseconds) at which the Slider should change posts (<strong>if autoplay is enabled</strong>). Default: 3000 (3 seconds).",
          "id"    => "slideshow_speed",
          "std"   => "3000",
          "type"  => "text"),
            
    array("name"  => "Slider Effect",
          "desc"  => "Select the effect for slides transition.",
          "id"    => "slideshow_effect",
          "options" => array('Fade', 'Slide'),
          "std"   => "Fade",
          "type"  => "select"),
            
    array("name"  => "Number of Posts in Slider",
          "desc"  => "How many posts should appear in \"Featured Slider\" on the homepage? Default: 8.",
          "id"    => "featured_posts_posts",
          "std"   => "8",
          "type"  => "text"),

    array("type"  => "preheader",
          "name"  => "Homepage Carousel"),

    array("name"  => "Display the carousel on homepage?",
          "desc"  => "Do you want to show a carousel on the homepage? Edit posts which you want to feature in the carousel, and check the box from editing page: <strong>Feature in Homepage Carousel</strong>",
          "id"    => "carousel_posts_show",
          "std"   => "on",
          "type"  => "checkbox"),

    array("name"  => "Number of Posts in Carousel",
          "desc"  => "How many posts should appear in \"Carousel\" on the homepage? Default: 9.",
          "id"    => "carousel_posts_posts",
          "std"   => "9",
          "type"  => "text"),
 
    array("type"  => "startsub",
          "name"  => "Display meta"),

 
         array("name"  => "Rating",
				"desc"  => 'The &ldquo;<em><a href="' . self_admin_url( 'plugin-install.php?tab=plugin-information&amp;plugin=polldaddy&amp;TB_iframe=true&amp;width=600&amp;height=550' ) . '" title="More information about Polldaddy Polls & Ratings" class="thickbox">Polldaddy Polls & Ratings</a></em>&rdquo; plugin must be installed and activated for this feature to work.',
              "id"    => "carousel_rating",
              "std"   => "on",
              "type"  => "checkbox"),
 
         array("name"  => "Read More Button",
              "id"    => "carousel_more_btn",
              "std"   => "on",
              "type"  => "checkbox"),
 

     array("type"  => "endsub"),

),


"id5" => array(
    array("type"  => "preheader",
          "name"  => "Colors"),

    array("type" => "startsub",
            "name" => "Global Styling"),
  
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

    array("type"  => "endsub"), 


    array("type" => "startsub",
            "name" => "Header"),

        array("name"  => "Logo Color",
           "id"   => "logo_color",
           "type" => "color",
           "selector" => "#logo h1 a",
           "attr" => "color"),

        array("name"  => "Menu Background Color",
           "id"   => "menu_color",
           "type" => "color",
           "selector" => "#menu",
           "attr" => "background"),

        array("name"  => "Menu Border Color",
           "id"   => "menu_border_color",
           "type" => "color",
           "selector" => "#menu",
           "attr" => "border-color"),
   
    array("type"  => "endsub"), 


    array("type" => "startsub",
            "name" => "Sidebar"),

        array("name"  => "Link Color",
           "id"   => "sidebar_a_css_color",
           "type" => "color",
           "selector" => "#sidebar a",
           "attr" => "color"),
           
        array("name"  => "Link Hover Color",
               "id"   => "sidebar_ahover_css_color",
               "type" => "color",
               "selector" => "#sidebar a:hover",
               "attr" => "color"),

        array("name"  => "Widget Title Color",
               "id"   => "widget_color",
               "type" => "color",
               "selector" => "#sidebar .widget h3.title, .tabbed-login-widget h3",
               "attr" => "color"),

    array("type"  => "endsub"), 
 
 
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
           "selector" => ".post h2.title a, .post h1.title a"),
 
     array("name"  => "Widget Title Style",
           "id"   => "typo_widget",
           "type" => "typography",
           "selector" => "#sidebar .widget h3.title"),

)

/* end return */);