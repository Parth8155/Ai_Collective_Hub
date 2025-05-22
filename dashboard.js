// Initialize the Dashboard
const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user) {
  alert("Please log in first!");
  window.location.href = "Login.html";
}

initializeTheme();
loadReviewsFromStorage();

window.onload = function () {
  var sidebar = document.getElementById("sidebar");
  var sidebarOverlay = document.getElementById("sidebarOverlay");
  var toggleSidebarButton = document.getElementById("toggleSidebar");
  var closeSidebarButton = document.getElementsByClassName("close-sidebar")[0];

  function toggleSidebar() {
    if (window.innerWidth < 768) {
      sidebar.classList.toggle("show");
      sidebarOverlay.classList.toggle("active");
    }
  }
  if (toggleSidebarButton) {
    toggleSidebarButton.onclick = toggleSidebar;
  }
  if (closeSidebarButton) {
    closeSidebarButton.onclick = toggleSidebar;
  }
  if (sidebarOverlay) {
    sidebarOverlay.onclick = toggleSidebar;
  }
};

function initializeTheme() {
  var savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon(savedTheme);
}

function toggleTheme() {
  var currentTheme = document.documentElement.getAttribute("data-theme");
  var newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  // Get the first element with class "theme-toggle"
  var themeToggleElements = document.getElementsByClassName("theme-toggle");
  if (themeToggleElements.length > 0 && themeToggleElements[0].firstElementChild) {
    var themeIcon = themeToggleElements[0].firstElementChild;
    themeIcon.className = theme === "light" ? "bi bi-moon-fill" : "bi bi-sun-fill";
  }
}

// Global variable to store the current pricing filter (empty means no filter applied)
let appliedPricingFilters = [];
let appliedRatingThreshold = 0;

// Pagination and Data Management
const itemsPerPage = 12;
let currentPage = 1;

let categories;
let aiToolsData;
let filteredTools = [];

// Fetch Categories
fetch("file/categories.json")
  .then((response) => response.json())
  .then((data) => {
    categories = Array.isArray(data) ? data : [data];
    initializeCategories();
  })
  .catch((error) => {
    console.error("Error loading categories:", error);
  });

// fetch("file/fdata.json")
//   .then((response) => response.json())
//   .then((data) => {
//     window.fdata = data; // Store fdata globally for later use
//     // Access the tools array using the key "Image Generation"
//     const toolsArray = data["Text & Writing"];
//     aiToolsData = Array.isArray(toolsArray) ? toolsArray : [toolsArray];
//     filteredTools = aiToolsData;
//     initializeTools(currentPage, filteredTools);
//   })
//   .catch((error) => {
//     console.error("Error loading fdata:", error);
//   });

fetch("file/fdata.json")
  .then((response) => response.json())
  .then((data) => {
    window.fdata = data; // Store fdata globally for later use
    // Access the tools array using the key "Text & Writing"
    const toolsArray = data["Text & Writing"];
    aiToolsData = Array.isArray(toolsArray) ? toolsArray : [toolsArray];
    
    // Merge submitted tools from localStorage
    var savedTools = JSON.parse(localStorage.getItem("submittedTools")) || [];
    aiToolsData = aiToolsData.concat(savedTools);
    
    filteredTools = aiToolsData;
    initializeTools(currentPage, filteredTools);
  })
  .catch((error) => {
    console.error("Error loading fdata:", error);
  });

  
