(function(){	
	$(document).on('ready', function(){	
		$("#digit1").colorPicker({pickerDefault: "transparent", colors: ["000000", "993300", "FF0000", "FF6600", "FFFF00", "00FF00", "0000FF", "FF00FF", "999999", "FFFFFF"], transparency: true, showHexField: false});
		$("#digit2").colorPicker({pickerDefault: "transparent", colors: ["000000", "993300", "FF0000", "FF6600", "FFFF00", "00FF00", "0000FF", "FF00FF", "999999", "FFFFFF"], transparency: true, showHexField: false});
		$("#digit3").colorPicker({pickerDefault: "transparent", colors: ["000000", "993300", "FF0000", "FF6600", "FFFF00", "00FF00", "0000FF", "FF00FF", "999999", "FFFFFF"], transparency: true, showHexField: false});
		$("#multiplier").colorPicker({pickerDefault: "transparent", colors: ["C0C0C0", "FFD700", "000000", "993300", "FF0000", "FF6600", "FFFF00", "00FF00", "0000FF", "FF00FF"], transparency: true, showHexField: false});
		$("#tolerance").colorPicker({pickerDefault: "transparent", colors: ["C0C0C0", "FFD700", "993300", "FF0000", "00FF00", "0000FF", "FF00FF"], transparency: true, showHexField: false});
		$("#temperature-coeficient").colorPicker({pickerDefault: "transparent", colors: ["993300", "FF0000", "FF6600", "FFFF00", "transparent"], transparency: true, showHexField: false});
		
		$('input:radio[id=four-bands]').attr('checked', true);
		$('#band-three').hide();
		$('#temperature-band').hide();
		
		var fourBands = true;
		var digitsSelected = false;
		var multiplierSelected = false;
		var toleranceSelected = false;
		
		$('input:radio[name=bands]').on('change', function(){
			var bands =$('input:radio[name=bands]:checked').val();
			
			switch(bands){
				case "4":
					fourBands = true;
					validate();
					$('#band-three').hide();
					$('#temperature-band').hide();
					break;
				case "5":
					fourBands = false;
					validate();
					$('#band-three').show();
					$('#temperature-band').hide();
					break;
				case "6":
					fourBands = false;
					validate();
					$('#band-three').show();
					$('#temperature-band').show();
			}
		});	
		
		setDigit = function(){
			return function(){
				var color = $(this).val();
				$(this).parent().parent().css({"background": color});
				switch(color){
					case "#000000":
						$(this).data('digit', '0');
						break;
					case "#993300":
						$(this).data('digit', '1');
						break;
					case "#ff0000":
						$(this).data('digit', '2');
						break;
					case "#ff6600":
						$(this).data('digit', '3');
						break;
					case "#ffff00":
						$(this).data('digit', '4');
						break;
					case "#00ff00":
						$(this).data('digit', '5');
						break;
					case "#0000ff":
						$(this).data('digit', '6');
					break;
					case "#ff00ff":
						$(this).data('digit', '7');
						break;
					case "#999999":
						$(this).data('digit', '8');
						break;
					case "#ffffff":
						$(this).data('digit', '9');
				}
				validate();
			}
		
		};
		
		setMultiplier = function(){
			return function(){
				var color = $(this).val();
				$(this).parent().parent().css({'background':color});
				switch(color){
					case "#c0c0c0":
						$(this).data('multiplier', '0.01');
						break;
					case "#ffd700":
						$(this).data('multiplier', '0.1');
						break;
					case "#000000":
						$(this).data('multiplier', '1');
						break;
					case "#993300":
						$(this).data('multiplier', '10');
						break;
					case "#ff0000":
						$(this).data('multiplier', '100');
						break;
					case "#ff6600":
						$(this).data('multiplier', '1000');
						break;
					case "#ffff00":
						$(this).data('multiplier', '10000');
						break;
					case "#00ff00":
						$(this).data('multiplier', '100000');
						break;
					case "#0000ff":
						$(this).data('multiplier', '1000000');
						break;
					case "#ff00ff":
						$(this).data('multiplier', '10000000');
				}
				multiplierSelected = true;
				validate();
			}
		};
		
		setTolerance = function(){
			return function(){
				var color = $(this).val();
				$(this).parent().parent().css({'background':color});
				switch(color){
					case "#c0c0c0":
						$(this).data('tolerance', '10%');
						break;
					case "#ffd700":
						$(this).data('tolerance', '5%');
						break;
					case "#993300":
						$(this).data('tolerance', '1%');
						break;
					case "#ff0000":
						$(this).data('tolerance', '2%');
						break;
					case "#00ff00":
						$(this).data('tolerance', '0.5%');
						break;
					case "#0000ff":
						$(this).data('tolerance', '0.25%');
						break;
					case "#ff00ff":
						$(this).data('tolerance', '0.01%');
				}
				toleranceSelected = true;
				validate();
			}
		};
		
		setTemperatureCoeficient = function(){
			return function(){
				var color = $(this).val();
				$(this).parent().parent().css({'background':color});
				switch(color){
					case "#993300":
						$(this).data('temperature-coeficient', '100ppm');
						break;
					case "#ff0000":
						$(this).data('temperature-coeficient', '50ppm');
						break;
					case "#ff6600":
						$(this).data('temperature-coeficient', '15ppm');
						break;
					case "#ffff00":
						$(this).data('temperature-coeficient', '25ppm');
						break;
					case "transparent":
						$(this).removeData('temperature-coeficient');
						$(this).addData('temperature-coeficient');
				}
			}
		};
		
		//Fue definida como una función declarada y no como una función expresada (closure) para que javascript la evalue antes de cualquier expresión
		function validate(){
			var digitOne = $('#digit1').data('digit');
			var digitTwo = $('#digit2').data('digit');
			var digitThree = $('#digit3').data('digit');
			
			if(fourBands){
				if(digitOne!= undefined && digitTwo!= undefined){
					digitsSelected = true;
					console.log("Two digits selected");
				}else{
					digitsSelected = false;
				}
			}else{
				if(digitOne!= undefined && digitTwo!= undefined && digitThree!= undefined){
					digitsSelected = true;
					console.log("Three digits selected");
				}else{
					digitsSelected = false;
				}
			}
			
			if(digitsSelected && multiplierSelected && toleranceSelected){
				console.log("validation true");
				$('#btn-calculate').attr('disabled', false);
			}else{
				$('#btn-calculate').attr('disabled', true);
			}
		}
		
		$("#digit1").change(setDigit());
		$("#digit2").change(setDigit());
		$("#digit3").change(setDigit());
		$("#multiplier").change(setMultiplier());
		$("#tolerance").change(setTolerance());
		$("#temperature-coeficient").change(setTemperatureCoeficient());
		
		$('#btn-calculate').on('click', function(){
			var digits = "";
			//condición para que firefox OS no tome el valor a parsear como hexadecimal
			if($('#digit1').data('digit') != '0'){
				digits = (fourBands) ? $('#digit1').data('digit')+$('#digit2').data('digit') : $('#digit1').data('digit')+$('#digit2').data('digit')+$('#digit3').data('digit');
			}else{
				digits = (fourBands) ? $('#digit2').data('digit') : $('#digit2').data('digit')+$('#digit3').data('digit');
			}
			var ohms = parseInt(digits);
			var result = ohms*parseFloat($('#multiplier').data('multiplier'));
			
			if($("#temperature-coeficient").data('temperature-coeficient')!= undefined){
				alert(result+" &#8486 "+"\n &#177 "+$("#tolerance").data('tolerance')+"\n "+$("#temperature-coeficient").data('temperature-coeficient'));
			}else{
				alert(result+" &#8486 "+"\n &#177 "+$("#tolerance").data('tolerance'));
			}
		});
	});
})();