// Get selected BHK value
function getBHKValue() {
  var uiBHK = document.getElementsByName("uiBHK");
  for (var i = 0; i < uiBHK.length; i++) {
    if (uiBHK[i].checked) {
      return parseInt(uiBHK[i].value);
    }
  }
  return -1;
}

// Get selected bathroom value
function getBathValue() {
  var uiBathrooms = document.getElementsByName("uiBathrooms");
  for (var i = 0; i < uiBathrooms.length; i++) {
    if (uiBathrooms[i].checked) {
      return parseInt(uiBathrooms[i].value);
    }
  }
  return -1;
}

// Estimate price button click handler
function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");

  var sqft = document.getElementById("uiSqft").value;
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("uiLocations").value;
  var estPrice = document.getElementById("uiEstimatedPrice");
  var errorDiv = document.getElementById("errorMessage");
  var loadingDiv = document.getElementById("loading");

  // Reset previous messages
  estPrice.innerHTML = "";
  errorDiv.style.display = "none";
  
  // Validate inputs
  if (!sqft || sqft <= 0) {
    showError("Please enter a valid area value");
    return;
  }
  
  if (bhk === -1) {
    showError("Please select BHK value");
    return;
  }
  
  if (bathrooms === -1) {
    showError("Please select bathroom value");
    return;
  }
  
  if (!location) {
    showError("Please select a location");
    return;
  }

  // Show loading indicator
  loadingDiv.style.display = "block";
  
  // Make API request
  $.ajax({
    url: "http://127.0.0.1:5000/predict_home_price",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      total_sqft: parseFloat(sqft),
      bhk: bhk,
      bath: bathrooms,
      location: location
    }),
    success: function(data, status) {
      loadingDiv.style.display = "none";
      
      if (data.status === "success") {
        estPrice.innerHTML =
          "<h2>🏠 Estimated Price: <span class='success'>₹" +
          data.estimated_price +
          " Lakh</span></h2>" +
          "<p>For " + sqft + " sqft, " + bhk + " BHK, " + bathrooms + " bath in " + location + "</p>";
      } else {
        showError("Error: " + data.error);
      }
    },
    error: function(xhr, status, error) {
      loadingDiv.style.display = "none";
      console.error("API Error:", error);
      
      if (xhr.status === 0) {
        showError("Cannot connect to server. Make sure the Flask server is running on port 5000.");
      } else {
        showError("Error fetching price: " + error);
      }
    }
  });
}

// Show error message
function showError(message) {
  var errorDiv = document.getElementById("errorMessage");
  errorDiv.innerHTML = message;
  errorDiv.style.display = "block";
}

// Load locations on page load
function onPageLoad() {
  console.log("Document loaded");
  var url = "http://127.0.0.1:5000/get_location_names";
  
  $.ajax({
    url: url,
    type: "GET",
    success: function(data, status) {
      console.log("Got locations:", data);
      if (data && data.locations) {
        var uiLocations = document.getElementById("uiLocations");
        $('#uiLocations').empty();
        $('#uiLocations').append(new Option("Choose a Location", "", true, true));
        
        // Sort locations alphabetically
        var sortedLocations = data.locations.sort();
        
        for (var i = 0; i < sortedLocations.length; i++) {
          var opt = new Option(sortedLocations[i], sortedLocations[i]);
          $('#uiLocations').append(opt);
        }
      }
    },
    error: function(xhr, status, error) {
      console.error("Error loading locations:", error);
      showError("Failed to load locations. Make sure the server is running.");
      
      // Add some sample locations as fallback
      var uiLocations = document.getElementById("uiLocations");
      $('#uiLocations').empty();
      $('#uiLocations').append(new Option("Choose a Location", "", true, true));
      
      var sampleLocations = [
        "1st phase jp nagar", "2nd phase judicial layout", "btm layout", 
        "hsr layout", "whitefield", "indira nagar", "koramangala"
      ];
      
      for (var i = 0; i < sampleLocations.length; i++) {
        var opt = new Option(sampleLocations[i], sampleLocations[i]);
        $('#uiLocations').append(opt);
      }
    }
  });
}

window.onload = onPageLoad;