// Initialize Categories
function initializeCategories() {
  var categoryList = document.getElementById("categoryList");

  // Loop through each category using a standard for loop
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    var categoryElement = document.createElement("div");
    categoryElement.className = "category-group";

    // Create main category element
    var mainCategory = document.createElement("div");
    mainCategory.className = "category-item " + (i === 0 ? "active" : "");
    mainCategory.innerHTML =
      '<div class="category-header">' +
        '<div class="category-title">' +
          '<i class="bi ' + category.icon + ' category-icon"></i>' +
          '<span>' + category.title + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="category-actions">' +
        (category.subcategories ? '<i class="bi bi-chevron-down category-expand"></i>' : "") +
      '</div>';

    // Handle main category click using onclick without forEach or querySelector
    mainCategory.onclick = (function(cat, mainCat) {
      return function(e) {
        // Check if the clicked element's class name does NOT contain "category-expand"
        if (e.target.className.indexOf("category-expand") === -1) {
          // Remove "active" from all elements with class "category-item"
          var categoryItems = document.getElementsByClassName("category-item");
          for (var j = 0; j < categoryItems.length; j++) {
            categoryItems[j].classList.remove("active");
          }
          mainCat.classList.add("active");
          onCategoryClick(cat.title);
        }
      };
    })(category, mainCategory);

    categoryElement.appendChild(mainCategory);

    // Add subcategories if they exist
    if (category.subcategories) {
      var subcategoriesContainer = document.createElement("div");
      subcategoriesContainer.className = "subcategories-container";

      // Loop through subcategories using a standard for loop
      for (var j = 0; j < category.subcategories.length; j++) {
        var subcategory = category.subcategories[j];
        var subcategoryElement = document.createElement("div");
        subcategoryElement.className = "subcategory";

        subcategoryElement.innerHTML =
          '<div class="subcategory-header">' +
            '<span class="subcategory-title ">' + subcategory.title + '</span>' +
          '</div>';

        // Handle subcategory click using onclick
        subcategoryElement.onclick = (function(cat, subcat, subcatElem) {
          return function() {
            // Remove "active" class from all subcategories
            var subcategoryItems = document.getElementsByClassName("subcategory");
            for (var k = 0; k < subcategoryItems.length; k++) {
              subcategoryItems[k].classList.remove("active");
            }
            subcatElem.classList.add("active");
            onSubcategoryClick(cat.title, subcat.title);
          };
        })(category, subcategory, subcategoryElement);

        subcategoriesContainer.appendChild(subcategoryElement);
      }

      categoryElement.appendChild(subcategoriesContainer);

      // Toggle subcategories visibility using onclick
      var expandButtons = mainCategory.getElementsByClassName("category-expand");
      if (expandButtons.length > 0) {
        var expandButton = expandButtons[0];
        expandButton.onclick = (function(catElem, expButton) {
          return function(e) {
            e.stopPropagation();
            catElem.classList.toggle("expanded");
            // Toggle the icon classes manually
            if (expButton.classList.contains("bi-chevron-down")) {
              expButton.classList.remove("bi-chevron-down");
              expButton.classList.add("bi-chevron-up");
            } else {
              expButton.classList.remove("bi-chevron-up");
              expButton.classList.add("bi-chevron-down");
            }
          };
        })(categoryElement, expandButton);
      }
    }

    categoryList.appendChild(categoryElement);
  }
}

