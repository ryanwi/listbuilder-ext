if (typeof jQuery === 'undefined') {
  console.error("no jquery");
} else {
  console.log("extension ready")
  $(document).ready( function () {
    console.log("jQuery ready");

    $("div.stream-container").on(
      "click", "li.stream-item", function(e) {
        e.preventDefault();
        // alert( $( this ).text() );
        $( this ).css( 'background-color', 'red' );
    }).on(
      "mouseout", "li.stream-item", function( e ) {
        // console.log( "item mouseover" );
        $( this ).css( 'background-color', 'red' );
    });

  });
}
