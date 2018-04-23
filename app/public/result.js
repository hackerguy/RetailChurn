$(document).ready(function() {
console.log("ready!");

$('#prediction').html("Prediction = " + "Churn")
$('#probability').html("Probability of Churn = " + "69.90" + "%");
chart(47.14)

	// on form submission ...
  	// $('form').on('submit', function() {
  	$('.onchange').on('change', function() {
     	// $('form').submit();
  		// console.log("the form has beeen submitted");

  	// grab values
  	GENDER = $('input[name="GENDER"]:checked').val();
	MARITAL = $('input[name="MARITAL"]:checked').val();
	MORTGAGE = $('input[name="MORTGAGE"]:checked').val();
	LOC = $('input[name="LOC"]:checked').val();
	TRANSACTION  = $('input[name="TRANSACTION"]').val();


	console.log(GENDER, MARITAL, MORTGAGE, LOC, TRANSACTION)


  	$.ajax({
  		type: "POST",
  		url: "/",
  		data : { 'GENDER': GENDER, 'MARITAL': MARITAL, 'MORTGAGE': MORTGAGE, 'LOC': LOC,
  			'TRANSACTION': TRANSACTION
			 },
		success: function(results) {
			console.log(results);
			console.log(results.object.output.predictions[0])
			if (results) {
				if (results.object.output.predictions[0] === 'T') {
    				prediction = "Churn";
    			} else {
    				prediction = "Not Churn";
    			}
    			probability = results.object.output.probabilities[0][0]
    			console.log(prediction);
    			console.log(probability);
    			$('#prediction').html("Prediction = " + prediction)
				$('#probability').html("Probability of Churning = " + (probability*100).toFixed(2) + "%");
				chart(probability)

			} else {
				console.log("Something went wrong with the prediction");
				$('.result').html('Something went wrong with the prediction.')

			}
		},

		error: function(error) {
			console.log(error)
		}

		});
	
	});

});