function initializeTools(page, tools) {

 // If any pricing filters are applied, filter the tools accordingly
  if (appliedPricingFilters.length > 0) {
    tools = tools.filter(tool =>
      appliedPricingFilters.includes(tool.pricing.toLowerCase())
    );
  }
  if (appliedRatingThreshold > 0) {
    tools = tools.filter(tool =>
      Number(ToolRating(tool.name)) >= appliedRatingThreshold
    );
  }


  var startIndex = (page - 1) * itemsPerPage;
  var endIndex = startIndex + itemsPerPage;
  var toolsToDisplay = tools.slice(startIndex, endIndex);

  var toolsGrid = document.getElementById("toolsGrid");
  toolsGrid.innerHTML = "";

  for (var i = 0; i < toolsToDisplay.length; i++) {
    var tool = toolsToDisplay[i];
    var toolCard = document.createElement("div");
    toolCard.className = "tool-card";

    // Build the tags HTML string without using map
    var tagsHtml = "";
    for (var j = 0; j < tool.tags.length; j++) {
      tagsHtml += '<span class="tool-tag">' + tool.tags[j] + '</span>';
    }

    // Construct the tool card innerHTML using string concatenation
    toolCard.innerHTML =
      '<div class="tool-content">' +
        '<div class="tool-header">' +
          '<div class="tool-icon">' +
            '<img src="' + tool.Logo_Image + '" alt="' + tool.name + ' Logo" class="tool-logo">' +
          '</div>' +
          '<div class="tool-info">' +
            '<h3 class="tool-title">' + tool.name + '</h3>' +
            '<div class="tool-meta">' +
              '<span class="badge bg-' + getPricingColor(tool.pricing) + '">' + tool.pricing + '</span>' +
              '<span class="tool-rating">' +
                '<i class="bi bi-star-fill"></i>' +
                '<span>(' + ToolRating(tool.name) + ')</span>' +
              '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<p class="tool-description">' + tool.Description + '</p>' +
        '<div class="tool-tags">' + tagsHtml + '</div>' +
        '<div class="tool-footer">' +
          '<button class="btn btn-primary btn-sm" onclick="openReviewModal(\'' + tool.name + '\')">' +
            '<i class="bi bi-chat-left-text me-1"></i> Reviews' +
          '</button>' +
          '<button class="btn btn-sm btn-primary" onclick="openToolModal(\'' + tool.External_Link + '\')">' +
            '<i class="bi bi-box-arrow-up-right me-1"></i>Try Now' +
          '</button>' +
        '</div>' +
      '</div>';

    toolsGrid.appendChild(toolCard);
  }

  updatePaginationControls(tools.length);
}

// Update Pagination Controls
function updatePaginationControls(totalItems) {
  var totalPages = Math.ceil(totalItems / itemsPerPage);
  var paginationContainer = document.getElementById("pagination");

  // Helper function that returns an HTML string for a page item.
  // onClickStr should be a string representing the inline call (e.g. "goToPage(1)").
  function createPageItem(text, onClickStr, disabled, active) {
    disabled = disabled || false;
    active = active || false;
    var liClass = "page-item" + (disabled ? " disabled" : "") + (active ? " active" : "");
    var onClickAttr = "";
    if (!disabled && onClickStr) {
      onClickAttr = ' onclick="' + onClickStr + ';"';
    }
    return '<li class="' + liClass + '"><a class="page-link"' + onClickAttr + ' href="#">' + text + '</a></li>';
  }

  // Build the HTML for the pagination controls
  var html = '';
  html += '<nav aria-label="Page navigation">';
  html += '<ul class="pagination justify-content-center">';

  // Left arrow button
  html += createPageItem("<i class='bi bi-chevron-left'></i>", "paginationPrev()", currentPage === 1, false);

  // Determine the start and end pages for the visible range
  var startPage = Math.max(1, currentPage - 2);
  var endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += createPageItem("1", "goToPage(1)", false, false);
    if (startPage > 2) {
      html += createPageItem("...", "", true, false);
    }
  }

  for (var i = startPage; i <= endPage; i++) {
    html += createPageItem(i, "goToPage(" + i + ")", false, i === currentPage);
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      html += createPageItem("...", "", true, false);
    }
    html += createPageItem(totalPages, "goToPage(" + totalPages + ")", false, false);
  }

  // Right arrow button
  html += createPageItem("<i class='bi bi-chevron-right'></i>", "paginationNext()", currentPage === totalPages, false);

  html += '</ul></nav>';

  // Set the constructed HTML into the pagination container.
  paginationContainer.innerHTML = html;
}

// Basic arrow functions (using plain function declarations)
function paginationPrev() {
  if (currentPage > 1) {
    currentPage--;
    initializeTools(currentPage, filteredTools);
  }
}

function paginationNext() {
  var totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    initializeTools(currentPage, filteredTools);
  }
}

