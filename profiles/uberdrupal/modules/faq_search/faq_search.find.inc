<?php
// $Id: faq_search.find.inc,v 1.1.2.1 2009/09/08 18:11:50 johnpv Exp $
/**
  * @file
  * Performs the database query based on the supplied keywords.
  */

function faq_search_find() {

  $term = strip_tags(drupal_substr($_POST['keyword'], 0, 100));
  $query = "SELECT question,nid
  FROM {faq_questions}
  WHERE question LIKE '%%%s%%'
  ORDER BY question asc";
  $result = db_query($query, $term);
  $string = "";
  
  while ($row = db_fetch_object($result)) {
    $string .= "<a href='/". drupal_get_path_alias('node/'. $row->nid)."'>". $row->question ."</a>";
  }

  if ( empty($string) ) {
    $string = t("<p class='message'>No matches!</p>");
  }

  echo $string;
  exit;

}