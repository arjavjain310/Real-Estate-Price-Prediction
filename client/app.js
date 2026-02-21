var API_BASE = "http://127.0.0.1:5001";
var RECENT_KEY = "pricePredictRecent";
var RECENT_MAX = 8;

// ----- Recent estimates (sessionStorage) -----
function getRecent() {
  try {
    var raw = sessionStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}
function addRecent(entry) {
  var list = getRecent();
  list.unshift(entry);
  list = list.slice(0, RECENT_MAX);
  try {
    sessionStorage.setItem(RECENT_KEY, JSON.stringify(list));
  } catch (e) {}
  renderRecent();
}
function renderRecent() {
  var list = getRecent();
  var container = document.getElementById("recentList");
  var empty = document.getElementById("recentEmpty");
  if (!container) return;

  if (list.length === 0) {
    if (empty) empty.style.display = "block";
    container.querySelectorAll(".recent-item").forEach(function (el) { el.remove(); });
    return;
  }
  if (empty) empty.style.display = "none";
  container.querySelectorAll(".recent-item").forEach(function (el) { el.remove(); });
  list.forEach(function (entry) {
    var li = document.createElement("li");
    li.className = "recent-item";
    li.innerHTML =
      "<span class=\"recent-item-info\">" +
      escapeHtml(entry.sqft) + " sqft, " + entry.bhk + " BHK · " + escapeHtml(entry.location) +
      "</span><span class=\"recent-item-price\">₹ " + entry.price + " Lakh</span>";
    container.appendChild(li);
  });
}
function escapeHtml(s) {
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// ----- Result panel -----
function showResult(price, sqft, bhk, bath, location) {
  var placeholder = document.getElementById("resultPlaceholder");
  var content = document.getElementById("resultContent");
  var priceEl = document.getElementById("resultPrice");
  var detailsEl = document.getElementById("resultDetails");
  if (placeholder) placeholder.style.display = "none";
  if (content) {
    content.hidden = false;
    content.style.display = "block";
  }
  if (priceEl) priceEl.textContent = "₹ " + price + " Lakh";
  if (detailsEl) {
    detailsEl.textContent = sqft + " sq ft · " + bhk + " BHK · " + bath + " bath · " + location;
  }
}
function showResultPlaceholder() {
  var placeholder = document.getElementById("resultPlaceholder");
  var content = document.getElementById("resultContent");
  if (placeholder) placeholder.style.display = "block";
  if (content) {
    content.hidden = true;
    content.style.display = "none";
  }
}
function showError(message) {
  var el = document.getElementById("errorMessage");
  if (el) {
    el.textContent = message;
    el.style.display = "block";
  }
}
function hideError() {
  var el = document.getElementById("errorMessage");
  if (el) {
    el.textContent = "";
    el.style.display = "none";
  }
}

// ----- BHK / Bath -----
function getBHKValue() {
  var radios = document.getElementsByName("uiBHK");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) return parseInt(radios[i].value, 10);
  }
  return -1;
}
function getBathValue() {
  var radios = document.getElementsByName("uiBathrooms");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) return parseInt(radios[i].value, 10);
  }
  return -1;
}

// ----- Estimate price -----
function onClickedEstimatePrice() {
  var sqft = document.getElementById("uiSqft").value;
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("uiLocations").value;
  var loadingDiv = document.getElementById("loading");
  var btn = document.getElementById("btnEstimate");

  hideError();
  showResultPlaceholder();

  var sqftNum = parseFloat(sqft);
  if (sqft === "" || isNaN(sqftNum) || sqftNum < 1) {
    showError("Please enter a valid area (sq ft) — any positive number.");
    return;
  }
  if (bhk === -1) {
    showError("Please select BHK.");
    return;
  }
  if (bathrooms === -1) {
    showError("Please select bathrooms.");
    return;
  }
  if (!location) {
    showError("Please select a location.");
    return;
  }

  if (loadingDiv) {
    loadingDiv.setAttribute("aria-hidden", "false");
    loadingDiv.style.display = "flex";
  }
  if (btn) btn.disabled = true;

  $.ajax({
    url: API_BASE + "/predict_home_price",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify({
      total_sqft: parseFloat(sqft),
      bhk: bhk,
      bath: bathrooms,
      location: location
    }),
    success: function (data) {
      if (loadingDiv) {
        loadingDiv.setAttribute("aria-hidden", "true");
        loadingDiv.style.display = "none";
      }
      if (btn) btn.disabled = false;

      if (data.status === "success") {
        showResult(data.estimated_price, sqft, data.input.bhk, data.input.bath, data.input.location);
        addRecent({
          sqft: sqft,
          bhk: data.input.bhk,
          bath: data.input.bath,
          location: data.input.location,
          price: data.estimated_price
        });
      } else {
        showError(data.error || "Something went wrong.");
      }
    },
    error: function (xhr, status, error) {
      if (loadingDiv) {
        loadingDiv.setAttribute("aria-hidden", "true");
        loadingDiv.style.display = "none";
      }
      if (btn) btn.disabled = false;
      if (xhr.status === 0) {
        showError("Cannot connect to server. Make sure the app is running on port 5001.");
      } else {
        showError("Request failed: " + (error || xhr.statusText));
      }
    }
  });
}

// ----- Load locations -----
function onPageLoad() {
  renderRecent();

  $.ajax({
    url: API_BASE + "/get_location_names",
    type: "GET",
    success: function (data) {
      if (data && data.locations && data.locations.length) {
        var select = document.getElementById("uiLocations");
        var countNum = document.getElementById("locationCountNum");
        if (countNum) countNum.textContent = data.locations.length;
        if (select) {
          $("#uiLocations").empty().append(new Option("Select area", "", true, true));
          data.locations.sort();
          data.locations.forEach(function (loc) {
            $("#uiLocations").append(new Option(loc, loc));
          });
        }
        var statLoc = document.getElementById("statLocations");
        if (statLoc) statLoc.textContent = data.locations.length + "+";
      }
    },
    error: function () {
      var select = document.getElementById("uiLocations");
      if (select) {
        $("#uiLocations").empty().append(new Option("Select area", "", true, true));
        ["1st phase jp nagar", "2nd phase judicial layout", "btm layout", "hsr layout", "whitefield", "indira nagar", "koramangala"].forEach(function (loc) {
          $("#uiLocations").append(new Option(loc, loc));
        });
      }
      showError("Locations loaded from fallback. Is the server running on port 5001?");
    }
  });
}

window.onload = onPageLoad;