function goToPage(page) {
  currentPage = page;
  initializeTools(currentPage, filteredTools);
}


function paginationNext() {
  var totalPages = Math.ceil(filteredTools.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    initializeTools(currentPage, filteredTools);
  }
}

function goToPage(page) {
  currentPage = page;
  initializeTools(currentPage, filteredTools);
}

// Open Tool Modal
function openToolModal(link) {
  window.open(link, "_blank");
}

// Get Pricing Color
function getPricingColor(pricing) {
  switch (pricing.toLowerCase()) {
    case "free":
      return "success";
    case "freemium":
      return "warning";
    case "paid":
      return "danger";
    default:
      return "secondary";
  }
}

// Category Click Handler
function onCategoryClick(categoryTitle) {
  if (window.fdata && window.fdata[categoryTitle]) {
    filteredTools = window.fdata[categoryTitle];
    currentPage = 1;
    initializeTools(currentPage, filteredTools);
  }
}

// Subcategory Click Handler
function onSubcategoryClick(categoryTitle, subcategoryTitle) {
  if (window.fdata && window.fdata[categoryTitle]) {
    filteredTools = window.fdata[categoryTitle].filter((tool) =>
      tool.tags.includes(subcategoryTitle)
    );
    currentPage = 1;
    initializeTools(currentPage, filteredTools);
  }
}

// Search Functionality
function filterToolsBySearch(query) {
  query = query.toLowerCase();
  filteredTools = aiToolsData.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
  currentPage = 1;
  initializeTools(currentPage, filteredTools);
}


// Logout Function
function logout() {
  const confirmLogout = confirm("Are you sure you want to log out?");
  if (confirmLogout) {
    localStorage.removeItem("loggedInUser");
    alert("You have been logged out successfully!");
    window.location.href = "index.html";
  }
}

// --------------------
// Review System Code
// --------------------

var reviews = {};

// Load reviews from localStorage
function loadReviewsFromStorage() {
  reviews = JSON.parse(localStorage.getItem("reviews")) || {};
}

// Update review statistics for a given tool (average rating, total reviews, and per-star distribution)
function updateReviewStats(toolName) {
  var toolReviews = reviews[toolName] || [];
  var total = toolReviews.length;
  var sum = 0;
  var distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  for (var i = 0; i < toolReviews.length; i++) {
    var r = toolReviews[i].rating;
    sum += r;
    distribution[r] = (distribution[r] || 0) + 1;
  }
  var avg = total ? sum / total : 0;

  // Update overall rating display
  document.getElementById("averageRating").textContent = avg.toFixed(1);
  document.getElementById("totalReviews").textContent =
    "Based on " + total + " review" + (total !== 1 ? "s" : "");

  // Update average stars display (round the average for simplicity)
  var roundedAvg = Math.round(avg);
  document.getElementById("averageStars").innerHTML = generateStars(roundedAvg);

  // Build rating bars for each star (from 5 to 1)
  var ratingBarsHtml = "";
  for (var star = 5; star >= 1; star--) {
    var count = distribution[star] || 0;
    var percentage = total ? ((count / total) * 100).toFixed(0) : 0;
    ratingBarsHtml +=
      '<div class="rating-bar-item">' +
      '<span class="rating-label">' +
      star +
      ' <i class="bi bi-star-fill"></i></span>' +
      '<div class="progress">' +
      '<div class="progress-bar bg-primary" style="width: ' +
      percentage +
      '%"></div>' +
      "</div>" +
      '<span class="rating-count">' +
      count +
      "</span>" +
      "</div>";
  }
  document.getElementById("ratingBars").innerHTML = ratingBarsHtml;
}

