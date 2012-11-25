------------------------------------------------------------------------------
  chatblock module Readme
  http://drupal.org/project/chatblock

  Created by David Wees, http://drupal.org/user/53190

  D6 revisions/additions by David Herminghaus, http://drupal.org/user/833794
------------------------------------------------------------------------------

Contents:
=========
1. ABOUT
2. TECHNICAL
3. QUICK REFERENCE
4. CUSTOMIZING
5. ISSUES

1. ABOUT
========

This module provides an on site chat, located in a block. You can set separate
permissions for viewing and for joining chats .

Chatblock focuses on simplicity. It does not require additional resources like
IRC, Java or flash and although it is thoroughly built with Javascript, it even
works basically in no-script environments. While other modules provide much
more flexibility and manifold functions, chatblock aims to be easy to handle,
compact and save as much server CPU as possible.

Features:
* Easy to set up, simple to use.
* Ideal for any site that needs no more than *one* generic chat room.
* Can be easily placed in any block region on your site.
* Optionally, some basic smiley codes transform into graphical smileys 
  and links become clickable.
* Basic fallback functionality for users with Javascript disabled.
* Configurable chat logs (which can be cleaned up manually 
  and/or on cron runs).
* Separate access permissions for viewing and joining chats and chat logs.


2. TECHNICAL
============

A new block, called "On site chat", will be available on your block
administration page once you installed and activated the module.
The block provides a chat window displaying the recent chat messages and
a simple input form to add own messages. Both items require explicite
permissions (view, join).

The messages are both polled and posted with Javascript/AJAX by default.
Users without Javascript enabled will receive a gracefully degraded
functionality, but after all able to participate (this will be thoroughly
improved as soon as possible).

Performance may be improved by installing the JS callback handler, see
http://drupal.org/project/js_callback, and also by having APC available on your
web server (see http://pecl.php.net/package/APC for details). Chatblock
will integrate with both without needing additional configuration for itself.

The installation routine will attempt to copy a specialized callback handler
for polls to your Drupal root directory which, in most cases, will dramatically
speed up almost each single poll by bypassing most Drupal overhead.

3. QUICK REFERENCE
==================

* If you have recently used a version from before November 2011, consider
  deactivating AND uninstalling it completely. You may also directly extract
  the installation archive to your modules folder and then run your update.php
  but an exceptional clean reinstall is recommended.
* Activate the module at admin/build/modules.
* Configure user access at admin/user/permissions#chatblock.
* Note the new "On site chat" block in your block configuration at
  admin/build/block and place it into your favorite region.
  Configure the block settings for block visibility but note that, for security
  reasons, users will need both the permission to view the block AND the
  "view chats" permission!
  Also note: If you are using modules that enable auto-refresh for blocks
  (such aus block_refresh or blajax), DO NOT enable refreshing or even
  automatic refreshing for the chatblock as this will cause trouble and
  will also strongly affect your server load.
* Configure many more detailed chat settings at admin/settings/chatblock.
* Optionally enable the additional menu items in your default menu
  (chat log and help page).
* Find a conditionally assembled info page at chatblock/infos
* Find the complete chat history at chatblock/logs and options for manual
  deletion at chatblock/logs/cleanup
* Check the status report (admin/reports/status) to find out about potential
  chatblock performance improvements.

Introducing "smart poll"
------------------------
One of many measures to make chatblock as harmless as possible for your overall
server load is the option to constantly optimize the clients' poll intervals.

The big picture is to increase the intervals while there is no recent chat
activity and to set them back to the default value as soon as a new message
is posted. This is especially important if you configure chatblock to be
visible on any page in your site and, of course, the more visitors with
"view chats" permission you have.

The "smart poll" interval adjustment evaluates four information pieces:
val_1 = The minutes that have passed since the last message was typed.
val_2 = The value you have configured as "smart poll stepwidth" (minutes).
val_3 = The value you have configured as "default poll interval" (seconds).
val_4 = The value you have configured as "maximum poll interval" (minutes).
Given these values (and not having set val_2 or val_3 to "0"), the client will
recalculate the actual poll interval with the following (simplified) formula:

  actualInterval = min((val_1 / val_2) * val_3, val_4 * 60)

Translated to a phrase, you could say:

  "Increase the actual interval every val_2 minutes by val_3 until it reaches
  the limit defined by val_4, starting at the moment of val_1."

The actual calculation of course contains some more validation, but you should
have got it so far.

Some words on the impacts of every setting:

* DEFAULT POLL INTERVAL
  Simple: The lower the value, the more up-to-date every client at any time
  (and the higher the server load, of course). And vice-versa.
  RULE OF THUMB: 1-5 seconds on a dedicated chat page and with rather moderate
  users, 5-10 seconds for a very frequented block.
* SMART POLL STEPWIDTH
  Higher values mean slower adjustment and thus more server load. Lower values
  are better for your server but may cause delay before all clients are back
  after someone breaks the silence.
  RULE OF THUMB: Use a higher value (e.g. 4-10 minutes) on a dedicated chat
  page and lower values (e.g. 1-4 minutes) for blocks everyone can see
  everywhere.
* MAXIMUM POLL INTERVAL
  Again, simple: The higher your setting and the longer your chatters idle,
  the more wellness for your server. But also the longer until life turns
  back to the chat for everyone.
  RULE OF THUMB: None yet. You will have to find out yourself.

Final note: All this magic will not help once your cat becomes so
popular that a constant high number of chatters uses it with a constant
high frequency. Naturally.
   

4. CUSTOMIZING
==============

In order to keep chatblock as simple and lightweight as possible, all theming
functions have been removed. But of course you may still tweak the default
design by overriding/adding CSS definitions e.g. in your theme's CSS. Just
study the existing chatblock.css to learn about overridable items.

However you may also do some tweaks on the configuration page.

If you prefer your chat within its own "static" page, this is of course as
easy! Just create a page, eventually add some introducing lines and place
the chatblock in a content related region (this will most likely be "content"
in most themes.


5. ISSUES
=========

As chatblock is currently under heavy development, please check with the latest
commit logs at http://drupal.org/node/120150/commits for changes and with the
issue queue at http://drupal.org/project/issues/chatblock?categories=All to
track (or add) bugs, requests etc.