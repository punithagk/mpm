About
=====
This module will add product attributes as 'attribute' and 'uc_cart_item'
tokens, for use elsewhere. The difference between these two categories of
tokens is that 'attribute' tokens apply to Product node type objects
retrieved from a stored order, while 'uc_cart_item' tokens apply to
temporary objects used by Ubercart to store items in a cart.  The two
objects are different enough that it uncomfortable to translate between
the two. Thus its solely a matter of convenience that these two token
categories are defined.  The casual user does not need to make a distinction;
any module which uses attribute tokens will choose the correct category.

In particular, the 'uc_cart_item' tokens are used by the Custom Price
Calculation contributed module (http://drupal.org/project/uc_custom_price).

The combination of this and the Custom Price Calculation module allows
an administrator to calculate price based on attributes, using custom
PHP code.

One use could be setting up an attribute with no options on a product called
donation which would in turn generate a token called [donation] and would add
a text box for a customer to enter a donation amount to add to the product
price. This could then be used by the Custom Price module with the following
code inserted...

  $item->price += [donation];

You'd want to do validation (e.g. check_plain()) and formatting here as
well since [donation] is going to be any text that a user could enter and
this expects a 2 decimal place number with no leading dollar sign.

Another use might be for implementing complex logic beyond just +1.00 or -2.00
for attribute price adjustments. Within the custom code block you can
reference all of the attribute values and make adjustments based on the exact
combo of attributes selected. For instance, if you only want to charge $1.00
extra for a (large, black) t-shirt but a (large, red) and a (medium, black)
will sell for regular price you can set all of the product attributes to 0
price adjustment and then add the following custom code...

  if('[size]' == 'large' && '[color]' == 'black') {
    $item->price += 1;
  }

*I believe this could cause problems if you happen to name your attributes the
same as existing tokens generated elsewhere. Perhaps tokens generated here
should be prefixed attr_


Installation
============
Check requirements:  PHP 5.x, Drupal 6.x, Ubercart 2.x.

This module depends on the Token module (http://drupal.org/project/token).

Copy uc_attribute_tokens.tar.gz into your sites/all/modules directory
and unzip/untar it.

In your web browser, navigate to admin/build/modules and enable the
following module: Attribute Tokens

No configuration is required or possible.  Attribute tokens will
be available only where they are specifically requested.  At the
moment, the only modules to support attribute tokens are uc_custom_price
and uc_watermark.