// Load and display reviews for a given tool using a simple for loop
function loadReviews(toolName) {
  var toolReviews = reviews[toolName] || [];
  var reviewsListEl = document.getElementById("reviewsList");
  var html = "";

  if (toolReviews.length > 0) {
    for (var i = 0; i < toolReviews.length; i++) {
      var review = toolReviews[i];
      html +=
        '<div class="review-item">' +
        '<div class="review-header">' +
        '<span class="review-author">' +
        review.author +
        "</span>" +
        '<span class="review-date">' +
        formatDate(review.date) +
        "</span>" +
        "</div>" +
        '<div class="review-rating">' +
        generateStars(review.rating) +
        "</div>" +
        '<div class="review-title">' +
        review.title +
        "</div>" +
        '<div class="review-content">' +
        review.content +
        "</div>" +
        "</div>";
    }
  } else {
    html = "<p>No reviews yet.</p>";
  }
  reviewsListEl.innerHTML = html;
}

// Open the review modal: update stats, load reviews, and show the modal
function openReviewModal(toolName) {
  document.getElementById("reviewToolName").textContent = toolName;
  updateReviewStats(toolName);
  loadReviews(toolName);
  new bootstrap.Modal(document.getElementById("reviewModal")).show();
}

// Review submission system

// Hold the selected rating value
var selectedRating = 0;

// Update star icons based on the selected rating using a simple loop
function selectRating(rating) {
  selectedRating = rating;
  var stars = document.getElementsByClassName("rating-star");
  for (var i = 0; i < stars.length; i++) {
    if (i < rating) {
      stars[i].className = "bi bi-star-fill rating-star";
    } else {
      stars[i].className = "bi bi-star rating-star";
    }
  }
}

// Submit the review and update localStorage and UI
function submitReview() {
  var toolName = document.getElementById("reviewToolName").textContent;
  var title = document.getElementById("reviewTitle").value;
  var content = document.getElementById("reviewContent").value;

  if (!selectedRating || !title || !content) {
    alert("Please fill in all fields");
    return;
  }

  if (!reviews[toolName]) {
    reviews[toolName] = [];
  }

  // Add the new review at the beginning
  reviews[toolName].unshift({
    author: "Current User", // Replace with actual user name if available
    rating: selectedRating,
    title: title,
    content: content,
    date: new Date().toISOString().split("T")[0],
  });

  // Save updated reviews to localStorage
  localStorage.setItem("reviews", JSON.stringify(reviews));

  // Update review statistics and modal review list
  updateReviewStats(toolName);
  loadReviews(toolName);

  // Refresh the dashboard tools grid so that the updated rating is reflected.
  // (This re‑calls your initializeTools function with the current page and filteredTools.)
  initializeTools(currentPage, filteredTools);

  // Reset the review form and rating selection
  document.getElementById("reviewForm").reset();
  selectedRating = 0;
  selectRating(0);
}

// calculate a tool's rating based on its reviews
function ToolRating(toolName) {
  var toolReviews = reviews[toolName] || [];
  var total = toolReviews.length;
  var sum = 0;
  for (var i = 0; i < toolReviews.length; i++) {
    sum += toolReviews[i].rating;
  }
  var avg = total ? sum / total : 0;
  return avg.toFixed(1);
}

// Generate star icons based on an integer rating using a simple for loop
function generateStars(rating) {
  var stars = "";
  for (var i = 0; i < 5; i++) {
    if (i < rating) {
      stars += '<i class="bi bi-star-fill"></i>';
    } else {
      stars += '<i class="bi bi-star"></i>';
    }
  }
  return stars;
}

// Format a date string into a more readable format
function formatDate(dateString) {
  var options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Submit AI Tool Function
function submitTool(event,formElement) {
  console.log("Hello ")
  event.preventDefault();

  
  var toolName = formElement.elements["toolName"].value.trim();
  if (!toolName) {
    console.error("Element with id 'toolName' not found.");
    return;
  }
  console.error("Element with id 'toolName'  found."+toolName);

  var toolDescription = formElement.elements["toolDescription"].value.trim();
  var toolLogo = formElement.elements["toolLogo"].value.trim();
  var toolLink = formElement.elements["toolLink"].value.trim();
  var toolPricing = formElement.elements["toolPricing"].value.trim();
  var toolTags = formElement.elements["toolTags"].value.split(",").map(function(tag) {
    return tag.trim();
  });

  if (
    !toolName ||
    !toolDescription ||
    !toolLogo ||
    !toolLink ||
    !toolPricing ||
    toolTags.length === 0
  ) {
    alert("Please fill in all fields.");
    return;
  }

  var newTool = {
    name: toolName,
    Description: toolDescription,
    Logo_Image: toolLogo,
    External_Link: toolLink,
    pricing: toolPricing,
    tags: toolTags,
    Rating: 0,
  };

  // Save to localStorage
  var submittedTools = JSON.parse(localStorage.getItem("submittedTools")) || [];
  submittedTools.push(newTool);
  localStorage.setItem("submittedTools", JSON.stringify(submittedTools));

  // Reset form and hide modal
  document.getElementById("submitToolForm").reset();
  var submitToolModal = new bootstrap.Modal(document.getElementById("submitToolModal"));
  submitToolModal.hide();

  // Add the new tool to the dashboard
  aiToolsData.push(newTool);
  initializeTools(currentPage, aiToolsData);

  alert("AI Tool submitted successfully!");
}


function loadSubmittedTools() {
  var savedTools = JSON.parse(localStorage.getItem("submittedTools")) || [];
  aiToolsData = (aiToolsData || []).concat(savedTools);
  initializeTools(currentPage, aiToolsData);
}
loadSubmittedTools();


// filter
function applyFilters() {
  // Determine the base data: use currentCategoryData if a category is selected,
  // otherwise use the full set.
  let baseData = filteredTools.length > 0 ? filteredTools : aiToolsData;
  
  // Update pricing filters from checkboxes
  appliedPricingFilters = [];
  if (document.getElementById("free").checked) {
    appliedPricingFilters.push("free");
  }
  if (document.getElementById("freemium").checked) {
    appliedPricingFilters.push("freemium");
  }
  if (document.getElementById("paid").checked) {
    appliedPricingFilters.push("paid");
  }
  
  // Update rating threshold: if multiple are selected, the helper (onlyOne)
  // ensures only one is checked, so we check which one is selected.
  if (document.getElementById("rating3").checked) {
    appliedRatingThreshold = 3;
  } else if (document.getElementById("rating4").checked) {
    appliedRatingThreshold = 4;
  } else {
    appliedRatingThreshold = 0;
  }
  
  // Apply the filters to the base data
  let filteredData = baseData;
  
  // Filter by pricing if any pricing filters are active
  if (appliedPricingFilters.length > 0) {
    filteredData = filteredData.filter(tool =>
      appliedPricingFilters.includes(tool.pricing.toLowerCase())
    );
  }
  
  // Filter by rating if a threshold is set (using your ToolRating function)
  if (appliedRatingThreshold > 0) {
    filteredData = filteredData.filter(tool =>
      Number(ToolRating(tool.name)) >= appliedRatingThreshold
    );
  }
  
  // Reset pagination and update the tools grid with the filtered data
  currentPage = 1;
  initializeTools(currentPage, filteredData);
}

function resetFilters() {
  // Clear pricing checkboxes
  document.getElementById("free").checked = false;
  document.getElementById("freemium").checked = false;
  document.getElementById("paid").checked = false;
  
  // Clear rating checkboxes
  document.getElementById("rating3").checked = false;
  document.getElementById("rating4").checked = false;
  
  // Reset the filter variables
  appliedPricingFilters = [];
  appliedRatingThreshold = 0;
  
  // Determine the base data to display: if a category is selected, use that; otherwise, show all data.
  let baseData = filteredTools.length > 0 ? filteredTools : aiToolsData;
  
  // Reset pagination and reinitialize tools grid with the base data (unfiltered)
  currentPage = 1;
  initializeTools(currentPage, baseData);
}
